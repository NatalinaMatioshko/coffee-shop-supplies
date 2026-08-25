const format = new Intl.NumberFormat('uk-UA');
const format1 = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 });

export const formatNumber = (value) => format.format(value);
export const formatOne = (value) => format1.format(value);

export function formatMoney(value) {
  return `${new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ₴`;
}

export function plural(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const digit = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (digit === 1) return one;
  if (digit >= 2 && digit <= 4) return few;
  return many;
}

export function recipeLine(item) {
  const parts = [];
  if (item.coffeeG) parts.push(`${item.coffeeG} г кави`);
  if (item.milkMl) parts.push(`${item.milkMl} мл молока`);
  if (item.matchaG) parts.push(`${item.matchaG} г матчі`);
  if (item.cocoaG) parts.push(`${item.cocoaG} г какао`);
  if (item.teaBags) parts.push(`${item.teaBags} пакетик чаю`);
  parts.push(`стакан ${item.cupSize} мл`);
  return parts.join(' · ');
}

export function parseNonNegative(value) {
  return Math.max(0, Number(value) || 0);
}

export function parseDays(value) {
  return Math.max(1, Number(value) || 14);
}

export function parseCupsPerDay(value) {
  return Math.max(1, Number(value) || 100);
}
