/**
 * @module content-common
 * @description Inicialización compartida entre content scripts:
 * persiste el idioma de la página y aplica el tamaño de checkbox desde storage.
 */
if (typeof __BUILD_TIME__ !== 'undefined') console.log(`[Cardmarket] build: ${__BUILD_TIME__}`);

// Persiste el idioma de la página para uso interno de la extensión
chrome.storage.local.set({ lang: document.documentElement.lang || 'es' });
