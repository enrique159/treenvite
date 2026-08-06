<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiRequest } from '../../services/api'
const route = useRoute()
const password = ref('')
const done = ref(false)
async function submit() {
  await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: route.query.token, password: password.value }),
  })
  done.value = true
}
</script>
<template>
  <div>
    <h1 class="font-display text-4xl">Nueva contraseña</h1>
    <p class="mt-3 text-sm opacity-60">
      {{ done ? 'Tu contraseña quedó actualizada.' : 'Elige una contraseña segura de al menos ocho caracteres.' }}
    </p>
    <form v-if="!done" class="mt-8 grid gap-4" @submit.prevent="submit">
      <input
        v-model="password"
        class="input input-bordered w-full"
        type="password"
        minlength="8"
        required
        autocomplete="new-password"
      /><button class="btn btn-primary">Guardar contraseña</button>
    </form>
    <RouterLink v-else to="/auth/login" class="btn btn-primary mt-7 w-full">Iniciar sesión</RouterLink>
  </div>
</template>
