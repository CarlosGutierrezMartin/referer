-- ==============================================================================
-- MIGRACIÓN 2: Añadir youtube_channel_id a videos
-- Ejecuta este script en el Editor SQL de Supabase para corregir la verificación
-- ==============================================================================

-- 1. Añadir columna youtube_channel_id a la tabla 'videos'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'youtube_channel_id') THEN
        ALTER TABLE videos ADD COLUMN youtube_channel_id TEXT;
        CREATE INDEX idx_videos_youtube_channel_id ON videos(youtube_channel_id);
    END IF;
END $$;
