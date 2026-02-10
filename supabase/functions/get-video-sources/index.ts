// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.
// IDE TypeScript errors for Deno globals and URL imports are expected and harmless.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoSource {
    id: string
    video_id: string
    timestamp_seconds: number
    claim: string
    source_text: string | null
    source_url: string
    contributed_by: string | null
    is_creator_source: boolean
    created_at: string
}

interface Video {
    id: string
    title: string
    youtube_id: string
    user_id: string
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { youtube_id } = await req.json()

        if (!youtube_id || typeof youtube_id !== 'string') {
            return new Response(
                JSON.stringify({ error: 'youtube_id is required and must be a string' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validate youtube_id format (11 characters, alphanumeric + _ -)
        const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/
        if (!youtubeIdRegex.test(youtube_id)) {
            return new Response(
                JSON.stringify({ error: 'Invalid youtube_id format' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Create Supabase client with service role for server-side access
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Find video by youtube_id (include user_id and youtube_channel_id for attribution)
        const { data: video, error: videoError } = await supabase
            .from('videos')
            .select('id, title, youtube_id, user_id, youtube_channel_id')
            .eq('youtube_id', youtube_id)
            .single()

        if (videoError || !video) {
            return new Response(
                JSON.stringify({
                    video: null,
                    sources: [],
                    creator: null,
                    message: 'No registered sources for this video'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if video owner is a verified creator
        const { data: creator } = await supabase
            .from('creators')
            .select('youtube_channel_id, youtube_channel_name, youtube_channel_avatar')
            .eq('user_id', video.user_id)
            .single()

        // Get sources for this video, ordered by timestamp
        const { data: sources, error: sourcesError } = await supabase
            .from('sources')
            .select('id, video_id, timestamp_seconds, claim, source_text, source_url, contributed_by, created_at')
            .eq('video_id', video.id)
            .order('timestamp_seconds', { ascending: true })

        if (sourcesError) {
            console.error('Error fetching sources:', sourcesError)
            return new Response(
                JSON.stringify({ error: 'Error fetching sources' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Enrich sources with attribution info
        // Must match BOTH: contributor is the video owner AND the video's YouTube channel
        // matches the creator's verified channel
        const enrichedSources = (sources || []).map(s => {
            const isOwner = s.contributed_by === video.user_id;
            const channelMatches = creator && video.youtube_channel_id &&
                video.youtube_channel_id === creator.youtube_channel_id;

            return {
                ...s,
                is_creator_source: Boolean(isOwner && channelMatches),
            }
        })

        // Return video, sources, and creator info
        return new Response(
            JSON.stringify({
                video: {
                    id: video.id,
                    title: video.title,
                    youtube_id: video.youtube_id,
                },
                sources: enrichedSources,
                creator: creator || null,
                count: enrichedSources.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
