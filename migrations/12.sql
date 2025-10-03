
CREATE TABLE popups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  button_color TEXT DEFAULT '#dc2626',
  popup_width INTEGER DEFAULT 500,
  popup_height INTEGER DEFAULT 400,
  image_width INTEGER DEFAULT 200,
  image_height INTEGER DEFAULT 150,
  button_position TEXT DEFAULT 'center',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  border_radius INTEGER DEFAULT 12,
  show_on_pages TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT 1,
  show_once_per_session BOOLEAN DEFAULT 0,
  delay_seconds INTEGER DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
