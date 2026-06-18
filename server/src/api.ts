import { Hono } from 'hono'
import { z } from 'zod'
import { validateInitData, issueToken, verifyToken } from './auth'
import { BOT_USERNAME, gameOverrides, type Env } from './env'
import { getOrCreateUser, getProfile, recordOpen, recentGames } from './profiles'
import { buildCatalog, GAMES } from '../../shared/games'

export const api = new Hono<Env>()

const VALID_IDS = new Set(GAMES.map(g => g.id))
const catalog = () => buildCatalog(gameOverrides())

api.get('/health', c => c.json({ ok: true }))

// Public catalog, so the menu still renders if a guest opens the URL directly.
api.get('/catalog', c => c.json({ catalog: catalog() }))

api.post('/auth', async c => {
  const body = await c.req.json<{ initData: string }>().catch(() => null)
  if (!body) return c.json({ error: 'bad_request' }, 400)
  const v = validateInitData(body.initData ?? '')
  if (!v) return c.json({ error: 'invalid_init_data' }, 401)
  const name = [v.user.first_name, v.user.last_name].filter(Boolean).join(' ').slice(0, 40) || 'Игрок'
  getOrCreateUser(v.user.id, name, v.user.username)
  const token = await issueToken(v.user.id)
  return c.json({
    token,
    profile: getProfile(v.user.id),
    startParam: v.startParam,
    botUsername: BOT_USERNAME,
    catalog: catalog(),
    recent: recentGames(v.user.id),
  })
})

// auth gate for everything below
api.use('/*', async (c, next) => {
  const p = c.req.path
  if (p.endsWith('/auth') || p.endsWith('/health') || p.endsWith('/catalog')) return next()
  const token = c.req.header('authorization')?.replace(/^Bearer /, '')
  const uid = token ? await verifyToken(token) : null
  if (!uid) return c.json({ error: 'unauthorized' }, 401)
  c.set('uid', uid)
  return next()
})

api.get('/profile', c => c.json({ profile: getProfile(c.get('uid')), recent: recentGames(c.get('uid')) }))

// Record that the player launched a game from the menu.
const openSchema = z.object({ gameId: z.string().min(1).max(32) })
api.post('/open', async c => {
  const parsed = openSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success || !VALID_IDS.has(parsed.data.gameId)) return c.json({ error: 'bad_request' }, 400)
  const uid = c.get('uid')
  const profile = recordOpen(uid, parsed.data.gameId)
  return c.json({ profile, recent: recentGames(uid) })
})
