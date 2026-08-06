import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GuestTable from './GuestTable.vue'
import type { Guest } from '../types'

const guest: Guest = {
  id: 'guest-1',
  eventId: 'event-1',
  parentId: null,
  name: 'Ana Torres',
  email: 'ana@example.com',
  phone: null,
  groupName: 'Familia',
  relationLabel: 'Anfitriona',
  rsvp: 'confirmed',
  companions: 1,
  dietary: null,
  notes: null,
  version: 1,
}

describe('GuestTable', () => {
  it('renders and selects a guest', async () => {
    const wrapper = mount(GuestTable, { props: { guests: [guest] } })
    expect(wrapper.text()).toContain('Ana Torres')
    await wrapper.find('tbody tr').trigger('click')
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(guest)
  })
})
