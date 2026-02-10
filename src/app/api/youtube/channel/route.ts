import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/youtube/channel — Link authenticated user's Google account to their YouTube channel
export async function POST() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Get the provider token (Google OAuth access token)
        const { data: { session } } = await supabase.auth.getSession();
        const providerToken = session?.provider_token;

        if (!providerToken) {
            return NextResponse.json(
                { error: 'No se encontró el token de Google. Por favor, inicia sesión de nuevo con Google.' },
                { status: 400 }
            );
        }

        // Call YouTube Data API to get the user's channel
        const ytResponse = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            {
                headers: {
                    Authorization: `Bearer ${providerToken}`,
                },
            }
        );

        if (!ytResponse.ok) {
            const errorData = await ytResponse.json().catch(() => ({}));
            console.error('YouTube API error:', errorData);
            return NextResponse.json(
                { error: 'Error al acceder a la YouTube API. Verifica que tu cuenta de Google tiene un canal de YouTube.' },
                { status: 400 }
            );
        }

        const ytData = await ytResponse.json();

        if (!ytData.items || ytData.items.length === 0) {
            return NextResponse.json(
                { error: 'No se encontró un canal de YouTube vinculado a esta cuenta de Google.' },
                { status: 404 }
            );
        }

        const channel = ytData.items[0];
        const channelId = channel.id;
        const channelName = channel.snippet?.title || null;
        const channelAvatar = channel.snippet?.thumbnails?.default?.url || null;

        // Upsert into creators table
        const { data: creator, error: upsertError } = await supabase
            .from('creators')
            .upsert(
                {
                    user_id: user.id,
                    youtube_channel_id: channelId,
                    youtube_channel_name: channelName,
                    youtube_channel_avatar: channelAvatar,
                    verified_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            )
            .select()
            .single();

        if (upsertError) {
            console.error('Creator upsert error:', upsertError);

            // Check if channel is already claimed by another user
            if (upsertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Este canal de YouTube ya está vinculado a otra cuenta.' },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: 'Error al guardar la verificación del canal.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            creator,
            message: `¡Canal "${channelName}" verificado correctamente!`,
        });

    } catch (error) {
        console.error('Channel verification error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// GET /api/youtube/channel — Check current user's creator status
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        const { data: creator } = await supabase
            .from('creators')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            is_creator: !!creator,
            creator: creator || null,
        });

    } catch (error) {
        console.error('Creator status error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
