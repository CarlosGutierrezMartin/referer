-- ==============================================================================
-- MIGRACIÓN: Sistema de Verificación de Creadores
-- Ejecuta este script en el Editor SQL de Supabase para actualizar tu base de datos
-- ==============================================================================

-- 1. Añadir columna de atribución a la tabla 'sources' existente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'contributed_by') THEN
        ALTER TABLE sources ADD COLUMN contributed_by UUID REFERENCES profiles(id);
        CREATE INDEX idx_sources_contributed_by ON sources(contributed_by);
    END IF;
END $$;

-- 2. Crear tabla 'creators' para canales verificados
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  youtube_channel_id TEXT NOT NULL UNIQUE,
  youtube_channel_name TEXT,
  youtube_channel_avatar TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para creators
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_channel_id ON creators(youtube_channel_id);

-- 3. Habilitar RLS en creators
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- 4. Actualizar Políticas de Seguridad (RLS)

-- 4a. Políticas para 'creators'
-- Cualquiera puede ver (para mostrar badges)
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
CREATE POLICY "Anyone can view creators" 
  ON creators FOR SELECT 
  USING (true);

-- Solo el usuario puede gestionar su propio perfil de creador
DROP POLICY IF EXISTS "Users can insert own creator profile" ON creators;
CREATE POLICY "Users can insert own creator profile" 
  ON creators FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own creator profile" ON creators;
CREATE POLICY "Users can update own creator profile" 
  ON creators FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own creator profile" ON creators;
CREATE POLICY "Users can delete own creator profile" 
  ON creators FOR DELETE 
  USING (auth.uid() = user_id);

-- 4b. Actualizar Políticas para 'sources' (Permitir contribuciones de la comunidad)

-- Primero, eliminamos políticas antiguas restrictivas de INSERT/UPDATE/DELETE si existen
-- (Ajusta los nombres si tus políticas actuales se llaman diferente)
DROP POLICY IF EXISTS "Users can insert sources for own videos" ON sources;
DROP POLICY IF EXISTS "Users can update sources for own videos" ON sources;
DROP POLICY IF EXISTS "Users can delete sources for own videos" ON sources;

-- Nueva política de INSERT: Cualquier usuario autenticado puede añadir fuentes
CREATE POLICY "Authenticated users can insert sources" 
  ON sources FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND contributed_by = auth.uid()
  );

-- Nueva política de UPDATE: El contribuidor O el dueño del video pueden editar
CREATE POLICY "Source contributors can update own sources" 
  ON sources FOR UPDATE 
  USING (
    contributed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- Nueva política de DELETE: El contribuidor O el dueño del video pueden borrar
CREATE POLICY "Source contributors can delete own sources or video owner can delete" 
  ON sources FOR DELETE 
  USING (
    contributed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = auth.uid()
    )
  );
