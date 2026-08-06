<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarTone = 'accent' | 'primary' | 'warning' | 'info'

const props = withDefaults(
  defineProps<{
    name: string
    src?: string | null
    size?: AvatarSize
    tone?: AvatarTone
  }>(),
  {
    src: null,
    size: 'sm',
    tone: 'accent',
  },
)

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-9 text-xs',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-14 text-sm',
}

const toneClasses: Record<AvatarTone, string> = {
  accent: 'bg-accent text-accent-content',
  primary: 'bg-primary text-primary-content',
  warning: 'bg-warning/40 text-base-content',
  info: 'bg-info/30 text-base-content',
}
</script>

<template>
  <span class="avatar shrink-0" :class="{ placeholder: !src }" aria-hidden="true">
    <span
      class="grid place-items-center overflow-hidden rounded-full text-center font-bold leading-none"
      :class="[sizeClasses[size], toneClasses[tone]]"
    >
      <img v-if="src" :src="src" alt="" class="size-full object-cover" />
      <span v-else>{{ initials }}</span>
    </span>
  </span>
</template>
