'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SourceForm } from '@/components/dashboard/SourceForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Video, ShieldAlert, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Video as VideoType, Source } from '@/lib/types';

interface PageProps {
    params: Promise<{ videoId: string }>;
}

export default function ContributePage({ params }: PageProps) {
    const [video, setVideo] = useState<VideoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Unwrap params
    const [videoId, setVideoId] = useState<string | null>(null);

    useEffect(() => {
        params.then(unwrapped => setVideoId(unwrapped.videoId));
    }, [params]);

    useEffect(() => {
        if (!videoId) return;
        fetchVideo();
    }, [videoId]);

    async function fetchVideo() {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('id', videoId)
                .single();

            if (error) throw error;
            setVideo(data);
        } catch (err) {
            console.error('Error fetching video:', err);
            // Redirect if not found or error
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    }

    const handleSourceAdded = (source: Source) => {
        setSuccessMessage('¡Fuente añadida correctamente! Puedes añadir otra o volver al video.');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#818CF8]"></div>
            </div>
        );
    }

    if (!video) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <header className="bg-[#0A0A0B] border-b border-[#27272A] sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5">
                            <Image src="/logo.png" alt="Referer" width={28} height={28} className="invert brightness-200" />
                            <span className="text-lg font-semibold text-[#F4F4F5] tracking-tight">Referer</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <Link
                    href={`/v/${video.id}`}
                    className="inline-flex items-center gap-2 text-[#71717A] hover:text-white mb-8 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al video
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight mb-2">
                        Contribuir Fuente
                    </h1>
                    <p className="text-[#A1A1AA] text-sm">
                        Estás añadiendo una fuente al video: <strong className="text-[#F4F4F5]">{video.title}</strong>
                    </p>
                </div>

                <div className="grid gap-6">
                    <Card padding="none" className="overflow-hidden bg-[#141416] border-[#27272A]">
                        <div className="p-4 bg-[#1A1A1E] border-b border-[#27272A] flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-[#818CF8] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-[#F4F4F5] mb-1">Guías de Contribución</h3>
                                <ul className="text-xs text-[#A1A1AA] space-y-1 list-disc list-inside">
                                    <li>Asegúrate de que el timestamp sea preciso.</li>
                                    <li>Enlaza a fuentes primarias siempre que sea posible (papers, datos oficiales).</li>
                                    <li>Evita opiniones personales; cíñete a los hechos verificables.</li>
                                    <li>Tu contribución será marcada con la insignia de <strong>Comunidad</strong>.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6">
                            {successMessage && (
                                <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[#4ADE80]/[0.08] border border-[#4ADE80]/20">
                                    <CheckCircle className="w-5 h-5 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-[#4ADE80]">¡Contribución guardada!</p>
                                        <p className="text-xs text-[#A1A1AA] mt-1">{successMessage}</p>
                                        <Link href={`/v/${video.id}`}>
                                            <Button variant="ghost" size="sm" className="mt-2 h-8 text-[#4ADE80] hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 -ml-2">
                                                Ver en el video <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {videoId && (
                                <SourceForm
                                    videoId={videoId}
                                    onSourceAdded={handleSourceAdded}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
