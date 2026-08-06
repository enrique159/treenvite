import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastsStore } from './toasts'

describe('toasts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => vi.useRealTimers())

  it('queues and automatically removes an error message', () => {
    const toasts = useToastsStore()
    toasts.error('No pudimos guardar')

    expect(toasts.items).toEqual([expect.objectContaining({ message: 'No pudimos guardar', tone: 'error' })])

    vi.advanceTimersByTime(6500)
    expect(toasts.items).toHaveLength(0)
  })
})
