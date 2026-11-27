/** 1500000 → "1,500,000₮", null → "Тохиролцоно". Server/client-д ижил үр дүн өгнө. */
export function formatMNT(value: number | null): string {
  if (value === null) return "Тохиролцоно"
  return `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`
}

/** Админаас засагддаг загвар текстийн `{нэр}`-ийг утгаар солино: fill("{count} алдаа", { count: 2 }) → "2 алдаа". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
