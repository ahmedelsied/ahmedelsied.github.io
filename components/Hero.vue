<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    /** Show the avatar + status pill + socials chrome (home hero only). */
    showChrome?: boolean;
    /** Availability status shown in the status pill (home hero only). */
    available?: boolean;
    /** Localized status label shown in the status pill. */
    statusLabel?: string;
  }>(),
  {
    eyebrow: undefined,
    subtitle: undefined,
    statusLabel: undefined,
    showChrome: false,
    available: true,
  }
);

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
  <section class="pt-6 pb-10 text-center sm:pt-10 sm:pb-14">
    <div v-if="showChrome" class="hero-enter mb-6 flex justify-center" style="--hero-delay: 50ms">
      <img
        src="/avatar.jpg"
        alt="Ahmed Elsayed"
        width="256"
        height="256"
        decoding="async"
        fetchpriority="high"
        class="size-24 rounded-full object-cover ring-2 ring-border ring-offset-4 ring-offset-background sm:size-28"
      />
    </div>

    <p v-if="eyebrow" class="hero-enter mb-4" style="--hero-delay: 100ms">
      <span
        class="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-medium tracking-widest text-accent-foreground uppercase ar:normal-case ar:tracking-normal"
      >
        {{ eyebrow }}
      </span>
    </p>

    <h1
      class="hero-enter mx-auto max-w-xl text-3xl leading-[1.15] text-pretty sm:text-4xl md:text-5xl"
      style="
        --hero-delay: 200ms;
        text-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 8%, transparent);
      "
    >
      {{ title }}
    </h1>

    <p
      v-if="subtitle"
      class="hero-enter mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
      style="--hero-delay: 300ms"
    >
      {{ subtitle }}
    </p>

    <div class="hero-enter" style="--hero-delay: 400ms">
      <slot />
    </div>

    <div
      v-if="showChrome && statusLabel"
      class="hero-enter mt-6 flex flex-wrap items-center justify-center gap-2"
      style="--hero-delay: 500ms"
    >
      <span
        class="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
      >
        <span class="relative inline-flex size-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            :class="available ? 'bg-emerald-500' : 'bg-amber-500'"
          />
          <span
            class="relative inline-flex size-2 rounded-full"
            :class="available ? 'bg-emerald-500' : 'bg-amber-500'"
          />
        </span>
        {{ statusLabel }}
      </span>
    </div>

    <div
      v-if="showChrome"
      class="hero-enter mt-6 flex flex-wrap items-center justify-center gap-1"
      style="--hero-delay: 600ms"
    >
      <NuxtLink
        v-for="s in socials"
        :key="s.href"
        :to="s.href"
        external
        target="_blank"
        rel="noopener"
        :aria-label="s.label"
        class="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
      >
        <Icon :name="s.icon" class="size-4" />
      </NuxtLink>
    </div>
  </section>
</template>
