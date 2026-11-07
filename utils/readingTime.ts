// Nuxt Content stores markdown as a minimark tree:
// { type: 'minimark', value: [['p', {}, 'text', ['em', {}, 'inner']], ...] }
// Older hast-shaped nodes ({ type: 'text', value, children }) are handled too.
function collectProse(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectProse).join(' ');
  if (typeof node === 'object') {
    const record = node as { type?: string; value?: unknown; children?: unknown };
    if (record.type === 'text' && typeof record.value === 'string') return record.value;
    if (record.type === 'minimark' || Array.isArray(record.value)) {
      return collectProse(record.value);
    }
    if (record.children) return collectProse(record.children);
  }
  return '';
}

export function readingMinutes(body: unknown, override?: number | null): number {
  if (typeof override === 'number' && Number.isFinite(override) && override > 0) {
    return Math.round(override);
  }
  const words = collectProse(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
