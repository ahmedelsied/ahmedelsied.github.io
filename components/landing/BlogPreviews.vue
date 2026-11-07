<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocalizedDate();

const isArabicLocaleInitial = locale.value.toLowerCase().startsWith('ar');
const initialCollection = isArabicLocaleInitial ? 'writesAr' : 'writes';

const { data: posts } = await useAsyncData(`${initialCollection}-previews`, async () => {
  const rows = await queryCollection(initialCollection).order('date', 'DESC').limit(3).all();
  if (rows.length > 0 || initialCollection === 'writes') return rows;
  return queryCollection('writes').order('date', 'DESC').limit(3).all();
});

type PostRow = { title?: string; description?: string; lang?: string; path?: string };
const localizedLang = (p: PostRow) => p.lang ?? 'en';
const localizedDir = (p: PostRow) =>
  localizedLang(p).toLowerCase().startsWith('ar') ? 'rtl' : 'ltr';
const externalPath = (p: PostRow) => (p.path ?? '').replace(/^\/writes-ar\//, '/writes/');
</script>

<template>
  <section v-if="posts && posts.length" class="py-16">
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.blog_previews.title') }}</h2>
      <NuxtLink
        :to="localePath('/writes')"
        class="text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        {{ t('common.all_writing') }}
      </NuxtLink>
    </div>

    <ul class="mt-6 flex flex-col divide-y divide-border">
      <li v-for="(post, i) in posts" :key="post.path" v-reveal="i * 100">
        <NuxtLink
          :to="localePath(externalPath(post))"
          class="group flex items-start justify-between gap-4 py-5 no-underline"
        >
          <div class="min-w-0 flex-1">
            <p
              :lang="localizedLang(post)"
              :dir="localizedDir(post)"
              class="text-base font-medium text-foreground group-hover:text-primary"
            >
              {{ post.title }}
            </p>
            <p
              v-if="post.description"
              :lang="localizedLang(post)"
              :dir="localizedDir(post)"
              class="mt-1 line-clamp-2 text-sm text-muted-foreground"
            >
              {{ post.description }}
            </p>
            <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <time v-if="post.date" :datetime="post.date">
                {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </time>
              <span class="inline-flex items-center gap-1 text-foreground">
                {{ t('home.blog_previews.read_more') }}
                <Icon
                  name="lucide:arrow-right"
                  class="rtl-flip size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
