<script setup lang="ts">
withDefaults(defineProps<{ size?: number; title?: string }>(), {
  size: 32,
  title: 'Ahmed Elsayed',
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    role="img"
    :aria-label="title"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{{ title }}</title>
    <rect width="64" height="64" rx="10" class="site-logo-bg" />
    <text
      x="32"
      y="43"
      font-family="var(--font-serif)"
      font-size="28"
      font-weight="600"
      letter-spacing="-0.5"
      text-anchor="middle"
      class="site-logo-text"
    >
      AE
    </text>
  </svg>
</template>

<style scoped>
.site-logo-bg {
  fill: var(--foreground);
}
.site-logo-text {
  fill: var(--background);
}
</style>
