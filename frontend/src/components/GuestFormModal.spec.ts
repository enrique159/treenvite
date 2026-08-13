import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Guest } from '../types'
import GuestFormModal from './GuestFormModal.vue'

function mountModal() {
  return mount(GuestFormModal, {
    props: {
      open: true,
      guest: null,
      guests: [],
      relationOptions: ['Familiar', 'Pareja'],
    },
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
    await wrapper.get('select').setValue('bride')
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
        invitedBySide: 'bride',
      }),
    )
  })

  it('loads persisted relation suggestions and rejects punctuation', async () => {
    const wrapper = mountModal()
    await wrapper.get('#guest-relation').trigger('focus')
    expect(wrapper.get('[role="listbox"]').text()).toContain('Familiar')

    await wrapper.get('input[autocomplete="name"]').setValue('Ana Pérez')
    await wrapper.get('#guest-relation').setValue('Amigo/a')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Usa únicamente letras y espacios.')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('preserves an unchanged legacy relation while editing other fields', async () => {
    const legacyGuest: Guest = {
      id: 'guest-1',
      eventId: 'event-1',
      parentId: null,
      name: 'Ana Pérez',
      email: null,
      phone: null,
      groupName: 'Familia',
      relationLabel: 'Invitado/a',
      invitedBySide: null,
      rsvp: 'pending',
      companions: 0,
      dietary: null,
      notes: null,
      version: 1,
    }
    const wrapper = mount(GuestFormModal, {
      props: { open: true, guest: legacyGuest, guests: [legacyGuest] },
    })

    await wrapper.get('input[autocomplete="name"]').setValue('Ana Pérez López')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual(expect.not.objectContaining({ relationLabel: expect.anything() }))
  })
})
