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
  youtube_channel_id: string | null;
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
  contributed_by: string | null;
  created_at: string;
}

// Extended source with creator verification status (computed, not stored)
export interface SourceWithAttribution extends Source {
  is_creator_source: boolean;
  contributor_name?: string | null;
}

export interface Creator {
  id: string;
  user_id: string;
  youtube_channel_id: string;
  youtube_channel_name: string | null;
  youtube_channel_avatar: string | null;
  verified_at: string;
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
  contributed_by: string;
}

// Para la UI del visor
export interface SourceWithActive extends Source {
  isActive: boolean;
}
