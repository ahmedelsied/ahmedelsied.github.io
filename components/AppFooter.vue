<script setup lang="ts">
const { t } = useI18n();
const year = new Date().getFullYear();

const socials = [
  { label: 'GitHub', href: 'https://github.com/ahmedelsied', icon: 'lucide:github' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dev-ahmed-elsied',
    icon: 'lucide:linkedin',
  },
  { label: 'WhatsApp', href: 'https://wa.me/201024404534', icon: 'lucide:message-circle' },
  { label: 'Email', href: 'mailto:dev.ahmed.elsied@gmail.com', icon: 'lucide:mail' },
];
</script>

<template>
  <footer class="mt-16 border-t border-border">
    <div
      class="flex flex-col items-start gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{{ t('footer.copyright', { year }) }}</p>

      <div class="flex items-center gap-1">
        <NuxtLink
          v-for="s in socials"
          :key="s.label"
          :to="s.href"
          external
          target="_blank"
          rel="noopener"
          :aria-label="s.label"
          class="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon :name="s.icon" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
