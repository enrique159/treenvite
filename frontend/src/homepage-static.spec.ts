/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const homepage = readFileSync('index.html', 'utf8')

describe('static homepage fallback', () => {
  it('describes the application and Google data use without requiring JavaScript', () => {
    expect(homepage).toContain('Treenvite es una aplicación web para crear y administrar eventos')
    expect(homepage).toContain('Propósito del acceso con Google')
    expect(homepage).toContain('No solicita acceso a Google Drive, Calendar, Contactos, Gmail')
  })

  it('links to the same public privacy path used by the OAuth consent screen', () => {
    expect(homepage).toContain('href="/privacidad"')
  })
})
