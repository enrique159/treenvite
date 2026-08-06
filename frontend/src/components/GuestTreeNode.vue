<script setup lang="ts">
import { GripVertical, Plus } from '@lucide/vue'
import type { SortableEvent } from 'sortablejs'
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { Guest } from '../types'
import type { GuestTreeItem } from '../types/tree'

defineOptions({ name: 'GuestTreeNode' })
const props = defineProps<{ node: GuestTreeItem }>()
const children = ref<GuestTreeItem[]>([])
watch(
  () => props.node.children,
  (value) => (children.value = [...value]),
  { immediate: true },
)
const emit = defineEmits<{
  edit: [guest: Guest]
  add: [guest: Guest]
  move: [guestId: string, parentId: string | null]
}>()
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function onAdd(event: SortableEvent) {
  const guestId = (event.item as HTMLElement).dataset.guestId
  if (guestId) emit('move', guestId, props.node.guest.id)
}
</script>

<template>
  <div class="flex min-w-56 flex-col items-center" :data-guest-id="node.guest.id">
    <article
      class="group card w-56 border border-base-300 border-l-4 bg-base-100 shadow-sm"
      :class="
        node.guest.rsvp === 'confirmed'
          ? 'border-l-success'
          : node.guest.rsvp === 'declined'
            ? 'border-l-error'
            : 'border-l-warning'
      "
    >
      <div class="card-body flex-row items-center gap-2 p-3">
        <GripVertical class="drag-handle size-4 cursor-grab opacity-30" />
        <div class="avatar placeholder">
          <div class="w-9 rounded-full bg-accent text-xs font-bold">
            <span>{{ initials(node.guest.name) }}</span>
          </div>
        </div>
        <button class="min-w-0 flex-1 text-left" @click="emit('edit', node.guest)">
          <strong class="block truncate text-xs">{{ node.guest.name }}</strong
          ><span class="block truncate text-[10px] opacity-50">{{ node.guest.relationLabel }}</span>
        </button>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :aria-label="`Agregar relación a ${node.guest.name}`"
          @click="emit('add', node.guest)"
        >
          <Plus class="size-3.5" />
        </button>
      </div>
    </article>
    <span v-if="node.children.length" class="h-7 w-px bg-base-300"></span>
    <VueDraggable
      v-model="children"
      group="guest-tree"
      handle=".drag-handle"
      class="flex items-start gap-6"
      :animation="180"
      ghost-class="opacity-30"
      @add="onAdd"
    >
      <div
        v-for="child in children"
        :key="child.guest.id"
        :data-guest-id="child.guest.id"
        class="relative flex justify-center before:absolute before:-top-px before:left-0 before:right-0 before:h-px before:bg-base-300 first:before:left-1/2 last:before:right-1/2 only:before:hidden"
      >
        <span class="absolute left-1/2 top-0 h-7 w-px bg-base-300"></span>
        <GuestTreeNode
          :node="child"
          class="pt-7"
          @edit="emit('edit', $event)"
          @add="emit('add', $event)"
          @move="(id, parent) => emit('move', id, parent)"
        />
      </div>
    </VueDraggable>
  </div>
</template>
