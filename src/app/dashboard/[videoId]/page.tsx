import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { VideoEditor } from './VideoEditor';
import type { Video, Source } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ videoId: string }>;
}

async function getVideo(videoId: string, userId: string): Promise<Video | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', userId)
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

export default async function VideoEditorPage({ params }: PageProps) {
    const { videoId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const video = await getVideo(videoId, user.id);

    if (!video) {
        notFound();
    }

    const sources = await getSources(videoId);

    return <VideoEditor video={video} initialSources={sources} />;
}
