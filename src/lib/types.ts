// Referer - Core TypeScript Types
// Definiciones centrales para toda la aplicación

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  video_id: string;
  timestamp_seconds: number;
  claim: string;
  source_text: string | null;
  source_url: string;
  created_at: string;
}

// Para formularios y creación
export interface CreateVideoInput {
  youtube_id: string;
  title: string;
  thumbnail_url?: string;
}

export interface CreateSourceInput {
  video_id: string;
  timestamp_seconds: number;
  claim: string;
  source_text?: string;
  source_url: string;
}

// Para la UI del visor
export interface SourceWithActive extends Source {
  isActive: boolean;
}
