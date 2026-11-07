<script setup lang="ts">
import { Button } from '@/components/ui/button';

const { t } = useI18n();
const localePath = useLocalePath();
const { formatPeriod, formatYear } = useLocalizedDate();
const tmArray = useTmArray();

useSiteSeo({
  title: t('meta.about.title'),
  description: t('meta.about.description'),
});

const { roles } = useExperience();
const avatarSrc = publicPath('/avatar.jpg');

const introParagraphs = computed(() => tmArray('about.intro'));
const currentlyItems = computed(() => tmArray('about.currently_items'));

// Primary stack — the six things that carry day-to-day backend work.
// Everything else in the detailed groups is supporting context.
const primaryStack = [
  { label: 'PHP', note: 'Expert' },
  { label: 'Laravel', note: 'Expert' },
  { label: 'MySQL', note: 'Expert' },
  { label: 'PostgreSQL' },
  { label: 'NestJS' },
  { label: 'Node.js' },
];

type StackGroup = { title: string; items: string[] };
const stack: StackGroup[] = [
  {
    title: 'about.stack.frontend',
    items: ['JavaScript', 'HTML & CSS', 'Vue.js'],
  },
  {
    title: 'about.stack.backend',
    items: [
      'PHP',
      'Laravel',
      'NestJS',
      'Node.js',
      'REST APIs',
      'Laravel Sanctum',
      'Laravel Passport',
      'Filament',
      'Spatie',
    ],
  },
  {
    title: 'about.stack.databases',
    items: ['MySQL', 'PostgreSQL', 'MongoDB'],
  },
  {
    title: 'about.stack.state',
    items: [
      'Layered architecture',
      'Modular monolith',
      'Hexagonal architecture',
      'Onion architecture',
      'Clean architecture',
      'Microservices',
    ],
  },
  {
    title: 'about.stack.design',
    items: ['SOLID', 'Domain-driven design', 'Design patterns', 'Event-driven architecture'],
  },
  {
    title: 'about.stack.realtime',
    items: [
      'Cache strategies',
      'Database replication',
      'Distributed systems',
      'Horizontal and vertical scaling',
      'System design',
      'System observability',
    ],
  },
  {
    title: 'about.stack.devops',
    items: ['Docker', 'Kubernetes', 'Grafana', 'Prometheus'],
  },
  {
    title: 'about.stack.quality',
    items: [
      'TDD',
      'Code review',
      'Mentorship',
      'Sprint planning',
      'Cursor',
      'Model Context Protocol',
    ],
  },
];
</script>

<template>
  <div>
    <!-- Hero: portrait card on the start side, serif title + intro meta on
         the end side. On mobile the portrait sits above the text. -->
    <section class="pt-4 pb-14 sm:pt-8 sm:pb-16">
      <div
        class="grid gap-8 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-center sm:gap-12"
      >
        <div class="mx-auto max-w-[10rem] sm:mx-0">
          <img
            :src="avatarSrc"
            alt="Ahmed Elsayed"
            width="384"
            height="384"
            decoding="async"
            fetchpriority="high"
            class="aspect-square w-full rounded-2xl object-cover shadow-lg ring-1 ring-border"
          />
        </div>

        <div class="min-w-0">
          <p
            class="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            <span aria-hidden="true" class="h-px w-8 bg-border" />
            {{ t('about.eyebrow') }}
          </p>
          <h1
            class="text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl"
            style="text-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 8%, transparent)"
          >
            {{ t('about.title') }}
          </h1>
          <p
            class="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            {{ t('about.subtitle') }}
          </p>

          <div
            class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            <span class="inline-flex items-center gap-1.5">
              <Icon name="lucide:map-pin" class="size-3.5" />
              {{ t('home.location') }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Intro — reads like a short essay opener, with drop-cap on the first
         paragraph to match the blog article aesthetic. -->
    <section class="pb-16">
      <div class="about-intro mx-auto max-w-2xl">
        <p v-for="(p, i) in introParagraphs" :key="i">{{ p }}</p>
      </div>
    </section>

    <!-- Now block — small tinted card, clearly a "current status" surface. -->
    <section class="pb-16">
      <div
        class="mx-auto max-w-2xl rounded-xl border border-border bg-foreground/[0.02] p-6 sm:p-7"
      >
        <p
          class="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
        >
          <span aria-hidden="true" class="size-1.5 rounded-full bg-primary" />
          {{ t('about.currently') }}
        </p>
        <ul class="space-y-2.5 text-foreground/90">
          <li
            v-for="(item, i) in currentlyItems"
            :key="item"
            v-reveal="i * 50"
            class="flex items-start gap-3 text-sm leading-relaxed sm:text-base"
          >
            <span
              aria-hidden="true"
              class="mt-[0.65rem] size-1 shrink-0 rounded-full bg-foreground/40"
            />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Experience — narrow date column on the start side, role details on
         the end side. Mirrors the blog listing timeline for consistency. -->
    <section class="pb-16">
      <div class="mb-8 flex items-baseline gap-4">
        <h2
          class="font-serif text-2xl leading-none font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {{ t('about.experience') }}
        </h2>
        <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
      </div>

      <ol class="flex flex-col divide-y divide-border">
        <li v-for="(role, i) in roles" :key="role.company + role.start" v-reveal="i * 60">
          <div class="grid gap-3 py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 sm:py-8">
            <div
              class="font-mono text-xs tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-sm ar:font-semibold ar:tracking-normal ar:normal-case"
              dir="ltr"
            >
              <span>{{ formatYear(role.start) }}</span>
              <span aria-hidden="true"> to </span>
              <span v-if="role.end">{{ formatYear(role.end) }}</span>
              <span v-else>{{ t('common.present') }}</span>
            </div>

            <div class="min-w-0">
              <h3
                class="text-lg leading-snug font-semibold text-balance text-foreground sm:text-xl"
              >
                <bdi>{{ role.title }}</bdi>
              </h3>
              <p class="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
                <NuxtLink
                  v-if="role.link"
                  :to="role.link"
                  external
                  target="_blank"
                  rel="noopener"
                  class="min-w-0 truncate no-underline hover:text-foreground"
                >
                  <bdi>{{ role.company }}</bdi>
                </NuxtLink>
                <span v-else class="min-w-0"
                  ><bdi>{{ role.company }}</bdi></span
                >
                <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
                <span>{{ role.location }}</span>
                <span
                  aria-hidden="true"
                  class="size-0.5 rounded-full bg-muted-foreground/60 sm:hidden"
                />
                <span class="font-mono text-xs sm:hidden ar:font-sans ar:text-sm">
                  {{ formatPeriod(role.start, role.end) }}
                </span>
              </p>

              <ul class="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90">
                <li v-for="(h, j) in role.highlights" :key="j" class="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    class="mt-[0.55rem] size-1 shrink-0 rounded-full bg-foreground/40"
                  />
                  <span class="min-w-0">{{ h }}</span>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ol>
    </section>

    <!-- Skills — primary stack promoted to a "signature" callout, then the
         detailed grouped breakdown for anyone reading closely. -->
    <section class="pb-16">
      <div class="mb-8 flex items-baseline gap-4">
        <h2
          class="font-serif text-2xl leading-none font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {{ t('about.skills') }}
        </h2>
        <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
      </div>

      <div class="mb-10">
        <p
          class="mb-4 font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
        >
          {{ t('about.primary_stack') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in primaryStack"
            :key="s.label"
            class="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground"
          >
            {{ s.label }}
            <span
              v-if="s.note"
              class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-[11px] ar:tracking-normal ar:normal-case"
            >
              {{ s.note }}
            </span>
          </span>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8">
        <div v-for="(group, i) in stack" :key="group.title" v-reveal="i * 40">
          <h3
            class="mb-3 font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            {{ t(group.title) }}
          </h3>
          <ul class="flex flex-wrap gap-1.5">
            <li
              v-for="s in group.items"
              :key="s"
              class="inline-flex items-center rounded-md border border-border/70 bg-background/60 px-2 py-0.5 text-xs text-foreground/85"
            >
              {{ s }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Education + language — compact info card, no border decoration
         competing with the timeline above. -->
    <section class="pb-16">
      <div class="mb-8 flex items-baseline gap-4">
        <h2
          class="font-serif text-2xl leading-none font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {{ t('about.education') }}
        </h2>
        <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
      </div>

      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-8">
        <div>
          <p class="text-base font-semibold text-foreground sm:text-lg">
            {{ t('about.education_degree') }}
          </p>
          <p
            class="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-sm ar:tracking-normal ar:normal-case"
          >
            {{ t('about.education_meta') }}
          </p>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-foreground/90 sm:text-base">
            {{ t('about.education_blurb') }}
          </p>
        </div>

        <p class="text-sm text-muted-foreground sm:max-w-[16rem] sm:text-end">
          <span
            class="block font-mono text-[11px] tracking-widest uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            {{ t('about.languages_label') }}
          </span>
          <span class="mt-1 block text-foreground">{{ t('about.languages_value') }}</span>
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="pb-24">
      <div
        class="flex flex-col items-start gap-4 rounded-xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
      >
        <div class="min-w-0">
          <h3 class="text-lg font-semibold text-foreground sm:text-xl">
            {{ t('home.cta.title') }}
          </h3>
          <p class="mt-1 text-sm text-muted-foreground sm:text-base">
            {{ t('home.cta.body') }}
          </p>
        </div>
        <Button :to="localePath('/contact')" variant="primary" class="shrink-0">
          {{ t('common.get_in_touch') }}
          <Icon name="lucide:arrow-right" class="rtl-flip" />
        </Button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Intro paragraphs — comfortable long-form reading with a drop cap on the
   first paragraph. Suppressed for RTL Arabic since drop caps aren't a
   native pattern there. */
.about-intro {
  font-size: 1.075rem;
  line-height: 1.85;
  color: color-mix(in oklab, var(--foreground) 88%, transparent);
}

.about-intro > p + p {
  margin-top: 1.25rem;
}

.about-intro > p:first-of-type::first-letter {
  float: inline-start;
  margin-inline-end: 0.5rem;
  padding-block-start: 0.25rem;
  font-family: var(--font-serif);
  font-size: 3.5rem;
  font-weight: 600;
  line-height: 0.85;
  color: var(--foreground);
}

[dir='rtl'] .about-intro > p:first-of-type::first-letter {
  float: none;
  margin-inline-end: 0;
  padding-block-start: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
}
</style>
