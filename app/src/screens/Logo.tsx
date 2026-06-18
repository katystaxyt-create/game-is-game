// Эмблема Game is Game: глянцевый бейдж-лаунчер с четырьмя плитками игр.
// 2x2 сетка в цветах игр (карты, слова, ночь, питомец) читается как «папка с играми».
export function Logo({ size = 132 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className="brand-logo" aria-label="Game is Game">
      <defs>
        <linearGradient id="ggBadge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f3e7cf" />
        </linearGradient>
        <linearGradient id="ggRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3837a" /><stop offset="1" stopColor="#c0392f" />
        </linearGradient>
        <linearGradient id="ggGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#82d186" /><stop offset="1" stopColor="#3c8c45" />
        </linearGradient>
        <linearGradient id="ggIndigo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b8ff0" /><stop offset="1" stopColor="#4b3bc0" />
        </linearGradient>
        <linearGradient id="ggAmber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd07a" /><stop offset="1" stopColor="#d98b1f" />
        </linearGradient>
        <linearGradient id="ggGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* бейдж-подложка */}
      <rect x="16" y="14" width="128" height="128" rx="32" fill="#e7d5b2" />
      <rect x="16" y="13" width="128" height="128" rx="32" fill="url(#ggBadge)" />
      <rect x="16" y="13" width="128" height="60" rx="30" fill="url(#ggGloss)" />

      {/* четыре плитки игр */}
      <Tile x={34} y={31} fill="url(#ggRed)" glyph="card" />
      <Tile x={86} y={31} fill="url(#ggGreen)" glyph="bubble" />
      <Tile x={34} y={83} fill="url(#ggIndigo)" glyph="moon" />
      <Tile x={86} y={83} fill="url(#ggAmber)" glyph="heart" />
    </svg>
  )
}

function Tile({ x, y, fill, glyph }: { x: number; y: number; fill: string; glyph: 'card' | 'bubble' | 'moon' | 'heart' }) {
  const s = 40
  const cx = x + s / 2
  const cy = y + s / 2
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx="13" fill={fill} />
      <rect x={x} y={y} width={s} height={s * 0.5} rx="13" fill="url(#ggGloss)" />
      {glyph === 'card' && (
        <g transform={`translate(${cx} ${cy}) rotate(-12)`}>
          <rect x="-9" y="-12" width="18" height="24" rx="4" fill="#fff" />
          <rect x="-6" y="-9" width="12" height="6" rx="2" fill="#e1554b" opacity="0.85" />
        </g>
      )}
      {glyph === 'bubble' && (
        <g transform={`translate(${cx} ${cy})`}>
          <rect x="-12" y="-9" width="24" height="16" rx="7" fill="#fff" />
          <path d="M -3 6 L 2 6 L -5 12 Z" fill="#fff" />
          <circle cx="-5" cy="-1" r="1.7" fill="#3c8c45" />
          <circle cx="0" cy="-1" r="1.7" fill="#3c8c45" />
          <circle cx="5" cy="-1" r="1.7" fill="#3c8c45" />
        </g>
      )}
      {glyph === 'moon' && (
        <g transform={`translate(${cx + 2} ${cy})`}>
          <circle cx="0" cy="0" r="11" fill="#fff" />
          <circle cx="5" cy="-2" r="9.5" fill="#5847c7" />
          <circle cx="9" cy="-7" r="1.6" fill="#fff" />
          <circle cx="11" cy="-1" r="1.1" fill="#fff" />
        </g>
      )}
      {glyph === 'heart' && (
        <path
          transform={`translate(${cx} ${cy - 1})`}
          d="M0 9 C -9 2 -11 -5 -5.5 -8 C -2.5 -9.6 0 -7 0 -5 C 0 -7 2.5 -9.6 5.5 -8 C 11 -5 9 2 0 9 Z"
          fill="#fff"
        />
      )}
    </g>
  )
}
