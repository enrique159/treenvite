<script setup lang="ts">
import { computed } from 'vue'
import type { Guest } from '../types'

defineOptions({ name: 'GuestTreeNode' })

const props = defineProps<{
  guest: Guest
  guests: Guest[]
}>()

const emit = defineEmits<{
  edit: [guest: Guest]
  addChild: [guest: Guest]
}>()

const children = computed(() => props.guests.filter((guest) => guest.parentId === props.guest.id))

const initials = computed(() =>
  props.guest.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

const statusLabel = computed(() => {
  if (props.guest.rsvp === 'confirmed') return 'Confirmado'
  if (props.guest.rsvp === 'declined') return 'No asiste'
  return 'Pendiente'
})
</script>

<template>
  <li class="tree-branch">
    <article class="tree-node" :class="`tree-node--${guest.rsvp}`">
      <button class="tree-node__main" type="button" @click="emit('edit', guest)">
        <span class="avatar avatar--tree">{{ initials }}</span>
        <span class="tree-node__copy">
          <strong>{{ guest.name }}</strong>
          <small>{{ guest.relation || guest.group }}</small>
        </span>
        <span class="status-dot" :class="`status-dot--${guest.rsvp}`" :title="statusLabel"></span>
      </button>
      <button
        class="tree-node__add"
        type="button"
        :aria-label="`Agregar invitado relacionado con ${guest.name}`"
        @click="emit('addChild', guest)"
      >
        +
      </button>
    </article>

    <ul v-if="children.length" class="tree-children">
      <GuestTreeNode
        v-for="child in children"
        :key="child.id"
        :guest="child"
        :guests="guests"
        @edit="emit('edit', $event)"
        @add-child="emit('addChild', $event)"
      />
    </ul>
  </li>
</template>
