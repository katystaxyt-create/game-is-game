import type { GameCard } from '@shared/types'

/** Относительное время по-русски: «5 мин назад», «2 ч назад», «вчера». */
export function timeAgo(iso: string | null): string {
  if (!iso) return ''
  // SQLite datetime('now') пишет в UTC без зоны — приведём к ISO с Z.
  const ts = Date.parse(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  if (Number.isNaN(ts)) return ''
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return 'только что'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  if (d === 1) return 'вчера'
  if (d < 7) return `${d} дн назад`
  return `${Math.floor(d / 7)} нед назад`
}

/** «играет в …» / «онлайн» по последней активности друга. */
export function isOnline(iso: string | null): boolean {
  if (!iso) return false
  const ts = Date.parse(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  return !Number.isNaN(ts) && Date.now() - ts < 5 * 60 * 1000
}

export function gameById(catalog: GameCard[], id: string | null): GameCard | undefined {
  return id ? catalog.find(g => g.id === id) : undefined
}
