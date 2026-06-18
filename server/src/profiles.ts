import { db } from './db'
import type { Profile } from '../../shared/types'

interface UserRow {
  id: number
  name: string
  username: string | null
  opens: number
}

export function getOrCreateUser(id: number, name: string, username?: string): UserRow {
  const existing = db.prepare('SELECT * FROM users WHERE id=?').get(id) as UserRow | undefined
  if (existing) {
    db.prepare("UPDATE users SET name=?, last_seen=datetime('now') WHERE id=?").run(name, id)
    return { ...existing, name }
  }
  db.prepare("INSERT INTO users (id, name, username, last_seen) VALUES (?,?,?,datetime('now'))").run(
    id,
    name,
    username ?? null,
  )
  return db.prepare('SELECT * FROM users WHERE id=?').get(id) as UserRow
}

export function toProfile(u: UserRow): Profile {
  return { id: u.id, name: u.name, opens: u.opens }
}

export function getProfile(id: number): Profile | null {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(id) as UserRow | undefined
  return u ? toProfile(u) : null
}

// Record that a player launched a game and return their updated profile.
export function recordOpen(id: number, gameId: string): Profile {
  db.prepare("INSERT OR IGNORE INTO users (id, name) VALUES (?, 'Игрок')").run(id)
  db.prepare('INSERT INTO opens (user_id, game_id) VALUES (?,?)').run(id, gameId)
  db.prepare('UPDATE users SET opens=opens+1 WHERE id=?').run(id)
  return getProfile(id)!
}

// Distinct game ids, most recently opened first (for the "Недавнее" highlight).
export function recentGames(id: number, limit = 4): string[] {
  const rows = db
    .prepare('SELECT game_id, MAX(id) AS last FROM opens WHERE user_id=? GROUP BY game_id ORDER BY last DESC LIMIT ?')
    .all(id, limit) as { game_id: string; last: number }[]
  return rows.map(r => r.game_id)
}
