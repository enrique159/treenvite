import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isSidebarCollapsed = ref(false)

  function toggleSidebar(): void {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  return { isSidebarCollapsed, toggleSidebar }
})
