export function formatIsoDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(date);
}

export function toIsoDateString(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}
