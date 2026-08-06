<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiRequest } from '../../services/api'
const route = useRoute()
const state = ref<'loading' | 'done' | 'error'>('loading')
onMounted(async () => {
  try {
    await apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: route.query.token }) })
    state.value = 'done'
  } catch {
    state.value = 'error'
  }
})
</script>
<template>
  <div class="text-center">
    <span v-if="state === 'loading'" class="loading loading-spinner loading-lg text-primary"></span
    ><template v-else
      ><h1 class="font-display text-4xl">{{ state === 'done' ? 'Cuenta confirmada' : 'El enlace expiró' }}</h1>
      <p class="mt-3 text-sm opacity-60">
        {{
          state === 'done'
            ? 'Ya puedes entrar y crear tu primer evento.'
            : 'Solicita un nuevo enlace desde el inicio de sesión.'
        }}
      </p>
      <RouterLink to="/auth/login" class="btn btn-primary mt-7">Ir al inicio</RouterLink></template
    >
  </div>
</template>
