<script setup lang="ts">
withDefaults(
  defineProps<{
    class?: string
  }>(),
  { class: '' },
)
</script>

<template>
  <nav
    :class="['flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs opacity-65', $props.class]"
    aria-label="Información legal"
  >
    <RouterLink to="/terminos" class="link link-hover">Términos y condiciones</RouterLink>
    <RouterLink to="/privacidad" class="link link-hover">Aviso de privacidad</RouterLink>
  </nav>
</template>
