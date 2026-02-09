'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ExternalLink, Play, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatTimestamp } from '@/lib/time-utils';
import type { Video, Source } from '@/lib/types';

interface PublicViewerProps {
    video: Video;
    sources: Source[];
}

export function PublicViewer({ video, sources }: PublicViewerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<HTMLIFrameElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const activeSourceRef = useRef<HTMLDivElement>(null);

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
                            <div className="w-8 h-8 rounded-lg bg-[#818CF8] flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-[#0A0A0B]" />
                            </div>
                            <span className="font-semibold text-[#F4F4F5]">Referer</span>
                        </Link>

                        <span className="text-xs text-[#71717A] flex items-center gap-1">
                            <span className="hidden sm:inline">Verificado con</span>
                            <span className="font-medium text-[#818CF8]">{sources.length} fuentes</span>
                        </span>
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
                            <p className="text-sm text-[#71717A] mt-2">
                                Este video tiene {sources.length} fuentes verificables vinculadas a momentos específicos.
                            </p>
                        </div>
                    </div>

                    {/* Right: Source Timeline (2 columns) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[#F4F4F5] flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#818CF8]" />
                                    Fuentes Citadas
                                </h2>
                            </div>

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
                                                        {/* Timestamp */}
                                                        <div className="flex items-center gap-2 mb-1">
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
                            <div className="w-6 h-6 rounded bg-[#818CF8] flex items-center justify-center">
                                <BookOpen className="w-3 h-3 text-[#0A0A0B]" />
                            </div>
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
