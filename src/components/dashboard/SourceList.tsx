'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { formatTimestamp } from '@/lib/time-utils';
import { Clock, ExternalLink, Trash2, Quote } from 'lucide-react';
import type { Source } from '@/lib/types';

interface SourceListProps {
    sources: Source[];
    onSourceDeleted: (sourceId: string) => void;
    onTimestampClick?: (seconds: number) => void;
}

export function SourceList({ sources, onSourceDeleted, onTimestampClick }: SourceListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const supabase = createClient();

    const handleDelete = async (sourceId: string) => {
        setDeletingId(sourceId);

        try {
            const { error } = await supabase
                .from('sources')
                .delete()
                .eq('id', sourceId);

            if (error) throw error;
            onSourceDeleted(sourceId);
        } catch (err) {
            console.error('Error deleting source:', err);
        } finally {
            setDeletingId(null);
        }
    };

    // Ordenar por timestamp
    const sortedSources = [...sources].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

    if (sortedSources.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Quote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay fuentes añadidas todavía.</p>
                <p className="text-sm mt-1">Usa el formulario de arriba para empezar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {sortedSources.map((source) => (
                <div
                    key={source.id}
                    className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Timestamp */}
                            <button
                                onClick={() => onTimestampClick?.(source.timestamp_seconds)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm font-mono hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors mb-2"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                {formatTimestamp(source.timestamp_seconds)}
                            </button>

                            {/* Claim */}
                            <p className="text-gray-900 dark:text-white font-medium line-clamp-2">
                                {source.claim}
                            </p>

                            {/* Source text */}
                            {source.source_text && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                    {source.source_text}
                                </p>
                            )}

                            {/* Source URL */}
                            <a
                                href={source.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                {new URL(source.source_url).hostname}
                            </a>
                        </div>

                        {/* Delete button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            disabled={deletingId === source.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
