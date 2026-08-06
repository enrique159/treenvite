<script setup lang="ts">
import { Copy, KeyRound, Mail, Trash2, UserRoundPlus } from '@lucide/vue'
import { reactive, ref, watch } from 'vue'
import EventHeader from '../../components/EventHeader.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError, apiRequest } from '../../services/api'
import type { EventAccessCode, EventInvitation, EventMember, EventRole } from '../../types'

const { event, eventId, events } = useEventContext()
const error = ref('')
const saved = ref('')
const members = ref<EventMember[]>([])
const invitations = ref<EventInvitation[]>([])
const codes = ref<EventAccessCode[]>([])
const revealedCode = ref('')
const invite = reactive({ email: '', role: 'editor' as EventRole })
const code = reactive({ role: 'viewer' as EventRole, expiresAt: '' })
async function loadAccess() {
  if (event.value?.role !== 'owner') return
  ;[members.value, invitations.value, codes.value] = await Promise.all([
    apiRequest<EventMember[]>(`/events/${eventId.value}/members`),
    apiRequest<EventInvitation[]>(`/events/${eventId.value}/invitations`),
    apiRequest<EventAccessCode[]>(`/events/${eventId.value}/access-codes`),
  ])
}
watch(
  event,
  (current) => {
    if (current?.role === 'owner') void loadAccess()
  },
  { immediate: true },
)
async function saveEvent() {
  if (!event.value) return
  try {
    await events.update(eventId.value, {
      name: event.value.name,
      type: event.value.type,
      startsAt: event.value.startsAt,
      location: event.value.location,
      color: event.value.color,
      version: event.value.version,
    })
    saved.value = 'Cambios guardados'
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos guardar'
  }
}
async function sendInvite() {
  await apiRequest(`/events/${eventId.value}/invitations`, { method: 'POST', body: JSON.stringify(invite) })
  invite.email = ''
  await loadAccess()
}
async function createCode() {
  const result = await apiRequest<EventAccessCode>(`/events/${eventId.value}/access-codes`, {
    method: 'POST',
    body: JSON.stringify({ ...code, expiresAt: new Date(`${code.expiresAt}T23:59:59`).toISOString() }),
  })
  revealedCode.value = result.code || ''
  await loadAccess()
}
async function removeMember(id: string) {
  await apiRequest(`/events/${eventId.value}/members/${id}`, { method: 'DELETE' })
  await loadAccess()
}
async function revokeCode(id: string) {
  await apiRequest(`/events/${eventId.value}/access-codes/${id}`, { method: 'DELETE' })
  await loadAccess()
}
async function copyCode() {
  if (revealedCode.value) await navigator.clipboard.writeText(revealedCode.value)
}
</script>
<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <div class="mx-auto grid max-w-5xl gap-6 p-5 sm:p-8">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="saved" class="alert alert-success">{{ saved }}</div>
      <section class="card border border-base-300 bg-base-100">
        <div class="card-body">
          <h2 class="card-title font-display text-2xl">Información del evento</h2>
          <form class="mt-3 grid gap-4 sm:grid-cols-2" @submit.prevent="saveEvent">
            <label class="form-control sm:col-span-2"
              ><span class="label-text mb-1 text-xs">Nombre</span
              ><input v-model="event.name" class="input input-bordered" /></label
            ><label class="form-control"
              ><span class="label-text mb-1 text-xs">Tipo</span
              ><input v-model="event.type" class="input input-bordered" /></label
            ><label class="form-control"
              ><span class="label-text mb-1 text-xs">Ubicación</span
              ><input v-model="event.location" class="input input-bordered"
            /></label>
            <div class="sm:col-span-2 flex justify-end"><button class="btn btn-primary">Guardar cambios</button></div>
          </form>
        </div>
      </section>
      <template v-if="event.role === 'owner'"
        ><section class="card border border-base-300 bg-base-100">
          <div class="card-body">
            <h2 class="card-title font-display text-2xl"><UserRoundPlus class="size-5 text-primary" />Colaboradores</h2>
            <form class="mt-3 flex flex-wrap gap-2" @submit.prevent="sendInvite">
              <input
                v-model="invite.email"
                class="input input-bordered min-w-64 flex-1"
                type="email"
                required
                placeholder="colaborador@correo.com"
              /><select v-model="invite.role" class="select select-bordered">
                <option value="editor">Editor</option>
                <option value="viewer">Solo lectura</option></select
              ><button class="btn btn-primary"><Mail class="size-4" />Invitar</button>
            </form>
            <div class="divider"></div>
            <div class="grid gap-2">
              <div
                v-for="member in members"
                :key="member.id"
                class="flex items-center gap-3 rounded-lg bg-base-200 p-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold">{{ member.user.name }}</p>
                  <p class="truncate text-xs opacity-50">{{ member.user.email }} · {{ member.role }}</p>
                </div>
                <button class="btn btn-ghost btn-square btn-sm text-error" @click="removeMember(member.id)">
                  <Trash2 class="size-4" />
                </button>
              </div>
              <div
                v-for="pending in invitations.filter((i) => i.status === 'pending')"
                :key="pending.id"
                class="flex items-center rounded-lg border border-dashed border-base-300 p-3 text-xs"
              >
                <span class="flex-1">{{ pending.email }}</span
                ><span class="badge badge-warning badge-soft">Pendiente</span>
              </div>
            </div>
          </div>
        </section>
        <section class="card border border-base-300 bg-base-100">
          <div class="card-body">
            <h2 class="card-title font-display text-2xl"><KeyRound class="size-5 text-primary" />Códigos temporales</h2>
            <p class="text-xs opacity-50">El código completo sólo aparece una vez al crearlo.</p>
            <div v-if="revealedCode" class="alert alert-success mt-3">
              <strong class="flex-1 tracking-widest">{{ revealedCode }}</strong
              ><button class="btn btn-sm" @click="copyCode"><Copy class="size-4" />Copiar</button>
            </div>
            <form class="mt-4 flex flex-wrap gap-2" @submit.prevent="createCode">
              <select v-model="code.role" class="select select-bordered">
                <option value="viewer">Solo lectura</option>
                <option value="editor">Editor</option></select
              ><input v-model="code.expiresAt" class="input input-bordered" type="date" required /><button
                class="btn btn-primary"
              >
                Generar código
              </button>
            </form>
            <div class="divider"></div>
            <div class="grid gap-2">
              <div v-for="item in codes" :key="item.id" class="flex items-center gap-3 rounded-lg bg-base-200 p-3">
                <strong class="flex-1 tracking-widest">{{ item.maskedCode }}</strong
                ><span class="badge">{{ item.role }}</span
                ><button
                  v-if="!item.revokedAt"
                  class="btn btn-ghost btn-square btn-sm text-error"
                  @click="revokeCode(item.id)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
            </div>
          </div></section
      ></template>
      <div v-else class="alert alert-info">Sólo la persona propietaria puede administrar colaboradores y códigos.</div>
    </div>
  </div>
  <div v-else class="grid min-h-screen place-items-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>
