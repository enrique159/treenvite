<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    code: string
    label?: string
  }>(),
  { label: 'Ejemplo' },
)

const copied = ref(false)

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div
    class="min-w-0 overflow-hidden rounded-xl border border-secondary/20 bg-secondary text-secondary-content shadow-sm"
  >
    <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
      <span class="text-xs font-semibold opacity-65">{{ label }}</span>
      <button
        type="button"
        class="btn btn-ghost btn-xs text-secondary-content hover:bg-white/10"
        :aria-label="copied ? 'Código copiado' : 'Copiar código'"
        @click="copy"
      >
        <Check v-if="copied" class="size-3.5 text-success" />
        <Copy v-else class="size-3.5" />
        {{ copied ? 'Copiado' : 'Copiar' }}
      </button>
    </div>
    <pre class="max-h-112 overflow-auto p-4 text-[12px] leading-6"><code>{{ code }}</code></pre>
  </div>
</template>
