-- ======================================
-- SourceLayer MVP - Database Schema
-- ======================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/_/sql

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  timestamp_seconds INTEGER NOT NULL,
  claim TEXT NOT NULL,
  source_text TEXT,
  source_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================
-- Indexes for performance
-- ======================================
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_video_id ON sources(video_id);
CREATE INDEX IF NOT EXISTS idx_sources_timestamp ON sources(video_id, timestamp_seconds);

-- ======================================
-- Row Level Security (RLS)
-- ======================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Videos: users can CRUD own videos, anyone can read
CREATE POLICY "Anyone can view videos" 
  ON videos FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own videos" 
  ON videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" 
  ON videos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" 
  ON videos FOR DELETE 
  USING (auth.uid() = user_id);

-- Sources: users can CRUD own sources, anyone can read
CREATE POLICY "Anyone can view sources" 
  ON sources FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert sources for own videos" 
  ON sources FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sources for own videos" 
  ON sources FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sources for own videos" 
  ON sources FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- ======================================
-- Trigger: Auto-create profile on signup
-- ======================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
