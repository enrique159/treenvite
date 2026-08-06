<script setup lang="ts">
import { ArrowLeft, Network, Settings, Table2 } from '@lucide/vue'
import type { EventItem } from '../types'
defineProps<{ event: EventItem }>()
</script>
<template>
  <header class="border-b border-base-300 bg-base-100 px-5 py-5 sm:px-8">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
      <RouterLink to="/events" class="btn btn-circle btn-ghost btn-sm" aria-label="Volver"><ArrowLeft class="size-4" /></RouterLink>
      <span class="grid size-11 place-items-center rounded-xl text-xl font-bold text-white" :style="{ backgroundColor: event.color }">{{ event.type[0] }}</span>
      <div class="min-w-0 flex-1"><p class="text-[10px] font-bold uppercase tracking-widest opacity-45">{{ event.type }}</p><h1 class="truncate font-display text-2xl">{{ event.name }}</h1></div>
      <div role="tablist" class="tabs tabs-box bg-base-200 p-1">
        <RouterLink :to="`/events/${event.id}/guests`" class="tab gap-1 text-xs" active-class="tab-active"><Table2 class="size-3.5" /> Lista</RouterLink>
        <RouterLink :to="`/events/${event.id}/tree`" class="tab gap-1 text-xs" active-class="tab-active"><Network class="size-3.5" /> Árbol</RouterLink>
        <RouterLink :to="`/events/${event.id}/settings`" class="tab gap-1 text-xs" active-class="tab-active"><Settings class="size-3.5" /> Ajustes</RouterLink>
      </div>
    </div>
  </header>
</template>
