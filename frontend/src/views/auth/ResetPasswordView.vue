<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { helpers, minLength, required } from '@vuelidate/validators'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import FormFieldError from '../../components/FormFieldError.vue'
import { ApiError, apiRequest } from '../../services/api'
import { useToastsStore } from '../../stores/toasts'

const route = useRoute()
const password = ref('')
const done = ref(false)
const loading = ref(false)
const toasts = useToastsStore()
const rules = {
  password: {
    required: helpers.withMessage('La contraseña es obligatoria.', required),
    minLength: helpers.withMessage('La contraseña debe tener al menos 8 caracteres.', minLength(8)),
  },
}
const v$ = useVuelidate(rules, { password })

async function submit() {
  if (!(await v$.value.$validate())) return

  loading.value = true
  try {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: route.query.token, password: password.value }),
    })
    done.value = true
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos restablecer la contraseña')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div>
    <h1 class="font-display text-4xl">Nueva contraseña</h1>
    <p class="mt-3 text-sm opacity-60">
      {{ done ? 'Tu contraseña quedó actualizada.' : 'Elige una contraseña segura de al menos ocho caracteres.' }}
    </p>
    <form v-if="!done" class="mt-8 grid gap-4" novalidate @submit.prevent="submit">
      <div class="grid gap-1.5">
        <label for="reset-password" class="text-xs font-semibold">Nueva contraseña</label>
        <input
          id="reset-password"
          v-model="password"
          class="input w-full"
          :class="{ 'input-error': v$.password.$error }"
          type="password"
          autocomplete="new-password"
          aria-required="true"
          :aria-invalid="v$.password.$error"
          :aria-describedby="v$.password.$error ? 'reset-password-error' : undefined"
          @blur="v$.password.$touch()"
        />
        <FormFieldError id="reset-password-error" :errors="v$.password.$errors" />
      </div>
      <button class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        Guardar contraseña
      </button>
    </form>
    <RouterLink v-else to="/auth/login" class="btn btn-primary mt-7 w-full">Iniciar sesión</RouterLink>
  </div>
</template>
