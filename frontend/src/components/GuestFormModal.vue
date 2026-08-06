<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Guest, RsvpStatus } from '../types'
import type { GuestPayload } from '../stores/guests'

const props = defineProps<{ open: boolean; guest: Guest | null; guests: Guest[]; parentId?: string | null; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [payload: GuestPayload]; remove: [guest: Guest] }>()
const form = reactive<GuestPayload>({ name: '', email: '', phone: '', groupName: '', relationLabel: '', rsvp: 'pending', companions: 0, dietary: '', notes: '', parentId: null })

watch(() => [props.open, props.guest, props.parentId] as const, () => {
  const guest = props.guest
  Object.assign(form, guest ? { ...guest } : { name: '', email: '', phone: '', groupName: '', relationLabel: '', rsvp: 'pending' as RsvpStatus, companions: 0, dietary: '', notes: '', parentId: props.parentId ?? null })
}, { immediate: true })
</script>

<template>
  <div v-if="open" class="modal modal-open" role="dialog" aria-modal="true">
    <div class="modal-box max-w-3xl">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-3 top-3" aria-label="Cerrar" @click="emit('close')">✕</button>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{{ guest ? 'Editar persona' : parentId ? 'Nueva relación' : 'Nuevo invitado' }}</p>
      <h2 class="mt-2 font-display text-3xl">{{ guest?.name || 'Agregar invitado' }}</h2>
      <form class="mt-6 grid gap-4 sm:grid-cols-2" @submit.prevent="emit('save', { ...form, version: guest?.version })">
        <label class="form-control sm:col-span-2"><span class="label-text mb-1 text-xs">Nombre completo</span><input v-model="form.name" class="input input-bordered w-full" required minlength="2" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Correo</span><input v-model="form.email" class="input input-bordered w-full" type="email" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Teléfono</span><input v-model="form.phone" class="input input-bordered w-full" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Grupo</span><input v-model="form.groupName" class="input input-bordered w-full" placeholder="Familia, trabajo…" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Relación</span><input v-model="form.relationLabel" class="input input-bordered w-full" placeholder="Pareja, amigo…" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Relacionado con</span><select v-model="form.parentId" class="select select-bordered w-full"><option :value="null">Sin relación superior</option><option v-for="option in guests.filter((item) => item.id !== guest?.id)" :key="option.id" :value="option.id">{{ option.name }}</option></select></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Confirmación</span><select v-model="form.rsvp" class="select select-bordered w-full"><option value="pending">Pendiente</option><option value="confirmed">Confirmado</option><option value="declined">No asiste</option></select></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Acompañantes</span><input v-model.number="form.companions" class="input input-bordered w-full" type="number" min="0" max="20" /></label>
        <label class="form-control"><span class="label-text mb-1 text-xs">Alimentación</span><input v-model="form.dietary" class="input input-bordered w-full" /></label>
        <label class="form-control sm:col-span-2"><span class="label-text mb-1 text-xs">Notas</span><textarea v-model="form.notes" class="textarea textarea-bordered min-h-20"></textarea></label>
        <div class="modal-action sm:col-span-2 sm:justify-between"><button v-if="guest" type="button" class="btn btn-error btn-soft" :disabled="busy" @click="emit('remove', guest)">Eliminar</button><span v-else></span><div class="flex gap-2"><button type="button" class="btn btn-ghost" @click="emit('close')">Cancelar</button><button class="btn btn-primary" :disabled="busy"><span v-if="busy" class="loading loading-spinner loading-xs"></span>Guardar</button></div></div>
      </form>
    </div>
    <div class="modal-backdrop" @click="emit('close')"></div>
  </div>
</template>
