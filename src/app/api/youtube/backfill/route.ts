import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Backfill youtube_channel_id for all videos that don't have it yet
export async function POST() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all videos without youtube_channel_id for the current user
    const { data: videos, error } = await supabase
        .from('videos')
        .select('id, youtube_id')
        .is('youtube_channel_id', null)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!videos || videos.length === 0) {
        return NextResponse.json({ message: 'No videos to update', updated: 0 });
    }

    const results: { id: string; youtube_id: string; channel_id: string | null; status: string }[] = [];

    for (const video of videos) {
        try {
            // Use YouTube oEmbed to get author info
            const oembedRes = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_id}&format=json`
            );

            if (!oembedRes.ok) {
                results.push({ ...video, channel_id: null, status: 'oembed_failed' });
                continue;
            }

            const oembed = await oembedRes.json();
            const authorUrl: string = oembed.author_url || '';

            // Try to extract channel ID from author_url
            let channelId: string | null = null;

            // Format: https://www.youtube.com/channel/UCxxxx
            const channelMatch = authorUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
            if (channelMatch) {
                channelId = channelMatch[1];
            }

            // Format: https://www.youtube.com/@username - need to resolve
            if (!channelId) {
                const handleMatch = authorUrl.match(/\/@([a-zA-Z0-9_.-]+)/);
                if (handleMatch) {
                    try {
                        const pageRes = await fetch(authorUrl, {
                            headers: { 'User-Agent': 'Mozilla/5.0' },
                        });
                        const html = await pageRes.text();
                        const idMatch = html.match(/"(?:externalId|channelId)"\s*:\s*"(UC[a-zA-Z0-9_-]+)"/);
                        if (idMatch) {
                            channelId = idMatch[1];
                        }
                    } catch {
                        // Fallback failed
                    }
                }
            }

            if (channelId) {
                await supabase
                    .from('videos')
                    .update({ youtube_channel_id: channelId })
                    .eq('id', video.id);

                results.push({ ...video, channel_id: channelId, status: 'updated' });
            } else {
                results.push({ ...video, channel_id: null, status: 'no_channel_id_found' });
            }
        } catch (err) {
            results.push({ ...video, channel_id: null, status: 'error' });
        }
    }

    return NextResponse.json({
        message: `Processed ${results.length} videos`,
        updated: results.filter(r => r.status === 'updated').length,
        results,
    });
}
