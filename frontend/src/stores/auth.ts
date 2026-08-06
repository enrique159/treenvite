import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest, fetchCsrf, setCsrfToken } from '../services/api'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  async function restore(): Promise<void> {
    if (initialized.value) return
    try {
      user.value = await apiRequest<User>('/auth/me')
      await fetchCsrf()
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login(email: string, password: string): Promise<void> {
    loading.value = true
    try {
      const result = await apiRequest<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      user.value = result.user
      await fetchCsrf()
    } finally {
      loading.value = false
    }
  }

  async function google(credential: string): Promise<void> {
    const result = await apiRequest<{ user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    })
    user.value = result.user
    await fetchCsrf()
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      setCsrfToken('')
    }
  }

  async function clearAccount(): Promise<void> {
    user.value = null
    setCsrfToken('')
  }

  return { user, initialized, loading, restore, login, google, logout, clearAccount }
})
