<script setup lang="ts">
import { Info, Plus } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EventHeader from '../../components/EventHeader.vue'
import GuestFormModal from '../../components/GuestFormModal.vue'
import GuestTree from '../../components/GuestTree.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError } from '../../services/api'
import { useGuestsStore, type GuestPayload } from '../../stores/guests'
import { useToastsStore } from '../../stores/toasts'
import type { Guest } from '../../types'

const { event, eventId } = useEventContext()
const guests = useGuestsStore()
const toasts = useToastsStore()
const modal = ref(false)
const selected = ref<Guest | null>(null)
const pendingRemoval = ref<Guest | null>(null)
const parentId = ref<string | null>(null)
const busy = ref(false)
async function loadTree() {
  try {
    await guests.fetchTree(eventId.value)
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos cargar el árbol')
  }
}
onMounted(loadTree)
function open(guest: Guest | null = null, parent: Guest | null = null) {
  selected.value = guest
  parentId.value = parent?.id ?? null
  modal.value = true
}
async function save(payload: GuestPayload) {
  busy.value = true
  try {
    if (selected.value) await guests.update(eventId.value, selected.value.id, payload)
    else await guests.create(eventId.value, payload)
    modal.value = false
    await loadTree()
    toasts.success(selected.value ? 'Invitado actualizado.' : 'Invitado agregado.')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos guardar el invitado')
    await loadTree()
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
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos mover la relación')
    await loadTree()
  }
}
function requestRemove(guest: Guest) {
  pendingRemoval.value = guest
}
async function confirmRemove() {
  if (!pendingRemoval.value) return
  busy.value = true
  try {
    await guests.remove(eventId.value, pendingRemoval.value.id)
    modal.value = false
    pendingRemoval.value = null
    toasts.success('Invitado eliminado.')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos eliminar el invitado')
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <div class="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div class="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 class="font-display text-3xl">Árbol de relaciones</h2>
          <p class="mt-1 flex items-center gap-1.5 text-xs opacity-50">
            <Info class="size-3.5" />Arrastra una tarjeta para cambiar su relación o usa el formulario accesible.
          </p>
        </div>
        <button class="btn btn-primary w-full sm:w-auto" @click="open()">
          <Plus class="size-4" />Agregar invitado
        </button>
      </div>
      <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div
          class="flex flex-wrap gap-x-4 gap-y-2 border-b border-base-300 px-4 py-3 text-[10px] uppercase tracking-wide opacity-60 sm:px-5"
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
            ><div class="grid min-h-[24rem] place-items-center text-center sm:min-h-[30rem]">
              <div class="px-5 py-10">
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
      @remove="requestRemove"
    />
    <ConfirmDialog
      :open="Boolean(pendingRemoval)"
      title="Eliminar invitado"
      :message="`¿Seguro que quieres eliminar a ${pendingRemoval?.name ?? 'este invitado'}? Esta acción no se puede deshacer.`"
      :busy="busy"
      @cancel="pendingRemoval = null"
      @confirm="confirmRemove"
    />
  </div>
  <div v-else class="grid min-h-[calc(100svh-4rem)] place-items-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>
