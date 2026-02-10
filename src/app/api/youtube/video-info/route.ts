import { NextRequest, NextResponse } from 'next/server';

// Fetches the YouTube channel ID for a given video ID
// Uses the YouTube oEmbed + noembed fallback to get author info
// Then resolves the channel ID from the channel page
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('v');

    if (!videoId) {
        return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    try {
        // Method 1: Try YouTube's oEmbed to get the author URL
        const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (!oembedRes.ok) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const oembed = await oembedRes.json();
        const authorUrl: string = oembed.author_url || '';

        // Try to extract channel ID from author_url
        // Format: https://www.youtube.com/channel/UCxxxx
        const channelMatch = authorUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
        if (channelMatch) {
            return NextResponse.json({
                channel_id: channelMatch[1],
                channel_name: oembed.author_name,
                author_url: authorUrl,
            });
        }

        // Format: https://www.youtube.com/@username
        // We need to resolve this to a channel ID by fetching the page
        const handleMatch = authorUrl.match(/\/@([a-zA-Z0-9_.-]+)/);
        if (handleMatch) {
            try {
                const pageRes = await fetch(authorUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                });
                const html = await pageRes.text();

                // Look for "externalId":"UCxxxx" or "channelId":"UCxxxx" in the page
                const idMatch = html.match(/"(?:externalId|channelId)"\s*:\s*"(UC[a-zA-Z0-9_-]+)"/);
                if (idMatch) {
                    return NextResponse.json({
                        channel_id: idMatch[1],
                        channel_name: oembed.author_name,
                        author_url: authorUrl,
                    });
                }
            } catch {
                // Fallback: return without channel_id
            }
        }

        // If we couldn't get the channel ID, return what we have
        return NextResponse.json({
            channel_id: null,
            channel_name: oembed.author_name,
            author_url: authorUrl,
        });
    } catch (error) {
        console.error('Error fetching video info:', error);
        return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
    }
}
