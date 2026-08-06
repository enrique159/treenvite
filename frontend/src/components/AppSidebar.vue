<script setup lang="ts">
import { CalendarDays, CircleHelp, KeyRound, LogOut } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BrandMark from './BrandMark.vue'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  await router.push({ name: 'login' })
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
</script>

<template>
  <aside
    class="sticky top-0 z-20 flex h-screen w-64 shrink-0 flex-col border-r border-base-300 bg-base-100 p-5 max-lg:h-auto max-lg:w-full max-lg:flex-row max-lg:items-center max-lg:border-b max-lg:border-r-0"
  >
    <RouterLink to="/events" class="px-2"><BrandMark /></RouterLink>
    <nav class="mt-12 grid gap-1 max-lg:ml-auto max-lg:mt-0 max-lg:flex" aria-label="Navegación principal">
      <RouterLink to="/events" class="btn btn-ghost justify-start text-sm" active-class="btn-active bg-base-200"
        ><CalendarDays class="size-4" /> <span class="max-sm:hidden">Mis eventos</span></RouterLink
      >
      <RouterLink to="/join" class="btn btn-ghost justify-start text-sm" active-class="btn-active bg-base-200"
        ><KeyRound class="size-4" /> <span class="max-sm:hidden">Acceder con código</span></RouterLink
      >
    </nav>
    <div class="mt-auto grid gap-3 max-lg:ml-3 max-lg:mt-0">
      <button class="btn btn-ghost justify-start text-sm max-lg:hidden"><CircleHelp class="size-4" /> Ayuda</button>
      <div class="flex items-center gap-2 border-t border-base-300 pt-4 max-lg:border-0 max-lg:pt-0">
        <div class="avatar placeholder">
          <div class="w-9 rounded-full bg-accent text-xs font-bold text-accent-content">
            <span>{{ initials(auth.user?.name || 'T') }}</span>
          </div>
        </div>
        <div class="min-w-0 flex-1 max-lg:hidden">
          <p class="truncate text-xs font-bold">{{ auth.user?.name }}</p>
          <p class="truncate text-[10px] opacity-55">{{ auth.user?.email }}</p>
        </div>
        <button class="btn btn-ghost btn-square btn-sm" aria-label="Cerrar sesión" @click="logout">
          <LogOut class="size-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
