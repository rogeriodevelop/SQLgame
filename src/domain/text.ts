/**
 * Normalização de texto para comparações tolerantes.
 *
 * O jogador digita nomes livremente ("carlos mendes", "Carlos  Mendes",
 * "CARLOS MENDES"), e os dados dos casos têm acentuação. Comparar as duas
 * pontas normalizadas evita rejeitar respostas corretas por diferença
 * cosmética, sem afrouxar a comparação a ponto de aceitar nome errado.
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/** Duas strings são equivalentes ignorando caixa, acentos e espaços repetidos. */
export function textEquals(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}
