<script setup lang="ts">
import { Button } from '@/components/ui/button';

const { t } = useI18n();

useSiteSeo({
  title: t('meta.contact.title'),
  description: t('meta.contact.description'),
});

const primaryEmail = 'dev.ahmed.elsied@gmail.com';
const primaryHref = `mailto:${primaryEmail}`;

// Secondary channels — everything except email, which gets promoted into
// the primary CTA above.
const secondary = computed(() => [
  {
    key: 'phone',
    value: '+20 102 440 4534',
    href: 'tel:+201024404534',
    icon: 'lucide:phone',
  },
  {
    key: 'linkedin',
    value: 'linkedin.com/in/dev-ahmed-elsied',
    href: 'https://www.linkedin.com/in/dev-ahmed-elsied',
    icon: 'lucide:linkedin',
  },
  {
    key: 'github',
    value: '@ahmedelsied',
    href: 'https://github.com/ahmedelsied',
    icon: 'lucide:github',
  },
]);
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('contact.eyebrow')"
      :title="t('contact.title')"
      :subtitle="t('contact.subtitle')"
    />

    <!-- Primary CTA — email promoted to a big, unmistakable card. The rest
         of the channels live below as a quiet list, since email is by far
         the highest-signal way to reach me. -->
    <section class="pb-14">
      <div class="mx-auto max-w-2xl">
        <p
          class="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
        >
          <span aria-hidden="true" class="size-1.5 rounded-full bg-primary" />
          {{ t('contact.primary_label') }}
        </p>

        <div
          class="rounded-xl border border-border bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/40 sm:p-8"
        >
          <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="text-sm text-muted-foreground ar:text-base">
                {{ t('contact.channels.email.hint') }}
              </p>
              <NuxtLink
                :to="primaryHref"
                external
                class="mt-2 block truncate font-mono text-lg font-semibold text-foreground no-underline hover:text-primary sm:text-2xl ar:font-sans"
                dir="ltr"
              >
                {{ primaryEmail }}
              </NuxtLink>
            </div>

            <Button :to="primaryHref" external variant="primary" class="shrink-0">
              <Icon name="lucide:mail" class="size-4" />
              {{ t('contact.primary_action') }}
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Secondary channels — dense hairline-divided list, meta-labelled
         "or, elsewhere online". -->
    <section class="pb-16">
      <div class="mx-auto max-w-2xl">
        <div class="mb-2 flex items-center gap-3">
          <p
            class="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            {{ t('contact.secondary_label') }}
          </p>
          <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
        </div>

        <ul class="flex flex-col divide-y divide-border">
          <li v-for="(c, i) in secondary" :key="c.key" v-reveal="i * 50">
            <NuxtLink
              :to="c.href"
              external
              target="_blank"
              rel="noopener"
              class="group/row flex items-center gap-4 py-4 no-underline"
            >
              <span
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-foreground ring-1 ring-border transition-colors group-hover/row:bg-accent"
              >
                <Icon :name="c.icon" class="size-4" />
              </span>
              <div class="min-w-0 flex-1">
                <p
                  class="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
                >
                  {{ t(`contact.channels.${c.key}.label`) }}
                </p>
                <p
                  class="mt-0.5 truncate text-sm font-medium text-foreground transition-colors group-hover/row:text-primary sm:text-base"
                  dir="ltr"
                >
                  {{ c.value }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground ar:text-sm">
                  {{ t(`contact.channels.${c.key}.hint`) }}
                </p>
              </div>
              <Icon
                name="lucide:arrow-up-right"
                class="size-4 shrink-0 text-muted-foreground transition-all group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-foreground"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Availability footer — quiet meta strip, not a CTA. -->
    <section class="pb-24">
      <div class="mx-auto max-w-2xl">
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p
            class="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            {{ t('contact.availability_label') }}
          </p>
          <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">{{ t('contact.availability_value') }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
