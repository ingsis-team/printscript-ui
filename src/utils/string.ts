// Small safe capitalize helper to avoid runtime errors when value is undefined or not a string
export function safeCapitalize(value: unknown): string {
  if (typeof value === 'string') {
    if (value.length === 0) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return String(value ?? 'Unknown');
}

