<script setup lang="ts">
import { KeyRound, Plus } from '@lucide/vue'
import { onMounted } from 'vue'
import EventCard from '../../components/EventCard.vue'
import { useEventsStore } from '../../stores/events'
const events = useEventsStore(); onMounted(() => events.fetchAll())
</script>
<template>
  <div>
    <header class="border-b border-base-300 bg-base-100 px-6 py-7 sm:px-10"><div class="mx-auto flex max-w-7xl items-end justify-between gap-5"><div><p class="text-[10px] font-bold uppercase tracking-[.2em] opacity-45">Tu espacio</p><h1 class="mt-1 font-display text-4xl">Mis eventos</h1></div><div class="flex gap-2"><RouterLink to="/join" class="btn btn-outline max-sm:btn-square"><KeyRound class="size-4" /><span class="max-sm:hidden">Acceder con código</span></RouterLink><RouterLink to="/events/new" class="btn btn-primary"><Plus class="size-4" />Crear evento</RouterLink></div></div></header>
    <div class="mx-auto max-w-7xl p-6 sm:p-10">
      <section class="hero min-h-60 overflow-hidden rounded-2xl bg-secondary text-secondary-content"><div class="hero-content w-full justify-start p-8 sm:p-12"><div class="max-w-2xl"><p class="text-xs font-bold uppercase tracking-[.2em] text-primary">Tu próxima celebración</p><h2 class="mt-3 font-display text-4xl sm:text-5xl">Todo empieza con una persona.</h2><p class="mt-4 max-w-lg text-sm leading-6 text-white/65">Crea tu evento, reúne a tu gente y deja que las relaciones tomen forma.</p><RouterLink to="/events/new" class="btn btn-primary mt-6">Crear un nuevo evento</RouterLink></div></div></section>
      <div class="mb-5 mt-10 flex items-center gap-4"><h2 class="font-display text-2xl">Tus eventos</h2><span class="badge badge-ghost">{{ events.items.length }}</span><span class="h-px flex-1 bg-base-300"></span></div>
      <div v-if="events.loading" class="grid min-h-60 place-items-center"><span class="loading loading-spinner loading-lg text-primary"></span></div>
      <div v-else-if="events.items.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><EventCard v-for="event in events.items" :key="event.id" :event="event" /></div>
      <div v-else class="hero min-h-72 rounded-2xl border border-dashed border-base-300 bg-base-100"><div class="hero-content text-center"><div><div class="mx-auto grid size-16 place-items-center rounded-full bg-primary/10"><Plus class="size-7 text-primary" /></div><h2 class="mt-5 font-display text-3xl">Crea tu primer evento</h2><p class="mt-2 text-sm opacity-55">Tu lista y árbol de invitados aparecerán aquí.</p><RouterLink to="/events/new" class="btn btn-primary mt-5">Empezar</RouterLink></div></div></div>
    </div>
  </div>
</template>
