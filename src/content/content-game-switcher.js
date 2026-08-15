/**
 * @module content-game-switcher
 * @description Inyectado en páginas de usuario de Cardmarket (`/{lang}/{game}/Users/{username}[/...]`).
 * Reescribe los enlaces del selector de juego nativo para mantener el contexto del vendedor
 * al cambiar de juego, apuntando a `/{lang}/{newGame}/Users/{username}` en lugar de `/{lang}/{newGame}`.
 * Con la opción de contexto completo, preserva además el subpath y los query params genéricos.
 */
import { DEFAULT_GAME_SWITCHER_ENABLED, DEFAULT_GAME_SWITCHER_FULL_CONTEXT_ENABLED } from '../shared/defaults.js';

/** @type {string[]} Query params genéricos que se preservan en modo contexto completo. */
const GENERIC_PARAMS = ['sortBy'];

/**
 * Extrae lang, username, subpath y query params genéricos de la URL actual.
 * @returns {{ lang: string, username: string, subpath: string, search: string } | null}
 */
function parseUserUrl() {
    const match = location.pathname.match(/^\/([^/]+)\/[^/]+\/Users\/([^/]+)(\/.*)?$/);
    if (!match) return null;
    const params = new URLSearchParams(location.search);
    const genericParams = new URLSearchParams();
    GENERIC_PARAMS.forEach(k => { if (params.has(k)) genericParams.set(k, params.get(k)); });
    const search = genericParams.toString() ? `?${genericParams}` : '';
    return { lang: match[1], username: match[2], subpath: match[3] || '', search };
}

/**
 * Reescribe los href del selector de juego para mantener el contexto del vendedor.
 * @param {string} lang
 * @param {string} username
 * @param {boolean} fullContext - Si true, preserva subpath y query params genéricos.
 * @param {string} subpath
 * @param {string} search
 */
function rewriteGameLinks(lang, username, fullContext, subpath, search) {
    document.querySelectorAll('#brand-gamesDD .dropdown-menu a.dropdown-item').forEach(a => {
        const gameMatch = a.getAttribute('href')?.match(/^\/[^/]+\/([^/]+)/);
        if (!gameMatch) return;
        if (!a.dataset.originalHref) a.dataset.originalHref = a.getAttribute('href');
        const suffix = fullContext ? `${subpath}${search}` : '';
        a.href = `/${lang}/${gameMatch[1]}/Users/${username}${suffix}`;
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
    chrome.storage.sync.get(['gameSwitcherEnabled', 'gameSwitcherFullContextEnabled'], data => {
        if ((data.gameSwitcherEnabled ?? DEFAULT_GAME_SWITCHER_ENABLED) !== false) {
            const full = (data.gameSwitcherFullContextEnabled ?? DEFAULT_GAME_SWITCHER_FULL_CONTEXT_ENABLED) !== false;
            rewriteGameLinks(ctx.lang, ctx.username, full, ctx.subpath, ctx.search);
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        if (!('gameSwitcherEnabled' in changes) && !('gameSwitcherFullContextEnabled' in changes)) return;
        chrome.storage.sync.get(['gameSwitcherEnabled', 'gameSwitcherFullContextEnabled'], data => {
            if ((data.gameSwitcherEnabled ?? DEFAULT_GAME_SWITCHER_ENABLED) !== false) {
                const full = (data.gameSwitcherFullContextEnabled ?? DEFAULT_GAME_SWITCHER_FULL_CONTEXT_ENABLED) !== false;
                rewriteGameLinks(ctx.lang, ctx.username, full, ctx.subpath, ctx.search);
            } else {
                restoreGameLinks();
            }
        });
    });
}
