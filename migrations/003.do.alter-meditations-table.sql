ALTER TABLE meditations
  ADD COLUMN
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;