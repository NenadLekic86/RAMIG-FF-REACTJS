export type FieldGetter<T> = (item: T) => string | number | boolean | undefined | null;

export interface SearchOptions<T> {
  fields: Array<keyof T | FieldGetter<T>>;
  caseSensitive?: boolean;
  trim?: boolean;
}

export function normalizeQuery(query: string, caseSensitive = false, trim = true): string {
  let q = query ?? '';
  if (trim) q = q.trim();
  if (!caseSensitive) q = q.toLowerCase();
  return q;
}

export function extractFieldValue<T>(item: T, field: keyof T | FieldGetter<T>): unknown {
  if (typeof field === 'function') return field(item);
  const key = field as keyof T;
  return (item as Record<string, unknown>)[key as unknown as string];
}

export function toSearchable(value: unknown, caseSensitive = false): string {
  if (value == null) return '';
  const s = String(value);
  return caseSensitive ? s : s.toLowerCase();
}

export function filterByQuery<T>(items: T[], query: string, options: SearchOptions<T>): T[] {
  const { fields, caseSensitive = false, trim = true } = options;
  const q = normalizeQuery(query, caseSensitive, trim);
  if (!q) return items;
  return items.filter((item) => {
    for (const field of fields) {
      const raw = extractFieldValue(item, field);
      const s = toSearchable(raw, caseSensitive);
      if (s.includes(q)) return true;
    }
    return false;
  });
}


