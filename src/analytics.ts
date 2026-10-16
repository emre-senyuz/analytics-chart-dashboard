export const channels = ['Organic search', 'Paid search', 'Social', 'Email', 'Direct'] as const;
export type Channel = typeof channels[number];
export type ChannelFilter = Channel | 'All channels';
export type Period = 7 | 30 | 90;
export interface Metrics { sessions: number; signups: number; conversions: number; revenue: number }
export interface AnalyticsRow extends Metrics { date: string; channel: Channel; campaign: string }
export const END_DATE = '2026-10-14';
const DAY = 86_400_000;
export const shiftDate = (date: string, days: number) => new Date(Date.parse(date + 'T00:00:00Z') + days * DAY).toISOString().slice(0, 10);
export const START_DATE = shiftDate(END_DATE, -89);
const campaignNames = [['Evergreen content', 'Product discovery'], ['Brand search', 'Autumn acquisition'], ['Creator collective', 'Product stories'], ['Weekly digest', 'Welcome series'], ['Returning visitors', 'Brand awareness']];
// Fixed arithmetic seasonality: no runtime randomness, clock, or remote inputs.
export const dataset: readonly AnalyticsRow[] = Array.from({ length: 90 }, (_, day) => channels.flatMap((channel, ci) => campaignNames[ci].map((campaign, pi) => {
  const date = shiftDate(START_DATE, day);
  const weekday = new Date(date + 'T00:00:00Z').getUTCDay();
  const sessions = Math.round(([510, 390, 280, 170, 230][ci]) * (pi === 0 ? 0.64 : 0.36) * (1 + day * 0.0032) * (weekday === 0 || weekday === 6 ? 0.77 : 1.08) * (1 + Math.sin(day * 0.7 + ci + pi) * 0.13));
  const signups = Math.round(sessions * [0.115, 0.096, 0.075, 0.19, 0.12][ci]);
  const conversions = Math.round(signups * (0.29 + ci * 0.025 + pi * 0.015));
  return { date, channel, campaign, sessions, signups, conversions, revenue: conversions * (6900 + ci * 850 + pi * 1200) };
}))).flat();
export const ratio = (numerator: number, denominator: number): number => denominator > 0 ? numerator / denominator : 0;
export function total(rows: readonly Metrics[]): Metrics {
  return rows.reduce((a, r) => ({ sessions: a.sessions + r.sessions, signups: a.signups + r.signups, conversions: a.conversions + r.conversions, revenue: a.revenue + r.revenue }), { sessions: 0, signups: 0, conversions: 0, revenue: 0 });
}
export function change(current: number, previous: number): number | null { return previous === 0 ? null : (current - previous) / previous; }
export function aggregate(rows: readonly AnalyticsRow[], days: Period, channel: ChannelFilter) {
  const start = shiftDate(END_DATE, 1 - days);
  const previousStart = shiftDate(start, -days);
  const matches = (row: AnalyticsRow) => channel === 'All channels' || row.channel === channel;
  const current = rows.filter(r => matches(r) && r.date >= start && r.date <= END_DATE);
  // Only compare complete, equal-length periods within the available dataset.
  const previous = previousStart >= START_DATE ? total(rows.filter(r => matches(r) && r.date >= previousStart && r.date < start)) : null;
  const daily = Array.from({ length: days }, (_, i) => { const date = shiftDate(start, i); return { date, ...total(current.filter(r => r.date === date)) }; });
  const breakdown = channels.map(name => ({ name, ...total(current.filter(r => r.channel === name)) })).filter(r => r.sessions > 0);
  const campaigns = [...new Set(current.map(r => r.campaign))].map(name => { const group = current.filter(r => r.campaign === name); return { name, channel: group[0].channel, ...total(group) }; }).sort((a, b) => b.revenue - a.revenue);
  return { start, current: total(current), previous, daily, breakdown, campaigns };
}
export const number = (n: number) => new Intl.NumberFormat('en-US').format(n);
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
export const percent = (fraction: number) => new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(fraction);
export const shortDate = (date: string) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
