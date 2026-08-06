import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GuestFormModal from './GuestFormModal.vue'

function mountModal() {
  return mount(GuestFormModal, {
    props: { open: true, guest: null, guests: [] },
  })
}

describe('GuestFormModal', () => {
  it('shows field-level validation messages instead of submitting invalid data', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('El nombre es obligatorio.')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('keeps email optional and masks phone input to digits', async () => {
    const wrapper = mountModal()
    await wrapper.get('input[autocomplete="name"]').setValue('Ana Pérez')
    await wrapper.get('#guest-group').setValue('Familia de la novia')
    await wrapper.get('#guest-relation').setValue('Amistad de la universidad')
    const phone = wrapper.get('input[inputmode="numeric"]')
    await phone.setValue('669-12a34 567')

    expect((phone.element as HTMLInputElement).value).toBe('6691234567')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual(
      expect.objectContaining({
        email: null,
        phone: '6691234567',
        name: 'Ana Pérez',
        groupName: 'Familia de la novia',
        relationLabel: 'Amistad de la universidad',
      }),
    )
  })
})
