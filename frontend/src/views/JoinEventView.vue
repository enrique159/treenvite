<script setup lang="ts">
import { KeyRound } from '@lucide/vue'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormFieldError from '../components/FormFieldError.vue'
import { ApiError, apiRequest } from '../services/api'
import { useToastsStore } from '../stores/toasts'

const form = reactive({ code: '' })
const loading = ref(false)
const router = useRouter()
const toasts = useToastsStore()
const rules = {
  code: {
    required: helpers.withMessage('Escribe el código del evento.', required),
    minLength: helpers.withMessage('El código debe tener al menos 6 caracteres.', minLength(6)),
    maxLength: helpers.withMessage('El código no puede superar 30 caracteres.', maxLength(30)),
  },
}
const v$ = useVuelidate(rules, form)

async function submit() {
  if (!(await v$.value.$validate())) return

  loading.value = true
  try {
    const result = await apiRequest<{ event: { id: string } }>('/access-codes/redeem', {
      method: 'POST',
      body: JSON.stringify({ code: form.code.trim() }),
    })
    toasts.success('Ya tienes acceso al evento.')
    await router.push(`/events/${result.event.id}/guests`)
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos acceder al evento.')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div>
    <header class="border-b border-base-300 bg-base-100 px-4 py-6 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <p class="text-[10px] font-bold uppercase tracking-widest opacity-45">Acceso rápido</p>
        <h1 class="font-display text-4xl">Entra con un código</h1>
      </div>
    </header>
    <div class="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <form class="card-body items-center p-5 text-center sm:p-8" novalidate @submit.prevent="submit">
          <div class="grid size-16 place-items-center rounded-full bg-primary/10">
            <KeyRound class="size-7 text-primary" />
          </div>
          <h2 class="font-display text-3xl">Código del evento</h2>
          <p class="text-sm opacity-55">Pega el código que te compartió la persona organizadora.</p>
          <div class="mt-3 grid w-full gap-1.5 text-left">
            <label class="sr-only" for="event-access-code">Código del evento</label>
            <input
              id="event-access-code"
              v-model.trim="form.code"
              class="input w-full text-center text-xl font-bold uppercase tracking-widest"
              :class="{ 'input-error': v$.code.$error }"
              required
              :aria-invalid="v$.code.$error"
              :aria-describedby="v$.code.$error ? 'event-access-code-error' : undefined"
              placeholder="TV-AB12CD34"
              @blur="v$.code.$touch()"
            />
            <FormFieldError id="event-access-code-error" :errors="v$.code.$errors" />
          </div>
          <button class="btn btn-primary mt-2 w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>Acceder al evento
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
