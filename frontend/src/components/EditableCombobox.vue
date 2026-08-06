<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    modelValue: string
    options: readonly string[]
    label: string
    placeholder?: string
    invalid?: boolean
    describedBy?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '',
    invalid: false,
    describedBy: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const open = ref(false)
const activeIndex = ref(-1)

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()

const filteredOptions = computed(() => {
  const query = normalize(props.modelValue.trim())
  if (!query) return [...props.options]
  return props.options
    .filter((option) => normalize(option).includes(query))
    .sort((left, right) => Number(normalize(right).startsWith(query)) - Number(normalize(left).startsWith(query)))
})

const listboxId = computed(() => `${props.id}-options`)
const activeOptionId = computed(() =>
  open.value && activeIndex.value >= 0 ? `${props.id}-option-${activeIndex.value}` : undefined,
)

function showOptions(): void {
  if (props.disabled) return
  open.value = true
  const selectedIndex = filteredOptions.value.findIndex((option) => option === props.modelValue)
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : filteredOptions.value.length ? 0 : -1
}

function closeOptions(): void {
  open.value = false
  activeIndex.value = -1
}

function updateValue(event: Event): void {
  emit('update:modelValue', (event.currentTarget as HTMLInputElement).value)
  showOptions()
}

function selectOption(option: string): void {
  emit('update:modelValue', option)
  closeOptions()
  void nextTick(() => input.value?.focus())
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) showOptions()
    else if (filteredOptions.value.length) activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) showOptions()
    else if (filteredOptions.value.length)
      activeIndex.value = (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
  } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0) {
    event.preventDefault()
    const option = filteredOptions.value[activeIndex.value]
    if (option) selectOption(option)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeOptions()
  } else if (event.key === 'Tab') {
    closeOptions()
  }
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (!root.value?.contains(event.target as Node)) closeOptions()
}

watch(filteredOptions, (options) => {
  if (open.value) activeIndex.value = options.length ? 0 : -1
})

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="root" class="relative">
    <div class="input flex w-full items-center gap-2 pr-2" :class="{ 'input-error': invalid }">
      <input
        :id="id"
        ref="input"
        :value="modelValue"
        class="min-w-0 grow bg-transparent outline-none"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listboxId"
        :aria-activedescendant="activeOptionId"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="showOptions"
        @input="updateValue"
        @keydown="onKeydown"
        @blur="emit('blur')"
      />
      <button
        type="button"
        class="btn btn-circle btn-ghost btn-xs shrink-0"
        :aria-label="`${open ? 'Ocultar' : 'Mostrar'} opciones de ${label}`"
        :aria-expanded="open"
        :disabled="disabled"
        tabindex="-1"
        @mousedown.prevent
        @click="open ? closeOptions() : showOptions()"
      >
        <ChevronDown class="size-4 transition-transform" :class="{ 'rotate-180': open }" />
      </button>
    </div>

    <ul
      v-if="open"
      :id="listboxId"
      role="listbox"
      :aria-label="`Opciones de ${label}`"
      class="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-52 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
    >
      <li
        v-for="(option, index) in filteredOptions"
        :id="`${id}-option-${index}`"
        :key="option"
        role="option"
        :aria-selected="option === modelValue"
        class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
        :class="index === activeIndex ? 'bg-base-200' : 'hover:bg-base-200/70'"
        @mouseenter="activeIndex = index"
        @mousedown.prevent
        @click="selectOption(option)"
      >
        <span class="min-w-0 flex-1 truncate">{{ option }}</span>
        <Check v-if="option === modelValue" class="size-4 shrink-0 text-primary" />
      </li>
      <li v-if="!filteredOptions.length" class="px-3 py-2 text-xs leading-5 opacity-55">
        Puedes usar “{{ modelValue }}” como valor personalizado.
      </li>
    </ul>
  </div>
</template>
