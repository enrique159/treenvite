<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '../components/BrandMark.vue'
import { ApiError, apiRequest } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useToastsStore } from '../stores/toasts'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toasts = useToastsStore()
const preview = ref<{ event: { id: string; name: string }; email: string; role: string } | null>(null)
const failed = ref(false)
onMounted(async () => {
  try {
    preview.value = await apiRequest(`/invitations/preview?token=${encodeURIComponent(String(route.params.token))}`)
  } catch (cause) {
    failed.value = true
    toasts.error(cause instanceof ApiError ? cause.message : 'La invitación no está disponible')
  }
})
async function accept() {
  if (!auth.user) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  try {
    const member = await apiRequest<{ eventId: string }>('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token: route.params.token }),
    })
    await router.push(`/events/${member.eventId}/guests`)
  } catch (cause) {
    toasts.error(cause instanceof ApiError ? cause.message : 'No pudimos aceptar la invitación')
  }
}
</script>
<template>
  <main class="grid min-h-screen place-items-center bg-base-200 p-5">
    <div class="card w-full max-w-lg border border-base-300 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <BrandMark class="mb-8" />
        <div v-if="!preview && !failed" class="loading loading-spinner loading-lg text-primary"></div>
        <div v-else-if="failed" class="py-5">
          <h1 class="font-display text-3xl">Invitación no disponible</h1>
          <p class="mt-2 text-sm opacity-60">El enlace pudo expirar o haber sido revocado.</p>
          <RouterLink to="/events" class="btn btn-primary mt-6">Volver a mis eventos</RouterLink>
        </div>
        <template v-else-if="preview"
          ><p class="text-xs font-bold uppercase tracking-widest text-primary">Te invitaron a colaborar</p>
          <h1 class="font-display text-4xl">{{ preview.event.name }}</h1>
          <p class="mt-2 text-sm opacity-60">Invitación para {{ preview.email }} con permiso de {{ preview.role }}.</p>
          <button class="btn btn-primary mt-6 w-full" @click="accept">
            {{ auth.user ? 'Aceptar invitación' : 'Iniciar sesión para aceptar' }}
          </button></template
        >
      </div>
    </div>
  </main>
</template>
