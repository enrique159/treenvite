<script setup lang="ts">
import { Copy, KeyRound, Mail, Trash2, UserRoundPlus } from '@lucide/vue'
import useVuelidate from '@vuelidate/core'
import { email, helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EventHeader from '../../components/EventHeader.vue'
import FormFieldError from '../../components/FormFieldError.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError, apiRequest } from '../../services/api'
import { useToastsStore } from '../../stores/toasts'
import type { EventAccessCode, EventInvitation, EventMember, EventRole } from '../../types'

const { event, eventId, events } = useEventContext()
const router = useRouter()
const toasts = useToastsStore()
const deleteOpen = ref(false)
const deleting = ref(false)
const saving = ref(false)
const inviting = ref(false)
const generatingCode = ref(false)
const members = ref<EventMember[]>([])
const invitations = ref<EventInvitation[]>([])
const codes = ref<EventAccessCode[]>([])
const revealedCode = ref('')
const eventForm = reactive({ name: '', type: '', location: '' })
const invite = reactive({ email: '', role: 'editor' as EventRole })
const code = reactive({ role: 'viewer' as EventRole, expiresAt: '' })

const infoRules = {
  name: {
    required: helpers.withMessage('Escribe el nombre del evento.', required),
    minLength: helpers.withMessage('El nombre debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El nombre no puede superar 160 caracteres.', maxLength(160)),
  },
  type: {
    required: helpers.withMessage('Escribe el tipo de evento.', required),
    minLength: helpers.withMessage('El tipo debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El tipo no puede superar 60 caracteres.', maxLength(60)),
  },
  location: {
    required: helpers.withMessage('Escribe la ubicación del evento.', required),
    minLength: helpers.withMessage('La ubicación debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('La ubicación no puede superar 255 caracteres.', maxLength(255)),
  },
}
const inviteRules = {
  email: {
    required: helpers.withMessage('Escribe el correo del colaborador.', required),
    email: helpers.withMessage('Escribe un correo electrónico válido.', email),
  },
  role: { required: helpers.withMessage('Selecciona el nivel de acceso.', required) },
}
const expiresInFuture = (value: string) => {
  if (!value) return true
  const expiresAt = new Date(`${value}T23:59:59`)
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now()
}
const codeRules = {
  role: { required: helpers.withMessage('Selecciona el nivel de acceso.', required) },
  expiresAt: {
    required: helpers.withMessage('Selecciona la fecha de vencimiento.', required),
    expiresInFuture: helpers.withMessage('La fecha de vencimiento debe ser futura.', expiresInFuture),
  },
}
const infoV$ = useVuelidate(infoRules, eventForm)
const inviteV$ = useVuelidate(inviteRules, invite)
const codeV$ = useVuelidate(codeRules, code)

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof ApiError ? cause.message : fallback
}

async function loadAccess() {
  if (event.value?.role !== 'owner') return
  try {
    ;[members.value, invitations.value, codes.value] = await Promise.all([
      apiRequest<EventMember[]>(`/events/${eventId.value}/members`),
      apiRequest<EventInvitation[]>(`/events/${eventId.value}/invitations`),
      apiRequest<EventAccessCode[]>(`/events/${eventId.value}/access-codes`),
    ])
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos cargar los accesos del evento.'))
  }
}
watch(
  event,
  (current) => {
    if (!current) return
    Object.assign(eventForm, { name: current.name, type: current.type, location: current.location })
    infoV$.value.$reset()
    if (current?.role === 'owner') void loadAccess()
  },
  { immediate: true },
)
async function saveEvent() {
  if (!event.value || !(await infoV$.value.$validate())) return

  saving.value = true
  try {
    await events.update(eventId.value, {
      name: eventForm.name,
      type: eventForm.type,
      startsAt: event.value.startsAt,
      location: eventForm.location,
      color: event.value.color,
      version: event.value.version,
    })
    toasts.success('Cambios guardados correctamente.')
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos guardar los cambios.'))
  } finally {
    saving.value = false
  }
}
async function sendInvite() {
  if (!(await inviteV$.value.$validate())) return

  inviting.value = true
  try {
    await apiRequest(`/events/${eventId.value}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email: invite.email.trim(), role: invite.role }),
    })
    invite.email = ''
    inviteV$.value.$reset()
    toasts.success('Invitación enviada correctamente.')
    await loadAccess()
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos enviar la invitación.'))
  } finally {
    inviting.value = false
  }
}
async function createCode() {
  if (!(await codeV$.value.$validate())) return

  generatingCode.value = true
  try {
    const result = await apiRequest<EventAccessCode>(`/events/${eventId.value}/access-codes`, {
      method: 'POST',
      body: JSON.stringify({ ...code, expiresAt: new Date(`${code.expiresAt}T23:59:59`).toISOString() }),
    })
    revealedCode.value = result.code || ''
    code.expiresAt = ''
    codeV$.value.$reset()
    toasts.success('Código temporal generado.')
    await loadAccess()
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos generar el código temporal.'))
  } finally {
    generatingCode.value = false
  }
}
async function removeMember(id: string) {
  try {
    await apiRequest(`/events/${eventId.value}/members/${id}`, { method: 'DELETE' })
    toasts.success('Acceso eliminado.')
    await loadAccess()
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos eliminar el acceso.'))
  }
}
async function revokeCode(id: string) {
  try {
    await apiRequest(`/events/${eventId.value}/access-codes/${id}`, { method: 'DELETE' })
    toasts.success('Código revocado.')
    await loadAccess()
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos revocar el código.'))
  }
}
async function copyCode() {
  if (!revealedCode.value) return
  try {
    await navigator.clipboard.writeText(revealedCode.value)
    toasts.success('Código copiado al portapapeles.')
  } catch {
    toasts.error('No pudimos copiar el código.')
  }
}
async function deleteEvent() {
  deleting.value = true
  try {
    await events.remove(eventId.value)
    toasts.success('Evento eliminado.')
    await router.push('/events')
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos eliminar el evento.'))
    deleteOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>
<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <div class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-2 lg:px-8">
      <section class="card border border-base-300 bg-base-100 lg:col-span-2">
        <div class="card-body p-5 sm:p-7">
          <h2 class="card-title font-display text-2xl">Información del evento</h2>
          <form class="mt-4 grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="saveEvent">
            <div class="grid content-start gap-1.5 sm:col-span-2">
              <label class="text-xs font-semibold" for="settings-event-name">Nombre</label>
              <input
                id="settings-event-name"
                v-model.trim="eventForm.name"
                class="input w-full"
                :class="{ 'input-error': infoV$.name.$error }"
                required
                :aria-invalid="infoV$.name.$error"
                :aria-describedby="infoV$.name.$error ? 'settings-event-name-error' : undefined"
                @blur="infoV$.name.$touch()"
              />
              <FormFieldError id="settings-event-name-error" :errors="infoV$.name.$errors" />
            </div>
            <div class="grid content-start gap-1.5">
              <label class="text-xs font-semibold" for="settings-event-type">Tipo</label>
              <input
                id="settings-event-type"
                v-model.trim="eventForm.type"
                class="input w-full"
                :class="{ 'input-error': infoV$.type.$error }"
                required
                :aria-invalid="infoV$.type.$error"
                :aria-describedby="infoV$.type.$error ? 'settings-event-type-error' : undefined"
                @blur="infoV$.type.$touch()"
              />
              <FormFieldError id="settings-event-type-error" :errors="infoV$.type.$errors" />
            </div>
            <div class="grid content-start gap-1.5">
              <label class="text-xs font-semibold" for="settings-event-location">Ubicación</label>
              <input
                id="settings-event-location"
                v-model.trim="eventForm.location"
                class="input w-full"
                :class="{ 'input-error': infoV$.location.$error }"
                required
                :aria-invalid="infoV$.location.$error"
                :aria-describedby="infoV$.location.$error ? 'settings-event-location-error' : undefined"
                @blur="infoV$.location.$touch()"
              />
              <FormFieldError id="settings-event-location-error" :errors="infoV$.location.$errors" />
            </div>
            <div class="sm:col-span-2 flex justify-stretch sm:justify-end">
              <button class="btn btn-primary w-full sm:w-auto" :disabled="saving">
                <span v-if="saving" class="loading loading-spinner loading-xs"></span>Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </section>
      <template v-if="event.role === 'owner'"
        ><section class="card border border-base-300 bg-base-100">
          <div class="card-body p-5 sm:p-7">
            <h2 class="card-title font-display text-2xl"><UserRoundPlus class="size-5 text-primary" />Colaboradores</h2>
            <p class="text-sm opacity-55">Da acceso permanente a otras personas del equipo.</p>
            <form
              class="mt-3 grid items-start gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              novalidate
              @submit.prevent="sendInvite"
            >
              <div class="grid content-start gap-1.5">
                <label class="sr-only" for="collaborator-email">Correo del colaborador</label>
                <input
                  id="collaborator-email"
                  v-model.trim="invite.email"
                  class="input w-full"
                  :class="{ 'input-error': inviteV$.email.$error }"
                  type="email"
                  required
                  :aria-invalid="inviteV$.email.$error"
                  :aria-describedby="inviteV$.email.$error ? 'collaborator-email-error' : undefined"
                  placeholder="colaborador@correo.com"
                  @blur="inviteV$.email.$touch()"
                />
                <FormFieldError id="collaborator-email-error" :errors="inviteV$.email.$errors" />
              </div>
              <div class="grid content-start gap-1.5">
                <label class="sr-only" for="collaborator-role">Nivel de acceso</label>
                <select
                  id="collaborator-role"
                  v-model="invite.role"
                  class="select w-full sm:w-auto"
                  :class="{ 'select-error': inviteV$.role.$error }"
                  required
                  :aria-invalid="inviteV$.role.$error"
                  :aria-describedby="inviteV$.role.$error ? 'collaborator-role-error' : undefined"
                  @blur="inviteV$.role.$touch()"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Solo lectura</option>
                </select>
                <FormFieldError id="collaborator-role-error" :errors="inviteV$.role.$errors" />
              </div>
              <button class="btn btn-primary w-full sm:w-auto" :disabled="inviting">
                <span v-if="inviting" class="loading loading-spinner loading-xs"></span
                ><Mail v-else class="size-4" />Invitar
              </button>
            </form>
            <div class="divider"></div>
            <div class="grid gap-2">
              <div
                v-for="member in members"
                :key="member.id"
                class="flex items-center gap-3 rounded-xl bg-base-200 p-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold">{{ member.user.name }}</p>
                  <p class="truncate text-xs opacity-50">{{ member.user.email }} · {{ member.role }}</p>
                </div>
                <button
                  class="btn btn-ghost btn-square text-error"
                  :aria-label="`Eliminar acceso de ${member.user.name}`"
                  @click="removeMember(member.id)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
              <div
                v-for="pending in invitations.filter((i) => i.status === 'pending')"
                :key="pending.id"
                class="flex flex-col items-start gap-2 rounded-xl border border-dashed border-base-300 p-3 text-xs sm:flex-row sm:items-center"
              >
                <span class="flex-1">{{ pending.email }}</span
                ><span class="badge badge-warning badge-soft">Pendiente</span>
              </div>
              <p
                v-if="!members.length && !invitations.some((item) => item.status === 'pending')"
                class="py-4 text-center text-sm opacity-50"
              >
                Aún no hay colaboradores ni invitaciones pendientes.
              </p>
            </div>
          </div>
        </section>
        <section class="card border border-base-300 bg-base-100">
          <div class="card-body p-5 sm:p-7">
            <h2 class="card-title font-display text-2xl"><KeyRound class="size-5 text-primary" />Códigos temporales</h2>
            <p class="text-xs opacity-50">El código completo sólo aparece una vez al crearlo.</p>
            <div v-if="revealedCode" class="alert alert-success mt-3">
              <strong class="flex-1 tracking-widest">{{ revealedCode }}</strong
              ><button class="btn btn-sm" @click="copyCode"><Copy class="size-4" />Copiar</button>
            </div>
            <form
              class="mt-4 grid items-start gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              novalidate
              @submit.prevent="createCode"
            >
              <div class="grid content-start gap-1.5">
                <label class="sr-only" for="access-code-role">Nivel de acceso</label>
                <select
                  id="access-code-role"
                  v-model="code.role"
                  class="select w-full sm:w-auto"
                  :class="{ 'select-error': codeV$.role.$error }"
                  required
                  :aria-invalid="codeV$.role.$error"
                  :aria-describedby="codeV$.role.$error ? 'access-code-role-error' : undefined"
                  @blur="codeV$.role.$touch()"
                >
                  <option value="viewer">Solo lectura</option>
                  <option value="editor">Editor</option>
                </select>
                <FormFieldError id="access-code-role-error" :errors="codeV$.role.$errors" />
              </div>
              <div class="grid content-start gap-1.5">
                <label class="sr-only" for="access-code-expiration">Fecha de vencimiento</label>
                <input
                  id="access-code-expiration"
                  v-model="code.expiresAt"
                  class="input w-full"
                  :class="{ 'input-error': codeV$.expiresAt.$error }"
                  type="date"
                  required
                  :aria-invalid="codeV$.expiresAt.$error"
                  :aria-describedby="codeV$.expiresAt.$error ? 'access-code-expiration-error' : undefined"
                  @blur="codeV$.expiresAt.$touch()"
                />
                <FormFieldError id="access-code-expiration-error" :errors="codeV$.expiresAt.$errors" />
              </div>
              <button class="btn btn-primary w-full sm:w-auto" :disabled="generatingCode">
                <span v-if="generatingCode" class="loading loading-spinner loading-xs"></span>Generar código
              </button>
            </form>
            <div class="divider"></div>
            <div class="grid gap-2">
              <div
                v-for="item in codes"
                :key="item.id"
                class="flex flex-wrap items-center gap-3 rounded-xl bg-base-200 p-3"
              >
                <strong class="flex-1 tracking-widest">{{ item.maskedCode }}</strong
                ><span class="badge">{{ item.role }}</span
                ><button
                  v-if="!item.revokedAt"
                  class="btn btn-ghost btn-square text-error"
                  aria-label="Revocar código"
                  @click="revokeCode(item.id)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
              <p v-if="!codes.length" class="py-4 text-center text-sm opacity-50">Todavía no has generado códigos.</p>
            </div>
          </div>
        </section>
        <section class="card border border-error/25 bg-error/5 lg:col-span-2">
          <div class="card-body gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
            <div class="min-w-0 flex-1">
              <h2 class="card-title font-display text-2xl text-error">Zona de peligro</h2>
              <p class="mt-1 text-sm opacity-60">
                Eliminar el evento también quitará el acceso a sus colaboradores y a toda su lista de invitados.
              </p>
            </div>
            <button class="btn btn-error w-full sm:w-auto" type="button" @click="deleteOpen = true">
              <Trash2 class="size-4" />Eliminar evento
            </button>
          </div>
        </section></template
      >
      <div v-else class="alert alert-info lg:col-span-2">
        Sólo la persona propietaria puede administrar colaboradores y códigos.
      </div>
    </div>
    <ConfirmDialog
      :open="deleteOpen"
      title="Eliminar evento"
      :message="`¿Seguro que quieres eliminar “${event.name}”? Todos sus invitados y accesos dejarán de estar disponibles.`"
      confirm-label="Eliminar definitivamente"
      :busy="deleting"
      @cancel="deleteOpen = false"
      @confirm="deleteEvent"
    />
  </div>
  <div v-else class="grid min-h-[calc(100svh-4rem)] place-items-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>
