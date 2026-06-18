-- Game is Game: лёгкий профиль игрока для лаунчера.
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY,            -- telegram user id
  name        TEXT    NOT NULL DEFAULT 'Игрок',
  username    TEXT,
  opens       INTEGER NOT NULL DEFAULT 0,     -- сколько игр открыто из лаунчера
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  last_seen   TEXT
);

-- Журнал открытий игр (для строки «Недавнее» и простой статистики).
CREATE TABLE IF NOT EXISTS opens (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id  INTEGER NOT NULL,
  game_id  TEXT    NOT NULL,
  ts       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_opens_user ON opens(user_id, id DESC);
