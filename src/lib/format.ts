/** 1500000 → "1,500,000₮", null → "Тохиролцоно". Server/client-д ижил үр дүн өгнө. */
export function formatMNT(value: number | null): string {
  if (value === null) return "Тохиролцоно"
  return `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`
}
