import { db } from './db'
import { DEV_MODE } from './auth'
import { getOrCreateUser } from './profiles'

// Демоданные ТОЛЬКО для локального DEV_MODE (нет BOT_TOKEN): несколько друзей,
// запуски игр и дружба с локальным игроком (id=1), чтобы соц-вкладки были живыми
// на скриншотах. В продакшене не выполняется никогда.
const DEMO = [
  { id: 9001, name: 'Аня', avatar: 'fox', opens: ['croco', 'pet', 'croco', 'uno', 'pet', 'croco'] },
  { id: 9002, name: 'Миша', avatar: 'panda', opens: ['mafia', 'uno', 'mafia', 'mafia'] },
  { id: 9003, name: 'Лена', avatar: 'unicorn', opens: ['pet', 'pet', 'pet', 'pet', 'pet', 'croco', 'uno', 'mafia', 'pet'] },
  { id: 9004, name: 'Костя', avatar: 'dragon', opens: ['uno', 'uno'] },
]

export function seedDev(): void {
  if (!DEV_MODE) return
  const already = db.prepare('SELECT 1 FROM friendships WHERE user_id=1 LIMIT 1').get()
  if (already) return

  getOrCreateUser(1, 'Dev')
  // Дадим локальному игроку немного истории, чтобы хаб не был пустым.
  for (const g of ['croco', 'pet', 'uno', 'croco', 'pet']) {
    db.prepare('INSERT INTO opens (user_id, game_id) VALUES (1, ?)').run(g)
  }
  db.prepare('UPDATE users SET opens=(SELECT COUNT(*) FROM opens WHERE user_id=1) WHERE id=1').run()

  const addFriend = db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?,?)')
  const addOpen = db.prepare('INSERT INTO opens (user_id, game_id) VALUES (?,?)')
  db.transaction(() => {
    for (const d of DEMO) {
      getOrCreateUser(d.id, d.name)
      db.prepare('UPDATE users SET avatar=?, opens=? WHERE id=?').run(d.avatar, d.opens.length, d.id)
      for (const g of d.opens) addOpen.run(d.id, g)
      addFriend.run(1, d.id)
      addFriend.run(d.id, 1)
    }
  })()
  console.log(`dev seed: ${DEMO.length} demo friends for local user`)
}
