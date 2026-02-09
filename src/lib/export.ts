// Referer - Export Utilities
// Generación de texto para descripción de YouTube

import { type Video, type Source } from './types';
import { formatTimestamp } from './time-utils';

/**
 * Genera un bloque de texto formateado para la descripción de YouTube
 */
export function generateYouTubeDescription(
    video: Video,
    sources: Source[],
    baseUrl: string
): string {
    if (sources.length === 0) {
        return `📚 Fuentes verificadas en Referer:\n\nNo hay fuentes registradas aún.\n\n🔗 Ver en Referer: ${baseUrl}/v/${video.id}`;
    }

    // Ordenar por timestamp
    const sortedSources = [...sources].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

    const lines = sortedSources.map(source => {
        const timestamp = formatTimestamp(source.timestamp_seconds);
        const claim = source.claim.length > 50
            ? source.claim.substring(0, 47) + '...'
            : source.claim;

        return `${timestamp} - ${claim}\n         → ${baseUrl}/v/${video.id}?t=${source.timestamp_seconds}`;
    });

    return `───────────────────────────────
📚 Fuentes verificadas en Referer:

${lines.join('\n\n')}

🔗 Ver todas las fuentes con papers originales:
   ${baseUrl}/v/${video.id}
───────────────────────────────`;
}

/**
 * Genera un texto simple con solo los enlaces
 */
export function generateSimpleLinks(
    video: Video,
    sources: Source[],
    baseUrl: string
): string {
    if (sources.length === 0) {
        return '';
    }

    const sortedSources = [...sources].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

    const lines = sortedSources.map(source => {
        const timestamp = formatTimestamp(source.timestamp_seconds);
        return `${timestamp} → ${source.source_url}`;
    });

    return `Fuentes:\n${lines.join('\n')}\n\nVerificar en: ${baseUrl}/v/${video.id}`;
}
