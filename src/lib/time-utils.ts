// Referer - Time Utilities
// Conversión entre formatos de tiempo (string ↔ segundos)

/**
 * Parsea un timestamp string a segundos
 * Acepta: "02:15", "2:15", "135", "1:02:15"
 */
export function parseTimestamp(input: string): number {
    const trimmed = input.trim();

    // Si es solo un número, retornarlo directamente
    if (/^\d+$/.test(trimmed)) {
        return parseInt(trimmed, 10);
    }

    // Parsear formato MM:SS o HH:MM:SS
    const parts = trimmed.split(':').map(p => parseInt(p, 10));

    if (parts.some(isNaN)) {
        return 0;
    }

    if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
}

/**
 * Formatea segundos a timestamp string legible
 * 135 → "02:15", 3665 → "1:01:05"
 */
export function formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Valida si un string es un timestamp válido
 */
export function isValidTimestamp(input: string): boolean {
    const trimmed = input.trim();

    // Número solo
    if (/^\d+$/.test(trimmed)) {
        return true;
    }

    // Formato MM:SS o HH:MM:SS
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        const parts = trimmed.split(':').map(p => parseInt(p, 10));
        // Validar rangos
        if (parts.length === 2) {
            return parts[1] < 60;
        }
        if (parts.length === 3) {
            return parts[1] < 60 && parts[2] < 60;
        }
    }

    return false;
}
