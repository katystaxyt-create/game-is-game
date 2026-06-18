// Общие типы для клиента и сервера.
import type { GameCard } from './games'

export interface Profile {
  id: number
  name: string
  /** Сколько раз игрок открывал игры из лаунчера. */
  opens: number
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
