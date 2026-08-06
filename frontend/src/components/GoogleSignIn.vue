<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ credential: [value: string] }>()
const container = ref<HTMLElement | null>(null)
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
let observer: ResizeObserver | undefined
let renderedWidth = 0

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

onMounted(() => {
  if (!clientId || !container.value) return
  const render = () => {
    if (!window.google || !container.value) return
    const width = Math.min(420, Math.floor(container.value.getBoundingClientRect().width))
    if (width < 200 || width === renderedWidth) return
    renderedWidth = width
    container.value.replaceChildren()
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => emit('credential', response.credential),
    })
    window.google.accounts.id.renderButton(container.value, {
      theme: 'outline',
      size: 'large',
      width,
      text: 'continue_with',
    })
  }
  if (window.google) render()
  else {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = render
    document.head.appendChild(script)
  }
  observer = new ResizeObserver(render)
  observer.observe(container.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="container" class="min-h-11 w-full overflow-hidden rounded-lg">
    <p v-if="!clientId" class="alert alert-info text-xs">Configura VITE_GOOGLE_CLIENT_ID para activar Google.</p>
  </div>
</template>
