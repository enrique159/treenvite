const RELATION_LABEL_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;

export function normalizeRelationLabel(value: string): string {
  const words = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!RELATION_LABEL_PATTERN.test(words)) {
    throw new Error('La relación sólo puede contener letras y espacios');
  }
  const lowerCase = words.toLocaleLowerCase('es-MX');
  return `${lowerCase.charAt(0).toLocaleUpperCase('es-MX')}${lowerCase.slice(1)}`;
}

export function relationLabelKey(value: string): string {
  return normalizeRelationLabel(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
