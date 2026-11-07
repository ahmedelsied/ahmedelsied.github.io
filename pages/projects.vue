<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

const { t } = useI18n();
const { formatYear } = useLocalizedDate();

useSiteSeo({
  title: t('meta.projects.title'),
  description: t('meta.projects.description'),
});

const { work, openSource } = useProjects();

const sections = computed(() =>
  [
    {
      key: 'work',
      heading: t('projects.product_work'),
      blurb: t('projects.product_work_blurb'),
      items: work,
    },
    {
      key: 'open-source',
      heading: t('projects.open_source'),
      blurb: t('projects.open_source_blurb'),
      items: openSource,
    },
  ].filter((section) => section.items.length > 0)
);

function primaryHref(p: { href?: string; repo?: string }) {
  return p.href ?? p.repo ?? '';
}
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('projects.eyebrow')"
      :title="t('projects.title')"
      :subtitle="t('projects.subtitle')"
    />

    <section v-for="(section, si) in sections" :key="section.key" class="pb-16 last:pb-24">
      <!-- Section header — same rhythm as the blog listing's year headers:
           serif h2, mono entry count, flex-1 hairline rule. -->
      <div v-reveal="si * 100">
        <div class="mb-3 flex items-baseline gap-4">
          <h2
            class="font-serif text-3xl leading-none font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            {{ section.heading }}
          </h2>
          <span
            class="font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
          >
            {{ t('projects.count', { n: section.items.length }, section.items.length) }}
          </span>
          <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
        </div>
        <p class="mb-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {{ section.blurb }}
        </p>
      </div>

      <!-- Typography-forward index — one row per project, no icon panels,
           no cards. Whole row is clickable via a positioned overlay link
           so nested Source anchors can still work. -->
      <ul class="flex flex-col divide-y divide-border">
        <li v-for="project in section.items" :key="project.title">
          <article class="group/proj relative">
            <NuxtLink
              v-if="primaryHref(project)"
              :to="primaryHref(project)"
              external
              target="_blank"
              rel="noopener"
              :aria-label="project.title"
              class="absolute inset-0 z-0"
            />

            <div
              class="grid gap-2 py-7 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:py-8"
            >
              <!-- Meta column — mono year + optional featured chip. On
                   mobile it sits inline as an eyebrow above the title. -->
              <div
                class="pointer-events-none relative z-10 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
              >
                <span v-if="project.year" dir="ltr">{{ formatYear(project.year) }}</span>
                <template v-if="project.featured">
                  <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
                  <span
                    class="inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary ar:text-[11px]"
                  >
                    {{ t('home.blog_previews.featured') }}
                  </span>
                </template>
              </div>

              <div class="pointer-events-none relative z-10 min-w-0">
                <h3
                  class="font-serif text-xl leading-[1.2] font-semibold tracking-tight text-balance text-foreground transition-colors group-hover/proj:text-primary sm:text-2xl md:text-[1.65rem]"
                >
                  <bdi>{{ project.title }}</bdi>
                </h3>

                <p class="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {{ project.description }}
                </p>

                <div v-if="project.tags.length" class="mt-4 flex flex-wrap gap-1.5">
                  <Badge
                    v-for="tag in project.tags"
                    :key="tag"
                    variant="outline"
                    class="pointer-events-none"
                  >
                    {{ tag }}
                  </Badge>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
                  <span
                    class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover/proj:text-primary"
                  >
                    {{ project.href ? t('common.visit') : t('common.source') }}
                    <Icon
                      name="lucide:arrow-up-right"
                      class="size-3.5 transition-transform group-hover/proj:translate-x-0.5 group-hover/proj:-translate-y-0.5"
                    />
                  </span>
                  <NuxtLink
                    v-if="project.repo && project.href"
                    :to="project.repo"
                    external
                    target="_blank"
                    rel="noopener"
                    class="pointer-events-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                    :aria-label="`${project.title}, ${t('common.source')}`"
                    @click.stop
                  >
                    <Icon name="lucide:github" class="size-3.5" />
                    {{ t('common.source') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>
