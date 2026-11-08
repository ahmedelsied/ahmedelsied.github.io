<script setup lang="ts">
const { open } = useSearchDialog();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <ClientOnly>
      <LandingHeroSignature />
    </ClientOnly>
    <FloatingNav />
    <div class="framed-container relative z-10 flex-1 pt-20 backdrop-blur-xs sm:pt-24">
      <main>
        <slot />
      </main>
      <AppFooter />
    </div>
    <ClientOnly>
      <ScrollToTop />
      <LandingSearchDialog v-model:open="open" />
    </ClientOnly>
  </div>
</template>
