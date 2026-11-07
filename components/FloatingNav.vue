<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { localeLabels, type Locales } from '~/constants/i18n';
import type { ThemeMode } from '~/composables/useTheme';

const { t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { show: showSearch } = useSearchDialog();
const { activeLocale, localeList, handleSetLocale } = useI18nHandler();
const { mode, accent, setMode, setAccent, presets } = useTheme();

const navLinks = computed(() => [
  { to: localePath('/'), label: t('nav.home'), icon: 'lucide:house' },
  { to: localePath('/about'), label: t('nav.about'), icon: 'lucide:user-round' },
  { to: localePath('/projects'), label: t('nav.projects'), icon: 'lucide:briefcase-business' },
  { to: localePath('/writes'), label: t('nav.writing'), icon: 'lucide:notebook-pen' },
  { to: localePath('/contact'), label: t('nav.contact'), icon: 'lucide:at-sign' },
]);

const themeModes: { key: ThemeMode; icon: string }[] = [
  { key: 'light', icon: 'lucide:sun' },
  { key: 'dark', icon: 'lucide:moon' },
  { key: 'auto', icon: 'lucide:monitor' },
];

const swatchColor = (preset: (typeof presets)[number]) =>
  `oklch(${mode.value === 'dark' ? preset.dark.primary : preset.light.primary})`;

const moreOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    moreOpen.value = false;
  }
);

function openSearchFromDrawer() {
  moreOpen.value = false;
  nextTick(() => showSearch());
}

async function chooseLocale(code: Locales) {
  if (code === (activeLocale.value as Locales)) return;
  moreOpen.value = false;
  await handleSetLocale(code);
}
</script>

<template>
  <!-- Desktop: floating top pill with text links + utility icons. -->
  <div class="pointer-events-none fixed inset-x-0 top-4 z-30 hidden justify-center sm:flex">
    <nav
      :aria-label="t('nav.home_aria')"
      class="pointer-events-auto flex items-center gap-1 rounded-full border border-border/50 bg-background/70 px-2 py-1 shadow-lg shadow-black/5 backdrop-blur-md"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="inline-flex h-9 items-center rounded-full px-3 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
        active-class="!text-foreground bg-accent"
      >
        {{ link.label }}
      </NuxtLink>

      <span class="mx-1 h-5 w-px bg-border" />

      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            :aria-label="t('nav.search')"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            @click="showSearch"
          >
            <Icon name="lucide:search" class="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{{ t('nav.search') }} (⌘K)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <NuxtLink
            to="/Ahmed-Elsayed-Resume.pdf"
            external
            download
            :aria-label="t('nav.download_resume')"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon name="lucide:file-down" class="size-4" />
          </NuxtLink>
        </TooltipTrigger>
        <TooltipContent>{{ t('nav.resume') }}</TooltipContent>
      </Tooltip>

      <LanguageSwitcher />
      <ThemeToggle />
    </nav>
  </div>

  <!-- Mobile: top-anchored floating pill, icons only. A "More" button opens
       the utilities drawer (search / resume / language / theme). -->
  <div class="pointer-events-none fixed inset-x-0 top-2 z-30 flex justify-center sm:hidden">
    <nav
      :aria-label="t('nav.home_aria')"
      class="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border/50 bg-background/75 px-1.5 py-1 shadow-lg shadow-black/5 backdrop-blur-md"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :aria-label="link.label"
        class="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors active:bg-accent"
        active-class="!text-foreground bg-accent"
      >
        <Icon :name="link.icon" class="size-4" />
      </NuxtLink>

      <span class="mx-0.5 h-5 w-px bg-border" />

      <button
        type="button"
        :aria-label="t('nav.more_options')"
        class="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
        :class="moreOpen ? '!text-foreground bg-accent' : ''"
        @click="moreOpen = true"
      >
        <Icon name="lucide:ellipsis" class="size-4" />
      </button>
    </nav>
  </div>

  <Drawer v-model:open="moreOpen">
    <DrawerContent class="sm:hidden">
      <DrawerTitle class="sr-only">{{ t('nav.more_options') }}</DrawerTitle>
      <DrawerDescription class="sr-only">{{ t('nav.more_options') }}</DrawerDescription>

      <div class="flex flex-col gap-1 px-3 pb-6">
        <button
          type="button"
          class="flex items-center gap-3 rounded-lg px-3 py-3 text-start text-sm text-foreground transition-colors hover:bg-accent"
          @click="openSearchFromDrawer"
        >
          <Icon name="lucide:search" class="size-4 text-muted-foreground" />
          <span class="flex-1">{{ t('nav.search') }}</span>
          <kbd
            class="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ar:font-sans"
          >
            ⌘K
          </kbd>
        </button>

        <NuxtLink
          to="/Ahmed-Elsayed-Resume.pdf"
          external
          download
          class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground no-underline transition-colors hover:bg-accent"
          @click="moreOpen = false"
        >
          <Icon name="lucide:file-down" class="size-4 text-muted-foreground" />
          <span class="flex-1">{{ t('nav.resume') }}</span>
          <Icon name="lucide:arrow-down-to-line" class="size-4 text-muted-foreground" />
        </NuxtLink>

        <div class="mt-2 border-t border-border pt-3">
          <p
            class="px-3 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ar:normal-case"
          >
            {{ t('nav.language') }}
          </p>
          <button
            v-for="l in localeList"
            :key="l.code"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors hover:bg-accent"
            @click="chooseLocale(l.code as Locales)"
          >
            <span aria-hidden="true" class="text-base">{{
              localeLabels[l.code as Locales]?.flag
            }}</span>
            <span class="flex-1">{{ l.name }}</span>
            <Icon
              v-if="l.code === activeLocale"
              name="lucide:check"
              class="size-4 text-foreground"
            />
          </button>
        </div>

        <div class="mt-2 border-t border-border pt-3">
          <p
            class="px-3 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ar:normal-case"
          >
            {{ t('theme.mode') }}
          </p>
          <div class="grid grid-cols-3 gap-1.5 px-3">
            <button
              v-for="m in themeModes"
              :key="m.key"
              type="button"
              class="flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors"
              :class="
                mode === m.key
                  ? 'border-foreground/30 bg-accent text-accent-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              "
              @click="setMode(m.key)"
            >
              <Icon :name="m.icon" class="size-4" />
              {{ t(`theme.modes.${m.key}`) }}
            </button>
          </div>

          <p
            class="mt-4 px-3 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ar:normal-case"
          >
            {{ t('theme.accent') }}
          </p>
          <div class="grid grid-cols-7 gap-2 px-3">
            <button
              v-for="p in presets"
              :key="p.key"
              type="button"
              class="relative grid size-8 place-items-center rounded-full border-2 transition-transform hover:scale-110"
              :class="accent === p.key ? 'border-foreground' : 'border-transparent'"
              :style="{ backgroundColor: swatchColor(p) }"
              :aria-label="t(`theme.accents.${p.key}`)"
              @click="setAccent(p.key)"
            >
              <Icon
                v-if="accent === p.key"
                name="lucide:check"
                class="size-4 text-primary-foreground"
              />
            </button>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
