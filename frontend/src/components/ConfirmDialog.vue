<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    busy?: boolean
  }>(),
  {
    confirmLabel: 'Eliminar',
    busy: false,
  },
)

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <div v-if="open" class="modal modal-open" role="dialog" aria-modal="true" :aria-label="title">
    <div class="modal-box max-w-md p-6 sm:p-7">
      <div class="flex items-start gap-4">
        <span class="grid size-12 shrink-0 place-items-center rounded-full bg-error/10 text-error">
          <AlertTriangle class="size-6" />
        </span>
        <div>
          <h2 class="font-display text-2xl">{{ title }}</h2>
          <p class="mt-2 text-sm leading-6 opacity-65">{{ message }}</p>
        </div>
      </div>
      <div class="modal-action grid grid-cols-2 gap-2 sm:flex">
        <button class="btn btn-ghost" type="button" :disabled="busy" @click="emit('cancel')">Cancelar</button>
        <button class="btn btn-error" type="button" :disabled="busy" @click="emit('confirm')">
          <span v-if="busy" class="loading loading-spinner loading-xs"></span>
          {{ confirmLabel }}
        </button>
      </div>
    </div>
    <button class="modal-backdrop" aria-label="Cancelar" @click="emit('cancel')"></button>
  </div>
</template>
