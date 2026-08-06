<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from '@lucide/vue'
import { useToastsStore, type ToastTone } from '../stores/toasts'

const toasts = useToastsStore()

const toneClasses: Record<ToastTone, string> = {
  error: 'border-error/30 bg-error/10',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-info/30 bg-info/10',
}

const toneLabels: Record<ToastTone, string> = {
  error: 'Error',
  success: 'Correcto',
  warning: 'Atención',
  info: 'Información',
}
</script>

<template>
  <div
    class="toast toast-end toast-top z-[1100] w-full max-w-md px-4 pt-4 sm:w-auto sm:min-w-96"
    aria-live="polite"
    aria-atomic="false"
  >
    <div
      v-for="toast in toasts.items"
      :key="toast.id"
      class="alert items-start border text-base-content shadow-lg"
      :class="toneClasses[toast.tone]"
      :role="toast.tone === 'error' ? 'alert' : 'status'"
    >
      <AlertCircle v-if="toast.tone === 'error'" class="mt-0.5 size-5 shrink-0 text-error" />
      <CheckCircle2 v-else-if="toast.tone === 'success'" class="mt-0.5 size-5 shrink-0 text-success" />
      <TriangleAlert v-else-if="toast.tone === 'warning'" class="mt-0.5 size-5 shrink-0 text-warning" />
      <Info v-else class="mt-0.5 size-5 shrink-0 text-info" />
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold">{{ toneLabels[toast.tone] }}</p>
        <p class="mt-0.5 text-sm leading-5">{{ toast.message }}</p>
      </div>
      <button
        type="button"
        class="btn btn-ghost btn-square btn-sm -mr-2 -mt-2"
        :aria-label="`Cerrar mensaje: ${toast.message}`"
        @click="toasts.remove(toast.id)"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
