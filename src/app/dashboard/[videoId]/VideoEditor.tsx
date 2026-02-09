'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SourceForm } from '@/components/dashboard/SourceForm';
import { SourceList } from '@/components/dashboard/SourceList';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { generateYouTubeDescription } from '@/lib/export';
import { ArrowLeft, ExternalLink, Copy, Check, BookOpen, FileText } from 'lucide-react';
import type { Video, Source } from '@/lib/types';

interface VideoEditorProps {
    video: Video;
    initialSources: Source[];
}

export function VideoEditor({ video, initialSources }: VideoEditorProps) {
    const [sources, setSources] = useState<Source[]>(initialSources);
    const [showExport, setShowExport] = useState(false);
    const [copied, setCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSourceAdded = (source: Source) => {
        setSources(prev => {
            // Si es una fuente temporal, reemplazarla si ya existe una con el mismo ID
            const existing = prev.find(s => s.id === source.id);
            if (existing) {
                return prev.map(s => s.id === source.id ? source : s);
            }
            // Si es nueva, añadirla
            return [...prev.filter(s => !s.id.startsWith('temp-')), source];
        });
    };

    const handleSourceDeleted = (sourceId: string) => {
        setSources(prev => prev.filter(s => s.id !== sourceId));
    };

    const handleTimestampClick = (seconds: number) => {
        // Usar postMessage para controlar el iframe de YouTube
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: 'seekTo',
                    args: [seconds, true],
                }),
                '*'
            );
        }
    };

    const handleCopyExport = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const text = generateYouTubeDescription(video, sources, baseUrl);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exportText = generateYouTubeDescription(
        video,
        sources,
        typeof window !== 'undefined' ? window.location.origin : ''
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </Link>
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">
                                {video.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href={`/v/${video.id}`} target="_blank">
                                <Button variant="secondary" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="hidden sm:inline">Ver Público</span>
                                </Button>
                            </Link>
                            <Button size="sm" onClick={() => setShowExport(!showExport)}>
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Exportar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Export Modal */}
            {showExport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card variant="elevated" padding="lg" className="w-full max-w-2xl max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Exportar para YouTube
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowExport(false)}>
                                ✕
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Copia este texto y pégalo en la descripción de tu video de YouTube.
                        </p>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 mb-4 overflow-x-auto">
                            {exportText}
                        </pre>
                        <Button onClick={handleCopyExport} className="w-full">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
                        </Button>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Video Player */}
                    <div className="space-y-6">
                        <Card padding="none" className="overflow-hidden sticky top-24">
                            <div className="aspect-video">
                                <iframe
                                    ref={iframeRef}
                                    src={getYouTubeEmbedUrl(video.youtube_id)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </Card>

                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{sources.length}</span> fuentes vinculadas
                        </div>
                    </div>

                    {/* Right: Source Editor */}
                    <div className="space-y-6">
                        <SourceForm videoId={video.id} onSourceAdded={handleSourceAdded} />

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Fuentes ({sources.length})
                            </h2>
                            <SourceList
                                sources={sources}
                                onSourceDeleted={handleSourceDeleted}
                                onTimestampClick={handleTimestampClick}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
