import { db } from './db'
import type { Friend, ActivityItem, LeaderRow } from '../../shared/types'
import { xpFromOpens, levelInfo } from '../../shared/progression'
import { avatarOf } from '../../shared/avatars'
import { getProfile } from './profiles'
import { GAMES } from '../../shared/games'

const VALID_GAME_IDS = new Set(GAMES.map(g => g.id))

export type AddFriendResult =
  | { ok: true; friend: Friend }
  | { ok: false; reason: 'not_found' | 'self' | 'already' }

/** Добавить друга по коду. Дружба взаимная: пишем обе стороны в транзакции. */
export function addFriendByCode(uid: number, rawCode: string): AddFriendResult {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, reason: 'not_found' }
  const target = db.prepare('SELECT id FROM users WHERE friend_code=?').get(code) as { id: number } | undefined
  if (!target) return { ok: false, reason: 'not_found' }
  if (target.id === uid) return { ok: false, reason: 'self' }
  const existing = db
    .prepare('SELECT 1 FROM friendships WHERE user_id=? AND friend_id=?')
    .get(uid, target.id)
  if (existing) return { ok: false, reason: 'already' }

  db.transaction(() => {
    const ins = db.prepare(
      'INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?,?)',
    )
    ins.run(uid, target.id)
    ins.run(target.id, uid)
  })()

  const friend = friendsOf(uid).find(f => f.id === target.id)
  return friend ? { ok: true, friend } : { ok: false, reason: 'not_found' }
}

export function removeFriend(uid: number, friendId: number): void {
  db.transaction(() => {
    const del = db.prepare('DELETE FROM friendships WHERE user_id=? AND friend_id=?')
    del.run(uid, friendId)
    del.run(friendId, uid)
  })()
}

/** Список друзей с уровнем и последней сыгранной игрой, недавно активные выше. */
export function friendsOf(uid: number): Friend[] {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.avatar, u.opens, u.last_seen,
              (SELECT game_id FROM opens o WHERE o.user_id=u.id ORDER BY o.id DESC LIMIT 1) AS last_game
         FROM friendships f
         JOIN users u ON u.id = f.friend_id
        WHERE f.user_id = ?
        ORDER BY u.last_seen DESC NULLS LAST, u.id DESC`,
    )
    .all(uid) as {
    id: number
    name: string
    avatar: string | null
    opens: number
    last_seen: string | null
    last_game: string | null
  }[]
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    avatar: avatarOf(r.avatar, r.id).id,
    level: levelInfo(xpFromOpens(r.opens)).level,
    lastGame: r.last_game && VALID_GAME_IDS.has(r.last_game) ? r.last_game : null,
    lastSeen: r.last_seen,
  }))
}

/** Лента: последние запуски игр у меня и моих друзей, свежие первыми. */
export function activityFeed(uid: number, limit = 30): ActivityItem[] {
  const rows = db
    .prepare(
      `SELECT o.id, o.user_id, o.game_id, o.ts, u.name, u.avatar
         FROM opens o
         JOIN users u ON u.id = o.user_id
        WHERE o.user_id = ?
           OR o.user_id IN (SELECT friend_id FROM friendships WHERE user_id = ?)
        ORDER BY o.id DESC
        LIMIT ?`,
    )
    .all(uid, uid, limit) as {
    id: number
    user_id: number
    game_id: string
    ts: string
    name: string
    avatar: string | null
  }[]
  return rows
    .filter(r => VALID_GAME_IDS.has(r.game_id))
    .map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      avatar: avatarOf(r.avatar, r.user_id).id,
      gameId: r.game_id,
      ts: r.ts,
    }))
}

/** Таблица лидеров: я и мои друзья по опыту, от большего к меньшему. */
export function leaderboard(uid: number, limit = 20): LeaderRow[] {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.avatar, u.opens
         FROM users u
        WHERE u.id = ?
           OR u.id IN (SELECT friend_id FROM friendships WHERE user_id = ?)
        ORDER BY u.opens DESC, u.id ASC
        LIMIT ?`,
    )
    .all(uid, uid, limit) as { id: number; name: string; avatar: string | null; opens: number }[]
  return rows.map(r => {
    const xp = xpFromOpens(r.opens)
    return {
      id: r.id,
      name: r.name,
      avatar: avatarOf(r.avatar, r.id).id,
      level: levelInfo(xp).level,
      xp,
      isMe: r.id === uid,
    }
  })
}

/** Сводка для соц-вкладок одним запросом. */
export function socialSnapshot(uid: number) {
  // Гарантируем, что код друга и аватар у текущего игрока есть.
  getProfile(uid)
  return {
    friends: friendsOf(uid),
    activity: activityFeed(uid),
    leaderboard: leaderboard(uid),
  }
}
