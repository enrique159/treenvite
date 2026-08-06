<script setup lang="ts">
import { ref } from 'vue'
import GoogleSignIn from '../../components/GoogleSignIn.vue'
import { ApiError, apiRequest } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const form = ref({ name: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(form.value) })
    sent.value = true
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos crear la cuenta'
  } finally {
    loading.value = false
  }
}

async function google(credential: string) {
  await auth.google(credential)
  await router.push('/events')
}
</script>

<template>
  <div v-if="sent" class="text-center">
    <div class="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success/15 text-2xl text-success">✓</div>
    <h1 class="font-display text-4xl">Revisa tu correo</h1>
    <p class="mt-3 text-sm opacity-60">Enviamos un enlace de confirmación a {{ form.email }}.</p>
  </div>
  <div v-else>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Empieza a organizar</p>
    <h1 class="mt-2 font-display text-4xl">Crea tu cuenta</h1>
    <p class="mt-2 text-sm opacity-60">Tu primer evento está a unos pasos.</p>
    <GoogleSignIn class="mt-8" @credential="google" />
    <div class="divider my-6 text-[10px] uppercase opacity-50">o continúa con correo</div>
    <div v-if="error" class="alert alert-error mb-4 text-sm">{{ error }}</div>
    <form class="grid gap-4" @submit.prevent="submit">
      <label class="form-control"
        ><span class="label-text mb-1.5 text-xs font-semibold">Nombre completo</span
        ><input v-model="form.name" class="input input-bordered w-full" required minlength="2" autocomplete="name"
      /></label>
      <label class="form-control"
        ><span class="label-text mb-1.5 text-xs font-semibold">Correo electrónico</span
        ><input v-model="form.email" class="input input-bordered w-full" required type="email" autocomplete="email"
      /></label>
      <label class="form-control"
        ><span class="label-text mb-1.5 text-xs font-semibold">Contraseña</span
        ><input
          v-model="form.password"
          class="input input-bordered w-full"
          required
          minlength="8"
          type="password"
          autocomplete="new-password"
      /></label>
      <button class="btn btn-primary mt-2" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>Crear mi cuenta
      </button>
    </form>
    <p class="mt-6 text-center text-sm opacity-65">
      ¿Ya tienes cuenta? <RouterLink to="/auth/login" class="link link-primary font-bold">Inicia sesión</RouterLink>
    </p>
  </div>
</template>
