<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, helpers, required } from '@vuelidate/validators'
import { ref } from 'vue'
import FormFieldError from '../../components/FormFieldError.vue'
import { ApiError, apiRequest } from '../../services/api'
import { useToastsStore } from '../../stores/toasts'

const email = ref('')
const sent = ref(false)
const loading = ref(false)
const toasts = useToastsStore()
const rules = {
  email: {
    required: helpers.withMessage('El correo electrónico es obligatorio.', required),
    email: helpers.withMessage('Escribe un correo electrónico válido.', emailValidator),
  },
}
const v$ = useVuelidate(rules, { email })

async function submit() {
  if (!(await v$.value.$validate())) return

  loading.value = true
  try {
    await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.value }) })
    sent.value = true
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos enviar el enlace de recuperación')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recupera el acceso</p>
    <h1 class="mt-2 font-display text-4xl">Restablece tu contraseña</h1>
    <p class="mt-3 text-sm opacity-60">
      {{
        sent
          ? 'Si existe una cuenta, recibirás un enlace en unos minutos.'
          : 'Escribe el correo asociado con tu cuenta.'
      }}
    </p>
    <form v-if="!sent" class="mt-8 grid gap-4" novalidate @submit.prevent="submit">
      <div class="grid gap-1.5">
        <label for="forgot-email" class="text-xs font-semibold">Correo electrónico</label>
        <input
          id="forgot-email"
          v-model="email"
          class="input w-full"
          :class="{ 'input-error': v$.email.$error }"
          type="email"
          autocomplete="email"
          aria-required="true"
          :aria-invalid="v$.email.$error"
          :aria-describedby="v$.email.$error ? 'forgot-email-error' : undefined"
          placeholder="tu@correo.com"
          @blur="v$.email.$touch()"
        />
        <FormFieldError id="forgot-email-error" :errors="v$.email.$errors" />
      </div>
      <button class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        Enviar enlace
      </button>
    </form>
    <RouterLink to="/auth/login" class="btn btn-ghost mt-5 w-full">Volver al inicio</RouterLink>
  </div>
</template>
