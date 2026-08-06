<script setup lang="ts">
import { ArrowRight, MapPin, Users } from '@lucide/vue'
import type { EventItem } from '../types'
defineProps<{ event: EventItem }>()
const formatDate = (value: string) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
</script>
<template>
  <RouterLink :to="`/events/${event.id}/guests`" class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div class="card-body gap-4 p-5">
      <div class="flex items-center justify-between"><span class="badge badge-ghost text-[10px] font-bold uppercase">{{ event.type }}</span><span class="badge" :class="event.status === 'active' ? 'badge-success badge-soft' : 'badge-warning badge-soft'">{{ event.status === 'draft' ? 'Borrador' : event.status === 'active' ? 'Activo' : 'Finalizado' }}</span></div>
      <div><h2 class="font-display text-2xl">{{ event.name }}</h2><p class="mt-2 flex items-center gap-1.5 text-xs opacity-60"><MapPin class="size-3.5" />{{ event.location }}</p></div>
      <div class="mt-auto flex items-end justify-between border-t border-base-300 pt-4"><div><p class="text-xs font-bold text-primary">{{ formatDate(event.startsAt) }}</p><p class="mt-1 flex items-center gap-1 text-[10px] opacity-50"><Users class="size-3" /> Gestionar invitados</p></div><ArrowRight class="size-5 text-primary" /></div>
    </div>
  </RouterLink>
</template>
