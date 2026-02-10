'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ExternalLink, Play, ChevronRight, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatTimestamp } from '@/lib/time-utils';
import type { Video, Source, Creator } from '@/lib/types';

interface PublicViewerProps {
    video: Video;
    sources: Source[];
    creator: Creator | null;
}

export function PublicViewer({ video, sources, creator }: PublicViewerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<HTMLIFrameElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const activeSourceRef = useRef<HTMLDivElement>(null);

    // Determine if a source was added by the video creator (verified)
    // Must match BOTH: contributor is the video owner AND the video's YouTube channel
    // matches the creator's verified channel
    const isCreatorSource = (source: Source): boolean => {
        if (!creator || !video.youtube_channel_id) return false;
        return (
            source.contributed_by === video.user_id &&
            video.youtube_channel_id === creator.youtube_channel_id
        );
    };

    // Check if there are any community sources
    const hasCommunity = sources.some(s => s.contributed_by && s.contributed_by !== video.user_id);
    const hasCreator = sources.some(s => isCreatorSource(s));

    // Encontrar la fuente activa basada en el tiempo actual
    const activeSourceIndex = sources.findIndex((source, index) => {
        const nextSource = sources[index + 1];
        if (!nextSource) {
            return currentTime >= source.timestamp_seconds;
        }
        return currentTime >= source.timestamp_seconds && currentTime < nextSource.timestamp_seconds;
    });

    // Escuchar mensajes del iframe de YouTube
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                const data = JSON.parse(event.data);
                if (data.event === 'onStateChange') {
                    setIsPlaying(data.info === 1);
                }
                if (data.event === 'infoDelivery' && data.info?.currentTime) {
                    setCurrentTime(Math.floor(data.info.currentTime));
                }
            } catch {
                // Ignorar mensajes que no son JSON
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Auto-scroll a la fuente activa
    useEffect(() => {
        if (activeSourceRef.current && timelineRef.current && isPlaying) {
            activeSourceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeSourceIndex, isPlaying]);

    // Función para saltar a un timestamp
    const seekTo = useCallback((seconds: number) => {
        if (playerRef.current?.contentWindow) {
            playerRef.current.contentWindow.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: 'seekTo',
                    args: [seconds, true],
                }),
                '*'
            );
        }
    }, []);

    // URL del embed con API habilitada
    const embedUrl = `https://www.youtube.com/embed/${video.youtube_id}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&modestbranding=1&rel=0`;

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <header className="bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[#27272A] sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Referer" width={28} height={28} className="invert brightness-200" />
                            <span className="font-semibold text-[#F4F4F5]">Referer</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            {creator && (
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4ADE80]/[0.08] border border-[#4ADE80]/20 text-xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                                    <span className="text-[#4ADE80] font-medium">Creador verificado</span>
                                </span>
                            )}
                            <span className="text-xs text-[#71717A] flex items-center gap-1">
                                <span className="hidden sm:inline">Verificado con</span>
                                <span className="font-medium text-[#818CF8]">{sources.length} fuentes</span>
                            </span>
                            <div className="h-4 w-px bg-[#27272A] mx-1"></div>
                            <Link href={`/contribute/${video.id}`}>
                                <button className="text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span className="hidden sm:inline">Contribuir</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    {/* Left: Video Player (3 columns) */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card padding="none" className="overflow-hidden shadow-2xl shadow-black/40">
                            <div className="aspect-video">
                                <iframe
                                    ref={playerRef}
                                    src={embedUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </Card>

                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-[#F4F4F5] leading-tight">
                                {video.title}
                            </h1>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <p className="text-sm text-[#71717A]">
                                    Este video tiene {sources.length} fuentes verificables vinculadas a momentos específicos.
                                </p>
                                {creator && (
                                    <div className="flex items-center gap-2">
                                        {creator.youtube_channel_avatar && (
                                            <img
                                                src={creator.youtube_channel_avatar}
                                                alt={creator.youtube_channel_name || ''}
                                                className="w-5 h-5 rounded-full"
                                            />
                                        )}
                                        <span className="text-xs text-[#A1A1AA]">
                                            por <strong className="text-[#F4F4F5]">{creator.youtube_channel_name}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Source Timeline (2 columns) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[#F4F4F5] flex items-center gap-2">
                                    <Image src="/logo.png" alt="Referer" width={20} height={20} className="invert brightness-200" />
                                    Fuentes Citadas
                                </h2>
                            </div>

                            {/* Attribution legend */}
                            {(hasCreator || hasCommunity) && (
                                <div className="mb-3 p-3 rounded-lg bg-[#141416] border border-[#27272A] space-y-1.5">
                                    {hasCreator && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#4ADE80]/10 border border-[#4ADE80]/20">
                                                <ShieldCheck className="w-3 h-3 text-[#4ADE80]" />
                                            </span>
                                            <span className="text-[#A1A1AA]">Añadida por el <strong className="text-[#F4F4F5]">creador del video</strong></span>
                                        </div>
                                    )}
                                    {hasCommunity && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#818CF8]/10 border border-[#818CF8]/20">
                                                <Users className="w-3 h-3 text-[#818CF8]" />
                                            </span>
                                            <span className="text-[#A1A1AA]">Añadida por la <strong className="text-[#F4F4F5]">comunidad</strong></span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div
                                ref={timelineRef}
                                className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2"
                            >
                                {sources.length === 0 ? (
                                    <Card variant="outlined" className="text-center py-8">
                                        <p className="text-[#71717A]">
                                            No hay fuentes registradas para este video.
                                        </p>
                                    </Card>
                                ) : (
                                    sources.map((source, index) => {
                                        const isActive = index === activeSourceIndex;
                                        const isFromCreator = isCreatorSource(source);
                                        const isCommunity = source.contributed_by && !isFromCreator;

                                        return (
                                            <div
                                                key={source.id}
                                                ref={isActive ? activeSourceRef : null}
                                                onClick={() => seekTo(source.timestamp_seconds)}
                                                className={`
                          group cursor-pointer p-4 rounded-xl border transition-all duration-200
                          ${isActive
                                                        ? 'border-[#818CF8] bg-[#818CF8]/10 source-active'
                                                        : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                                    }
                        `}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Play indicator */}
                                                    <div className={`
                            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                            ${isActive
                                                            ? 'bg-[#818CF8] text-[#0A0A0B]'
                                                            : 'bg-[#1A1A1E] text-[#52525B] group-hover:text-[#A1A1AA]'
                                                        }
                          `}>
                                                        <Play className="w-4 h-4" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        {/* Timestamp + Badge */}
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className={`
                                inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium
                                ${isActive
                                                                    ? 'bg-[#818CF8] text-[#0A0A0B]'
                                                                    : 'bg-[#1A1A1E] text-[#A1A1AA]'
                                                                }
                              `}>
                                                                <Clock className="w-3 h-3" />
                                                                {formatTimestamp(source.timestamp_seconds)}
                                                            </span>

                                                            {/* Attribution badge */}
                                                            {isFromCreator && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">
                                                                    <ShieldCheck className="w-2.5 h-2.5" />
                                                                    Creador
                                                                </span>
                                                            )}
                                                            {isCommunity && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/20">
                                                                    <Users className="w-2.5 h-2.5" />
                                                                    Comunidad
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Claim */}
                                                        <p className={`
                              text-sm font-medium leading-snug line-clamp-2
                              ${isActive ? 'text-[#F4F4F5]' : 'text-[#A1A1AA]'}
                            `}>
                                                            {source.claim}
                                                        </p>

                                                        {/* Source text */}
                                                        {source.source_text && (
                                                            <p className="text-xs text-[#52525B] mt-1 line-clamp-1">
                                                                {source.source_text}
                                                            </p>
                                                        )}

                                                        {/* Source link */}
                                                        <a
                                                            href={source.source_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 text-xs text-[#818CF8] hover:text-[#A5B4FC] mt-2 group/link"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            <span className="truncate max-w-[200px]">
                                                                {new URL(source.source_url).hostname}
                                                            </span>
                                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Info footer */}
                            <div className="mt-4 pt-4 border-t border-[#27272A]">
                                <p className="text-xs text-[#52525B] text-center">
                                    Las fuentes se iluminan automáticamente al reproducir el video.
                                    <br />
                                    Haz clic en cualquier fuente para saltar a ese momento.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#27272A] mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Referer" width={20} height={20} className="invert brightness-200" />
                            <span className="text-sm font-medium text-[#A1A1AA]">Referer</span>
                        </div>
                        <p className="text-xs text-[#52525B]">
                            La Capa de Verdad para el Video Online
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
