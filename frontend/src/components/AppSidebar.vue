<script setup lang="ts">
import { CalendarDays, CircleHelp, KeyRound, LogOut, PanelLeftClose, PanelLeftOpen, UserRound } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import BrandMark from './BrandMark.vue'
import InitialsAvatar from './InitialsAvatar.vue'
import LogoIso from './LogoIso.vue'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside
    id="app-sidebar"
    class="sticky top-0 z-20 hidden h-screen min-w-0 shrink-0 flex-col border-r border-base-300 bg-base-100 motion-safe:transition-[width,padding] motion-safe:duration-200 md:flex"
    :class="ui.isSidebarCollapsed ? 'w-20 p-3' : 'w-64 p-5'"
  >
    <div
      class="flex"
      :class="ui.isSidebarCollapsed ? 'flex-col items-center gap-4' : 'items-center justify-between gap-2'"
    >
      <RouterLink
        to="/events"
        class="flex min-w-0 items-center justify-center rounded-lg"
        aria-label="Ir a mis eventos"
        title="Treenvite"
      >
        <LogoIso v-if="ui.isSidebarCollapsed" class="size-6" />
        <BrandMark v-else class="px-2" />
      </RouterLink>
      <button
        type="button"
        class="btn btn-ghost btn-square btn-sm shrink-0"
        :aria-label="ui.isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'"
        :aria-expanded="!ui.isSidebarCollapsed"
        aria-controls="app-sidebar"
        :title="ui.isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'"
        @click="ui.toggleSidebar"
      >
        <PanelLeftOpen v-if="ui.isSidebarCollapsed" class="size-4" />
        <PanelLeftClose v-else class="size-4" />
      </button>
    </div>
    <nav class="mt-8 grid gap-1" aria-label="Navegación principal">
      <RouterLink
        to="/events"
        class="btn btn-ghost text-sm"
        :class="ui.isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'"
        active-class="btn-active bg-base-200"
        aria-label="Mis eventos"
        :title="ui.isSidebarCollapsed ? 'Mis eventos' : undefined"
      >
        <CalendarDays class="size-4 shrink-0" />
        <span v-if="!ui.isSidebarCollapsed">Mis eventos</span>
      </RouterLink>
      <RouterLink
        to="/join"
        class="btn btn-ghost text-sm"
        :class="ui.isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'"
        active-class="btn-active bg-base-200"
        aria-label="Acceder con código"
        :title="ui.isSidebarCollapsed ? 'Acceder con código' : undefined"
      >
        <KeyRound class="size-4 shrink-0" />
        <span v-if="!ui.isSidebarCollapsed">Acceder con código</span>
      </RouterLink>
    </nav>
    <div class="mt-auto grid min-w-0 gap-3">
      <button
        class="btn btn-ghost text-sm"
        :class="ui.isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'"
        aria-label="Ayuda"
        :title="ui.isSidebarCollapsed ? 'Ayuda' : undefined"
      >
        <CircleHelp class="size-4 shrink-0" />
        <span v-if="!ui.isSidebarCollapsed">Ayuda</span>
      </button>
      <div
        class="flex min-w-0 items-center gap-2 border-t border-base-300 pt-4"
        :class="{ 'flex-col': ui.isSidebarCollapsed }"
      >
        <RouterLink
          to="/account"
          class="flex min-w-0 items-center gap-2 rounded-lg p-1.5 hover:bg-base-200"
          :class="ui.isSidebarCollapsed ? 'justify-center' : 'flex-1'"
          aria-label="Configuración de cuenta"
          :title="ui.isSidebarCollapsed ? auth.user?.name || 'Configuración de cuenta' : undefined"
        >
          <InitialsAvatar :name="auth.user?.name || 'Treenvite'" :src="auth.user?.avatarUrl" />
          <span v-if="!ui.isSidebarCollapsed" class="min-w-0 flex-1">
            <span class="block truncate text-xs font-bold">{{ auth.user?.name }}</span>
            <span class="block truncate text-[10px] opacity-55">{{ auth.user?.email }}</span>
          </span>
          <UserRound v-if="!ui.isSidebarCollapsed" class="size-4 shrink-0 opacity-50" />
        </RouterLink>
        <button
          class="btn btn-ghost btn-square btn-sm shrink-0"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          @click="logout"
        >
          <LogOut class="size-4" />
        </button>
      </div>
    </div>
  </aside>
  <header
    class="sticky top-0 z-30 flex h-16 items-center border-b border-base-300 bg-base-100/95 px-4 backdrop-blur md:hidden"
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
