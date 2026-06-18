import { getInitData } from './telegram'
import type { AuthResponse, GameCard, Profile } from '@shared/types'

let token: string | null = sessionStorage.getItem('gg_jwt')

async function req<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(json.error ?? 'request_failed'), { status: res.status, data: json })
  return json as T
}

export const api = {
  async auth(): Promise<AuthResponse> {
    const r = await req<AuthResponse>('/auth', { initData: getInitData() })
    token = r.token
    sessionStorage.setItem('gg_jwt', r.token)
    return r
  },
  catalog: () => req<{ catalog: GameCard[] }>('/catalog'),
  open: (gameId: string) => req<{ profile: Profile; recent: string[] }>('/open', { gameId }),
}
