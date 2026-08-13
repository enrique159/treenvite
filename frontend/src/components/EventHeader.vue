<script setup lang="ts">
import { ArrowLeft, Braces, Network, Settings, Table2 } from '@lucide/vue'
import type { EventItem } from '../types'
defineProps<{ event: EventItem }>()
</script>
<template>
  <header class="border-b border-base-300 bg-base-100 px-4 py-4 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 sm:gap-4">
      <RouterLink to="/events" class="btn btn-circle btn-ghost" aria-label="Volver"
        ><ArrowLeft class="size-5"
      /></RouterLink>
      <span
        class="grid size-11 shrink-0 place-items-center rounded-xl text-xl font-bold text-white shadow-sm"
        :style="{ backgroundColor: event.color }"
        >{{ event.type[0] }}</span
      >
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-bold uppercase tracking-widest opacity-45">{{ event.type }}</p>
        <h1 class="truncate font-display text-xl sm:text-2xl">{{ event.name }}</h1>
      </div>
      <div
        role="tablist"
        class="tabs tabs-box grid w-full bg-base-200 p-1 sm:ml-auto sm:flex sm:w-auto"
        :class="event.role === 'owner' ? 'grid-cols-4' : 'grid-cols-3'"
      >
        <RouterLink :to="`/events/${event.id}/guests`" class="tab min-w-0 gap-1 text-xs" active-class="tab-active"
          ><Table2 class="size-3.5" /> Lista</RouterLink
        >
        <RouterLink :to="`/events/${event.id}/tree`" class="tab min-w-0 gap-1 text-xs" active-class="tab-active"
          ><Network class="size-3.5" /> Árbol</RouterLink
        >
        <RouterLink :to="`/events/${event.id}/settings`" class="tab min-w-0 gap-1 text-xs" active-class="tab-active"
          ><Settings class="size-3.5" /> Ajustes</RouterLink
        >
        <RouterLink
          v-if="event.role === 'owner'"
          :to="`/events/${event.id}/api`"
          class="tab min-w-0 gap-1 text-xs"
          active-class="tab-active"
          ><Braces class="size-3.5" /> API</RouterLink
        >
      </div>
    </div>
  </header>
</template>
