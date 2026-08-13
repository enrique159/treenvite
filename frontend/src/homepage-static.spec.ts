/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const homepage = readFileSync('index.html', 'utf8')

describe('static homepage fallback', () => {
  it('uses the exact OAuth application name in its primary identity signals', () => {
    expect(homepage).toContain('<title>Treenvite</title>')
    expect(homepage).toContain('<meta name="application-name" content="Treenvite" />')
    expect(homepage).toMatch(/<h1[^>]*>Treenvite<\/h1>/)
  })

  it('describes the application and Google data use without requiring JavaScript', () => {
    expect(homepage).toContain('Treenvite es una aplicación web para crear y administrar eventos')
    expect(homepage).toContain('Propósito del acceso con Google')
    expect(homepage).toContain('No solicita acceso a Google Drive, Calendar, Contactos, Gmail')
  })

  it('links to the same public privacy path used by the OAuth consent screen', () => {
    expect(homepage).toContain('href="/privacidad"')
  })

  it('publishes favicon and Apple touch icon metadata', () => {
    expect(homepage).toContain('rel="icon" href="/favicon.svg"')
    expect(homepage).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"')
  })
})
