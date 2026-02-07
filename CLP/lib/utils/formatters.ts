const eurFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const eurCentsFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("nl-NL");

export function formatEUR(value: number): string {
  return eurFormatter.format(value);
}

export function formatEURWithCents(value: number): string {
  return eurCentsFormatter.format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatEuroAxis(value: number): string {
  return `€${(value / 1000).toFixed(1)}k`;
}
