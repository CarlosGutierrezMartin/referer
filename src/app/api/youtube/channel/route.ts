import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
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

        // Get the provider token from multiple sources (in priority order)
        const cookieStore = await cookies();
        let providerToken = cookieStore.get('provider_token')?.value;

        // Fallback: try the session (works right after login in some cases)
        if (!providerToken) {
            const { data: { session } } = await supabase.auth.getSession();
            providerToken = session?.provider_token || undefined;
        }

        if (!providerToken) {
            return NextResponse.json(
                {
                    error: 'No se encontró el token de Google. ' +
                        'Es necesario volver a iniciar sesión con Google para obtener acceso a YouTube.',
                    code: 'MISSING_PROVIDER_TOKEN',
                },
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
            console.error('YouTube API error:', ytResponse.status, errorData);

            // Provide specific error messages
            if (ytResponse.status === 401 || ytResponse.status === 403) {
                // Check if it's an API not enabled error
                const reason = errorData?.error?.errors?.[0]?.reason || '';
                const googleMessage = errorData?.error?.message || '';

                let userMessage = 'Error de autenticación con YouTube. ';

                if (reason === 'accessNotConfigured' || googleMessage.includes('not enabled')) {
                    userMessage += 'La YouTube Data API v3 no está habilitada en tu proyecto de Google Cloud. ' +
                        'Ve a Google Cloud Console → APIs & Services → Library → busca "YouTube Data API v3" → Habilitar.';
                } else if (reason === 'forbidden' || reason === 'insufficientPermissions') {
                    userMessage += 'No se concedieron los permisos de YouTube necesarios. ' +
                        'Haz clic de nuevo en "Verificar con Google" y acepta TODOS los permisos.';
                } else {
                    userMessage += `Detalle: ${googleMessage || `HTTP ${ytResponse.status} - ${reason || 'unknown'}`}`;
                }

                // Clear the invalid cookie
                const response = NextResponse.json(
                    {
                        error: userMessage,
                        code: 'YOUTUBE_API_ERROR',
                        debug: { status: ytResponse.status, reason, googleMessage },
                    },
                    { status: 401 }
                );
                response.cookies.delete('provider_token');
                return response;
            }

            return NextResponse.json(
                { error: 'Error al acceder a la YouTube API.' },
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

        // Clean up the provider_token cookie (one-time use)
        const response = NextResponse.json({
            creator,
            message: `¡Canal "${channelName}" verificado correctamente!`,
        });
        response.cookies.delete('provider_token');
        return response;

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
