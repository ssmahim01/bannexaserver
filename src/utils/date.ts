export function addDays(days: number): Date {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}

export function isExpired(date: Date): boolean {
  return new Date() >= date;
}

export function isSettlementPeriod(): boolean {
  const today = new Date().getDate();
  return today >= 28 && today <= 30;
}
