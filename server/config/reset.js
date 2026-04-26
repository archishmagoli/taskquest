const pool = require('./database')

const createTables = `
  DROP TABLE IF EXISTS user_avatars CASCADE;
  DROP TABLE IF EXISTS tasks CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
  DROP TABLE IF EXISTS avatars CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    github_id TEXT UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1'
  );

  CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    point_value INTEGER NOT NULL DEFAULT 10,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE avatars (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    point_cost INTEGER NOT NULL DEFAULT 50,
    description TEXT
  );

  CREATE TABLE user_avatars (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, avatar_id)
  );
`

const seedData = `
  INSERT INTO users (username, points) VALUES ('player1', 0);

  INSERT INTO categories (user_id, name, color) VALUES
    (1, 'School', '#6366f1'),
    (1, 'Work', '#f59e0b'),
    (1, 'Personal', '#10b981'),
    (1, 'Health', '#ef4444');

  INSERT INTO tasks (user_id, category_id, title, description, due_date, point_value) VALUES
    (1, 1, 'Complete WEB103 milestone', 'Finish the final project milestone', NOW() + INTERVAL '3 days', 20),
    (1, 3, 'Go for a walk', 'Take a 30 minute walk outside', NOW() + INTERVAL '1 day', 10);

  INSERT INTO avatars (name, image_url, point_cost, description) VALUES
    ('Whiskers', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Whiskers', 0, 'Your default companion — always ready to help!'),
    ('Buddy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buddy', 50, 'A loyal friend earned through hard work.'),
    ('Hoppy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hoppy', 100, 'Quick and energetic — just like you!'),
    ('Foxy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Foxy', 150, 'Clever and cunning. A rare unlock.'),
    ('Cosmo', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cosmo', 250, 'Out of this world. For the truly dedicated.');

  INSERT INTO user_avatars (user_id, avatar_id, is_equipped) VALUES (1, 1, TRUE);
`

const seed = async () => {
  try {
    await pool.query(createTables)
    await pool.query(seedData)
    console.log('Database reset and seeded successfully')
  } catch (err) {
    console.error('Error resetting database:', err)
  } finally {
    pool.end()
  }
}

seed()
