// Крошечные синтезированные звуки через WebAudio: без файлов, работает офлайн.
// Создаётся лениво при первом воспроизведении (webview Telegram требует жест пользователя).
let ctx: AudioContext | null = null
let muted = localStorage.getItem('ggMuted') === '1'

export function isSoundOn(): boolean { return !muted }
export function setSoundOn(on: boolean): void {
  muted = !on
  localStorage.setItem('ggMuted', muted ? '1' : '0')
}

function audioCtx(): AudioContext | null {
  if (muted) return null
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = ctx ?? new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

function blip(c: AudioContext, freq: number, at: number, dur: number, type: OscillatorType = 'sine', peak = 0.12): void {
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, at)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g); g.connect(c.destination)
  o.start(at); o.stop(at + dur + 0.02)
}

export type Sfx = 'tap' | 'open'

export function playSfx(name: Sfx): void {
  const c = audioCtx()
  if (!c) return
  const t = c.currentTime
  if (name === 'tap') {
    blip(c, 520, t, 0.08, 'triangle', 0.08)
  } else {
    // тёплый восходящий аккорд при запуске игры
    blip(c, 523, t, 0.12, 'sine', 0.10)
    blip(c, 659, t + 0.06, 0.14, 'sine', 0.10)
    blip(c, 784, t + 0.12, 0.18, 'sine', 0.11)
  }
}
