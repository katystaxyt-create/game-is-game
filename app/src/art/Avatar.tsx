import { avatarOf } from '@shared/avatars'

// Аватар игрока: эмодзи в кружке с цветным кольцом. ring=false для баннера,
// где кольцо задаётся самим баннером (белое).
export function Avatar({ id, size = 44, seed = 0, ring = true }: { id?: string | null; size?: number; seed?: number; ring?: boolean }) {
  const a = avatarOf(id, seed)
  return (
    <span
      className="av"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.52),
        ...(ring ? ({ ['--av-ring']: a.ring } as Record<string, string>) : {}),
      }}
    >
      <span>{a.emoji}</span>
    </span>
  )
}
