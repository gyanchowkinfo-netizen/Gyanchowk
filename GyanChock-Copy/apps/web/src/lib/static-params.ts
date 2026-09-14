import { API_URL } from './api';

type Item = Record<string, unknown>;

export async function staticParams(
  path: string,
  sourceField: string = 'slug',
  paramName: string = 'slug',
): Promise<Array<Record<string, string>>> {
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: Item[] };
    const seen = new Set<string>();
    const out: Array<Record<string, string>> = [];
    for (const item of data.items ?? []) {
      const value = String(item[sourceField] ?? item._id ?? '');
      if (!value || seen.has(value)) continue;
      seen.add(value);
      out.push({ [paramName]: value });
    }
    return out;
  } catch {
    return [];
  }
}
