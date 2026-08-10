/**
 * @module i18n
 * @description Traducciones de la UI de la extensión para los 5 idiomas de Cardmarket.
 * El idioma activo se lee de `chrome.storage.local` (clave `lang`), persistido por content.js.
 * Fallback a `es` si el idioma no está soportado o no hay valor guardado.
 */

/** @type {Record<string, Record<string, string>>} */
const MESSAGES = {
    es: {
        popupTitle:        'Resaltador de usuarios',
        popupHeading:      'Resaltar usuarios',
        popupPlaceholder:  'Introduce usuarios separados por espacio o salto de línea...',
        toggleLabel:       'Activar resaltado',
        toggleTitle:       'Activa o desactiva el resaltado de usuarios en la página sin necesidad de modificar o vaciar tu lista de usuarios.',
        clearBtn:          'Vaciar',
        saved:             'Guardado',
        cleared:           'Vaciado',
        optionsTitle:      'Cardmarket Highlighter — Opciones',
        tabAppearance:     'Apariencia',
        tabAbout:          'Acerca de',
        h1Appearance:      'Apariencia',
        h2HighlightColor:  'Color de resaltado',
        labelLight:        'Modo claro',
        hintLight:         'Páginas con fondo claro',
        labelDark:         'Modo oscuro',
        hintDark:          'Páginas con fondo oscuro',
        btnSave:           'Guardar',
        btnReset:          'Restablecer',
        h2CheckboxSize:    'Tamaño de checkboxes',
        labelCheckboxSize: 'Tamaño',
        hintCheckboxSize:  'Tamaño de los checkboxes en el listado de pedido',
        h2CheckedOpacity:  'Opacidad al marcar',
        labelCheckedOpacity: 'Opacidad',
        hintCheckedOpacity: 'Opacidad de la fila al marcar su checkbox en el listado de pedido',
        h1About:           'Acerca de',
        linkStore:         'Valorar en la Chrome Web Store',
        linkChangelog:     'Novedades',
        linkIssues:        'Reportar un problema',
        linkPrivacy:       'Política de privacidad',
        versionPrefix:     'Versión',
        resetStatus:       'Restablecido',
        supportText:       'Desarrollo esta extensión en los ratos libres que me dejan mis dos hijas (spoiler: no son muchos). Hecha con cariño entre pañales y madrugadas — si te ha gustado y quieres que añada más funcionalidades, cualquier donación ayuda a seguir adelante.',
        btnDonate:         'Apoya las madrugadas de papá',
    },
    en: {
        popupTitle:        'User Highlighter',
        popupHeading:      'Highlight users',
        popupPlaceholder:  'Enter users separated by space or line break...',
        toggleLabel:       'Enable highlighting',
        toggleTitle:       'Enable or disable user highlighting on the page without modifying or clearing your user list.',
        clearBtn:          'Clear',
        saved:             'Saved',
        cleared:           'Cleared',
        optionsTitle:      'Cardmarket Highlighter — Options',
        tabAppearance:     'Appearance',
        tabAbout:          'About',
        h1Appearance:      'Appearance',
        h2HighlightColor:  'Highlight color',
        labelLight:        'Light mode',
        hintLight:         'Pages with light background',
        labelDark:         'Dark mode',
        hintDark:          'Pages with dark background',
        btnSave:           'Save',
        btnReset:          'Reset',
        h2CheckboxSize:    'Checkbox size',
        labelCheckboxSize: 'Size',
        hintCheckboxSize:  'Size of checkboxes in the order item list',
        h2CheckedOpacity:  'Opacity when checked',
        labelCheckedOpacity: 'Opacity',
        hintCheckedOpacity: 'Row opacity when its checkbox is checked in the order item list',
        h1About:           'About',
        linkStore:         'Rate on the Chrome Web Store',
        linkChangelog:     "What's new",
        linkIssues:        'Report an issue',
        linkPrivacy:       'Privacy policy',
        versionPrefix:     'Version',
        resetStatus:       'Reset',
        supportText:       "I develop this extension in the spare time my two daughters leave me (spoiler: not much). Made with love between diapers and sleepless nights — if you liked it and want more features, any donation helps keep it going.",
        btnDonate:         "Support dad's sleepless nights",
    },
    fr: {
        popupTitle:        "Surligneur d'utilisateurs",
        popupHeading:      'Surligner les utilisateurs',
        popupPlaceholder:  'Entrez les utilisateurs séparés par un espace ou un saut de ligne...',
        toggleLabel:       'Activer le surlignage',
        toggleTitle:       'Active ou désactive le surlignage des utilisateurs sur la page sans modifier ni vider votre liste.',
        clearBtn:          'Vider',
        saved:             'Enregistré',
        cleared:           'Vidé',
        optionsTitle:      'Cardmarket Highlighter — Options',
        tabAppearance:     'Apparence',
        tabAbout:          'À propos',
        h1Appearance:      'Apparence',
        h2HighlightColor:  'Couleur de surlignage',
        labelLight:        'Mode clair',
        hintLight:         'Pages avec fond clair',
        labelDark:         'Mode sombre',
        hintDark:          'Pages avec fond sombre',
        btnSave:           'Enregistrer',
        btnReset:          'Réinitialiser',
        h2CheckboxSize:    'Taille des cases à cocher',
        labelCheckboxSize: 'Taille',
        hintCheckboxSize:  'Taille des cases à cocher dans la liste de commande',
        h2CheckedOpacity:  'Opacité lors de la sélection',
        labelCheckedOpacity: 'Opacité',
        hintCheckedOpacity: 'Opacité de la ligne lors de la sélection de sa case dans la liste de commande',
        h1About:           'À propos',
        linkStore:         'Évaluer sur le Chrome Web Store',
        linkChangelog:     'Nouveautés',
        linkIssues:        'Signaler un problème',
        linkPrivacy:       'Politique de confidentialité',
        versionPrefix:     'Version',
        resetStatus:       'Réinitialisé',
        supportText:       'Je développe cette extension dans les moments libres que me laissent mes deux filles (spoiler : pas beaucoup). Faite avec amour entre couches et nuits blanches — si elle vous a plu et que vous souhaitez plus de fonctionnalités, tout don aide à continuer.',
        btnDonate:         'Soutenez les nuits blanches de papa',
    },
    de: {
        popupTitle:        'Benutzer-Hervorheber',
        popupHeading:      'Benutzer hervorheben',
        popupPlaceholder:  'Benutzer durch Leerzeichen oder Zeilenumbruch getrennt eingeben...',
        toggleLabel:       'Hervorhebung aktivieren',
        toggleTitle:       'Aktiviert oder deaktiviert die Benutzerhervorhebung auf der Seite, ohne die Liste zu ändern oder zu leeren.',
        clearBtn:          'Leeren',
        saved:             'Gespeichert',
        cleared:           'Geleert',
        optionsTitle:      'Cardmarket Highlighter — Optionen',
        tabAppearance:     'Erscheinungsbild',
        tabAbout:          'Über',
        h1Appearance:      'Erscheinungsbild',
        h2HighlightColor:  'Hervorhebungsfarbe',
        labelLight:        'Heller Modus',
        hintLight:         'Seiten mit hellem Hintergrund',
        labelDark:         'Dunkler Modus',
        hintDark:          'Seiten mit dunklem Hintergrund',
        btnSave:           'Speichern',
        btnReset:          'Zurücksetzen',
        h2CheckboxSize:    'Checkbox-Größe',
        labelCheckboxSize: 'Größe',
        hintCheckboxSize:  'Größe der Checkboxen in der Bestellartikelliste',
        h2CheckedOpacity:  'Deckkraft beim Markieren',
        labelCheckedOpacity: 'Deckkraft',
        hintCheckedOpacity: 'Deckkraft der Zeile beim Markieren der Checkbox in der Bestellartikelliste',
        h1About:           'Über',
        linkStore:         'Im Chrome Web Store bewerten',
        linkChangelog:     'Neuigkeiten',
        linkIssues:        'Problem melden',
        linkPrivacy:       'Datenschutzrichtlinie',
        versionPrefix:     'Version',
        resetStatus:       'Zurückgesetzt',
        supportText:       'Ich entwickle diese Erweiterung in der Freizeit, die mir meine zwei Töchter lassen (Spoiler: nicht viel). Mit Liebe zwischen Windeln und schlaflosen Nächten gemacht — wenn sie dir gefallen hat und du mehr Funktionen möchtest, hilft jede Spende weiter.',
        btnDonate:         'Unterstütze Papas schlaflose Nächte',
    },
    it: {
        popupTitle:        'Evidenziatore utenti',
        popupHeading:      'Evidenzia utenti',
        popupPlaceholder:  'Inserisci utenti separati da spazio o a capo...',
        toggleLabel:       'Attiva evidenziazione',
        toggleTitle:       "Attiva o disattiva l'evidenziazione degli utenti nella pagina senza modificare o svuotare la lista.",
        clearBtn:          'Svuota',
        saved:             'Salvato',
        cleared:           'Svuotato',
        optionsTitle:      'Cardmarket Highlighter — Opzioni',
        tabAppearance:     'Aspetto',
        tabAbout:          'Informazioni',
        h1Appearance:      'Aspetto',
        h2HighlightColor:  'Colore di evidenziazione',
        labelLight:        'Modalità chiara',
        hintLight:         'Pagine con sfondo chiaro',
        labelDark:         'Modalità scura',
        hintDark:          'Pagine con sfondo scuro',
        btnSave:           'Salva',
        btnReset:          'Ripristina',
        h2CheckboxSize:    'Dimensione checkbox',
        labelCheckboxSize: 'Dimensione',
        hintCheckboxSize:  'Dimensione dei checkbox nell\'elenco articoli dell\'ordine',
        h2CheckedOpacity:  'Opacità alla selezione',
        labelCheckedOpacity: 'Opacità',
        hintCheckedOpacity: 'Opacità della riga alla selezione del checkbox nell\'elenco articoli dell\'ordine',
        h1About:           'Informazioni',
        linkStore:         'Valuta sul Chrome Web Store',
        linkChangelog:     'Novità',
        linkIssues:        'Segnala un problema',
        linkPrivacy:       'Informativa sulla privacy',
        versionPrefix:     'Versione',
        resetStatus:       'Ripristinato',
        supportText:       'Sviluppo questa estensione nel tempo libero che mi lasciano le mie due figlie (spoiler: non molto). Fatta con amore tra pannolini e notti insonni — se ti è piaciuta e vuoi più funzionalità, qualsiasi donazione aiuta ad andare avanti.',
        btnDonate:         "Supporta le notti insonni di papà",
    },
};

const SUPPORTED = new Set(['es', 'en', 'fr', 'de', 'it']);

/**
 * Devuelve el objeto de mensajes para el idioma dado, con fallback a `es`.
 * @param {string} lang
 * @returns {Record<string, string>}
 */
export function getMessages(lang) {
    return MESSAGES[SUPPORTED.has(lang) ? lang : 'es'];
}

/**
 * Lee el idioma guardado en `chrome.storage.local` y devuelve los mensajes correspondientes.
 * @returns {Promise<Record<string, string>>}
 */
export function loadMessages() {
    return new Promise(resolve => {
        chrome.storage.local.get('lang', data => resolve(getMessages(data.lang || 'es')));
    });
}

/**
 * Aplica las traducciones al documento actual usando atributos data-i18n.
 * - `data-i18n` → textContent
 * - `data-i18n-placeholder` → placeholder
 * - `data-i18n-title` → title
 * @param {Record<string, string>} m
 */
export function applyMessages(m) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = m[el.dataset.i18n] ?? el.textContent;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = m[el.dataset.i18nPlaceholder] ?? el.placeholder;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = m[el.dataset.i18nTitle] ?? el.title;
    });
}
