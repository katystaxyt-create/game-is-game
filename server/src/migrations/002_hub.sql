-- Хаб Game is Game: профиль игрока обрастает аватаром и кодом друга,
-- появляется граф дружбы для социальных вкладок.

ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN friend_code TEXT;

-- Код друга уникален среди заданных (NULL-ы не конфликтуют в SQLite).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_friend_code ON users(friend_code);

-- Взаимная дружба хранится двумя строками (A→B и B→A): простые быстрые выборки.
CREATE TABLE IF NOT EXISTS friendships (
  user_id    INTEGER NOT NULL,
  friend_id  INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, friend_id)
);
CREATE INDEX IF NOT EXISTS idx_friend_user ON friendships(user_id);
