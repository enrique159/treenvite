<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core'
import { computed } from 'vue'

const props = defineProps<{
  errors: ErrorObject[]
  id?: string
}>()

const message = computed(() => String(props.errors[0]?.$message ?? ''))
</script>

<template>
  <p v-if="message" :id="id" class="text-xs font-medium text-error" role="alert">{{ message }}</p>
</template>
