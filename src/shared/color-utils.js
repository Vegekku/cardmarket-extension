/**
 * @module color-utils
 * @description Utilidades de conversión de color entre formatos rgba y hex.
 */

/**
 * Convierte un color rgba a hex aproximado para el input[type=color].
 * Ignora el canal alpha (no soportado por input[type=color]).
 * @param {string} rgba - Ej: "rgba(0, 150, 200, 0.3)"
 * @returns {string} - Ej: "#0096c8"
 */
export function rgbaToHex(rgba) {
    const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#0096c8';
    return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

/**
 * Convierte un color hex a rgba con alpha fijo 0.3.
 * @param {string} hex - Ej: "#0096c8"
 * @returns {string} - Ej: "rgba(0, 150, 200, 0.3)"
 */
export function hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
}
