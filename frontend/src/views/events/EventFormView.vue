<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormFieldError from '../../components/FormFieldError.vue'
import { ApiError } from '../../services/api'
import { useEventsStore } from '../../stores/events'
import { useToastsStore } from '../../stores/toasts'

const router = useRouter()
const events = useEventsStore()
const toasts = useToastsStore()
const loading = ref(false)
const form = reactive({ name: '', type: 'Boda', startsAt: '', location: '', color: '#e96f51' })

const rules = {
  name: {
    required: helpers.withMessage('Escribe el nombre del evento.', required),
    minLength: helpers.withMessage('El nombre debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El nombre no puede superar 160 caracteres.', maxLength(160)),
  },
  type: {
    required: helpers.withMessage('Selecciona un tipo de evento.', required),
    minLength: helpers.withMessage('El tipo debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El tipo no puede superar 60 caracteres.', maxLength(60)),
  },
  startsAt: { required: helpers.withMessage('Selecciona la fecha del evento.', required) },
  location: {
    required: helpers.withMessage('Escribe la ubicación del evento.', required),
    minLength: helpers.withMessage('La ubicación debe tener al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('La ubicación no puede superar 255 caracteres.', maxLength(255)),
  },
  color: { required: helpers.withMessage('Selecciona un color para el evento.', required) },
}
const v$ = useVuelidate(rules, form)

async function submit() {
  if (!(await v$.value.$validate())) return

  loading.value = true
  try {
    const event = await events.create({ ...form, startsAt: new Date(`${form.startsAt}T12:00:00`).toISOString() })
    toasts.success('Evento creado correctamente.')
    await router.push(`/events/${event.id}/guests`)
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos crear el evento.')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div>
    <header class="border-b border-base-300 bg-base-100 px-4 py-5 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-4xl items-center gap-3">
        <RouterLink to="/events" class="btn btn-circle btn-ghost"><ArrowLeft class="size-5" /></RouterLink>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest opacity-45">Un nuevo comienzo</p>
          <h1 class="font-display text-3xl">Crea tu evento</h1>
        </div>
      </div>
    </header>
    <div class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <form class="card border border-base-300 bg-base-100 shadow-sm" novalidate @submit.prevent="submit">
        <div class="card-body grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
          <div class="grid content-start gap-1.5 sm:col-span-2">
            <label class="text-xs font-semibold" for="event-name">Nombre</label>
            <input
              id="event-name"
              v-model.trim="form.name"
              class="input w-full"
              :class="{ 'input-error': v$.name.$error }"
              required
              :aria-invalid="v$.name.$error"
              :aria-describedby="v$.name.$error ? 'event-name-error' : undefined"
              placeholder="Boda de Ana & Carlos"
              @blur="v$.name.$touch()"
            />
            <FormFieldError id="event-name-error" :errors="v$.name.$errors" />
          </div>
          <div class="grid content-start gap-1.5">
            <label class="text-xs font-semibold" for="event-type">Tipo</label>
            <select
              id="event-type"
              v-model="form.type"
              class="select w-full"
              :class="{ 'select-error': v$.type.$error }"
              required
              :aria-invalid="v$.type.$error"
              :aria-describedby="v$.type.$error ? 'event-type-error' : undefined"
              @blur="v$.type.$touch()"
            >
              <option>Boda</option>
              <option>Cumpleaños</option>
              <option>Cena</option>
              <option>Corporativo</option>
              <option>Otro</option>
            </select>
            <FormFieldError id="event-type-error" :errors="v$.type.$errors" />
          </div>
          <div class="grid content-start gap-1.5">
            <label class="text-xs font-semibold" for="event-date">Fecha</label>
            <input
              id="event-date"
              v-model="form.startsAt"
              class="input w-full"
              :class="{ 'input-error': v$.startsAt.$error }"
              type="date"
              required
              :aria-invalid="v$.startsAt.$error"
              :aria-describedby="v$.startsAt.$error ? 'event-date-error' : undefined"
              @blur="v$.startsAt.$touch()"
            />
            <FormFieldError id="event-date-error" :errors="v$.startsAt.$errors" />
          </div>
          <div class="grid content-start gap-1.5 sm:col-span-2">
            <label class="text-xs font-semibold" for="event-location">Ubicación</label>
            <input
              id="event-location"
              v-model.trim="form.location"
              class="input w-full"
              :class="{ 'input-error': v$.location.$error }"
              required
              :aria-invalid="v$.location.$error"
              :aria-describedby="v$.location.$error ? 'event-location-error' : undefined"
              @blur="v$.location.$touch()"
            />
            <FormFieldError id="event-location-error" :errors="v$.location.$errors" />
          </div>
          <div class="grid content-start gap-1.5">
            <label class="text-xs font-semibold" for="event-color">Color</label>
            <input
              id="event-color"
              v-model="form.color"
              class="input h-12 w-full p-1.5"
              :class="{ 'input-error': v$.color.$error }"
              type="color"
              required
              :aria-invalid="v$.color.$error"
              :aria-describedby="v$.color.$error ? 'event-color-error' : undefined"
              @blur="v$.color.$touch()"
            />
            <FormFieldError id="event-color-error" :errors="v$.color.$errors" />
          </div>
          <div class="card-actions grid grid-cols-2 sm:col-span-2 sm:flex sm:items-end sm:justify-end">
            <RouterLink to="/events" class="btn btn-ghost">Cancelar</RouterLink>
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-xs"></span>Crear evento
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
