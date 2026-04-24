export function normalizeSpeechText(text: string): string {
  const ellipsisToken = '__NOVA_BLANK__';

  return text
    .replace(/_{3,}/g, ` ${ellipsisToken} `)
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/([,;!?]){2,}/g, '$1')
    .replace(/\.{4,}/g, '...')
    .replace(/\s+/g, ' ')
    .replace(new RegExp(ellipsisToken, 'g'), '...')
    .replace(/([^\s])\.\.\./g, '$1 ...')
    .trim();
}
