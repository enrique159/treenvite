import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EditableCombobox from './EditableCombobox.vue'

const options = ['Familia', 'Amigos', 'Trabajo']

describe('EditableCombobox', () => {
  it('shows and selects a predefined option', async () => {
    const wrapper = mount(EditableCombobox, {
      props: { id: 'group', modelValue: '', options, label: 'grupo' },
    })

    await wrapper.get('input[role="combobox"]').trigger('focus')
    expect(wrapper.get('[role="listbox"]').text()).toContain('Familia')

    await wrapper.findAll('[role="option"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Amigos'])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('emits free text that is not in the predefined list', async () => {
    const wrapper = mount(EditableCombobox, {
      props: { id: 'relation', modelValue: '', options, label: 'relación' },
    })

    await wrapper.get('input[role="combobox"]').setValue('Amistad de la universidad')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Amistad de la universidad'])
  })
})
