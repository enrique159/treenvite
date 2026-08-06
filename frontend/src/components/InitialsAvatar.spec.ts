import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InitialsAvatar from './InitialsAvatar.vue'

describe('InitialsAvatar', () => {
  it('centers the initials inside a square avatar', () => {
    const wrapper = mount(InitialsAvatar, { props: { name: 'Enrique Marín' } })
    const circle = wrapper.find('.grid')

    expect(wrapper.text()).toBe('EM')
    expect(circle.classes()).toEqual(expect.arrayContaining(['size-9', 'place-items-center', 'leading-none']))
  })
})
