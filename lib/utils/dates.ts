export function getTimestampDaysAgo(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
