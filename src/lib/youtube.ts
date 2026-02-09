// Referer - YouTube Utilities
// Helpers para trabajar con URLs y embeds de YouTube

/**
 * Extrae el ID de video de cualquier formato de URL de YouTube
 * Soporta:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/v/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ // ID directo
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

/**
 * Genera URL de thumbnail de YouTube
 * Calidades: default, mqdefault, hqdefault, sddefault, maxresdefault
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'hq'): string {
    const qualityMap = {
        default: 'default',
        mq: 'mqdefault',
        hq: 'hqdefault',
        sd: 'sddefault',
        maxres: 'maxresdefault'
    };

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Genera URL de embed para el reproductor
 */
export function getYouTubeEmbedUrl(videoId: string, startSeconds?: number): string {
    let url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

    if (startSeconds) {
        url += `&start=${startSeconds}`;
    }

    return url;
}

/**
 * Genera URL de video normal con timestamp
 */
export function getYouTubeWatchUrl(videoId: string, startSeconds?: number): string {
    let url = `https://www.youtube.com/watch?v=${videoId}`;

    if (startSeconds) {
        url += `&t=${startSeconds}`;
    }

    return url;
}

/**
 * Valida si un string parece ser un ID de YouTube válido
 */
export function isValidYouTubeId(id: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
}
