<script setup lang="ts">
// Page-wide interactive backdrop: tiny dots arranged on a grid. As the
// cursor passes over an area, nearby dots morph into small dashed
// triangle outlines that rotate slowly. When the cursor leaves, they
// ease back into dots. Works in light + dark themes.

const rootEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);

// Hardcoded per-mode colours — avoids depending on CSS-variable resolution
// which can be flaky when the .dark class lives on body vs html, or when
// the theme toggle writes a different attribute.
const LIGHT_FG = { r: 24, g: 23, b: 20 }; // deep ink
const DARK_FG = { r: 240, g: 240, b: 232 }; // cream

const detectDark = () => {
  const html = document.documentElement;
  const body = document.body;
  // Only treat the page as dark when the site has explicitly applied its
  // dark class / data-theme. The site defaults to light even if the OS
  // prefers dark, so we must NOT fall back to prefers-color-scheme.
  if (html.classList.contains('dark') || body?.classList.contains('dark')) return true;
  if (html.getAttribute('data-theme') === 'dark') return true;
  if (body?.getAttribute('data-theme') === 'dark') return true;
  return false;
};

onMounted(() => {
  const canvas = canvasEl.value;
  const root = rootEl.value;
  if (!canvas || !root) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0;
  let H = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const GAP = 48; // distance between dots (sparser = fewer cells = faster)
  const DOT_R = 0.65; // very small resting dot radius
  const TRI_R = 9; // triangle circumscribed radius when fully hovered
  // Shared influence radius — ghost and real cursor behave identically so
  // the page always animates with the same visual energy.
  const INFLUENCE_R = 250;
  const EASE = 0.18; // state smoothing per frame

  // Precomputed base vertex positions for a unit equilateral triangle
  // pointing up. We apply per-triangle rotation + scale + translate
  // arithmetically in the loop — avoids ctx.save/translate/rotate/restore
  // per instance, which is the heaviest part of drawing hundreds of tris.
  const TRI_BASE: Array<[number, number]> = [
    [Math.cos(-Math.PI / 2), Math.sin(-Math.PI / 2)],
    [Math.cos(-Math.PI / 2 + (Math.PI * 2) / 3), Math.sin(-Math.PI / 2 + (Math.PI * 2) / 3)],
    [Math.cos(-Math.PI / 2 + (Math.PI * 4) / 3), Math.sin(-Math.PI / 2 + (Math.PI * 4) / 3)],
  ];

  type Cell = {
    x: number;
    y: number;
    state: number; // 0 = dot, 1 = triangle
    seed: number; // per-cell phase for rotation variation
  };
  let cells: Cell[] = [];

  // Constrain the canvas horizontally to the framed content column so the
  // ghost animation only runs under the main content area, not under nav,
  // footer, or the viewport gutters.
  const framedContainer = document.querySelector('.framed-container') as HTMLElement | null;

  const syncBounds = () => {
    if (framedContainer) {
      const rect = framedContainer.getBoundingClientRect();
      root.style.left = `${rect.left}px`;
      root.style.width = `${rect.width}px`;
      root.style.right = 'auto';
    }
  };

  const rebuild = () => {
    syncBounds();
    W = root.clientWidth || window.innerWidth;
    H = root.clientHeight || window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    cells = [];
    const cols = Math.ceil(W / GAP) + 2;
    const rows = Math.ceil(H / GAP) + 2;
    const offX = (W - (cols - 1) * GAP) / 2;
    const offY = (H - (rows - 1) * GAP) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: offX + c * GAP,
          y: offY + r * GAP,
          state: 0,
          seed: Math.random() * Math.PI * 2,
        });
      }
    }
  };
  rebuild();
  window.addEventListener('resize', rebuild);
  window.addEventListener('scroll', syncBounds, { passive: true });
  const containerRO = framedContainer
    ? new ResizeObserver(() => {
        rebuild();
      })
    : null;
  if (containerRO && framedContainer) containerRO.observe(framedContainer);

  // --- cursor (coords mapped into the canvas-local space) ---
  const mouse = { x: -9999, y: -9999, active: false };
  const toLocal = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const onPointerMove = (e: PointerEvent) => {
    const { x, y } = toLocal(e.clientX, e.clientY);
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  };
  const onPointerLeave = () => {
    mouse.active = false;
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerleave', onPointerLeave);

  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const { x, y } = toLocal(t.clientX, t.clientY);
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  };
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchend', onPointerLeave);

  // --- theme (re-checked every frame for reliability; both calls are O(1)) ---
  let isDark = detectDark();
  let fg = isDark ? DARK_FG : LIGHT_FG;
  // Also observe html + body in case a theme toggle changes an attribute
  const applyTheme = () => {
    isDark = detectDark();
    fg = isDark ? DARK_FG : LIGHT_FG;
  };
  const themeObs = new MutationObserver(applyTheme);
  themeObs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
  if (document.body) {
    themeObs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();

  // --- ghost cursors ---
  // Two virtual pointers tracing slow, independent Lissajous paths. They
  // trigger the dot → triangle morph as they pass, so the page always looks
  // like someone is lightly interacting with it — even when idle.
  type Ghost = {
    freqX: number;
    freqY: number;
    phaseX: number;
    phaseY: number;
    ampX: number;
    ampY: number;
    strength: number;
  };
  const ghosts: Ghost[] = [
    {
      freqX: 0.11,
      freqY: 0.17,
      phaseX: 0,
      phaseY: Math.PI / 3,
      ampX: 0.42,
      ampY: 0.38,
      strength: 1.0,
    },
  ];

  let raf = 0;
  const tick = () => {
    const now = performance.now();
    const time = (now - start) * 0.001;
    // Re-verify mode every frame (both calls are cheap). Guarantees we
    // never draw with stale light-mode colours after a theme toggle.
    isDark = detectDark();
    fg = isDark ? DARK_FG : LIGHT_FG;
    ctx.clearRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([3, 2.5]); // set once — all triangles share the pattern

    // Same alpha in both modes — light mode was dialled in correctly,
    // dark mode should feel the same (just with cream ink over black
    // instead of deep ink over white).
    const baseDotAlpha = 0.26;
    const baseTriAlpha = 0.5;
    const dotRadius = DOT_R;
    const infR2 = INFLUENCE_R * INFLUENCE_R;

    // compute live ghost positions once per frame
    const ghostPositions = reduced
      ? []
      : ghosts.map((g) => ({
          x: W / 2 + Math.sin(time * g.freqX + g.phaseX) * W * g.ampX,
          y: H / 2 + Math.cos(time * g.freqY + g.phaseY) * H * g.ampY,
          strength: g.strength,
        }));

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]!;

      // --- target state + radial push ---
      // target: how much this cell wants to become a triangle (0..1)
      // dispX/dispY: displacement away from the nearest cursor so cells
      //              don't crowd each other when they morph.
      let target = 0;
      let dispX = 0;
      let dispY = 0;
      const PUSH_MAX = 22; // max pixels a cell slides away from a cursor

      // Real cursor and ghosts now share the same model: same radius,
      // same linear-overdrive target, same full push distance.
      if (!reduced && mouse.active) {
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < infR2) {
          const d = Math.sqrt(d2) || 1;
          const t = 1 - d / INFLUENCE_R;
          target = Math.max(target, t * 1.1);
          const push = t * t * PUSH_MAX;
          dispX += (dx / d) * push;
          dispY += (dy / d) * push;
        }
      }
      // Ghost pointer only lights up triangles — it does NOT push cells
      // apart, so no gap-opening from the ambient animation. Only the
      // real cursor creates breathing room.
      for (let gi = 0; gi < ghostPositions.length; gi++) {
        const g = ghostPositions[gi]!;
        const dx = cell.x - g.x;
        const dy = cell.y - g.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < infR2) {
          const d = Math.sqrt(d2) || 1;
          const t = 1 - d / INFLUENCE_R;
          target = Math.max(target, t * 1.1 * g.strength);
        }
      }
      cell.state += (target - cell.state) * EASE;
      const s = cell.state;
      const drawX = cell.x + dispX;
      const drawY = cell.y + dispY;

      if (s < 0.9) {
        // --- draw dot (fades out as triangle fades in) ---
        const dotAlpha = baseDotAlpha * (1 - s);
        if (dotAlpha > 0.015) {
          const r = Math.max(0.3, dotRadius);
          ctx.fillStyle = `rgba(${fg.r}, ${fg.g}, ${fg.b}, ${dotAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (s > 0.05) {
        // --- draw dashed triangle (no save/restore, no translate/rotate) ---
        // Depth-of-field: cells at the edge of the real-cursor radius
        // draw with thinner lines + lower alpha. No blur = cheap on perf.
        let edgeness = 0;
        if (!reduced && mouse.active) {
          const dx = cell.x - mouse.x;
          const dy = cell.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < INFLUENCE_R) edgeness = d / INFLUENCE_R;
        }
        const focusAlphaMul = 1 - edgeness * 0.4; // less aggressive than before
        const focusWidthMul = 1 - edgeness * 0.4;

        const triAlpha = baseTriAlpha * s * focusAlphaMul;
        const size = Math.max(1, TRI_R * (0.6 + s * 0.6));
        const rot = time * 0.4 + cell.seed;
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);

        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const b = TRI_BASE[k]!;
          const lx = b[0] * size;
          const ly = b[1] * size;
          // rotate + translate manually
          const wx = lx * cosR - ly * sinR + drawX;
          const wy = lx * sinR + ly * cosR + drawY;
          if (k === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${fg.r}, ${fg.g}, ${fg.b}, ${triAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.1 * focusWidthMul;
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    themeObs.disconnect();
    window.removeEventListener('resize', rebuild);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('touchend', onPointerLeave);
  });
});
</script>

<template>
  <div ref="rootEl" class="dot-triangles" aria-hidden="true">
    <canvas ref="canvasEl" />
  </div>
</template>

<style scoped>
.dot-triangles {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.dot-triangles canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
