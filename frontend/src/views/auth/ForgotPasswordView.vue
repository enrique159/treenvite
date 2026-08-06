<script setup lang="ts">
import { ref } from 'vue'
import { apiRequest } from '../../services/api'
const email = ref('')
const sent = ref(false)
async function submit() {
  await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.value }) })
  sent.value = true
}
</script>
<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recupera el acceso</p>
    <h1 class="mt-2 font-display text-4xl">Restablece tu contraseña</h1>
    <p class="mt-3 text-sm opacity-60">
      {{
        sent
          ? 'Si existe una cuenta, recibirás un enlace en unos minutos.'
          : 'Escribe el correo asociado con tu cuenta.'
      }}
    </p>
    <form v-if="!sent" class="mt-8 grid gap-4" @submit.prevent="submit">
      <input
        v-model="email"
        class="input input-bordered w-full"
        required
        type="email"
        placeholder="tu@correo.com"
      /><button class="btn btn-primary">Enviar enlace</button>
    </form>
    <RouterLink to="/auth/login" class="btn btn-ghost mt-5 w-full">Volver al inicio</RouterLink>
  </div>
</template>
