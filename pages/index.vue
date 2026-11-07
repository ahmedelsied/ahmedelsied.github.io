<script setup lang="ts">
import { Button } from '@/components/ui/button';

const { t } = useI18n();
const localePath = useLocalePath();
const tmArray = useTmArray();

useSiteSeo({
  title: t('meta.home.title'),
  description: t('meta.home.description'),
});

const config = useRuntimeConfig();
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ahmed Elsayed',
        url: siteUrl,
        jobTitle: t('meta.home.job_title'),
        email: 'dev.ahmed.elsied@gmail.com',
        image: `${siteUrl}/og-image.png`,
        sameAs: [
          'https://github.com/ahmedelsied',
          'https://www.linkedin.com/in/dev-ahmed-elsied',
          'https://wa.me/201024404534',
        ],
      }),
    },
  ],
});

const { featured } = useProjects();

const strengths = computed(() => tmArray('home.strengths'));

const sections = computed(() => [
  {
    title: t('nav.about'),
    to: localePath('/about'),
    blurb: t('home.explore_sections.about_blurb'),
  },
  {
    title: t('nav.projects'),
    to: localePath('/projects'),
    blurb: t('home.explore_sections.projects_blurb'),
  },
  {
    title: t('nav.writing'),
    to: localePath('/writes'),
    blurb: t('home.explore_sections.writing_blurb'),
  },
  {
    title: t('nav.contact'),
    to: localePath('/contact'),
    blurb: t('home.explore_sections.contact_blurb'),
  },
]);
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('home.eyebrow')"
      :title="t('home.title')"
      :subtitle="t('home.subtitle')"
      :show-chrome="true"
      :available="true"
      :status-label="t('hero.status.available')"
    >
      <div
        class="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
      >
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:map-pin" class="size-3.5" />
          {{ t('home.location') }}
        </span>
        <span class="opacity-40">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:plane" class="size-3.5" />
          {{ t('home.relocate') }}
        </span>
        <span class="opacity-40">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:award" class="size-3.5" />
          {{ t('home.award') }}
        </span>
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <Button :to="localePath('/projects')" variant="primary">
          {{ t('home.see_work') }}
          <Icon name="lucide:arrow-right" class="rtl-flip" />
        </Button>
        <Button :to="localePath('/contact')" variant="outline">
          {{ t('common.get_in_touch') }}
        </Button>
      </div>
    </Hero>

    <LandingHeroSearch />

    <section class="py-16">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('common.explore') }}
      </h2>
      <ul class="mt-5 grid gap-2 sm:grid-cols-2">
        <li v-for="(s, i) in sections" :key="s.to" v-reveal="i * 80">
          <NuxtLink
            :to="s.to"
            class="group flex items-baseline justify-between gap-4 rounded-lg border border-border p-4 no-underline transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
          >
            <span class="flex-1">
              <span class="block font-medium text-foreground">{{ s.title }}</span>
              <span class="mt-1 block text-sm text-muted-foreground">{{ s.blurb }}</span>
            </span>
            <Icon
              name="lucide:arrow-right"
              class="rtl-flip size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground rtl:group-hover:-translate-x-0.5"
            />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <LandingAboutWorkGrid />

    <section class="py-16">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.selected_work') }}</h2>
        <NuxtLink
          :to="localePath('/projects')"
          class="text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          {{ t('common.all_projects') }} →
        </NuxtLink>
      </div>

      <div class="mt-6 flex flex-col gap-6">
        <div v-for="(project, i) in featured" :key="project.title" v-reveal="i * 120">
          <ProjectCard
            :title="project.title"
            :description="project.description"
            :tags="project.tags"
            :href="project.href"
            :repo="project.repo"
            :year="project.year"
            :icon="project.icon"
            :horizontal="true"
            :reverse="i % 2 === 1"
          />
        </div>
      </div>
    </section>

    <section class="py-16">
      <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.what_i_do_well') }}</h2>
      <ul class="mt-5 space-y-3 text-foreground/90">
        <li v-for="(s, i) in strengths" :key="i" v-reveal="i * 80" class="flex items-start gap-3">
          <span class="mt-[0.6rem] size-1 shrink-0 rounded-full bg-foreground/40" />
          <span>{{ s }}</span>
        </li>
      </ul>
    </section>

    <LandingTestimonials />

    <LandingFAQ />

    <section class="py-16">
      <div
        class="rounded-lg border border-border p-6 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
      >
        <h3 class="text-lg font-semibold">{{ t('home.cta.title') }}</h3>
        <p class="mt-2 text-sm text-muted-foreground">{{ t('home.cta.body') }}</p>
        <Button :to="localePath('/contact')" variant="primary" class="mt-5">
          {{ t('common.get_in_touch') }}
          <Icon name="lucide:arrow-right" class="rtl-flip" />
        </Button>
      </div>
    </section>
  </div>
</template>
