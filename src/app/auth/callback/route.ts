import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const response = NextResponse.redirect(`${origin}${next}`);

            // Save provider_token (Google access token) to a secure cookie
            // Supabase does NOT persist this — we must do it ourselves
            if (data.session?.provider_token) {
                response.cookies.set('provider_token', data.session.provider_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 3600, // 1 hour (Google tokens expire after ~1h)
                    path: '/',
                });
            }

            // Also save provider_refresh_token if available
            if (data.session?.provider_refresh_token) {
                response.cookies.set('provider_refresh_token', data.session.provider_refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/',
                });
            }

            return response;
        }
    }

    // Redirect to login on error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
