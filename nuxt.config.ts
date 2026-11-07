import tailwindcss from '@tailwindcss/vite';
import { defaultLocale, localeCookieName } from './constants/i18n';
import { phases as plan1Phases } from './features/plan1/phases';
import { planTopics as plan1Topics } from './features/plan1/topics';
import { phases as plan2Phases } from './features/plan2/phases';
import { planTopics as plan2Topics } from './features/plan2/topics';
import { phases as plan3Phases } from './features/plan3/phases';
import { planTopics as plan3Topics } from './features/plan3/topics';

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://ahmedelsied.github.io';
const baseURL = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/?$/, '/');
const publicFile = (file: string) => `${baseURL}${file.replace(/^\//, '')}`;
const siteName = 'Ahmed Elsayed';
const siteDescription =
  'Senior Backend Engineer. Laravel, PHP, and NestJS for scalable APIs and admin platforms.';

// Cloudflare Web Analytics — unlimited, cookieless, no banner required.
// Set NUXT_PUBLIC_CF_ANALYTICS_TOKEN (see .env.example) to enable tracking.
// Unset = no script injected, so local dev stays silent.
const cfAnalyticsToken = process.env.NUXT_PUBLIC_CF_ANALYTICS_TOKEN?.trim();
const analyticsScripts = cfAnalyticsToken
  ? [
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        defer: true,
        'data-cf-beacon': JSON.stringify({ token: cfAnalyticsToken }),
      },
    ]
  : [];

const planRoutes = (
  planId: string,
  topics: Array<{ id: string }>,
  phases: Array<{ key: string }>
) => [
  `/en-us/plans/roadmap/${planId}`,
  ...topics.map((topic) => `/en-us/plans/roadmap/${planId}/topics/${topic.id}`),
  ...phases.map((phase) => `/en-us/plans/roadmap/${planId}/phase/${phase.key}`),
];

const learningRoutes = [
  ...planRoutes('plan-1', plan1Topics, plan1Phases),
  ...planRoutes('plan-2', plan2Topics, plan2Phases),
  ...planRoutes('plan-3', plan3Topics, plan3Phases),
];

export default defineNuxtConfig({
  compatibilityDate: '2026-04-01',
  srcDir: '.',
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/icon', '@nuxtjs/i18n', 'shadcn-nuxt'],
  css: [
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      siteUrl,
      siteName,
      siteDescription,
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },
  i18n: {
    defaultLocale,
    strategy: 'prefix',
    locales: [
      { code: 'en-us', name: 'English', file: 'en-us/index.ts', language: 'en-US' },
      { code: 'ar-eg', name: 'العربية (مصر)', file: 'ar-eg/index.ts', language: 'ar-EG' },
      { code: 'ar-sa', name: 'العربية (السعودية)', file: 'ar-sa/index.ts', language: 'ar-SA' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: localeCookieName,
      fallbackLocale: defaultLocale,
      redirectOn: 'root',
    },
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['ts', 'js', 'vue', 'bash', 'json', 'html', 'css'],
        },
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/404.html', '/robots.txt', '/sitemap.xml', '/en-us/plans', ...learningRoutes],
      failOnError: false,
    },
  },
  app: {
    baseURL,
    head: {
      title: siteName,
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: publicFile('favicon.svg') },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: publicFile('favicon-32.png') },
        { rel: 'apple-touch-icon', sizes: '180x180', href: publicFile('apple-touch-icon.png') },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap',
        },
        { rel: 'preload', as: 'image', href: publicFile('og-image.png'), type: 'image/png' },
        { rel: 'preload', as: 'image', href: publicFile('avatar.jpg'), type: 'image/jpeg' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
        { name: 'description', content: siteDescription },
        { name: 'author', content: siteName },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#fbfaf7' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#141311' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: siteName },
        { property: 'og:description', content: siteDescription },
        { property: 'og:url', content: siteUrl },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: `${siteUrl}/og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${siteName} — portfolio` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: siteName },
        { name: 'twitter:description', content: siteDescription },
        { name: 'twitter:image', content: `${siteUrl}/og-image.png` },
        { name: 'twitter:image:alt', content: `${siteName} — portfolio` },
      ],
      script: [
        {
          // Mirrors server/plugins/extend-html.ts but runs even for static
          // exports (where render:html sees no cookies at build time). Reads
          // theme + accent cookies and resolves auto-mode before paint.
          innerHTML: `(()=>{try{var r=document.documentElement,c={};(document.cookie||'').split(';').forEach(function(p){var i=p.indexOf('=');if(i>0)c[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())});var m=c.theme||'auto',a=c.accent||'slate';var P={slate:{l:'0.32 0.015 250',d:'0.85 0.015 250'},terracotta:{l:'0.58 0.13 40',d:'0.72 0.14 45'},teal:{l:'0.55 0.12 195',d:'0.72 0.13 195'},rose:{l:'0.6 0.18 15',d:'0.72 0.18 15'},indigo:{l:'0.5 0.18 270',d:'0.7 0.16 270'},olive:{l:'0.5 0.09 130',d:'0.72 0.1 130'},amber:{l:'0.62 0.16 70',d:'0.78 0.15 75'}};var p=P[a]||P.slate;var d=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);var t='oklch('+(d?p.d:p.l)+')';r.style.setProperty('--primary',t);r.style.setProperty('--ring',t)}catch(e){}})();`,
          tagPosition: 'head',
        },
        ...analyticsScripts,
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
});
