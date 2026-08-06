<script setup lang="ts">
import { CalendarDays, CircleHelp, KeyRound, LogOut, UserRound } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BrandMark from './BrandMark.vue'
import InitialsAvatar from './InitialsAvatar.vue'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="sticky top-0 z-20 hidden h-screen w-64 min-w-0 shrink-0 flex-col border-r border-base-300 bg-base-100 p-5 lg:flex"
  >
    <RouterLink to="/events" class="px-2"><BrandMark /></RouterLink>
    <nav class="mt-12 grid gap-1" aria-label="Navegación principal">
      <RouterLink to="/events" class="btn btn-ghost justify-start text-sm" active-class="btn-active bg-base-200"
        ><CalendarDays class="size-4" /> <span>Mis eventos</span></RouterLink
      >
      <RouterLink to="/join" class="btn btn-ghost justify-start text-sm" active-class="btn-active bg-base-200"
        ><KeyRound class="size-4" /> <span>Acceder con código</span></RouterLink
      >
    </nav>
    <div class="mt-auto grid min-w-0 gap-3">
      <button class="btn btn-ghost justify-start text-sm"><CircleHelp class="size-4" /> Ayuda</button>
      <div class="flex min-w-0 items-center gap-2 border-t border-base-300 pt-4">
        <RouterLink to="/account" class="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 hover:bg-base-200">
          <InitialsAvatar :name="auth.user?.name || 'Treenvite'" :src="auth.user?.avatarUrl" />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-bold">{{ auth.user?.name }}</span>
            <span class="block truncate text-[10px] opacity-55">{{ auth.user?.email }}</span>
          </span>
          <UserRound class="size-4 shrink-0 opacity-50" />
        </RouterLink>
        <button class="btn btn-ghost btn-square btn-sm shrink-0" aria-label="Cerrar sesión" @click="logout">
          <LogOut class="size-4" />
        </button>
      </div>
    </div>
  </aside>
  <header
    class="sticky top-0 z-30 flex h-16 items-center border-b border-base-300 bg-base-100/95 px-4 backdrop-blur lg:hidden"
  >
    <RouterLink to="/events" class="shrink-0" aria-label="Ir a mis eventos"><BrandMark /></RouterLink>
    <nav class="ml-auto flex items-center gap-1" aria-label="Navegación principal móvil">
      <RouterLink
        to="/events"
        class="btn btn-ghost btn-square"
        active-class="btn-active bg-base-200"
        aria-label="Mis eventos"
        title="Mis eventos"
      >
        <CalendarDays class="size-5" />
      </RouterLink>
      <RouterLink
        to="/join"
        class="btn btn-ghost btn-square"
        active-class="btn-active bg-base-200"
        aria-label="Acceder con código"
        title="Acceder con código"
      >
        <KeyRound class="size-5" />
      </RouterLink>
      <RouterLink to="/account" class="ml-1 max-[360px]:hidden" aria-label="Configuración de cuenta">
        <InitialsAvatar :name="auth.user?.name || 'Treenvite'" :src="auth.user?.avatarUrl" :title="auth.user?.name" />
      </RouterLink>
      <button class="btn btn-ghost btn-square" aria-label="Cerrar sesión" title="Cerrar sesión" @click="logout">
        <LogOut class="size-5" />
      </button>
    </nav>
  </header>
</template>
