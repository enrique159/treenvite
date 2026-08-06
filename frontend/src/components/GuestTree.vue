<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SortableEvent } from 'sortablejs'
import { VueDraggable } from 'vue-draggable-plus'
import type { Guest } from '../types'
import type { GuestTreeItem } from '../types/tree'
import GuestTreeNode from './GuestTreeNode.vue'

const props = defineProps<{ guests: Guest[] }>()
const emit = defineEmits<{ edit: [guest: Guest]; add: [guest: Guest]; move: [guestId: string, parentId: string | null] }>()
const roots = ref<GuestTreeItem[]>([])

function buildTree(guests: Guest[]): GuestTreeItem[] {
  const map = new Map(guests.map((guest) => [guest.id, { guest, children: [] as GuestTreeItem[] }]))
  const result: GuestTreeItem[] = []
  for (const item of map.values()) {
    const parent = item.guest.parentId ? map.get(item.guest.parentId) : null
    if (parent) parent.children.push(item)
    else result.push(item)
  }
  return result
}

watch(() => props.guests, (value) => (roots.value = buildTree(value)), { immediate: true, deep: true })
const hasGuests = computed(() => roots.value.length > 0)
function onRootAdd(event: SortableEvent) { const id = (event.item as HTMLElement).dataset.guestId; if (id) emit('move', id, null) }
</script>

<template>
  <div class="min-h-[34rem] overflow-auto bg-[radial-gradient(circle,var(--color-base-300)_1px,transparent_1px)] bg-[size:20px_20px] p-8">
    <div v-if="hasGuests" class="mx-auto w-max min-w-full">
      <VueDraggable v-model="roots" group="guest-tree" handle=".drag-handle" class="flex items-start justify-center gap-10" :animation="180" @add="onRootAdd">
        <GuestTreeNode v-for="node in roots" :key="node.guest.id" :node="node" @edit="emit('edit', $event)" @add="emit('add', $event)" @move="(id, parent) => emit('move', id, parent)" />
      </VueDraggable>
    </div>
    <slot v-else name="empty"></slot>
  </div>
</template>
