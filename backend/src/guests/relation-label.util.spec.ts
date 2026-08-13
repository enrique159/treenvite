import {
  normalizeRelationLabel,
  relationLabelKey,
} from './relation-label.util';

describe('relation label normalization', () => {
  it('collapses whitespace and applies consistent sentence casing', () => {
    expect(normalizeRelationLabel('  COMPAÑERA   DE trabajo ')).toBe(
      'Compañera de trabajo',
    );
  });

  it('creates an accent and case insensitive lookup key', () => {
    expect(relationLabelKey('TÍA')).toBe('tia');
  });

  it.each(['Amigo/a', 'Familiar 2', 'Ex-pareja'])(
    'rejects non-letter characters in %s',
    (value) => expect(() => normalizeRelationLabel(value)).toThrow(),
  );
});
