/**
 * @module defaults
 * @description Valores por defecto compartidos entre módulos de la extensión.
 */

/** @type {string} */
export const DEFAULT_COLOR = 'rgba(0, 150, 200, 0.3)';

/** @type {{ light: string, dark: string }} */
export const DEFAULT_COLORS = {
    light: DEFAULT_COLOR,
    dark: DEFAULT_COLOR,
};

/** @type {number} */
export const DEFAULT_CHECKBOX_SIZE = 1;

/** @type {number} */
export const DEFAULT_CHECKED_OPACITY = 0.3;

/** @type {boolean} */
export const DEFAULT_CHECKED_OPACITY_ENABLED = false;
