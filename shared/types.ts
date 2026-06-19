// Общие типы для клиента и сервера.
import type { GameCard } from './games'
import type { Badge } from './progression'

export interface Profile {
  id: number
  name: string
  /** id аватара из shared/avatars. */
  avatar: string
  /** Сколько раз игрок открывал игры из хаба. */
  opens: number
  /** Накопленный опыт (выводится из opens). */
  xp: number
  /** Текущий уровень. */
  level: number
  /** Код для добавления в друзья. */
  friendCode: string
  /** Когда присоединился, ISO-строка. */
  joinedAt: string
}

/** Сколько раз игрок открывал конкретную игру. */
export interface GameStat {
  id: string
  opens: number
}

/** Профиль + статистика по играм + значки для экрана «Профиль». */
export interface ProfileDetail {
  profile: Profile
  stats: GameStat[]
  badges: Badge[]
  friendCount: number
}

export interface Friend {
  id: number
  name: string
  avatar: string
  level: number
  /** id последней игры, которую запускал друг. */
  lastGame: string | null
  /** Последняя активность, ISO-строка. */
  lastSeen: string | null
}

export interface ActivityItem {
  id: number
  userId: number
  name: string
  avatar: string
  gameId: string
  ts: string
}

export interface LeaderRow {
  id: number
  name: string
  avatar: string
  level: number
  xp: number
  isMe: boolean
}

export interface AuthResponse {
  token: string
  profile: Profile
  startParam: string | null
  botUsername: string
  /** Каталог игр с готовыми ссылками. */
  catalog: GameCard[]
  /** Идентификаторы недавно открытых игр, свежие первыми. */
  recent: string[]
}

export type { GameCard, GameDef } from './games'
export type { Badge } from './progression'
