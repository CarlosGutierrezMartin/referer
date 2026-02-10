import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PublicViewer } from './PublicViewer';
import type { Video, Source, Creator } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ videoId: string }>;
}

async function getVideo(videoId: string): Promise<Video | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

    if (error) {
        console.error('Error fetching video:', error);
        return null;
    }

    return data;
}

async function getSources(videoId: string): Promise<Source[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp_seconds', { ascending: true });

    if (error) {
        console.error('Error fetching sources:', error);
        return [];
    }

    return data || [];
}

async function getCreatorForUser(userId: string): Promise<Creator | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', userId)
        .single();

    return data || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { videoId } = await params;
    const video = await getVideo(videoId);

    if (!video) {
        return {
            title: 'Video no encontrado - Referer',
        };
    }

    return {
        title: `${video.title} - Fuentes Verificadas | Referer`,
        description: `Verifica las fuentes y referencias bibliográficas de "${video.title}" con timestamps sincronizados.`,
        openGraph: {
            title: `${video.title} - Fuentes Verificadas`,
            description: `Verifica las fuentes y referencias bibliográficas de este video.`,
            images: [video.thumbnail_url || ''],
            type: 'video.other',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${video.title} - Fuentes Verificadas`,
            description: `Verifica las fuentes y referencias bibliográficas de este video.`,
            images: [video.thumbnail_url || ''],
        },
    };
}

export default async function PublicViewerPage({ params }: PageProps) {
    const { videoId } = await params;

    const video = await getVideo(videoId);

    if (!video) {
        notFound();
    }

    const sources = await getSources(videoId);
    const creator = await getCreatorForUser(video.user_id);

    return <PublicViewer video={video} sources={sources} creator={creator} />;
}
