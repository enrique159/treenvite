import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest } from '../services/api'
import type { EventItem, Paginated } from '../types'

export interface EventPayload {
  name: string
  type: string
  startsAt: string
  location: string
  color?: string
}

export const useEventsStore = defineStore('events', () => {
  const items = ref<EventItem[]>([])
  const current = ref<EventItem | null>(null)
  const loading = ref(false)

  async function fetchAll(): Promise<void> {
    loading.value = true
    try {
      const data = await apiRequest<Paginated<EventItem>>('/events?limit=100')
      items.value = data.items
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string): Promise<EventItem> {
    current.value = await apiRequest<EventItem>(`/events/${id}`)
    return current.value
  }

  async function create(payload: EventPayload): Promise<EventItem> {
    const event = await apiRequest<EventItem>('/events', { method: 'POST', body: JSON.stringify(payload) })
    items.value.unshift(event)
    return event
  }

  async function update(id: string, payload: Partial<EventPayload> & { version: number }): Promise<EventItem> {
    current.value = await apiRequest<EventItem>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    const index = items.value.findIndex((event) => event.id === id)
    if (index >= 0) items.value[index] = current.value
    return current.value
  }

  async function remove(id: string): Promise<void> {
    await apiRequest(`/events/${id}`, { method: 'DELETE' })
    items.value = items.value.filter((event) => event.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return { items, current, loading, fetchAll, fetchOne, create, update, remove }
})
