<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, helpers, required } from '@vuelidate/validators'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormFieldError from '../../components/FormFieldError.vue'
import GoogleSignIn from '../../components/GoogleSignIn.vue'
import { ApiError } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useToastsStore } from '../../stores/toasts'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const toasts = useToastsStore()
const route = useRoute()
const router = useRouter()
const rules = {
  email: {
    required: helpers.withMessage('El correo electrónico es obligatorio.', required),
    email: helpers.withMessage('Escribe un correo electrónico válido.', emailValidator),
  },
  password: {
    required: helpers.withMessage('La contraseña es obligatoria.', required),
  },
}
const v$ = useVuelidate(rules, { email, password })

async function submit() {
  if (!(await v$.value.$validate())) return

  try {
    await auth.login(email.value, password.value)
    await router.push(String(route.query.redirect || '/events'))
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos iniciar sesión')
  }
}

async function google(credential: string) {
  try {
    await auth.google(credential)
    await router.push('/events')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos iniciar sesión con Google')
  }
}
</script>

<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Qué gusto verte</p>
    <h1 class="mt-2 font-display text-4xl">Entra a tu cuenta</h1>
    <p class="mt-2 text-sm opacity-60">Tus eventos te están esperando.</p>
    <GoogleSignIn class="mt-8" @credential="google" />
    <div class="divider my-6 text-[10px] uppercase opacity-50">o continúa con correo</div>
    <form class="grid gap-4" novalidate @submit.prevent="submit">
      <div class="grid gap-1.5">
        <label for="login-email" class="text-xs font-semibold">Correo electrónico</label>
        <input
          id="login-email"
          v-model="email"
          class="input w-full"
          :class="{ 'input-error': v$.email.$error }"
          type="email"
          autocomplete="email"
          aria-required="true"
          :aria-invalid="v$.email.$error"
          :aria-describedby="v$.email.$error ? 'login-email-error' : undefined"
          placeholder="tu@correo.com"
          @blur="v$.email.$touch()"
        />
        <FormFieldError id="login-email-error" :errors="v$.email.$errors" />
      </div>
      <div class="grid gap-1.5">
        <div class="flex justify-between text-xs font-semibold">
          <label for="login-password">Contraseña</label>
          <RouterLink to="/auth/forgot-password" class="link link-primary font-medium">¿La olvidaste?</RouterLink>
        </div>
        <input
          id="login-password"
          v-model="password"
          class="input w-full"
          :class="{ 'input-error': v$.password.$error }"
          type="password"
          autocomplete="current-password"
          aria-required="true"
          :aria-invalid="v$.password.$error"
          :aria-describedby="v$.password.$error ? 'login-password-error' : undefined"
          @blur="v$.password.$touch()"
        />
        <FormFieldError id="login-password-error" :errors="v$.password.$errors" />
      </div>
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
