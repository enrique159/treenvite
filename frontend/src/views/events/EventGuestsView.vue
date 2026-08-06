<script setup lang="ts">
import { CheckCircle2, Download, Plus, Search, UserPlus, UsersRound } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EventHeader from '../../components/EventHeader.vue'
import GuestFormModal from '../../components/GuestFormModal.vue'
import GuestTable from '../../components/GuestTable.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError, downloadCsv } from '../../services/api'
import { useGuestsStore, type GuestPayload } from '../../stores/guests'
import { useToastsStore } from '../../stores/toasts'
import type { Guest, RsvpStatus } from '../../types'

const { event, eventId } = useEventContext()
const guests = useGuestsStore()
const toasts = useToastsStore()
const search = ref('')
const rsvp = ref<'all' | RsvpStatus>('all')
const page = ref(1)
const modal = ref(false)
const selected = ref<Guest | null>(null)
const pendingRemoval = ref<Guest | null>(null)
const busy = ref(false)
const params = computed(() => {
  const value = new URLSearchParams({ page: String(page.value), limit: '50' })
  if (search.value) value.set('search', search.value)
  if (rsvp.value !== 'all') value.set('rsvp', rsvp.value)
  return value
})
let timer: ReturnType<typeof setTimeout>
async function load() {
  try {
    await guests.fetchTable(eventId.value, params.value)
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos cargar los invitados')
  }
}
watch([search, rsvp], () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    void load()
  }, 250)
})
onMounted(load)
function open(guest: Guest | null = null) {
  selected.value = guest
  modal.value = true
}
async function save(payload: GuestPayload) {
  busy.value = true
  try {
    if (selected.value) await guests.update(eventId.value, selected.value.id, payload)
    else await guests.create(eventId.value, payload)
    modal.value = false
    await load()
    toasts.success(selected.value ? 'Invitado actualizado.' : 'Invitado agregado.')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos guardar el invitado')
  } finally {
    busy.value = false
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
async function exportGuests() {
  if (!event.value) return
  try {
    await downloadCsv(`/events/${eventId.value}/guests/export.csv`, `${event.value.name}-invitados.csv`)
    toasts.success('Archivo CSV generado.')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos exportar la lista')
  }
}
</script>
<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section class="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div class="stat min-w-0 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-5">
          <div class="stat-figure hidden text-primary sm:block"><UsersRound class="size-6" /></div>
          <div class="stat-title truncate text-[10px] sm:text-xs">Invitados</div>
          <div class="stat-value font-display text-3xl sm:text-4xl">{{ guests.total }}</div>
        </div>
        <div class="stat min-w-0 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-5">
          <div class="stat-figure hidden text-success sm:block"><CheckCircle2 class="size-6" /></div>
          <div class="stat-title truncate text-[10px] sm:text-xs">Confirmados</div>
          <div class="stat-value font-display text-3xl text-success sm:text-4xl">
            {{ guests.items.filter((g) => g.rsvp === 'confirmed').length }}
          </div>
        </div>
        <div class="stat min-w-0 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-5">
          <div class="stat-figure hidden text-secondary sm:block"><UserPlus class="size-6" /></div>
          <div class="stat-title truncate text-[10px] sm:text-xs">Acompañantes</div>
          <div class="stat-value font-display text-3xl sm:text-4xl">
            {{ guests.items.reduce((sum, g) => sum + g.companions, 0) }}
          </div>
        </div>
      </section>
      <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div class="grid grid-cols-2 items-center gap-3 border-b border-base-300 p-4 sm:flex">
          <label class="input col-span-2 flex w-full items-center gap-2 sm:min-w-56 sm:flex-1"
            ><Search class="size-4 opacity-40" /><input
              v-model="search"
              class="grow"
              placeholder="Buscar invitado…" /></label
          ><select v-model="rsvp" class="select col-span-2 w-full sm:w-auto">
            <option value="all">Todos</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Pendientes</option>
            <option value="declined">No asisten</option></select
          ><button class="btn btn-outline w-full sm:w-auto" @click="exportGuests">
            <Download class="size-4" /><span>Exportar</span></button
          ><button class="btn btn-primary w-full sm:w-auto" @click="open()"><Plus class="size-4" />Agregar</button>
        </div>
        <GuestTable
          v-if="guests.loading || guests.items.length"
          :guests="guests.items"
          :loading="guests.loading"
          @edit="open"
        />
        <div v-if="!guests.loading && !guests.items.length" class="grid min-h-64 place-items-center text-center">
          <div class="px-6 py-12">
            <p class="font-display text-2xl">Tu lista empieza aquí</p>
            <p class="mt-2 text-sm opacity-50">Agrega a la primera persona del evento.</p>
            <button class="btn btn-primary mt-5" @click="open()">Agregar invitado</button>
          </div>
        </div>
      </section>
    </div>
    <GuestFormModal
      :open="modal"
      :guest="selected"
      :guests="guests.items"
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
