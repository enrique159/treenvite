<script setup lang="ts">
import { Braces, Check, Clipboard, ExternalLink, KeyRound, Plus, ShieldCheck, Trash2, X } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EventHeader from '../../components/EventHeader.vue'
import { useEventContext } from '../../composables/useEventContext'
import { ApiError, apiRequest } from '../../services/api'
import { useToastsStore } from '../../stores/toasts'
import type { ApiTokenItem, ApiTokenPermission, CreatedApiToken } from '../../types'

const { eventId, event } = useEventContext()
const toasts = useToastsStore()
const tokens = ref<ApiTokenItem[]>([])
const loading = ref(true)
const creating = ref(false)
const revoking = ref(false)
const loadError = ref('')
const tokenToRevoke = ref<ApiTokenItem | null>(null)
const revealedToken = ref('')
const copied = ref(false)

function suggestedExpiration(): string {
  const date = new Date()
  date.setDate(date.getDate() + 90)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const form = reactive({
  name: '',
  permission: 'read' as ApiTokenPermission,
  expiresAt: suggestedExpiration(),
})

const minimumExpiration = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof ApiError ? cause.message : fallback
}

async function loadTokens(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    tokens.value = await apiRequest<ApiTokenItem[]>(`/events/${eventId.value}/api-tokens`)
  } catch (cause) {
    loadError.value = errorMessage(cause, 'No pudimos cargar los tokens de este evento.')
  } finally {
    loading.value = false
  }
}

watch(
  event,
  (current) => {
    if (!current) return
    if (current.role === 'owner') void loadTokens()
    else loading.value = false
  },
  { immediate: true },
)

async function createToken(): Promise<void> {
  if (form.name.trim().length < 2) {
    toasts.error('Escribe un nombre de al menos dos caracteres.')
    return
  }
  creating.value = true
  try {
    const result = await apiRequest<CreatedApiToken>(`/events/${eventId.value}/api-tokens`, {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.trim(),
        permission: form.permission,
        ...(form.expiresAt ? { expiresAt: new Date(`${form.expiresAt}T23:59:59`).toISOString() } : {}),
      }),
    })
    revealedToken.value = result.token
    copied.value = false
    form.name = ''
    form.permission = 'read'
    form.expiresAt = suggestedExpiration()
    await loadTokens()
    toasts.success('Token creado. Cópialo antes de cerrar esta ventana.')
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos crear el token.'))
  } finally {
    creating.value = false
  }
}

async function copyToken(): Promise<void> {
  if (!revealedToken.value) return
  try {
    await navigator.clipboard.writeText(revealedToken.value)
    copied.value = true
    toasts.success('Token copiado al portapapeles.')
  } catch {
    toasts.error('No pudimos copiar el token. Selecciónalo y cópialo manualmente.')
  }
}

function closeSecret(): void {
  revealedToken.value = ''
  copied.value = false
}

async function revokeToken(): Promise<void> {
  if (!tokenToRevoke.value) return
  revoking.value = true
  try {
    await apiRequest(`/events/${eventId.value}/api-tokens/${tokenToRevoke.value.id}`, {
      method: 'DELETE',
    })
    tokenToRevoke.value = null
    await loadTokens()
    toasts.success('Token revocado correctamente.')
  } catch (cause) {
    toasts.error(errorMessage(cause, 'No pudimos revocar el token.'))
  } finally {
    revoking.value = false
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'Nunca'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const statusLabels = {
  active: 'Activo',
  expired: 'Vencido',
  revoked: 'Revocado',
} as const

const permissionLabels = {
  read: 'Sólo lectura',
  read_write: 'Lectura y escritura',
} as const
</script>

<template>
  <div v-if="event">
    <EventHeader :event="event" />
    <main class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section v-if="event.role !== 'owner'" class="alert alert-warning" role="alert">
        <ShieldCheck class="size-5" />
        <span>Sólo el propietario del evento puede administrar integraciones.</span>
      </section>

      <template v-else>
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Integraciones</p>
            <h2 class="mt-2 font-display text-3xl text-secondary sm:text-4xl">API para terceros</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 opacity-60">
              Crea credenciales para servicios de confianza. Cada token sólo puede acceder a este evento.
            </p>
          </div>
          <RouterLink to="/documentacion/api" target="_blank" class="btn btn-outline shrink-0">
            <Braces class="size-4" />Ver documentación<ExternalLink class="size-3.5" />
          </RouterLink>
        </header>

        <section class="card border border-base-300 bg-base-100">
          <div class="card-body p-5 sm:p-7">
            <h3 class="card-title font-display text-2xl"><Plus class="size-5 text-primary" />Crear token</h3>
            <form
              class="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
              @submit.prevent="createToken"
            >
              <div class="grid gap-1.5">
                <label for="api-token-name" class="text-xs font-semibold">Nombre de la integración</label>
                <input
                  id="api-token-name"
                  v-model.trim="form.name"
                  class="input w-full"
                  minlength="2"
                  maxlength="100"
                  required
                  placeholder="CRM del evento"
                />
              </div>
              <div class="grid gap-1.5">
                <label for="api-token-permission" class="text-xs font-semibold">Permisos</label>
                <select id="api-token-permission" v-model="form.permission" class="select w-full lg:w-auto">
                  <option value="read">Sólo lectura</option>
                  <option value="read_write">Lectura y escritura</option>
                </select>
              </div>
              <div class="grid gap-1.5">
                <label for="api-token-expiration" class="text-xs font-semibold">Vencimiento opcional</label>
                <div class="join w-full">
                  <input
                    id="api-token-expiration"
                    v-model="form.expiresAt"
                    type="date"
                    class="input join-item min-w-0 flex-1"
                    :min="minimumExpiration"
                  />
                  <button
                    v-if="form.expiresAt"
                    class="btn btn-ghost join-item border-base-300"
                    type="button"
                    aria-label="Crear sin vencimiento"
                    title="Quitar vencimiento"
                    @click="form.expiresAt = ''"
                  >
                    <X class="size-4" />
                  </button>
                </div>
                <p v-if="!form.expiresAt" class="text-xs text-warning">
                  El token permanecerá activo hasta que lo revoques.
                </p>
              </div>
              <button class="btn btn-primary mt-auto w-full lg:w-auto" :disabled="creating">
                <span v-if="creating" class="loading loading-spinner loading-xs"></span>
                <KeyRound v-else class="size-4" />Crear token
              </button>
            </form>
          </div>
        </section>

        <section class="card border border-base-300 bg-base-100">
          <div class="card-body p-0">
            <div class="flex items-center justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-7">
              <div>
                <h3 class="font-display text-2xl">Tokens del evento</h3>
                <p class="mt-1 text-sm opacity-55">
                  Los secretos no pueden volver a consultarse después de su creación.
                </p>
              </div>
              <span v-if="!loading" class="badge badge-ghost">{{ tokens.length }}</span>
            </div>

            <div v-if="loading" class="grid min-h-48 place-items-center" role="status">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <span class="sr-only">Cargando tokens</span>
            </div>
            <div v-else-if="loadError" class="m-5 alert alert-error sm:m-7" role="alert">
              <span class="min-w-0 flex-1">{{ loadError }}</span>
              <button class="btn btn-sm" type="button" @click="loadTokens">Reintentar</button>
            </div>
            <div v-else-if="!tokens.length" class="grid min-h-48 place-items-center px-5 py-10 text-center sm:px-7">
              <div>
                <KeyRound class="mx-auto size-10 text-primary/45" />
                <p class="mt-3 font-semibold">Todavía no hay tokens</p>
                <p class="mt-1 text-sm opacity-55">Crea el primero para conectar una aplicación externa.</p>
              </div>
            </div>

            <div v-else class="mt-5">
              <div class="hidden overflow-x-auto md:block">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Integración</th>
                      <th>Permisos</th>
                      <th>Estado</th>
                      <th>Último uso</th>
                      <th>Vencimiento</th>
                      <th><span class="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="token in tokens" :key="token.id">
                      <td>
                        <p class="font-semibold">{{ token.name }}</p>
                        <p class="font-mono text-xs opacity-45">tv_api_••••{{ token.tokenSuffix }}</p>
                      </td>
                      <td>{{ permissionLabels[token.permission] }}</td>
                      <td>
                        <span
                          class="badge badge-sm"
                          :class="
                            token.status === 'active'
                              ? 'badge-success'
                              : token.status === 'expired'
                                ? 'badge-warning'
                                : 'badge-error'
                          "
                          >{{ statusLabels[token.status] }}</span
                        >
                      </td>
                      <td>{{ formatDate(token.lastUsedAt) }}</td>
                      <td>{{ formatDate(token.expiresAt) }}</td>
                      <td class="text-right">
                        <button
                          class="btn btn-ghost btn-square btn-sm text-error"
                          type="button"
                          :disabled="token.status === 'revoked'"
                          :aria-label="`Revocar ${token.name}`"
                          @click="tokenToRevoke = token"
                        >
                          <Trash2 class="size-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="grid gap-3 border-t border-base-300 p-4 md:hidden">
                <article v-for="token in tokens" :key="token.id" class="rounded-xl border border-base-300 p-4">
                  <div class="flex items-start gap-3">
                    <div class="min-w-0 flex-1">
                      <p class="truncate font-semibold">{{ token.name }}</p>
                      <p class="mt-0.5 font-mono text-xs opacity-45">tv_api_••••{{ token.tokenSuffix }}</p>
                    </div>
                    <span
                      class="badge badge-sm"
                      :class="
                        token.status === 'active'
                          ? 'badge-success'
                          : token.status === 'expired'
                            ? 'badge-warning'
                            : 'badge-error'
                      "
                      >{{ statusLabels[token.status] }}</span
                    >
                  </div>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt class="opacity-50">Permisos</dt>
                      <dd class="mt-1 font-medium">{{ permissionLabels[token.permission] }}</dd>
                    </div>
                    <div>
                      <dt class="opacity-50">Último uso</dt>
                      <dd class="mt-1 font-medium">{{ formatDate(token.lastUsedAt) }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="opacity-50">Vencimiento</dt>
                      <dd class="mt-1 font-medium">{{ formatDate(token.expiresAt) }}</dd>
                    </div>
                  </dl>
                  <button
                    class="btn btn-outline btn-error btn-sm mt-4 w-full"
                    type="button"
                    :disabled="token.status === 'revoked'"
                    @click="tokenToRevoke = token"
                  >
                    <Trash2 class="size-4" />Revocar
                  </button>
                </article>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <div
      v-if="revealedToken"
      class="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-secret-title"
    >
      <div class="modal-box max-w-2xl p-6 sm:p-7">
        <div class="flex items-start gap-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-full bg-success/10 text-success">
            <ShieldCheck class="size-6" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 id="api-secret-title" class="font-display text-2xl">Guarda tu token ahora</h2>
            <p class="mt-2 text-sm leading-6 opacity-65">
              Por seguridad no podrás volver a verlo. Guárdalo en el gestor de secretos de tu servidor.
            </p>
          </div>
        </div>
        <div class="mt-5 rounded-xl border border-base-300 bg-base-200 p-3">
          <code class="block break-all text-sm">{{ revealedToken }}</code>
        </div>
        <div class="modal-action grid gap-2 sm:flex">
          <button class="btn btn-primary" type="button" @click="copyToken">
            <Check v-if="copied" class="size-4" /><Clipboard v-else class="size-4" />
            {{ copied ? 'Copiado' : 'Copiar token' }}
          </button>
          <button class="btn btn-ghost" type="button" @click="closeSecret">Ya lo guardé</button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="Boolean(tokenToRevoke)"
      title="Revocar token"
      :message="`La integración ${tokenToRevoke?.name || ''} perderá el acceso inmediatamente. Esta acción no se puede deshacer.`"
      confirm-label="Revocar token"
      :busy="revoking"
      @cancel="tokenToRevoke = null"
      @confirm="revokeToken"
    />
  </div>
</template>
