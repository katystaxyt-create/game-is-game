import { create } from 'zustand'
import type { GameCard, Profile } from '@shared/types'
import { GAMES, defaultLink } from '@shared/games'
import { api } from './api'
import { haptic, openGame as openGameLink, getStartParam, inTelegram } from './telegram'
import { playSfx, isSoundOn, setSoundOn } from './sound'

// Статичный каталог на случай, если сервер недоступен (гость, офлайн).
const STATIC_CATALOG: GameCard[] = GAMES.map(g => ({ ...g, link: defaultLink(g.bot) }))

type Sheet = 'about' | 'help' | null

interface S {
  ready: boolean
  profile: Profile | null
  catalog: GameCard[]
  recent: string[]
  sheet: Sheet
  soundOn: boolean
  launching: string | null

  init(): Promise<void>
  launch(card: GameCard): void
  openSheet(s: Sheet): void
  toggleSound(): void
}

export const useStore = create<S>((set, get) => ({
  ready: false,
  profile: null,
  catalog: STATIC_CATALOG,
  recent: [],
  sheet: null,
  soundOn: isSoundOn(),
  launching: null,

  async init() {
    let autoOpenId: string | null = null
    try {
      const r = await api.auth()
      set({ profile: r.profile, catalog: r.catalog?.length ? r.catalog : STATIC_CATALOG, recent: r.recent ?? [], ready: true })
      if (r.startParam && r.catalog?.some(g => g.id === r.startParam)) autoOpenId = r.startParam
    } catch {
      // гость или офлайн: показываем меню из публичного каталога или статики
      try {
        const r = await api.catalog()
        set({ catalog: r.catalog?.length ? r.catalog : STATIC_CATALOG, ready: true })
      } catch {
        set({ ready: true })
      }
      const sp = getStartParam()
      if (sp && get().catalog.some(g => g.id === sp)) autoOpenId = sp
    }
    // Прямая ссылка на игру через лаунчер: t.me/<bot>?startapp=<gameId>
    if (autoOpenId && inTelegram) {
      const card = get().catalog.find(g => g.id === autoOpenId)
      if (card) get().launch(card)
    }
  },

  launch(card) {
    haptic('heavy')
    if (get().soundOn) playSfx('open')
    set({ launching: card.id, recent: [card.id, ...get().recent.filter(id => id !== card.id)] })
    // фиксируем открытие на сервере (не блокируя запуск)
    api.open(card.id).then(r => set({ profile: r.profile, recent: r.recent })).catch(() => {})
    // небольшая пауза, чтобы плитка успела «нажаться», затем открываем игру
    setTimeout(() => {
      openGameLink(card.link)
      set({ launching: null })
    }, 180)
  },

  openSheet(sheet) {
    haptic('tap')
    if (get().soundOn) playSfx('tap')
    set({ sheet })
  },

  toggleSound() {
    const next = !get().soundOn
    setSoundOn(next)
    set({ soundOn: next })
    haptic('select')
  },
}))
