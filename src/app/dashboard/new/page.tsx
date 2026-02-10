'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Link2, Check, Youtube, ShieldCheck, Users, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';
import type { Creator } from '@/lib/types';

const PENDING_VIDEO_KEY = 'referer_pending_video';

interface PendingVideo {
    url: string;
    title: string;
    videoId: string;
}

function NewVideoPageInner() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Multi-step state
    const [step, setStep] = useState<'url' | 'creator' | 'details'>('url');

    // Creator verification state
    const [creatorStatus, setCreatorStatus] = useState<'unknown' | 'checking' | 'verified' | 'not_verified' | 'verifying' | 'mismatch'>('unknown');
    const [creator, setCreator] = useState<Creator | null>(null);
    const [videoChannelId, setVideoChannelId] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Handle return from OAuth verification
    useEffect(() => {
        const isVerifying = searchParams.get('verify') === 'true';

        if (isVerifying) {
            // Restore saved video state from localStorage
            const saved = localStorage.getItem(PENDING_VIDEO_KEY);
            if (saved) {
                try {
                    const pending: PendingVideo = JSON.parse(saved);
                    setUrl(pending.url);
                    setTitle(pending.title);
                    setVideoId(pending.videoId);
                    setStep('creator');

                    // Fetch channel ID for the video
                    fetchVideoChannelId(pending.videoId);

                    // Automatically attempt channel linking with fresh token
                    linkChannel();
                } catch {
                    console.error('Error restoring pending video');
                }
            }
            // Clean URL params without full navigation
            window.history.replaceState({}, '', '/dashboard/new');
        }
    }, [searchParams]);

    const fetchVideoChannelId = async (ytId: string) => {
        try {
            const res = await fetch(`/api/youtube/video-info?v=${ytId}`);
            if (res.ok) {
                const info = await res.json();
                setVideoChannelId(info.channel_id || null);
                return info.channel_id || null;
            }
        } catch {
            console.warn('Could not fetch video channel ID');
        }
        return null;
    };

    const checkCreatorStatus = async () => {
        setCreatorStatus('checking');
        try {
            const res = await fetch('/api/youtube/channel');
            const data = await res.json();
            if (data.is_creator && data.creator) {
                setCreator(data.creator);
                setCreatorStatus('verified');
                return data.creator;
            } else {
                setCreatorStatus('not_verified');
                return null;
            }
        } catch {
            setCreatorStatus('not_verified');
            return null;
        }
    };

    const linkChannel = async () => {
        setCreatorStatus('verifying');
        setVerificationError(null);
        try {
            const res = await fetch('/api/youtube/channel', { method: 'POST' });
            const data = await res.json();

            if (res.ok && data.creator) {
                setCreator(data.creator);
                setCreatorStatus('verified');
                localStorage.removeItem(PENDING_VIDEO_KEY);
                return data.creator;
            } else {
                setVerificationError(data.error || 'Error al verificar el canal');
                setCreatorStatus('not_verified');
                return null;
            }
        } catch {
            setVerificationError('Error de conexión');
            setCreatorStatus('not_verified');
            return null;
        }
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        setError(null);

        const id = extractYouTubeId(value);
        if (id) {
            setVideoId(id);
            if (!title) setTitle('Video de YouTube');
        } else {
            setVideoId(null);
        }
    };

    const handleContinueToCreator = async () => {
        if (!videoId) {
            setError('Por favor, introduce una URL de YouTube válida');
            return;
        }
        setStep('creator');

        // Fetch video channel info in parallel with creator status
        const channelPromise = fetchVideoChannelId(videoId);
        const creatorPromise = checkCreatorStatus();

        const [channelId, creatorData] = await Promise.all([channelPromise, creatorPromise]);

        // If already verified, auto-check match
        if (creatorData && channelId) {
            if (creatorData.youtube_channel_id === channelId) {
                setCreatorStatus('verified');
            } else {
                setCreatorStatus('mismatch');
            }
        }
    };

    const handleVerifyAsCreator = async () => {
        // Save form state to localStorage before redirecting
        if (videoId) {
            localStorage.setItem(PENDING_VIDEO_KEY, JSON.stringify({
                url,
                title,
                videoId,
            }));
        }

        // Redirect to Google OAuth with YouTube scope
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/new?verify=true`,
                scopes: 'https://www.googleapis.com/auth/youtube.readonly',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            setVerificationError(error.message);
        }
    };

    const handleSkipCreator = () => {
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoId) {
            setError('Por favor, introduce una URL de YouTube válida');
            return;
        }
        if (!title.trim()) {
            setError('Por favor, añade un título para el video');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch channel ID if we don't already have it
            let channelId = videoChannelId;
            if (!channelId) {
                channelId = await fetchVideoChannelId(videoId);
            }

            const { data, error: insertError } = await supabase
                .from('videos')
                .insert({
                    user_id: user.id,
                    youtube_id: videoId,
                    youtube_channel_id: channelId,
                    title: title.trim(),
                    thumbnail_url: getYouTubeThumbnail(videoId),
                })
                .select()
                .single();

            if (insertError) throw insertError;

            localStorage.removeItem(PENDING_VIDEO_KEY);
            router.push(`/dashboard/${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear el video');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine if creator channel matches video channel
    const channelMatches = creator && videoChannelId && creator.youtube_channel_id === videoChannelId;

    return (
        <div className="min-h-screen bg-[#09090B] py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Back button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-[#71717A] hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al dashboard
                </Link>

                {/* Step indicators */}
                <div className="flex items-center gap-2 mb-6">
                    {['URL', 'Creador', 'Detalles'].map((label, i) => {
                        const stepIndex = i;
                        const currentIndex = step === 'url' ? 0 : step === 'creator' ? 1 : 2;
                        const isActive = stepIndex === currentIndex;
                        const isDone = stepIndex < currentIndex;

                        return (
                            <div key={label} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight className="w-3 h-3 text-[#3F3F46]" />}
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${isActive ? 'bg-[#818CF8]/20 text-[#818CF8]' :
                                    isDone ? 'bg-[#4ADE80]/20 text-[#4ADE80]' :
                                        'bg-[#1A1A1E] text-[#52525B]'
                                    }`}>
                                    {isDone ? '✓' : ''} {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* === STEP 1: URL Input === */}
                {step === 'url' && (
                    <Card variant="elevated" padding="lg" className="bg-[#131316] border-[#27272A]">
                        <CardHeader>
                            <CardTitle className="text-white">Importar Video de YouTube</CardTitle>
                            <CardDescription className="text-[#71717A]">
                                Pega la URL de tu video para empezar a añadir fuentes verificables
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="mt-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                                    URL del Video
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#27272A] bg-[#0A0A0B] text-white placeholder-[#52525B] focus:ring-2 focus:ring-[#818CF8] focus:border-[#818CF8] transition-colors"
                                    />
                                    {videoId && (
                                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4ADE80]" />
                                    )}
                                </div>
                            </div>

                            {/* Video Preview */}
                            {videoId && (
                                <div className="rounded-lg overflow-hidden border border-[#27272A]">
                                    <div className="aspect-video relative bg-[#0A0A0B]">
                                        <img
                                            src={getYouTubeThumbnail(videoId)}
                                            alt="Vista previa"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                                <Youtube className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg">{error}</p>
                            )}

                            <Button
                                onClick={handleContinueToCreator}
                                disabled={!videoId}
                                className="w-full"
                            >
                                Continuar
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* === STEP 2: Creator Verification === */}
                {step === 'creator' && (
                    <Card variant="elevated" padding="lg" className="bg-[#131316] border-[#27272A]">
                        <CardHeader>
                            <CardTitle className="text-white">¿Eres el creador de este video?</CardTitle>
                            <CardDescription className="text-[#71717A]">
                                Si eres el creador, verifica tu canal de YouTube para aparecer con la insignia de creador
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="mt-6 space-y-4">
                            {/* Video mini preview */}
                            {videoId && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#27272A]">
                                    <img
                                        src={getYouTubeThumbnail(videoId)}
                                        alt=""
                                        className="w-20 h-12 object-cover rounded"
                                    />
                                    <span className="text-sm text-[#A1A1AA] truncate">{url}</span>
                                </div>
                            )}

                            {/* Loading state */}
                            {(creatorStatus === 'checking' || creatorStatus === 'verifying') && (
                                <div className="flex items-center justify-center gap-3 py-8">
                                    <Loader2 className="w-5 h-5 text-[#818CF8] animate-spin" />
                                    <span className="text-[#A1A1AA]">
                                        {creatorStatus === 'checking' ? 'Comprobando estado...' : 'Verificando canal...'}
                                    </span>
                                </div>
                            )}

                            {/* Already verified + channel matches */}
                            {creatorStatus === 'verified' && channelMatches && (
                                <div className="p-4 rounded-xl bg-[#4ADE80]/[0.08] border border-[#4ADE80]/20">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-6 h-6 text-[#4ADE80]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#4ADE80]">¡Canal verificado!</p>
                                            <p className="text-xs text-[#A1A1AA] mt-0.5">
                                                Tu canal <strong className="text-white">{creator?.youtube_channel_name}</strong> coincide con el creador de este video.
                                                Tus fuentes aparecerán con la insignia de creador.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Verified but channel doesn't match */}
                            {creatorStatus === 'mismatch' && (
                                <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-400">Canal no coincide</p>
                                            <p className="text-xs text-[#A1A1AA] mt-0.5">
                                                Tu canal verificado (<strong className="text-white">{creator?.youtube_channel_name}</strong>) no es el creador de este video.
                                                Tus fuentes aparecerán como contribuciones de la comunidad.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Verified but no video channel ID to compare */}
                            {creatorStatus === 'verified' && !videoChannelId && (
                                <div className="p-4 rounded-xl bg-[#818CF8]/[0.08] border border-[#818CF8]/20">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#818CF8]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#818CF8]">Canal verificado</p>
                                            <p className="text-xs text-[#A1A1AA] mt-0.5">
                                                Tu canal <strong className="text-white">{creator?.youtube_channel_name}</strong> está verificado.
                                                No pudimos confirmar automáticamente si eres el creador de este video.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {verificationError && (
                                <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Error de verificación</p>
                                            <p className="text-xs text-[#A1A1AA] mt-0.5">{verificationError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons - show when not loading */}
                            {creatorStatus !== 'checking' && creatorStatus !== 'verifying' && (
                                <div className="space-y-3 pt-2">
                                    {/* Show verify button only if not already verified */}
                                    {creatorStatus !== 'verified' && creatorStatus !== 'mismatch' && (
                                        <button
                                            onClick={handleVerifyAsCreator}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0B] hover:border-[#4ADE80]/40 hover:bg-[#4ADE80]/[0.04] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center">
                                                <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-white">Sí, soy el creador</p>
                                                <p className="text-xs text-[#71717A]">Verificar con tu cuenta de Google</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[#3F3F46] group-hover:text-[#4ADE80] transition-colors" />
                                        </button>
                                    )}

                                    <button
                                        onClick={handleSkipCreator}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0B] hover:border-[#818CF8]/40 hover:bg-[#818CF8]/[0.04] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#818CF8]/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-[#818CF8]" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium text-white">
                                                {creatorStatus === 'verified' || creatorStatus === 'mismatch' ? 'Continuar' : 'No, solo quiero añadir fuentes'}
                                            </p>
                                            <p className="text-xs text-[#71717A]">
                                                {creatorStatus === 'verified' || creatorStatus === 'mismatch'
                                                    ? 'Ir al siguiente paso'
                                                    : 'Las fuentes se marcarán como contribución comunitaria'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#3F3F46] group-hover:text-[#818CF8] transition-colors" />
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* === STEP 3: Details & Submit === */}
                {step === 'details' && (
                    <Card variant="elevated" padding="lg" className="bg-[#131316] border-[#27272A]">
                        <CardHeader>
                            <CardTitle className="text-white">Detalles del Video</CardTitle>
                            <CardDescription className="text-[#71717A]">
                                Añade un título y guarda el video para empezar a añadir fuentes
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="mt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Video mini preview */}
                                {videoId && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#27272A]">
                                        <img
                                            src={getYouTubeThumbnail(videoId)}
                                            alt=""
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-[#A1A1AA] truncate block">{url}</span>
                                            {channelMatches && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#4ADE80]">
                                                    <ShieldCheck className="w-3 h-3" /> Verificado como creador
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Input
                                    label="Título del Video"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="El título que aparecerá en Referer"
                                    helperText="Puedes usar el título original o personalizarlo"
                                />

                                {error && (
                                    <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg">{error}</p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setStep('creator')}
                                        className="flex-1"
                                    >
                                        Atrás
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        isLoading={isLoading}
                                        disabled={!videoId || !title.trim()}
                                    >
                                        Importar Video
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function NewVideoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#818CF8] animate-spin" />
            </div>
        }>
            <NewVideoPageInner />
        </Suspense>
    );
}
