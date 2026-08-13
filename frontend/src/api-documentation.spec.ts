/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const documentation = readFileSync('src/views/ApiDocumentationView.vue', 'utf8')

describe('public API documentation', () => {
  it('documents every public guest endpoint', () => {
    expect(documentation).toContain('/integrations/guests</code>')
    expect(documentation).toContain('/integrations/guests/:guestId</code>')
    expect(documentation).toContain('Listar invitados')
    expect(documentation).toContain('Actualizar un invitado')
  })

  it('includes navigation, authentication and server-side security guidance', () => {
    expect(documentation).toContain('Contenido de la documentación')
    expect(documentation).toContain('Authorization: Bearer tv_api_TU_TOKEN')
    expect(documentation).toContain('comunicación servidor a servidor')
  })
})
