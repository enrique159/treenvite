<script setup lang="ts">
import AppSidebar from '../components/AppSidebar.vue'
import LegalLinks from '../components/LegalLinks.vue'
</script>

<template>
  <div class="min-h-screen lg:flex">
    <AppSidebar />
    <main class="flex min-w-0 flex-1 flex-col">
      <div class="min-w-0 flex-1"><RouterView /></div>
      <footer class="border-t border-base-300 bg-base-100 px-4 py-4 sm:px-6">
        <LegalLinks />
      </footer>
    </main>
  </div>
</template>
