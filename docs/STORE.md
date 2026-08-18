# Chrome Web Store — Ficha de la extensión

## Versión publicada
v1.3.0

## Ficha de Play Store

### Detalles del producto

#### Título del paquete
Cardmarket Enhancer

#### Resumen del paquete (máx. 132 caracteres)
Resalta vendedores y mejora la interfaz de Cardmarket: pedidos, navegación y personalización visual.

#### Descripción (máx. 16000 caracteres)
Cardmarket Enhancer resalta visualmente los vendedores que más te interesan en los listados de artículos de Cardmarket, el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, Digimon, etc.), y mejora la interfaz de pedidos, navegación y personalización visual.

Funcionalidades principales:

• Introduce uno o varios nombres de usuario en el popup separados por espacio, salto de línea o coma.
• Las filas de los vendedores coincidentes se resaltan en el listado de artículos.
• Los usuarios persisten entre sesiones y se aplican automáticamente al navegar por Cardmarket.
• Toggle para activar o desactivar el resaltado sin borrar la lista de usuarios.
• Botón Vaciar para eliminar todos los usuarios guardados de una vez.
• Feedback visual en el popup al modificar o vaciar la lista de usuarios.
• Página de opciones con selector de color de resaltado independiente para modo claro y oscuro, con previsualización en vivo.
• Tamaño de checkboxes configurable en el listado de pedido, con previsualización en vivo.
• Atenuado de filas al marcar su checkbox en el listado de pedido, con opacidad configurable.
• Imágenes de cartas inline en el listado de pedido, con altura configurable.
• Categorías colapsables en el pedido y en el carrito (toggle por bloque de juego) y opción de colapso por defecto.
• Desglose del valor del pedido y del carrito por categoría de juego, con opción de colapso por defecto.
• Reescritura de los enlaces del selector de juego en páginas de usuario para mantener el contexto del vendedor al cambiar de juego.
• Enlace a formulario de feedback en la sección Acerca de, con idioma, versión y tema pre-rellenados.
• Interfaz disponible en español, inglés, francés, alemán e italiano (se adapta automáticamente al idioma de Cardmarket).

Compatibilidad: Chrome con Manifest V3. Funciona en todas las páginas de Cardmarket.

#### Categoría
Herramientas

#### Idioma
Español (es)

### Recursos gráficos

#### Capturas de pantalla (máx. 5 capturas)

1. Popup de la extensión con varios usuarios introducidos y el toggle de resaltado activado.
2. Listado de artículos de una carta con filas de vendedores resaltadas en azul-cian.
3. Página de opciones con controles de pedido y previsualización en vivo.
4. Listado de pedido con imágenes inline, checkboxes ampliados y bloques colapsables por juego.

Nota: las capturas 3 y 4 están pendientes de actualizar con las nuevas funcionalidades.

## Privacidad

### Una sola finalidad

#### Descripción de la finalidad única (máx. 1000 caracteres)
Esta extensión mejora la experiencia de uso de Cardmarket: resalta visualmente vendedores favoritos en los listados de artículos y añade herramientas de productividad para la gestión de pedidos y la navegación entre juegos.

### Justificación de permiso

#### Justificación de storage (máx. 1000 caracteres)
Se usa chrome.storage.sync para guardar los nombres de usuario resaltados y las preferencias de la extensión (colores de resaltado, tamaño de checkboxes, opacidad de filas, imágenes inline, bloques colapsables, colapso del desglose de valor, selector de juego) entre sesiones y dispositivos vinculados al perfil de Chrome.

#### Justificación de tabs (máx. 1000 caracteres)
Se usa chrome.tabs para enviar mensajes desde el popup a las pestañas abiertas de Cardmarket y aplicar el resaltado sin necesidad de recargar la página.

#### Justificación de Permiso de host (máx. 1000 caracteres)
El permiso sobre *://*.cardmarket.com/* es necesario para inyectar los content scripts en las páginas de Cardmarket: resaltado de vendedores en listados de artículos, mejoras en el listado de pedido (imágenes inline, checkboxes, bloques colapsables) y reescritura del selector de juego en páginas de usuario.

#### Utilizas código remoto?
- (x) No, no estoy usando Código remoto
- ( ) Sí, estoy usando Código remoto (Justificación max 1000 chars)

### Uso de datos

#### ¿Qué datos de usuario piensas recoger ahora o en el futuro?
- [ ] Información de identificación personal
- [ ] Información sanitaria
- [ ] Datos financieros y de pagos
- [ ] Información de autenticación
- [ ] Comunicaciones personales
- [ ] Ubicación
- [ ] Historial web
- [ ] Actividad del usuario
- [ ] Contenido del sitio web

#### Certifico que las siguientes afirmaciones son ciertas:
- [x] No vendo ni transfiero datos de usuario a terceros, fuera de los casos prácticos aprobados
- [x] No uso ni transfiero datos de usuario para fines no relacionados con la finalidad única de mi elemento
- [x] No uso ni transfiero datos de usuarios para determinar su situación crediticia ni para ofrecer préstamos

### Política de Privacidad

#### URL de la Política de Privacidad
https://vegekku.github.io/cardmarket-extension/privacy.html

## Instrucciones de la prueba

### Instrucciones adicionales (máx. 500 caracteres)
Resaltado: abre el popup, introduce un nombre de usuario de Cardmarket y navega a una página de producto (ej. https://www.cardmarket.com/es/Magic/Products/Singles/...). La fila del vendedor quedará resaltada.

Pedido: abre una página de pedido (https://www.cardmarket.com/es/Magic/Orders/...) y accede a Opciones para configurar checkboxes, imágenes inline y bloques por juego.

Carrito: abre el carrito (https://www.cardmarket.com/es/Magic/ShoppingCart) con artículos de varios juegos para ver los bloques colapsables y el desglose de valor por categoría.
