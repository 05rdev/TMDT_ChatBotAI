export type ProductAttributeRow = {
  key: string;
  value: string;
  unit?: string | null;
};

export function normalizeProductAttributes(input: unknown): ProductAttributeRow[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    const rows: ProductAttributeRow[] = [];
    for (const item of input) {
      if (!item || typeof item !== 'object') continue;
        const attr = item as { key?: unknown; value?: unknown; unit?: unknown };
        const key = String(attr.key ?? '').trim();
        const value = String(attr.value ?? '').trim();
      if (!key || !value) continue;
      rows.push({
        key,
        value,
        unit: attr.unit === null || attr.unit === undefined ? null : String(attr.unit),
      });
    }
    return rows;
  }

  if (typeof input === 'object') {
    const rows: ProductAttributeRow[] = [];
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const normalizedKey = key.trim();
      const normalizedValue = String(value ?? '').trim();
      if (!normalizedKey || !normalizedValue || normalizedValue === '[object Object]') continue;
      rows.push({ key: normalizedKey, value: normalizedValue, unit: null });
    }
    return rows;
  }

  return [];
}

export function productAttributesToRecord(input: unknown): Record<string, string> {
  return normalizeProductAttributes(input).reduce<Record<string, string>>((acc, attr) => {
    acc[attr.key] = attr.unit ? `${attr.value} ${attr.unit}` : attr.value;
    return acc;
  }, {});
}

export function productAttributesToPayload(input: unknown) {
  return normalizeProductAttributes(input).map((attr) => ({
    key: attr.key,
    value: attr.value,
    unit: attr.unit || undefined,
  }));
}
