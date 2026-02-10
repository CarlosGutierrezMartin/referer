'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseTimestamp, isValidTimestamp } from '@/lib/time-utils';
import { Plus, Clock, FileText, Link2, Quote } from 'lucide-react';
import type { Source, CreateSourceInput } from '@/lib/types';

interface SourceFormProps {
    videoId: string;
    onSourceAdded: (source: Source) => void;
}

export function SourceForm({ videoId, onSourceAdded }: SourceFormProps) {
    const [timestamp, setTimestamp] = useState('');
    const [claim, setClaim] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        getUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!userId) {
            setError('Debes iniciar sesión para añadir fuentes.');
            return;
        }

        // Validaciones
        if (!isValidTimestamp(timestamp)) {
            setError('Timestamp inválido. Usa formato MM:SS o segundos.');
            return;
        }

        if (!claim.trim()) {
            setError('La afirmación es requerida.');
            return;
        }

        if (!sourceUrl.trim()) {
            setError('La URL de la fuente es requerida.');
            return;
        }

        // Validar URL
        try {
            new URL(sourceUrl);
        } catch {
            setError('URL inválida. Debe empezar con http:// o https://');
            return;
        }

        setIsLoading(true);

        const timestampSeconds = parseTimestamp(timestamp);

        // Optimistic UI: crear objeto temporal
        const optimisticSource: Source = {
            id: `temp-${Date.now()}`,
            video_id: videoId,
            timestamp_seconds: timestampSeconds,
            claim: claim.trim(),
            source_text: sourceText.trim() || null,
            source_url: sourceUrl.trim(),
            contributed_by: userId,
            created_at: new Date().toISOString(),
        };

        // Mostrar inmediatamente
        onSourceAdded(optimisticSource);

        // Limpiar formulario
        setTimestamp('');
        setClaim('');
        setSourceText('');
        setSourceUrl('');

        try {
            const { data, error: insertError } = await supabase
                .from('sources')
                .insert({
                    video_id: videoId,
                    timestamp_seconds: timestampSeconds,
                    claim: claim.trim(),
                    source_text: sourceText.trim() || null,
                    source_url: sourceUrl.trim(),
                    contributed_by: userId,
                } as CreateSourceInput)
                .select()
                .single();

            if (insertError) throw insertError;

            // Actualizar con datos reales (el ID correcto)
            onSourceAdded(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar la fuente');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir Nueva Fuente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timestamp */}
                <div className="relative">
                    <Clock className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                    <Input
                        label="Timestamp"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        placeholder="02:15 o 135"
                        className="pl-9"
                        helperText="Momento en el video"
                    />
                </div>

                {/* Source URL */}
                <div className="relative">
                    <Link2 className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                    <Input
                        label="URL de la Fuente"
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                        className="pl-9"
                        helperText="Enlace al paper, artículo o dataset"
                    />
                </div>
            </div>

            {/* Claim */}
            <div className="relative">
                <Quote className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                <Input
                    label="Afirmación en el Video"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="El consumo de azúcar no causa hiperactividad en niños"
                    className="pl-9"
                    helperText="¿Qué afirmas en ese momento?"
                />
            </div>

            {/* Source Text (optional) */}
            <div className="relative">
                <FileText className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                <Input
                    label="Descripción de la Fuente (Opcional)"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Estudio de la Universidad de Yale sobre..."
                    className="pl-9"
                    helperText="Breve descripción del paper o artículo"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                    {error}
                </p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Añadir Fuente
            </Button>
        </form>
    );
}
