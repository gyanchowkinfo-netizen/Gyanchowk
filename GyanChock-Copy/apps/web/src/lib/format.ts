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

/** e.g. Started on 24th Aug'26 */
export function formatStartedOn(value?: string | Date | null) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const day = d.getDate();
  const ord =
    day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const mon = d.toLocaleString('en-GB', { month: 'short' });
  const yy = String(d.getFullYear()).slice(-2);
  return `${day}${ord} ${mon}'${yy}`;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  english: 'English',
  hi: 'Hindi',
  hindi: 'Hindi',
  hinglish: 'Hinglish',
  bilingual: 'Bilingual',
};

export function formatCourseLanguage(value?: string | null) {
  const raw = (value || '').trim();
  if (!raw) return 'English';
  return LANGUAGE_LABELS[raw.toLowerCase()] || raw;
}

/** Normalize admin/API language input to a stable display label. */
export function normalizeCourseLanguage(value?: string | null) {
  const raw = (value || '').trim();
  if (!raw) return 'English';
  return LANGUAGE_LABELS[raw.toLowerCase()] || raw;
}
