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
    created_at: string
}

interface Video {
    id: string
    title: string
    youtube_id: string
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

        // Find video by youtube_id
        const { data: video, error: videoError } = await supabase
            .from('videos')
            .select('id, title, youtube_id')
            .eq('youtube_id', youtube_id)
            .single()

        if (videoError || !video) {
            // No video found - this is not an error, just means no sources registered
            return new Response(
                JSON.stringify({
                    video: null,
                    sources: [],
                    message: 'No registered sources for this video'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get sources for this video, ordered by timestamp
        const { data: sources, error: sourcesError } = await supabase
            .from('sources')
            .select('id, video_id, timestamp_seconds, claim, source_text, source_url, created_at')
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

        // Return video and sources
        return new Response(
            JSON.stringify({
                video: video as Video,
                sources: (sources || []) as VideoSource[],
                count: sources?.length || 0
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
