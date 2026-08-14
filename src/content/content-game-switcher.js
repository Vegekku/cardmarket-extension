/**
 * @module content-game-switcher
 * @description Inyectado en páginas de usuario de Cardmarket (`/{lang}/{game}/Users/{username}[/...]`).
 * Reescribe los enlaces del selector de juego nativo para mantener el contexto del vendedor
 * al cambiar de juego, apuntando a `/{lang}/{newGame}/Users/{username}` en lugar de `/{lang}/{newGame}`.
 */

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
        if (gameMatch) a.href = `/${lang}/${gameMatch[1]}/Users/${username}`;
    });
}

const ctx = parseUserUrl();
if (ctx) rewriteGameLinks(ctx.lang, ctx.username);
