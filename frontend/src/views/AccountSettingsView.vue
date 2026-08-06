<script setup lang="ts">
import { Trash2, UserRound } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiError, apiRequest } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useToastsStore } from '../stores/toasts'

const auth = useAuthStore()
const router = useRouter()
const toasts = useToastsStore()
const deleteOpen = ref(false)
const deleting = ref(false)

async function deleteAccount() {
  deleting.value = true
  try {
    await apiRequest<void>('/users/me', { method: 'DELETE' })
    await auth.clearAccount()
    await router.push({ name: 'login' })
    toasts.success('Tu cuenta y la información relacionada fueron eliminadas.')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos eliminar tu cuenta')
    deleteOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl gap-5 px-4 py-6 sm:px-6 sm:py-10">
    <header>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Tu cuenta</p>
      <h1 class="mt-2 font-display text-4xl text-secondary">Configuración de cuenta</h1>
      <p class="mt-2 text-sm opacity-60">Administra tus datos y revisa cómo cuidamos tu información.</p>
    </header>

    <section class="card border border-base-300 bg-base-100">
      <div class="card-body p-5 sm:p-7">
        <h2 class="card-title font-display text-2xl"><UserRound class="size-5 text-primary" />Datos de la cuenta</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide opacity-50">Nombre</dt>
            <dd class="mt-1 text-sm">{{ auth.user?.name }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide opacity-50">Correo electrónico</dt>
            <dd class="mt-1 break-all text-sm">{{ auth.user?.email }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="card border border-base-300 bg-base-100">
      <div class="card-body p-5 sm:p-7">
        <h2 class="card-title font-display text-2xl">Privacidad y condiciones</h2>
        <p class="mt-1 text-sm leading-6 opacity-60">
          Consulta los documentos que explican el uso de la plataforma y el tratamiento de la información.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <RouterLink to="/privacidad" class="btn btn-outline btn-sm">Aviso de privacidad</RouterLink>
          <RouterLink to="/terminos" class="btn btn-ghost btn-sm">Términos y condiciones</RouterLink>
        </div>
      </div>
    </section>

    <section class="card border border-error/25 bg-error/5">
      <div class="card-body gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
        <div class="min-w-0 flex-1">
          <h2 class="card-title font-display text-2xl text-error">Eliminar cuenta</h2>
          <p class="mt-1 text-sm leading-6 opacity-65">
            Esta acción elimina permanentemente tu cuenta, tus eventos, invitados, colaboraciones, invitaciones, accesos
            y sesiones. No se puede deshacer.
          </p>
        </div>
        <button class="btn btn-error w-full shrink-0 sm:w-auto" type="button" @click="deleteOpen = true">
          <Trash2 class="size-4" />Eliminar mi cuenta
        </button>
      </div>
    </section>

    <ConfirmDialog
      :open="deleteOpen"
      title="Eliminar cuenta definitivamente"
      message="Se borrarán tu cuenta y toda la información relacionada, incluidos tus eventos, invitados, accesos y sesiones. Esta acción no se puede deshacer."
      confirm-label="Sí, eliminar cuenta"
      :busy="deleting"
      @cancel="deleteOpen = false"
      @confirm="deleteAccount"
    />
  </div>
</template>
