import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EventHeader from './EventHeader.vue'
import type { EventItem, EventRole } from '../types'

function event(role: EventRole): EventItem {
  return {
    id: 'event-1',
    ownerId: 'owner-1',
    name: 'Boda',
    type: 'Boda',
    startsAt: '2026-12-01T20:00:00.000Z',
    location: 'Mazatlán',
    status: 'active',
    color: '#e96f51',
    role,
    version: 1,
    createdAt: '2026-08-13T12:00:00.000Z',
    updatedAt: '2026-08-13T12:00:00.000Z',
  }
}

const RouterLink = {
  props: ['to'],
  template: '<a><slot /></a>',
}

describe('EventHeader API navigation', () => {
  it('shows the API tab to owners', () => {
    const wrapper = mount(EventHeader, {
      props: { event: event('owner') },
      global: { stubs: { RouterLink } },
    })

    expect(wrapper.text()).toContain('API')
  })

  it('hides the API tab from collaborators', () => {
    const wrapper = mount(EventHeader, {
      props: { event: event('editor') },
      global: { stubs: { RouterLink } },
    })

    expect(wrapper.text()).not.toContain('API')
  })
})
