<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GoogleSignIn from '../../components/GoogleSignIn.vue'
import { ApiError } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function submit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    await router.push(String(route.query.redirect || '/events'))
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : 'No pudimos iniciar sesión'
  }
}

async function google(credential: string) {
  await auth.google(credential)
  await router.push('/events')
}
</script>

<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Qué gusto verte</p>
    <h1 class="mt-2 font-display text-4xl">Entra a tu cuenta</h1>
    <p class="mt-2 text-sm opacity-60">Tus eventos te están esperando.</p>
    <GoogleSignIn class="mt-8" @credential="google" />
    <div class="divider my-6 text-[10px] uppercase opacity-50">o continúa con correo</div>
    <div v-if="error" class="alert alert-error mb-4 text-sm">{{ error }}</div>
    <form class="grid gap-4" @submit.prevent="submit">
      <label class="form-control"
        ><span class="label-text mb-1.5 text-xs font-semibold">Correo electrónico</span
        ><input
          v-model="email"
          class="input input-bordered w-full"
          type="email"
          autocomplete="email"
          required
          placeholder="tu@correo.com"
      /></label>
      <label class="form-control"
        ><span class="mb-1.5 flex justify-between text-xs font-semibold"
          ><span>Contraseña</span
          ><RouterLink to="/auth/forgot-password" class="link link-primary font-medium"
            >¿La olvidaste?</RouterLink
          ></span
        ><input
          v-model="password"
          class="input input-bordered w-full"
          type="password"
          autocomplete="current-password"
          required
      /></label>
      <button class="btn btn-primary mt-2" :disabled="auth.loading">
        <span v-if="auth.loading" class="loading loading-spinner loading-xs"></span>Entrar a Treenvite
      </button>
    </form>
    <p class="mt-6 text-center text-sm opacity-65">
      ¿Aún no tienes cuenta?
      <RouterLink to="/auth/register" class="link link-primary font-bold">Créala gratis</RouterLink>
    </p>
  </div>
</template>
