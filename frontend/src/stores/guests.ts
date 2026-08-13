import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest } from '../services/api'
import type { Guest, GuestSide, Paginated, RsvpStatus } from '../types'

export interface GuestPayload {
  name?: string
  email?: string | null
  phone?: string | null
  groupName?: string
  relationLabel?: string
  invitedBySide?: GuestSide | null
  rsvp?: RsvpStatus
  companions?: number
  dietary?: string | null
  notes?: string | null
  parentId?: string | null
  version?: number
}

export const useGuestsStore = defineStore('guests', () => {
  const items = ref<Guest[]>([])
  const total = ref(0)
  const loading = ref(false)
  const relationSuggestions = ref<string[]>([])

  function mergeRelationSuggestion(label: string): void {
    if (!relationSuggestions.value.some((option) => option.localeCompare(label, 'es', { sensitivity: 'base' }) === 0)) {
      relationSuggestions.value = [...relationSuggestions.value, label].sort((left, right) =>
        left.localeCompare(right, 'es'),
      )
    }
  }

  async function fetchRelationSuggestions(eventId: string): Promise<void> {
    relationSuggestions.value = []
    relationSuggestions.value = await apiRequest<string[]>(`/events/${eventId}/guests/relation-suggestions`)
  }

  async function fetchTable(eventId: string, params: URLSearchParams): Promise<void> {
    loading.value = true
    try {
      const data = await apiRequest<Paginated<Guest>>(`/events/${eventId}/guests?${params.toString()}`)
      items.value = data.items
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchTree(eventId: string): Promise<void> {
    loading.value = true
    try {
      items.value = await apiRequest<Guest[]>(`/events/${eventId}/guests/tree`)
      total.value = items.value.length
    } finally {
      loading.value = false
    }
  }

  async function create(eventId: string, payload: GuestPayload): Promise<Guest> {
    const guest = await apiRequest<Guest>(`/events/${eventId}/guests`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    items.value.push(guest)
    mergeRelationSuggestion(guest.relationLabel)
    total.value += 1
    return guest
  }

  async function update(eventId: string, guestId: string, payload: GuestPayload): Promise<Guest> {
    const guest = await apiRequest<Guest>(`/events/${eventId}/guests/${guestId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    const index = items.value.findIndex((item) => item.id === guestId)
    if (index >= 0) items.value[index] = guest
    mergeRelationSuggestion(guest.relationLabel)
    return guest
  }

  async function remove(eventId: string, guestId: string): Promise<void> {
    await apiRequest(`/events/${eventId}/guests/${guestId}`, { method: 'DELETE' })
    items.value = items.value.filter((guest) => guest.id !== guestId)
    total.value -= 1
  }

  return {
    items,
    total,
    loading,
    relationSuggestions,
    fetchTable,
    fetchTree,
    fetchRelationSuggestions,
    create,
    update,
    remove,
  }
})
