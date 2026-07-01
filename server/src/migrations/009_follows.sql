-- Подписки на игры: игрок получает личное сообщение от бота, когда по игре
-- выходит новость или событие (команда /announce у админа).
CREATE TABLE IF NOT EXISTS follows (
  user_id    INTEGER NOT NULL,
  game_id    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, game_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_game ON follows(game_id);
