'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Link2, Check, Youtube } from 'lucide-react';
import Link from 'next/link';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';

export default function NewVideoPage() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleUrlChange = (value: string) => {
        setUrl(value);
        setError(null);

        const id = extractYouTubeId(value);
        if (id) {
            setVideoId(id);
            // Intentar obtener el título automáticamente (simulado por ahora)
            if (!title) {
                setTitle('Video de YouTube');
            }
        } else {
            setVideoId(null);
        }
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

            const { data, error: insertError } = await supabase
                .from('videos')
                .insert({
                    user_id: user.id,
                    youtube_id: videoId,
                    title: title.trim(),
                    thumbnail_url: getYouTubeThumbnail(videoId),
                })
                .select()
                .single();

            if (insertError) throw insertError;

            router.push(`/dashboard/${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear el video');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Back button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al dashboard
                </Link>

                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <CardTitle>Importar Video de YouTube</CardTitle>
                        <CardDescription>
                            Pega la URL de tu video para empezar a añadir fuentes verificables
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL del Video
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {videoId && (
                                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Video Preview */}
                            {videoId && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
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

                            {/* Title Input */}
                            <Input
                                label="Título del Video"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="El título que aparecerá en Referer"
                                helperText="Puedes usar el título original o personalizarlo"
                            />

                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Link href="/dashboard" className="flex-1">
                                    <Button type="button" variant="secondary" className="w-full">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    isLoading={isLoading}
                                    disabled={!videoId}
                                >
                                    Importar Video
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
