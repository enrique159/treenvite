import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GuestTree from './GuestTree.vue'
import type { Guest } from '../types'

const guest = (id: string, parentId: string | null): Guest => ({
  id,
  eventId: 'event-1',
  parentId,
  name: id,
  email: null,
  phone: null,
  groupName: 'Familia',
  relationLabel: 'Familiar',
  rsvp: 'pending',
  companions: 0,
  dietary: null,
  notes: null,
  version: 1,
})

describe('GuestTree', () => {
  it('keeps stable guest identifiers on nested draggable items', () => {
    const wrapper = mount(GuestTree, {
      props: { guests: [guest('root', null), guest('child', 'root')] },
    })

    expect(wrapper.findAll('[data-guest-id="child"]').length).toBeGreaterThan(0)
  })
})
