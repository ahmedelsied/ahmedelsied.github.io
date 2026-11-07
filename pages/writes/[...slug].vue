<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { t, locale, locales } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocalizedDate();

const lookupPath = computed(() => {
  const codes = locales.value.map((l) => (typeof l === 'string' ? l : l.code));
  for (const code of codes) {
    if (route.path === `/${code}`) return '/';
    if (route.path.startsWith(`/${code}/`)) return route.path.slice(code.length + 1);
  }
  return route.path;
});

const isArabicLocaleInitial = locale.value.toLowerCase().startsWith('ar');
const initialCollection = isArabicLocaleInitial ? 'writesAr' : 'writes';
const initialCollectionPath = isArabicLocaleInitial
  ? lookupPath.value.replace(/^\/writes\//, '/writes-ar/')
  : lookupPath.value;

const { data: post } = await useAsyncData(`${initialCollection}-${lookupPath.value}`, async () => {
  const primary = await queryCollection(initialCollection).path(initialCollectionPath).first();
  if (primary) return primary;
  // Fallback to the English post if the current locale's translation is missing
  if (isArabicLocaleInitial) {
    return queryCollection('writes').path(lookupPath.value).first();
  }
  return null;
});

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const tocLinks = computed(() => post.value?.body?.toc?.links ?? []);

const slug = computed(() => {
  const path = post.value?.path ?? lookupPath.value;
  return path.replace(/^\/writes(-ar)?\//, '').replace(/\/$/, '');
});

const readingTime = computed(() =>
  readingMinutes(post.value?.body, post.value?.readingMinutes),
);

// Related posts — grab everything then filter out the current one; take 2
// newest. Cached by `related-<slug>` so navigating between posts reuses it.
const { data: relatedPosts } = await useAsyncData(
  `related-${initialCollection}-${lookupPath.value}`,
  () => queryCollection(initialCollection).order('date', 'DESC').all(),
  {
    transform: (rows) => rows.filter((r) => r.path !== initialCollectionPath).slice(0, 2),
  }
);

const AUDIO_BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'UL',
  'OL',
  'BLOCKQUOTE',
]);
const postBody = useTemplateRef<{ $el?: HTMLElement } | HTMLElement>('postBody');
const activeIndex = ref<number | null>(null);

function contentRoot(): HTMLElement | null {
  const raw = postBody.value as unknown;
  if (!raw) return null;
  if (raw instanceof HTMLElement) return raw;
  const el = (raw as { $el?: HTMLElement }).$el;
  return el ?? null;
}

function textBlocks(): HTMLElement[] {
  const root = contentRoot();
  if (!root) return [];
  const out: HTMLElement[] = [];
  for (const el of Array.from(root.children) as HTMLElement[]) {
    if (!AUDIO_BLOCK_TAGS.has(el.tagName)) continue;
    if (el.tagName === 'P' && !el.textContent?.trim()) continue;
    out.push(el);
  }
  return out;
}

function labelBlocks() {
  const blocks = textBlocks();
  blocks.forEach((el, i) => {
    el.setAttribute('data-audio-index', String(i));
  });
}

watch(activeIndex, (next, prev) => {
  const root = contentRoot();
  if (!root) return;
  if (prev !== null && prev !== undefined) {
    root
      .querySelector<HTMLElement>(`[data-audio-index="${prev}"]`)
      ?.classList.remove('audio-active');
  }
  if (next !== null && next !== undefined) {
    const el = root.querySelector<HTMLElement>(`[data-audio-index="${next}"]`);
    if (el) {
      el.classList.add('audio-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// Reading progress bar — thin fixed strip at the very top of the viewport
// whose width tracks how far the reader has scrolled through the article.
const progress = ref(0);
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
}

onMounted(() => {
  nextTick(labelBlocks);
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress);
  window.removeEventListener('resize', updateProgress);
});

const postLang = computed(() => post.value?.lang ?? 'en');
const postDir = computed(() => (postLang.value.toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'));

const localeLangRoot = computed(() => locale.value.split('-')[0]?.toLowerCase() ?? 'en');
const postLangRoot = computed(() => postLang.value.split('-')[0]?.toLowerCase() ?? 'en');
const isEnglishLocale = computed(() => localeLangRoot.value === 'en');
const isArabicLocale = computed(() => localeLangRoot.value === 'ar');
const audioEnabled = computed(() => isEnglishLocale.value && postLangRoot.value === 'en');

const displayTitle = computed(
  () => (isArabicLocale.value && post.value?.title_ar) || post.value?.title || ''
);
const displayDescription = computed(
  () => (isArabicLocale.value && post.value?.description_ar) || post.value?.description || ''
);
const displayLang = computed(() =>
  isArabicLocale.value && post.value?.title_ar ? 'ar' : postLang.value
);
const displayDir = computed(() =>
  displayLang.value.toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'
);
// Notice only when the article body is not in the site locale. Since bodies
// are English-only for now, this fires on any Arabic locale.
const showLangNotice = computed(() => postLangRoot.value !== localeLangRoot.value);

const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
const url = `${siteUrl}${route.path}`;
const title = displayTitle.value;
const description = displayDescription.value;
const keywords = post.value?.keywords ?? [];
const publishedAt = post.value?.date;
const modifiedAt = post.value?.updatedAt ?? post.value?.date;
const ogImage = post.value?.image
  ? /^https?:\/\//.test(post.value.image)
    ? post.value.image
    : `${siteUrl}${post.value.image}`
  : `${siteUrl}/og-image.png`;
const inLanguage = post.value?.lang ?? 'en';

useSiteSeo({
  title,
  description,
  ogType: 'article',
  image: post.value?.image,
});

useSeoMeta({
  articleAuthor: [config.public.siteName as string],
  articlePublishedTime: publishedAt,
  articleModifiedTime: modifiedAt,
  articleTag: keywords.length ? keywords : undefined,
  keywords: keywords.length ? keywords.join(', ') : undefined,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        author: {
          '@type': 'Person',
          name: config.public.siteName,
          url: siteUrl,
        },
        publisher: {
          '@type': 'Person',
          name: config.public.siteName,
          url: siteUrl,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: ogImage,
        url,
        inLanguage,
        ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
      }),
    },
  ],
});

const avatarSrc = publicPath('/avatar.jpg');

const coverFor = (p: { path: string; image?: string }) => {
  if (p.image) return publicPath(p.image);
  const s = p.path.replace(/^\/writes(-ar)?\//, '').replace(/\/$/, '');
  return publicPath(`/writes-covers/${s}.png`);
};

// Public route is always /writes/<slug>; the writesAr collection stores
// paths as /writes-ar/<slug>, which isn't a real page route.
const externalPath = (p: { path?: string }) => (p.path ?? '').replace(/^\/writes-ar\//, '/writes/');
</script>

<template>
  <div class="py-8 sm:py-12">
    <div aria-hidden="true" class="fixed inset-x-0 top-0 z-50 h-[3px] motion-reduce:hidden">
      <div
        class="h-full bg-primary transition-[width] duration-150 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <div class="mx-auto max-w-[42rem]">
      <NuxtLink
        :to="localePath('/writes')"
        class="mb-10 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <Icon name="lucide:chevron-left" class="rtl-flip size-3.5" />
        {{ t('common.all_writing') }}
      </NuxtLink>

      <article :dir="postDir" :lang="postLang">
        <header :dir="displayDir" :lang="displayLang">
          <h1
            class="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-[3.25rem]"
            style="text-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 8%, transparent)"
          >
            {{ displayTitle }}
          </h1>

          <p
            v-if="displayDescription"
            class="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
          >
            {{ displayDescription }}
          </p>

          <div
            class="mt-8 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:tracking-normal ar:normal-case ar:text-xs"
          >
            <span aria-hidden="true" class="h-px w-8 bg-border" />
            <time v-if="post?.date" :datetime="post.date" dir="ltr">
              {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </time>
            <span aria-hidden="true">·</span>
            <span>{{ t('blog.min_read', { n: readingTime }, readingTime) }}</span>
            <template v-if="post?.updatedAt && post.updatedAt !== post.date">
              <span aria-hidden="true">·</span>
              <span>
                {{ t('blog.updated') }}
                {{
                  formatDate(post.updatedAt, { year: 'numeric', month: 'short', day: 'numeric' })
                }}
              </span>
            </template>
          </div>
        </header>

        <div
          v-if="post?.image"
          class="mt-10 overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:mt-14"
        >
          <img
            :src="post.image"
            :alt="post.title"
            class="aspect-[16/9] size-full object-cover"
            width="1280"
            height="720"
            fetchpriority="high"
          />
        </div>

        <ClientOnly v-if="audioEnabled">
          <ArticleAudio :slug="slug" @update:active-index="activeIndex = $event" />
        </ClientOnly>

        <p
          v-if="showLangNotice"
          class="mt-10 rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 text-sm text-muted-foreground"
        >
          <Icon name="lucide:languages" class="inline size-4 align-[-2px]" />
          {{ t('blog.english_only_notice') }}
        </p>

        <BlogTocMobile :links="tocLinks" />

        <ContentRenderer v-if="post" ref="postBody" :value="post" class="post-body" />
      </article>

      <footer class="mt-16 border-t border-border pt-8">
        <div class="flex items-center gap-4">
          <img
            :src="avatarSrc"
            alt="Ahmed Elsayed"
            width="96"
            height="96"
            loading="lazy"
            class="size-11 shrink-0 rounded-full object-cover ring-2 ring-border ring-offset-2 ring-offset-background"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight text-foreground">Ahmed Elsayed</p>
            <p class="mt-0.5 text-xs leading-tight text-muted-foreground">
              {{ t('meta.home.job_title') }}
            </p>
          </div>
          <div class="flex gap-0.5">
            <NuxtLink
              v-for="s in [
                { href: 'https://github.com/ahmedelsied', icon: 'lucide:github', label: 'GitHub' },
                {
                  href: 'https://www.linkedin.com/in/dev-ahmed-elsied',
                  icon: 'lucide:linkedin',
                  label: 'LinkedIn',
                },
                {
                  href: 'https://wa.me/201024404534',
                  icon: 'lucide:message-circle',
                  label: 'WhatsApp',
                },
                {
                  href: 'mailto:dev.ahmed.elsied@gmail.com',
                  icon: 'lucide:mail',
                  label: 'Email',
                },
              ]"
              :key="s.href"
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
    </div>

    <!-- Related posts — sits below the reading rail but stretches wider on
         desktop so two cards can breathe side-by-side. -->
    <section v-if="relatedPosts?.length" class="mx-auto mt-20 max-w-3xl">
      <div class="mb-6 flex items-center gap-3">
        <span aria-hidden="true" class="h-px flex-1 bg-border" />
        <p
          class="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
        >
          {{ t('blog.related') }}
        </p>
        <span aria-hidden="true" class="h-px flex-1 bg-border" />
      </div>

      <ul class="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <li v-for="p in relatedPosts" :key="p.path">
          <NuxtLink :to="localePath(externalPath(p))" class="group/rel block no-underline">
            <div class="aspect-[16/10] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
              <img
                :src="coverFor(p)"
                :alt="(isArabicLocale && p.title_ar) || p.title"
                class="size-full object-cover transition-transform duration-500 group-hover/rel:scale-[1.04]"
                loading="lazy"
                width="480"
                height="300"
              />
            </div>
            <time
              v-if="p.date"
              class="mt-4 block font-mono text-[10px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-[11px] ar:tracking-normal ar:normal-case"
              :datetime="p.date"
            >
              {{ formatDate(p.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </time>
            <h3
              :lang="isArabicLocale && p.title_ar ? 'ar' : (p.lang ?? 'en')"
              :dir="
                (isArabicLocale && p.title_ar ? 'ar' : (p.lang ?? 'en'))
                  .toLowerCase()
                  .startsWith('ar')
                  ? 'rtl'
                  : 'ltr'
              "
              class="mt-1.5 text-base font-semibold leading-snug text-foreground transition-colors group-hover/rel:text-primary sm:text-lg"
            >
              {{ (isArabicLocale && p.title_ar) || p.title }}
            </h3>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style>
/* Post body — editorial reading experience. Comfortable serif-adjacent
   feel, generous leading, drop-cap first paragraph, quiet UI chrome. */
.post-body {
  margin-top: 3rem;
  font-size: 1.075rem;
  line-height: 1.85;
  color: color-mix(in oklab, var(--foreground) 88%, transparent);
}

.post-body > * + * {
  margin-top: 1.4rem;
}

/* Drop cap — the first character of the first paragraph gets a large,
   serif treatment. Uses the article's own :first-of-type paragraph so
   headings / images preceding it don't hijack the cap. LTR-only —
   Arabic typography doesn't use drop caps in the same way. */
.post-body > p:first-of-type::first-letter {
  float: inline-start;
  margin-inline-end: 0.5rem;
  padding-block-start: 0.25rem;
  font-family: var(--font-serif);
  font-size: 3.75rem;
  font-weight: 600;
  line-height: 0.85;
  color: var(--foreground);
}

[dir='rtl'] .post-body > p:first-of-type::first-letter {
  float: none;
  margin-inline-end: 0;
  padding-block-start: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
}

/* Headings — sans with tight tracking, no anchor decoration; the top TOC
   handles navigation, so headings stay uncluttered. */
.post-body h2,
.post-body h3,
.post-body h4 {
  scroll-margin-top: 6rem;
  color: var(--foreground);
  letter-spacing: -0.015em;
}

.post-body h2 {
  margin-top: 3rem;
  margin-bottom: 0.4rem;
  font-size: 1.65rem;
  line-height: 1.25;
}

.post-body h3 {
  margin-top: 2.25rem;
  margin-bottom: 0.25rem;
  font-size: 1.25rem;
  line-height: 1.35;
}

.post-body h4 {
  margin-top: 1.75rem;
  font-size: 1.05rem;
}

.post-body h2 + p,
.post-body h3 + p,
.post-body h4 + p {
  margin-top: 0.75rem;
}

.post-body [data-audio-index] {
  scroll-margin-top: 6rem;
  border-radius: 0.5rem;
  transition: background-color 250ms ease;
}

.post-body .audio-active {
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  box-shadow:
    -0.75rem 0 0 color-mix(in oklab, var(--primary) 12%, transparent),
    0.75rem 0 0 color-mix(in oklab, var(--primary) 12%, transparent);
}

.post-body a {
  color: var(--foreground);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--primary) 55%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition:
    color 0.15s,
    text-decoration-color 0.15s;
}

.post-body a:hover {
  color: var(--primary);
  text-decoration-color: var(--primary);
}

.post-body ul,
.post-body ol {
  padding-inline-start: 1.3rem;
}

.post-body ul > li,
.post-body ol > li {
  margin-top: 0.4rem;
}

.post-body ul > li::marker {
  color: color-mix(in oklab, var(--primary) 60%, transparent);
}

.post-body :not(pre) > code {
  background: color-mix(in oklab, var(--foreground) 6%, var(--background));
  color: var(--foreground);
  padding: 0.12rem 0.4rem;
  border-radius: 0.35rem;
  border: 1px solid color-mix(in oklab, var(--foreground) 8%, transparent);
  font-size: 0.86em;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  direction: ltr;
  unicode-bidi: isolate;
}

.post-body pre {
  margin-top: 1.75rem;
  margin-bottom: 1.75rem;
  padding: 1.15rem 1.3rem;
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.7;
  background: color-mix(in oklab, var(--foreground) 3%, var(--background));
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  direction: ltr;
  text-align: left;
  unicode-bidi: isolate;
}

.dark .post-body .shiki,
.dark .post-body .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

.post-body pre code {
  display: block;
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  border: none;
}

/* Pull-quote — larger, serif, tinted rule. Reads as a moment of pause
   rather than an information block. */
.post-body blockquote {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 0.5rem 0 0.5rem 1.5rem;
  border-inline-start: 3px solid color-mix(in oklab, var(--primary) 55%, var(--border));
  color: color-mix(in oklab, var(--foreground) 82%, transparent);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.2rem;
  line-height: 1.6;
}

.post-body blockquote p {
  margin-top: 0;
}

.post-body hr {
  margin-top: 2.75rem;
  margin-bottom: 2.75rem;
  border: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border) 30%,
    var(--border) 70%,
    transparent
  );
}

.post-body img {
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

.post-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.925rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.post-body th,
.post-body td {
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 0.9rem;
  text-align: start;
}

.post-body tr:last-child td {
  border-bottom: none;
}

.post-body th {
  background: color-mix(in oklab, var(--foreground) 4%, var(--background));
  font-weight: 600;
  color: var(--foreground);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
