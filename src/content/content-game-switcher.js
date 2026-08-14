/**
 * @module content-game-switcher
 * @description Inyectado en páginas de usuario de Cardmarket (`/{lang}/{game}/Users/{username}[/...]`).
 * Reescribe los enlaces del selector de juego nativo para mantener el contexto del vendedor
 * al cambiar de juego, apuntando a `/{lang}/{newGame}/Users/{username}` en lugar de `/{lang}/{newGame}`.
 */
import { DEFAULT_GAME_SWITCHER_ENABLED } from '../shared/defaults.js';

/**
 * Extrae lang y username de la URL actual.
 * @returns {{ lang: string, username: string } | null}
 */
function parseUserUrl() {
    const match = location.pathname.match(/^\/([^/]+)\/[^/]+\/Users\/([^/]+)/);
    return match ? { lang: match[1], username: match[2] } : null;
}

/**
 * Reescribe los href del selector de juego para mantener el contexto del vendedor.
 * @param {string} lang
 * @param {string} username
 */
function rewriteGameLinks(lang, username) {
    document.querySelectorAll('#brand-gamesDD .dropdown-menu a.dropdown-item').forEach(a => {
        const gameMatch = a.getAttribute('href')?.match(/^\/[^/]+\/([^/]+)/);
        if (!gameMatch) return;
        if (!a.dataset.originalHref) a.dataset.originalHref = a.getAttribute('href');
        a.href = `/${lang}/${gameMatch[1]}/Users/${username}`;
    });
}

/**
 * Restaura los href originales del selector de juego.
 */
function restoreGameLinks() {
    document.querySelectorAll('#brand-gamesDD .dropdown-menu a.dropdown-item[data-original-href]').forEach(a => {
        a.href = a.dataset.originalHref;
    });
}

const ctx = parseUserUrl();
if (ctx) {
    chrome.storage.sync.get('gameSwitcherEnabled', data => {
        if ((data.gameSwitcherEnabled ?? DEFAULT_GAME_SWITCHER_ENABLED) !== false) {
            rewriteGameLinks(ctx.lang, ctx.username);
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync' || !('gameSwitcherEnabled' in changes)) return;
        if (changes.gameSwitcherEnabled.newValue !== false) {
            rewriteGameLinks(ctx.lang, ctx.username);
        } else {
            restoreGameLinks();
        }
    });
}
