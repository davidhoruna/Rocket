-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  industry TEXT NOT NULL,
  field TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  privacy TEXT NOT NULL,
  github TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read all users
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects are viewable by everyone
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Projects can be created by authenticated users
CREATE POLICY "Projects can be created by authenticated users" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects can be updated by their owners
CREATE POLICY "Projects can be updated by their owners" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects can be deleted by their owners
CREATE POLICY "Projects can be deleted by their owners" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- Comments can be created by authenticated users
CREATE POLICY "Comments can be created by authenticated users" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments can be updated by their owners
CREATE POLICY "Comments can be updated by their owners" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments can be deleted by their owners
CREATE POLICY "Comments can be deleted by their owners" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes are viewable by everyone
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- Likes can be created by authenticated users
CREATE POLICY "Likes can be created by authenticated users" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes can be deleted by their owners
CREATE POLICY "Likes can be deleted by their owners" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

