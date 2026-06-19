// Палитра аватаров хаба: эмодзи + цвет «кольца». Игрок выбирает в профиле.
// Дефолт детерминированно зависит от id, чтобы у каждого был свой вид сразу.

export interface AvatarDef {
  id: string
  emoji: string
  ring: string
}

export const AVATARS: AvatarDef[] = [
  { id: 'fox', emoji: '🦊', ring: '#f2a93b' },
  { id: 'owl', emoji: '🦉', ring: '#3d8bff' },
  { id: 'cat', emoji: '🐱', ring: '#e2574c' },
  { id: 'panda', emoji: '🐼', ring: '#5c7cfa' },
  { id: 'frog', emoji: '🐸', ring: '#7fb069' },
  { id: 'dragon', emoji: '🐲', ring: '#9b6cff' },
  { id: 'ghost', emoji: '👻', ring: '#22b8cf' },
  { id: 'alien', emoji: '👾', ring: '#cc5de8' },
  { id: 'robot', emoji: '🤖', ring: '#868e96' },
  { id: 'unicorn', emoji: '🦄', ring: '#f06595' },
  { id: 'lion', emoji: '🦁', ring: '#f59f00' },
  { id: 'penguin', emoji: '🐧', ring: '#4dabf7' },
]

const byId = new Map(AVATARS.map(a => [a.id, a]))

/** Детерминированный аватар по умолчанию из id пользователя. */
export function defaultAvatar(seed: number): string {
  const i = Math.abs(Math.floor(seed)) % AVATARS.length
  return AVATARS[i].id
}

export function avatarOf(id: string | null | undefined, seed = 0): AvatarDef {
  return (id && byId.get(id)) || byId.get(defaultAvatar(seed)) || AVATARS[0]
}
