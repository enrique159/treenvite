<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormFieldError from '../../components/FormFieldError.vue'
import GoogleSignIn from '../../components/GoogleSignIn.vue'
import { ApiError, apiRequest } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useToastsStore } from '../../stores/toasts'

const form = ref({ name: '', email: '', password: '' })
const loading = ref(false)
const sent = ref(false)
const auth = useAuthStore()
const toasts = useToastsStore()
const router = useRouter()
const rules = {
  name: {
    required: helpers.withMessage('El nombre es obligatorio.', required),
    minLength: helpers.withMessage('El nombre debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El nombre no puede superar los 120 caracteres.', maxLength(120)),
  },
  email: {
    required: helpers.withMessage('El correo electrónico es obligatorio.', required),
    email: helpers.withMessage('Escribe un correo electrónico válido.', emailValidator),
  },
  password: {
    required: helpers.withMessage('La contraseña es obligatoria.', required),
    minLength: helpers.withMessage('La contraseña debe tener al menos 8 caracteres.', minLength(8)),
  },
}
const v$ = useVuelidate(rules, form)

async function submit() {
  if (!(await v$.value.$validate())) return

  loading.value = true
  try {
    await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(form.value) })
    sent.value = true
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos crear la cuenta')
  } finally {
    loading.value = false
  }
}

async function google(credential: string) {
  try {
    await auth.google(credential)
    await router.push('/events')
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos crear la cuenta con Google')
  }
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
    <form class="grid gap-4" novalidate @submit.prevent="submit">
      <div class="grid gap-1.5">
        <label for="register-name" class="text-xs font-semibold">Nombre completo</label>
        <input
          id="register-name"
          v-model="form.name"
          class="input w-full"
          :class="{ 'input-error': v$.name.$error }"
          autocomplete="name"
          aria-required="true"
          :aria-invalid="v$.name.$error"
          :aria-describedby="v$.name.$error ? 'register-name-error' : undefined"
          @blur="v$.name.$touch()"
        />
        <FormFieldError id="register-name-error" :errors="v$.name.$errors" />
      </div>
      <div class="grid gap-1.5">
        <label for="register-email" class="text-xs font-semibold">Correo electrónico</label>
        <input
          id="register-email"
          v-model="form.email"
          class="input w-full"
          :class="{ 'input-error': v$.email.$error }"
          type="email"
          autocomplete="email"
          aria-required="true"
          :aria-invalid="v$.email.$error"
          :aria-describedby="v$.email.$error ? 'register-email-error' : undefined"
          @blur="v$.email.$touch()"
        />
        <FormFieldError id="register-email-error" :errors="v$.email.$errors" />
      </div>
      <div class="grid gap-1.5">
        <label for="register-password" class="text-xs font-semibold">Contraseña</label>
        <input
          id="register-password"
          v-model="form.password"
          class="input w-full"
          :class="{ 'input-error': v$.password.$error }"
          type="password"
          autocomplete="new-password"
          aria-required="true"
          :aria-invalid="v$.password.$error"
          :aria-describedby="v$.password.$error ? 'register-password-error' : undefined"
          @blur="v$.password.$touch()"
        />
        <FormFieldError id="register-password-error" :errors="v$.password.$errors" />
      </div>
      <button class="btn btn-primary mt-2" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>Crear mi cuenta
      </button>
    </form>
    <p class="mt-4 text-center text-xs leading-5 opacity-55">
      Antes de comenzar, consulta nuestros
      <RouterLink to="/terminos" class="link link-primary">términos y condiciones</RouterLink> y
      <RouterLink to="/privacidad" class="link link-primary">aviso de privacidad</RouterLink>.
    </p>
    <p class="mt-6 text-center text-sm opacity-65">
      ¿Ya tienes cuenta? <RouterLink to="/auth/login" class="link link-primary font-bold">Inicia sesión</RouterLink>
    </p>
  </div>
</template>
