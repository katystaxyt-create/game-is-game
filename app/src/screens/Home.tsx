import type { CSSProperties } from 'react'
import { useStore } from '../store'
import { Logo } from './Logo'
import { APP_NAME, APP_TAG } from '../brand'
import type { GameCard } from '@shared/types'

export function Home() {
  const catalog = useStore(s => s.catalog)
  const profile = useStore(s => s.profile)
  const recent = useStore(s => s.recent)
  const soundOn = useStore(s => s.soundOn)
  const toggleSound = useStore(s => s.toggleSound)
  const openSheet = useStore(s => s.openSheet)
  const recentTop = recent[0] ?? null
  const firstName = profile?.name ? profile.name.split(' ')[0] : null

  return (
    <div className="launcher rise">
      <div className="topbar-mini">
        <button className="round-btn" onClick={toggleSound} aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}>
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button className="round-btn" onClick={() => openSheet('help')} aria-label="Помощь">?</button>
      </div>

      <div className="brand">
        <Logo />
        <div className="brand-name">{APP_NAME}</div>
        <div className="brand-tag">{APP_TAG}</div>
      </div>

      {firstName && <div className="greet">Привет, <b>{firstName}</b> 👋 Во что сыграем?</div>}

      <div className="section-label">Выбери игру</div>

      <div className="game-list">
        {catalog.map(g => (
          <GameTile key={g.id} game={g} recent={g.id === recentTop} />
        ))}
      </div>

      <div className="foot-row">
        <button className="foot-tile" onClick={() => openSheet('about')}>ℹ️ Об этом</button>
        <button className="foot-tile" onClick={() => openSheet('help')}>❓ Помощь</button>
      </div>

      <div className="foot-note">Сделано с любовью 💛</div>
    </div>
  )
}

function GameTile({ game, recent }: { game: GameCard; recent: boolean }) {
  const launch = useStore(s => s.launch)
  const launching = useStore(s => s.launching === game.id)
  const style = { '--a': game.accent, '--ad': game.accentDeep } as CSSProperties

  return (
    <button
      className={`game-tile${launching ? ' launching' : ''}`}
      style={style}
      onClick={() => launch(game)}
      aria-label={`Открыть: ${game.name}`}
    >
      <span className="gt-badge"><span className="gt-emoji">{game.emoji}</span></span>
      <span className="gt-text">
        <span className="gt-title">
          {game.name}
          {recent && <span className="recent-chip">Недавнее</span>}
        </span>
        <span className="gt-sub">{game.tagline}</span>
      </span>
      <span className="gt-chev">›</span>
    </button>
  )
}
