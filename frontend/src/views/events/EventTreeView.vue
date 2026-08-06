<script setup lang="ts">
import { Info, Plus } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import EventHeader from '../../components/EventHeader.vue'
import GuestFormModal from '../../components/GuestFormModal.vue'
import GuestTree from '../../components/GuestTree.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError } from '../../services/api'
import { useGuestsStore, type GuestPayload } from '../../stores/guests'
import type { Guest } from '../../types'

const { event, eventId } = useEventContext()
const guests = useGuestsStore()
const modal = ref(false)
const selected = ref<Guest | null>(null)
const parentId = ref<string | null>(null)
const busy = ref(false)
const error = ref('')
onMounted(() => guests.fetchTree(eventId.value))
function open(guest: Guest | null = null, parent: Guest | null = null) {
  selected.value = guest
  parentId.value = parent?.id ?? null
  modal.value = true
  error.value = ''
}
async function save(payload: GuestPayload) {
  busy.value = true
  try {
    if (selected.value) await guests.update(eventId.value, selected.value.id, payload)
    else await guests.create(eventId.value, payload)
    modal.value = false
    await guests.fetchTree(eventId.value)
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos guardar'
    await guests.fetchTree(eventId.value)
  } finally {
    busy.value = false
  }
}
async function move(guestId: string, newParentId: string | null) {
  const guest = guests.items.find((item) => item.id === guestId)
  if (!guest || guest.parentId === newParentId) return
  const oldParentId = guest.parentId
  guest.parentId = newParentId
  try {
    await guests.update(eventId.value, guest.id, { parentId: newParentId, version: guest.version })
  } catch (cause) {
    guest.parentId = oldParentId
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos mover la relación'
    await guests.fetchTree(eventId.value)
  }
}
async function remove(guest: Guest) {
  if (!confirm(`¿Eliminar a ${guest.name}?`)) return
  busy.value = true
  try {
    await guests.remove(eventId.value, guest.id)
    modal.value = false
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos eliminar'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <div class="mx-auto max-w-[1500px] p-5 sm:p-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-3xl">Árbol de relaciones</h2>
          <p class="mt-1 flex items-center gap-1.5 text-xs opacity-50">
            <Info class="size-3.5" />Arrastra una tarjeta para cambiar su relación o usa el formulario accesible.
          </p>
        </div>
        <button class="btn btn-primary" @click="open()"><Plus class="size-4" />Agregar invitado</button>
      </div>
      <div v-if="error" class="alert alert-error mb-4">{{ error }}</div>
      <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div
          class="flex flex-wrap gap-4 border-b border-base-300 px-5 py-3 text-[10px] uppercase tracking-wide opacity-60"
        >
          <span class="flex items-center gap-1.5"><i class="size-2 rounded-full bg-success"></i>Confirmado</span
          ><span class="flex items-center gap-1.5"><i class="size-2 rounded-full bg-warning"></i>Pendiente</span
          ><span class="flex items-center gap-1.5"><i class="size-2 rounded-full bg-error"></i>No asiste</span>
        </div>
        <div v-if="guests.loading" class="grid min-h-[34rem] place-items-center">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <GuestTree
          v-else
          :guests="guests.items"
          @edit="(guest) => open(guest)"
          @add="(parent) => open(null, parent)"
          @move="move"
          ><template #empty
            ><div class="grid min-h-[30rem] place-items-center text-center">
              <div>
                <p class="font-display text-3xl">Tu árbol empieza aquí</p>
                <p class="mt-2 text-sm opacity-50">Agrega a la primera persona y construye sus relaciones.</p>
                <button class="btn btn-primary mt-5" @click="open()">Agregar primer invitado</button>
              </div>
            </div></template
          ></GuestTree
        >
      </section>
    </div>
    <GuestFormModal
      :open="modal"
      :guest="selected"
      :guests="guests.items"
      :parent-id="parentId"
      :busy="busy"
      @close="modal = false"
      @save="save"
      @remove="remove"
    />
  </div>
  <div v-else class="grid min-h-screen place-items-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>
