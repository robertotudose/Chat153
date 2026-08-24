/**
 * =========================================================================
 * CARGADOR DEL WIDGET · INSTALACIÓN CON UNA SOLA LÍNEA
 * =========================================================================
 * Permite incrustar el asistente en la web ya existente de un centro sin
 * tocar su plantilla ni su hoja de estilos:
 *
 *   <script src="https://TU-SERVIDOR/widget.js"
 *           data-servidor="https://TU-SERVIDOR"
 *           defer></script>
 *
 * POR QUÉ SHADOW DOM: el widget se monta dentro de un Shadow Root, una caja
 * aislada del resto de la página. Ni los estilos del centro afectan al
 * asistente ni los del asistente afectan a la web del centro. Sin este
 * aislamiento, cualquier CSS agresivo (WordPress, Drupal, plantillas
 * heredadas) puede romper el diseño y no tendríamos forma de evitarlo.
 * =========================================================================
 */

(function () {
  'use strict';

  if (window.__asistenteEscolarCargado) return; // evita dobles inserciones
  window.__asistenteEscolarCargado = true;

  const script = document.currentScript ||
    document.querySelector('script[src*="widget.js"]');

  // Base de la que cuelgan los archivos (style.css, chat.js, JSON...)
  const base = (function () {
    if (!script || !script.src) return '';
    return script.src.replace(/[^/]*$/, '');
  })();

  const servidor = (script && script.getAttribute('data-servidor')) || base.replace(/\/$/, '');
  const posicion = (script && script.getAttribute('data-posicion')) || 'derecha';

  const PLANTILLA = `
    <div class="salesianas-chat-widget" id="salesianas-chat-widget">
      <div class="chat-window" role="dialog" aria-labelledby="chat-title" aria-modal="false">
        <div class="chat-header">
          <div class="chat-header-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12,3L1,9L12,15L21,9L12,3M19,10.66V15.5C19,16.88 15.86,18 12,18C8.14,18 5,16.88 5,15.5V10.66L12,14.5L19,10.66M12,16.5L2,11V15.5C2,17.43 6.5,19 12,19C17.5,19 22,17.43 22,15.5V11L12,16.5Z"/>
            </svg>
          </div>
          <div class="chat-header-info">
            <h3 id="chat-title">Secretaría Virtual</h3>
            <p>
              <span class="status-badge" aria-hidden="true"></span>
              <span id="chat-subtitle">Secretaría y Orientación</span>
            </p>
          </div>
          <div class="chat-header-actions">
            <button type="button" class="chat-header-btn" id="chat-expand-btn" title="Pantalla grande" aria-label="Pantalla grande">
              <svg id="icon-maximize" viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              <svg id="icon-minimize" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" style="display:none;"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z"/></svg>
            </button>
            <button type="button" class="chat-header-btn" id="chat-reset-btn" title="Reiniciar" aria-label="Reiniciar conversación">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></svg>
            </button>
            <button type="button" class="chat-header-btn" id="chat-close-btn" title="Cerrar" aria-label="Cerrar asistente">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
            </button>
          </div>
        </div>

        <div class="chat-banner-warning" role="note">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z"/></svg>
          <span><strong>Asistente automático:</strong> estás hablando con un sistema de inteligencia artificial, no con una persona.</span>
        </div>

        <div class="chat-body" id="chat-body" role="log" aria-live="polite"></div>

        <div class="chat-footer">
          <div class="chat-input-wrapper">
            <input type="text" id="chat-input" class="chat-input" placeholder="Escribe tu consulta..." autocomplete="off" aria-label="Escribe tu consulta">
          </div>
          <button type="button" id="chat-send-btn" class="chat-send-btn" aria-label="Enviar consulta">&#10148;</button>
        </div>

        <div class="chat-aviso-modo" id="chat-aviso-modo" role="status"></div>
        <div class="chat-credits">Asistente escolar</div>
      </div>

      <div class="chat-cue-bubble" id="chat-cue-bubble">¿Tienes alguna duda? 💬</div>

      <button type="button" class="chat-trigger-btn" id="chat-trigger-btn" aria-label="Abrir asistente" title="Abrir asistente">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H5.17L4,17.17V4H20V16Z"/>
        </svg>
      </button>
    </div>
  `;

  function montar() {
    const anfitrion = document.createElement('div');
    anfitrion.id = 'asistente-escolar-anfitrion';
    // El contenedor no ocupa espacio ni intercepta clics: lo hacen sus hijos.
    // NO se usa 'all: initial': además de aislar, deja la tipografía en el
    // serif por defecto del navegador y el widget acaba viéndose con Times.
    // El aislamiento real lo da el Shadow DOM; aquí basta con la posición.
    anfitrion.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483000;';
    document.body.appendChild(anfitrion);

    const raiz = anfitrion.attachShadow({ mode: 'open' });

    // 1. Estilos: se inyectan dentro de la caja aislada
    fetch(base + 'style.css')
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (css) {
        const estilos = document.createElement('style');
        // Dentro de un Shadow Root, :root no existe. Las variables CSS deben
        // declararse sobre :host para que el widget herede su propia paleta.
        // Las propiedades heredables (tipografía, color, interlineado) SÍ
        // atraviesan la frontera del Shadow DOM. Se fijan explícitamente
        // para no heredar las de la web del centro.
        // No se usa 'all: initial' aquí: reiniciaría también el display del
        // host. Basta con fijar las propiedades que de verdad se heredan.
        const base = '\n:host { display: block; font-family: var(--font-body), ' +
                     '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
                     'line-height: 1.5; color: var(--slate-700); font-size: 15px; ' +
                     'letter-spacing: normal; text-transform: none; text-align: left; }\n';
        estilos.textContent = css.replace(/:root\s*\{/g, ':host {') + base;
        raiz.appendChild(estilos);
      })
      .catch(function () {
        console.warn('[asistente] No se ha podido cargar la hoja de estilos.');
      });

    // 2. Marcado del widget
    const contenedor = document.createElement('div');
    contenedor.innerHTML = PLANTILLA;
    raiz.appendChild(contenedor);

    if (posicion === 'izquierda') {
      const w = raiz.querySelector('.salesianas-chat-widget');
      if (w) { w.style.right = 'auto'; w.style.left = '24px'; }
    }

    // 3. Motor del asistente
    if (window.AsistenteEscolar) {
      window.AsistenteEscolar.arrancar({ raiz: raiz, base: base, servidor: servidor });
      return;
    }

    const motor = document.createElement('script');
    motor.src = base + 'chat.js';
    motor.onload = function () {
      if (window.AsistenteEscolar) {
        window.AsistenteEscolar.arrancar({ raiz: raiz, base: base, servidor: servidor });
      }
    };
    motor.onerror = function () {
      console.error('[asistente] No se ha podido cargar el motor del asistente.');
      anfitrion.remove();
    };
    document.head.appendChild(motor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
