<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import type { Guest, RsvpStatus } from '../types'
import InitialsAvatar from './InitialsAvatar.vue'
defineProps<{ guests: Guest[]; loading?: boolean }>()
const emit = defineEmits<{ edit: [guest: Guest] }>()
const status: Record<RsvpStatus, string> = { confirmed: 'Confirmado', pending: 'Pendiente', declined: 'No asiste' }
const side = { groom: 'Novio', bride: 'Novia' } as const
</script>
<template>
  <div v-if="loading" class="grid min-h-48 place-items-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
  <div v-else>
    <div class="grid gap-2 p-3 sm:hidden">
      <button
        v-for="guest in guests"
        :key="guest.id"
        class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="emit('edit', guest)"
      >
        <InitialsAvatar :name="guest.name" size="md" />
        <span class="min-w-0">
          <strong class="block truncate text-sm">{{ guest.name }}</strong>
          <span class="mt-0.5 block truncate text-xs opacity-55"
            >{{ guest.relationLabel }} · {{ guest.invitedBySide ? side[guest.invitedBySide] : 'Sin parte' }} ·
            {{ guest.groupName }}</span
          >
        </span>
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
      </button>
    </div>
    <div class="hidden overflow-x-auto sm:block">
      <table class="table">
        <thead>
          <tr>
            <th>Invitado</th>
            <th>Grupo</th>
            <th>Relación</th>
            <th>Por parte de</th>
            <th>Confirmación</th>
            <th>Acomp.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="guest in guests"
            :key="guest.id"
            class="cursor-pointer hover:bg-base-200"
            @click="emit('edit', guest)"
          >
            <td>
              <div class="flex items-center gap-3">
                <InitialsAvatar :name="guest.name" />
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
            <td>{{ guest.invitedBySide ? side[guest.invitedBySide] : '—' }}</td>
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
              <button
                class="btn btn-ghost btn-square btn-sm"
                :aria-label="`Editar a ${guest.name}`"
                @click.stop="emit('edit', guest)"
              >
                <MoreHorizontal class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
