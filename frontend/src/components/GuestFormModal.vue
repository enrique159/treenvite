<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { between, email, helpers, integer, maxLength, minLength, required } from '@vuelidate/validators'
import { nextTick, reactive, watch } from 'vue'
import { GUEST_GROUP_OPTIONS, GUEST_RELATION_OPTIONS } from '../constants/guest-options'
import type { Guest, RsvpStatus } from '../types'
import type { GuestPayload } from '../stores/guests'
import EditableCombobox from './EditableCombobox.vue'
import FormFieldError from './FormFieldError.vue'

const props = defineProps<{
  open: boolean
  guest: Guest | null
  guests: Guest[]
  parentId?: string | null
  busy?: boolean
}>()
const emit = defineEmits<{ close: []; save: [payload: GuestPayload]; remove: [guest: Guest] }>()

interface GuestFormState {
  name: string
  email: string
  phone: string
  groupName: string
  relationLabel: string
  rsvp: RsvpStatus
  companions: number
  dietary: string
  notes: string
  parentId: string | null
}

const form = reactive<GuestFormState>({
  name: '',
  email: '',
  phone: '',
  groupName: '',
  relationLabel: '',
  rsvp: 'pending',
  companions: 0,
  dietary: '',
  notes: '',
  parentId: null,
})

const rules = {
  name: {
    required: helpers.withMessage('El nombre es obligatorio.', required),
    minLength: helpers.withMessage('Escribe al menos 2 caracteres.', minLength(2)),
    maxLength: helpers.withMessage('El nombre no puede superar 160 caracteres.', maxLength(160)),
  },
  email: {
    email: helpers.withMessage('Escribe un correo electrónico válido.', email),
  },
  phone: {
    digits: helpers.withMessage('Usa únicamente entre 7 y 15 números.', helpers.regex(/^\d{7,15}$/)),
  },
  groupName: {
    maxLength: helpers.withMessage('El grupo no puede superar 100 caracteres.', maxLength(100)),
  },
  relationLabel: {
    maxLength: helpers.withMessage('La relación no puede superar 80 caracteres.', maxLength(80)),
  },
  companions: {
    required: helpers.withMessage('Indica el número de acompañantes.', required),
    integer: helpers.withMessage('Usa un número entero.', integer),
    between: helpers.withMessage('Debe estar entre 0 y 20.', between(0, 20)),
  },
}

const v$ = useVuelidate(rules, form)

watch(
  () => [props.open, props.guest, props.parentId] as const,
  () => {
    const guest = props.guest
    Object.assign(form, {
      name: guest?.name ?? '',
      email: guest?.email ?? '',
      phone: guest?.phone ?? '',
      groupName: guest?.groupName ?? '',
      relationLabel: guest?.relationLabel ?? '',
      rsvp: guest?.rsvp ?? ('pending' as RsvpStatus),
      companions: guest?.companions ?? 0,
      dietary: guest?.dietary ?? '',
      notes: guest?.notes ?? '',
      parentId: guest?.parentId ?? props.parentId ?? null,
    })
    void nextTick(() => v$.value.$reset())
  },
  { immediate: true },
)

function maskPhone(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 15)
  input.value = digits
  form.phone = digits
}

async function submit(): Promise<void> {
  if (!(await v$.value.$validate())) return
  emit('save', {
    name: form.name.trim(),
    email: form.email.trim() || null,
    phone: form.phone || null,
    groupName: form.groupName.trim() || 'Sin grupo',
    relationLabel: form.relationLabel.trim() || 'Invitado',
    rsvp: form.rsvp,
    companions: form.companions,
    dietary: form.dietary.trim() || null,
    notes: form.notes.trim() || null,
    parentId: form.parentId,
    version: props.guest?.version,
  })
}
</script>

<template>
  <div v-if="open" class="modal modal-open" role="dialog" aria-modal="true">
    <div class="modal-box max-h-[calc(100svh-2rem)] max-w-3xl p-5 sm:p-7">
      <button class="btn btn-circle btn-ghost absolute right-3 top-3" aria-label="Cerrar" @click="emit('close')">
        ✕
      </button>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {{ guest ? 'Editar persona' : parentId ? 'Nueva relación' : 'Nuevo invitado' }}
      </p>
      <h2 class="mt-2 pr-10 font-display text-3xl">{{ guest?.name || 'Agregar invitado' }}</h2>
      <form class="mt-6 grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="submit">
        <label class="grid gap-1.5 sm:col-span-2">
          <span class="text-xs font-semibold">Nombre completo</span>
          <input
            v-model="form.name"
            class="input w-full"
            :class="{ 'input-error': v$.name.$error }"
            autocomplete="name"
            aria-describedby="guest-name-error"
            :aria-invalid="v$.name.$error"
            @blur="v$.name.$touch()"
          />
          <FormFieldError id="guest-name-error" :errors="v$.name.$errors" />
        </label>
        <label class="grid content-start gap-1.5">
          <span class="text-xs font-semibold">Correo <span class="font-normal opacity-50">(opcional)</span></span>
          <input
            v-model.trim="form.email"
            class="input w-full"
            :class="{ 'input-error': v$.email.$error }"
            type="email"
            autocomplete="email"
            placeholder="persona@correo.com"
            aria-describedby="guest-email-error"
            :aria-invalid="v$.email.$error"
            @blur="v$.email.$touch()"
          />
          <FormFieldError id="guest-email-error" :errors="v$.email.$errors" />
        </label>
        <label class="grid content-start gap-1.5">
          <span class="text-xs font-semibold">Teléfono <span class="font-normal opacity-50">(opcional)</span></span>
          <input
            :value="form.phone"
            class="input w-full"
            :class="{ 'input-error': v$.phone.$error }"
            type="text"
            inputmode="numeric"
            autocomplete="tel"
            maxlength="15"
            pattern="[0-9]*"
            placeholder="6691234567"
            aria-describedby="guest-phone-help guest-phone-error"
            :aria-invalid="v$.phone.$error"
            @input="maskPhone"
            @blur="v$.phone.$touch()"
          />
          <span id="guest-phone-help" class="text-[11px] opacity-50">De 7 a 15 dígitos, sin espacios.</span>
          <FormFieldError id="guest-phone-error" :errors="v$.phone.$errors" />
        </label>
        <div class="grid content-start gap-1.5">
          <label for="guest-group" class="text-xs font-semibold">Grupo</label>
          <EditableCombobox
            id="guest-group"
            v-model="form.groupName"
            label="grupo"
            :options="GUEST_GROUP_OPTIONS"
            placeholder="Selecciona o escribe un grupo"
            :invalid="v$.groupName.$error"
            described-by="guest-group-help guest-group-error"
            @blur="v$.groupName.$touch()"
          />
          <span id="guest-group-help" class="text-[11px] opacity-50">También puedes escribir un grupo nuevo.</span>
          <FormFieldError id="guest-group-error" :errors="v$.groupName.$errors" />
        </div>
        <div class="grid content-start gap-1.5">
          <label for="guest-relation" class="text-xs font-semibold">Relación</label>
          <EditableCombobox
            id="guest-relation"
            v-model="form.relationLabel"
            label="relación"
            :options="GUEST_RELATION_OPTIONS"
            placeholder="Selecciona o escribe una relación"
            :invalid="v$.relationLabel.$error"
            described-by="guest-relation-help guest-relation-error"
            @blur="v$.relationLabel.$touch()"
          />
          <span id="guest-relation-help" class="text-[11px] opacity-50"
            >También puedes escribir una relación nueva.</span
          >
          <FormFieldError id="guest-relation-error" :errors="v$.relationLabel.$errors" />
        </div>
        <label class="grid gap-1.5"
          ><span class="text-xs font-semibold">Relacionado con</span
          ><select v-model="form.parentId" class="select w-full">
            <option :value="null">Sin relación superior</option>
            <option
              v-for="option in guests.filter((item) => item.id !== guest?.id)"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select></label
        >
        <label class="grid gap-1.5"
          ><span class="text-xs font-semibold">Confirmación</span
          ><select v-model="form.rsvp" class="select w-full">
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="declined">No asiste</option>
          </select></label
        >
        <label class="grid content-start gap-1.5">
          <span class="text-xs font-semibold">Acompañantes</span>
          <input
            v-model.number="form.companions"
            class="input w-full"
            :class="{ 'input-error': v$.companions.$error }"
            type="number"
            min="0"
            max="20"
            aria-describedby="guest-companions-error"
            :aria-invalid="v$.companions.$error"
            @blur="v$.companions.$touch()"
          />
          <FormFieldError id="guest-companions-error" :errors="v$.companions.$errors" />
        </label>
        <label class="grid gap-1.5"
          ><span class="text-xs font-semibold">Alimentación</span><input v-model="form.dietary" class="input w-full"
        /></label>
        <label class="grid gap-1.5 sm:col-span-2"
          ><span class="text-xs font-semibold">Notas</span
          ><textarea v-model="form.notes" class="textarea min-h-24 w-full"></textarea>
        </label>
        <div class="modal-action mt-2 flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-between">
          <button
            v-if="guest"
            type="button"
            class="btn btn-error btn-soft w-full sm:w-auto"
            :disabled="busy"
            @click="emit('remove', guest)"
          >
            Eliminar</button
          ><span v-else class="hidden sm:block"></span>
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Cancelar</button>
            <button class="btn btn-primary" :disabled="busy">
              <span v-if="busy" class="loading loading-spinner loading-xs"></span>Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="emit('close')"></div>
  </div>
</template>
