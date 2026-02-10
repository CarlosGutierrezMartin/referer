'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
    ArrowLeft, Youtube, ShieldCheck, CheckCircle, AlertCircle,
    Loader2, LogOut, User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Creator } from '@/lib/types';

export default function SettingsPage() {
    const [creator, setCreator] = useState<Creator | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkCreatorStatus();
        getUserEmail();
    }, []);

    async function getUserEmail() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUserEmail(user.email || '');
    }

    async function checkCreatorStatus() {
        setIsLoading(true);
        try {
            const response = await fetch('/api/youtube/channel');
            const data = await response.json();

            if (data.is_creator && data.creator) {
                setCreator(data.creator);
            }
        } catch {
            console.error('Error checking creator status');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleLinkChannel() {
        setIsLinking(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/youtube/channel', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al vincular el canal');
            }

            setCreator(data.creator);
            setSuccess(data.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLinking(false);
        }
    }

    async function handleUnlinkChannel() {
        if (!creator) return;

        setIsLinking(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('creators')
                .delete()
                .eq('user_id', creator.user_id);

            if (deleteError) throw deleteError;

            setCreator(null);
            setSuccess('Canal desvinculado correctamente.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al desvincular');
        } finally {
            setIsLinking(false);
        }
    }

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
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#71717A] hidden sm:block">{userEmail}</span>
                            <form action="/auth/signout" method="post">
                                <Button variant="ghost" size="sm" type="submit">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Salir</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-[#71717A] hover:text-white mb-8 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">Ajustes</h1>
                    <p className="text-[#71717A] text-sm mt-1">
                        Gestiona tu perfil y verificación de creador
                    </p>
                </div>

                {/* Creator Verification Card */}
                <Card variant="outlined" padding="none" className="overflow-hidden">
                    <div className="p-6 border-b border-[#27272A]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#818CF8]/20 to-[#6366F1]/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[#818CF8]" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-[#F4F4F5]">Verificación de Creador</h2>
                                <p className="text-xs text-[#71717A]">
                                    Vincula tu canal de YouTube para que tus fuentes muestren la insignia de verificación
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-[#818CF8] animate-spin" />
                            </div>
                        ) : creator ? (
                            /* Verified state */
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#4ADE80]/[0.06] border border-[#4ADE80]/20">
                                    <CheckCircle className="w-5 h-5 text-[#4ADE80] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#4ADE80]">Creador verificado</p>
                                        <p className="text-xs text-[#71717A] mt-0.5">
                                            Tus fuentes muestran la insignia ✓ en la vista pública
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141416] border border-[#27272A]">
                                    {creator.youtube_channel_avatar ? (
                                        <img
                                            src={creator.youtube_channel_avatar}
                                            alt={creator.youtube_channel_name || 'Canal'}
                                            className="w-12 h-12 rounded-full border-2 border-[#27272A]"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#1A1A1E] flex items-center justify-center">
                                            <User className="w-6 h-6 text-[#52525B]" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#F4F4F5] truncate">
                                            {creator.youtube_channel_name || 'Canal de YouTube'}
                                        </p>
                                        <p className="text-xs text-[#52525B] font-mono mt-0.5">
                                            ID: {creator.youtube_channel_id}
                                        </p>
                                    </div>
                                    <Youtube className="w-5 h-5 text-[#F87171] flex-shrink-0" />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUnlinkChannel}
                                    isLoading={isLinking}
                                    className="text-[#71717A] hover:text-[#F87171]"
                                >
                                    Desvincular canal
                                </Button>
                            </div>
                        ) : (
                            /* Unverified state */
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-[#818CF8]/[0.06] border border-[#818CF8]/15">
                                    <h3 className="text-sm font-medium text-[#A5B4FC] mb-2">¿Por qué verificarte?</h3>
                                    <ul className="space-y-2 text-xs text-[#A1A1AA]">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-3.5 h-3.5 text-[#818CF8] mt-0.5 flex-shrink-0" />
                                            Tus fuentes mostrarán la insignia de <strong className="text-[#F4F4F5]">Creador Verificado ✓</strong>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-3.5 h-3.5 text-[#818CF8] mt-0.5 flex-shrink-0" />
                                            Tu audiencia podrá distinguir tus fuentes de las contribuciones de la comunidad
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-3.5 h-3.5 text-[#818CF8] mt-0.5 flex-shrink-0" />
                                            Aumenta la credibilidad y confianza en tu contenido
                                        </li>
                                    </ul>
                                </div>

                                <div className="text-center">
                                    <Button
                                        onClick={handleLinkChannel}
                                        isLoading={isLinking}
                                        className="shadow-lg shadow-[#818CF8]/10"
                                    >
                                        <Youtube className="w-4 h-4" />
                                        Vincular mi canal de YouTube
                                    </Button>
                                    <p className="text-xs text-[#52525B] mt-3">
                                        Usamos tu cuenta de Google para verificar automáticamente tu canal.
                                        <br />No almacenamos tus credenciales de YouTube.
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#F87171]/[0.08] border border-[#F87171]/15">
                                <AlertCircle className="w-4 h-4 text-[#F87171] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#F87171]">{error}</p>
                            </div>
                        )}

                        {success && !creator && (
                            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#4ADE80]/[0.08] border border-[#4ADE80]/15">
                                <CheckCircle className="w-4 h-4 text-[#4ADE80] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#4ADE80]">{success}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}
