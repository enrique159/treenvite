<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import type { Guest, RsvpStatus } from '../types'
defineProps<{ guests: Guest[]; loading?: boolean }>()
const emit = defineEmits<{ edit: [guest: Guest] }>()
const status: Record<RsvpStatus, string> = { confirmed: 'Confirmado', pending: 'Pendiente', declined: 'No asiste' }
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
</script>
<template>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Invitado</th>
          <th>Grupo</th>
          <th>Relación</th>
          <th>Confirmación</th>
          <th>Acomp.</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="py-16 text-center"><span class="loading loading-spinner text-primary"></span></td>
        </tr>
        <tr
          v-for="guest in guests"
          v-else
          :key="guest.id"
          class="cursor-pointer hover:bg-base-200"
          @click="emit('edit', guest)"
        >
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="w-9 rounded-full bg-accent text-xs font-bold">
                  <span>{{ initials(guest.name) }}</span>
                </div>
              </div>
              <div>
                <div class="font-bold">{{ guest.name }}</div>
                <div class="text-xs opacity-45">{{ guest.email || guest.phone || 'Sin contacto' }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge badge-ghost badge-sm">{{ guest.groupName }}</span>
          </td>
          <td>{{ guest.relationLabel }}</td>
          <td>
            <span
              class="badge badge-sm"
              :class="
                guest.rsvp === 'confirmed'
                  ? 'badge-success badge-soft'
                  : guest.rsvp === 'pending'
                    ? 'badge-warning badge-soft'
                    : 'badge-error badge-soft'
              "
              >{{ status[guest.rsvp] }}</span
            >
          </td>
          <td>{{ guest.companions }}</td>
          <td>
            <button class="btn btn-ghost btn-square btn-xs" @click.stop="emit('edit', guest)">
              <MoreHorizontal class="size-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
