import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastTone = 'error' | 'success' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
}

let nextToastId = 0

export const useToastsStore = defineStore('toasts', () => {
  const items = ref<ToastMessage[]>([])

  function remove(id: number): void {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function show(message: string, tone: ToastTone = 'info', duration = 5000): number {
    const id = ++nextToastId
    items.value.push({ id, message, tone })
    if (duration > 0) window.setTimeout(() => remove(id), duration)
    return id
  }

  const error = (message: string) => show(message, 'error', 6500)
  const success = (message: string) => show(message, 'success')
  const warning = (message: string) => show(message, 'warning')
  const info = (message: string) => show(message, 'info')

  return { items, show, remove, error, success, warning, info }
})
