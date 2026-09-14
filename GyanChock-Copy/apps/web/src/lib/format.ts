export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount || 0,
  );
}

export function formatPaise(paise: number): string {
  return formatInr((paise || 0) / 100);
}

export function salePrice(price: number, discountPercent = 0, pricingType?: string): number {
  if (pricingType === 'free' || !price) return 0;
  return Math.round(price * (1 - Math.min(100, discountPercent) / 100));
}

export function formatPrice(price: number, discountPercent = 0, pricingType?: string): string {
  const n = salePrice(price, discountPercent, pricingType);
  return n === 0 ? 'Free' : formatInr(n);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function initials(name?: string) {
  return (name ?? 'G')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function readingMinutes(text?: string) {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
}

export function authorName(author?: { name?: string } | string) {
  if (!author) return undefined;
  return typeof author === 'string' ? author : author.name;
}

export function formatDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
