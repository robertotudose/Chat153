/**
 * SCHOLAIA - Motor Unificado Frontend
 * Arquitectura Apple Studio (Asistente en vivo a la izquierda + Configurador a la derecha)
 * Validación numérica estricta, reactividad de color y auto-scroll
 */

(function () {
  'use strict';

  // ==================== ESTADO GLOBAL DE LA APLICACIÓN ====================
  const state = {
    schoolName: 'Colegio San Gabriel',
    schoolBadge: 'SG',
    brandColor: '#0284c7',
    brandHover: '#0369a1',
    brandLight: '#f0f9ff',
    brandBorder: '#bae6fd',
    inlineChatMode: 'core', // 'core' | 'lite'
    activeModalTool: 'core-ia',

    // Registros del Panel de Control
    records: [
      {
        id: 'REC-101',
        time: 'Hoy, 10:24',
        name: 'García Morales',
        procedure: 'Visita Guiada',
        stage: 'Infantil (3 a 6 años)',
        phone: '+34 612 345 678',
        email: 'garcia.morales@email.com',
        status: 'Pendiente',
        category: 'visitas',
        notes: 'Familia interesada en jornada de puertas abiertas para 3 años.'
      },
      {
        id: 'REC-102',
        time: 'Hoy, 09:40',
        name: 'López Sánchez',
        procedure: 'Orientación 4º ESO / Bachillerato',
        stage: 'Secundaria (ESO)',
        phone: '+34 654 987 321',
        email: 'lopez.sanchez@email.com',
        status: 'Completado',
        category: 'orientacion',
        notes: 'Consulta sobre itinerarios de Ciencias y Tecnología y salidas universitarias.'
      },
      {
        id: 'REC-103',
        time: 'Ayer, 18:15',
        name: 'Fernández Gómez',
        procedure: 'Alta Comedor Escolar',
        stage: 'Primaria (6 a 12 años)',
        phone: '+34 699 112 233',
        email: 'fernandez.gomez@email.com',
        status: 'Completado',
        category: 'tramites',
        notes: 'Solicitud con dieta especial validada por secretaría.'
      },
      {
        id: 'REC-104',
        time: 'Ayer, 16:30',
        name: 'Martínez Ruiz',
        procedure: 'Información FP Grado Medio',
        stage: 'Formación Profesional',
        phone: '+34 678 445 566',
        email: 'martinez.ruiz@email.com',
        status: 'En trámite',
        category: 'visitas',
        notes: 'Duda sobre el ciclo de Gestión Administrativa Bilingüe y plazas concertadas.'
      }
    ]
  };

  // ==================== CONFIGURADOR DEL CENTRO (APPLE STUDIO) ====================
  function initBrandCustomizer() {
    const nameInput = document.getElementById('custom-school-name');
    const badgeInput = document.getElementById('custom-school-badge');
    const colorDots = document.querySelectorAll('.color-dot');
    const freeColorInput = document.getElementById('custom-color-input');
    const colorWheelPreview = document.getElementById('color-wheel-preview');
    const resetBtn = document.getElementById('btn-reset-customizer');

    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        state.schoolName = e.target.value.trim() || 'Centro Educativo';
        updateBrandUI();
      });
    }

    if (badgeInput) {
      badgeInput.addEventListener('input', (e) => {
        state.schoolBadge = (e.target.value.trim() || 'CE').toUpperCase();
        updateBrandUI();
      });
    }

    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        applyBrandColor(
          dot.dataset.color,
          dot.dataset.hover,
          dot.dataset.light,
          dot.dataset.border
        );
      });
    });

    if (freeColorInput) {
      freeColorInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        colorDots.forEach(d => d.classList.remove('active'));
        if (colorWheelPreview) colorWheelPreview.style.backgroundColor = hex;
        applyBrandColor(hex);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (nameInput) nameInput.value = 'Colegio San Gabriel';
        if (badgeInput) badgeInput.value = 'SG';
        state.schoolName = 'Colegio San Gabriel';
        state.schoolBadge = 'SG';
        colorDots.forEach((d, i) => d.classList.toggle('active', i === 0));
        applyBrandColor('#0284c7', '#0369a1', '#f0f9ff', '#bae6fd');
        updateBrandUI();
        setInlineChatMode('core');
      });
    }
  }

  function applyBrandColor(hex, hover, light, border) {
    state.brandColor = hex;
    state.brandHover = hover || adjustHexBrightness(hex, -20);
    state.brandLight = light || hexToRgba(hex, 0.08);
    state.brandBorder = border || hexToRgba(hex, 0.3);

    document.documentElement.style.setProperty('--school-brand-color', state.brandColor);
    document.documentElement.style.setProperty('--school-brand-hover', state.brandHover);
    document.documentElement.style.setProperty('--school-brand-light', state.brandLight);
    document.documentElement.style.setProperty('--school-brand-border', state.brandBorder);
  }

  function adjustHexBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  function hexToRgba(hex, alpha) {
    let c = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    let num = parseInt(c.join(''), 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  function updateBrandUI() {
    document.querySelectorAll('.school-name-preview').forEach(el => el.textContent = state.schoolName);
    document.querySelectorAll('.school-badge-preview').forEach(el => el.textContent = state.schoolBadge);
  }

  // ==================== ASISTENTE EN VIVO EN EL STUDIO (INLINE CHAT) ====================
  window.setInlineChatMode = function (mode) {
    state.inlineChatMode = mode;
    const btnCore = document.getElementById('btn-mode-core');
    const btnLite = document.getElementById('btn-mode-lite');
    const subTitle = document.getElementById('inline-model-subtitle');
    const inputBar = document.getElementById('inline-input-bar-container');

    if (btnCore) {
      btnCore.classList.toggle('active', mode === 'core');
      btnCore.classList.toggle('is-active', mode === 'core');
      const check = btnCore.querySelector('span:last-child');
      if (check) check.textContent = mode === 'core' ? '✓' : '';
    }
    if (btnLite) {
      btnLite.classList.toggle('active', mode === 'lite');
      btnLite.classList.toggle('is-active', mode === 'lite');
      const check = btnLite.querySelector('span:last-child');
      if (check) check.textContent = mode === 'lite' ? '✓' : '';
    }

    if (subTitle) {
      subTitle.innerHTML = `<span class="signal-dot"></span> SCHOLAIA ${mode === 'core' ? 'Core' : 'Lite'}`;
    }

    if (inputBar) {
      inputBar.style.display = mode === 'core' ? 'flex' : 'none';
    }

    renderInlineChatContent();
  };

  function initInlineChat() {
    const form = document.getElementById('inline-chat-form');
    const input = document.getElementById('inline-user-input');

    if (input) {
      input.addEventListener('focus', () => {
        scrollChatToBottom('inline-chat-feed');
      });
      input.addEventListener('input', () => {
        scrollChatToBottom('inline-chat-feed');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        handleInlineUserMessage(text);
      });
    }
    renderInlineChatContent();
  }

  function renderInlineChatContent() {
    const feed = document.getElementById('inline-feed-inner');
    if (!feed) return;

    if (state.inlineChatMode === 'core') {
      feed.innerHTML = `
        <div class="demo-bubble bot">
          👋 ¡Hola! Te damos la bienvenida a la secretaría virtual de <strong>${state.schoolName}</strong>.<br><br>
          Puedo resolver tus dudas sobre admisiones, comedor y etapas escolares, o ayudarte a concertar una visita con Dirección.<br><br>
          ¿Qué información necesitas hoy?
        </div>
        <div class="demo-options-list">
          <button type="button" class="demo-opt-btn" onclick="triggerInlineAction('visita')">🏫 Concertar una visita guiada para conocer el centro &rarr;</button>
          <button type="button" class="demo-opt-btn" onclick="triggerInlineAction('comedor')">🍲 Menú y funcionamiento del comedor escolar &rarr;</button>
          <button type="button" class="demo-opt-btn" onclick="triggerInlineAction('orientacion')">🎓 Salidas académicas de 4º de ESO y Bachillerato &rarr;</button>
          <button type="button" class="demo-opt-btn" onclick="triggerInlineAction('horarios')">⏰ Horarios lectivos y secretaría &rarr;</button>
        </div>
      `;
    } else {
      feed.innerHTML = `
        <div class="demo-bubble bot">
          👋 ¡Hola! Te damos la bienvenida a la secretaría virtual de <strong>${state.schoolName}</strong>.<br><br>
          Selecciona una etapa o servicio para consultar su información oficial:
        </div>
        <div class="demo-options-list">
          <button type="button" class="demo-opt-btn" onclick="navigateInlineConcierge('admisiones')">🏫 Buscamos plaza (Admisiones y Visitas) &rarr;</button>
          <button type="button" class="demo-opt-btn" onclick="navigateInlineConcierge('etapas')">🎒 Ya somos familia del centro (Infantil a FP) &rarr;</button>
          <button type="button" class="demo-opt-btn" onclick="navigateInlineConcierge('comedor')">🍲 Comedor, Horarios y Secretaría &rarr;</button>
        </div>
      `;
    }
    scrollChatToBottom('inline-chat-feed');
  }

  window.triggerInlineAction = function (action) {
    if (action === 'visita') {
      appendUserBubble('inline-feed-inner', 'Quiero concertar una visita guiada para conocer el colegio.');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `¡Estaremos encantados de recibiros en <strong>${state.schoolName}</strong>! Completa este breve formulario oficial para que Dirección organice vuestra visita:`);
        renderStructuredVisitForm('inline-feed-inner');
      }, 350);
    } else if (action === 'comedor') {
      appendUserBubble('inline-feed-inner', '¿Cómo funciona el comedor escolar y quién prepara la comida?');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `En <strong>${state.schoolName}</strong> disponemos de <strong>cocina propia</strong> y menús diarios supervisados por nutricionistas, adaptados a cualquier tipo de intolerancia o celiaquía. El horario de comedor es de 12:30 a 15:30 h.`);
        scrollChatToBottom('inline-chat-feed');
      }, 350);
    } else if (action === 'orientacion') {
      appendUserBubble('inline-feed-inner', '¿Qué opciones académicas se ofrecen tras terminar 4º de ESO?');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `Al finalizar 4º de ESO los alumnos pueden optar por:<br><br>1) <strong>Bachillerato:</strong> Ciencias y Tecnología, y Humanidades y Ciencias Sociales con preparación intensiva para la EVAU.<br>2) <strong>Formación Profesional de Grado Medio:</strong> Formación técnica con prácticas en empresa (Dual / FCT).`);
        scrollChatToBottom('inline-chat-feed');
      }, 350);
    } else if (action === 'horarios') {
      appendUserBubble('inline-feed-inner', '¿Cuál es el horario del colegio y de secretaría?');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `📅 <strong>Horarios de ${state.schoolName}:</strong><br>• <strong>Jornada escolar:</strong> De 09:00 a 14:00 h (y tardes según etapa).<br>• <strong>Aula matinal / madrugadores:</strong> Desde las 07:30 h.<br>• <strong>Secretaría:</strong> Lunes a viernes de 09:00 a 14:00 h y tardes de 16:00 a 18:00 h.`);
        scrollChatToBottom('inline-chat-feed');
      }, 350);
    }
  };

  window.triggerInlineShortcut = function (type) {
    if (type === 'visitas' || type === 'admisiones') {
      window.triggerInlineAction('visita');
    } else if (type === 'comedor') {
      window.triggerInlineAction('comedor');
    } else if (type === 'horarios') {
      window.triggerInlineAction('horarios');
    }
  };

  function handleInlineUserMessage(text) {
    appendUserBubble('inline-feed-inner', text);
    scrollChatToBottom('inline-chat-feed');
    const lower = text.toLowerCase();

    setTimeout(() => {
      if (lower.includes('visita') || lower.includes('cita') || lower.includes('conocer') || lower.includes('puertas abiertas') || lower.includes('matricula') || lower.includes('plaza')) {
        appendBotBubble('inline-feed-inner', `¡Con mucho gusto! En <strong>${state.schoolName}</strong> organizamos visitas personalizadas para mostrar las aulas y el proyecto educativo. Por favor, indícanos tus datos:`);
        renderStructuredVisitForm('inline-feed-inner');
      } else if (lower.includes('comedor') || lower.includes('menu') || lower.includes('alergia') || lower.includes('celia')) {
        appendBotBubble('inline-feed-inner', `El comedor escolar de <strong>${state.schoolName}</strong> cuenta con cocina propia y menús supervisados por nutricionistas adaptados a celiaquía y alergias.`);
      } else if (lower.includes('4 eso') || lower.includes('bachillerato') || lower.includes('fp') || lower.includes('orientacion') || lower.includes('grado medio')) {
        appendBotBubble('inline-feed-inner', `En Secundaria y Bachillerato disponemos de itinerarios en Ciencias y Humanidades-CCSS, además de ciclos de Formación Profesional con prácticas en empresas.`);
      } else {
        appendBotBubble('inline-feed-inner', `Entendido. Como asistente de <strong>${state.schoolName}</strong> puedo resolver consultas de secretaría, horarios, comedor o coordinar visitas con Dirección.<br><br>¿Deseas concertar una visita guiada o prefieres consultar información de alguna etapa en concreto?`);
      }
      scrollChatToBottom('inline-chat-feed');
    }, 400);
  }

  window.navigateInlineConcierge = function (node) {
    const feed = document.getElementById('inline-feed-inner');
    if (!feed) return;

    if (node === 'admisiones') {
      appendUserBubble('inline-feed-inner', '🏫 Buscamos plaza (Admisiones y Visitas)');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `Las <strong>Jornadas de Puertas Abiertas</strong> y entrevistas individuales se coordinan con el equipo directivo. Puedes solicitar una visita rellenando este formulario:`);
        renderStructuredVisitForm('inline-feed-inner');
        appendInlineConciergeOptions([
          { text: '⬅️ Volver al menú principal', action: () => renderInlineChatContent(), isBack: true }
        ]);
      }, 300);
    } else if (node === 'etapas') {
      appendUserBubble('inline-feed-inner', '🎒 Etapas Educativas');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `Selecciona la etapa educativa del alumno para ver sus trámites específicos:`);
        appendInlineConciergeOptions([
          { text: '🧸 Educación Infantil (3 a 6 años)', action: () => showInlineStageInfo('Infantil', 'Comedor con siesta asistida, aula matinal de madrugadores y justificación de faltas.') },
          { text: '📚 Educación Primaria (6 a 12 años)', action: () => showInlineStageInfo('Primaria', 'Comedor con estudio dirigido, banco de libros y salidas pedagógicas.') },
          { text: '🎓 Educación Secundaria (ESO)', action: () => showInlineStageInfo('ESO', 'Jornada matinal continua (08:30 a 14:30 h), tutorías y orientación académica.') },
          { text: '🏛️ Bachillerato', action: () => showInlineStageInfo('Bachillerato', 'Modalidades de Ciencias y Humanidades-CCSS con preparación para la EVAU.') },
          { text: '💼 Formación Profesional', action: () => showInlineStageInfo('FP', 'Ciclos Formativos de Grado Medio con prácticas en empresa (FCT / Dual).') },
          { text: '⬅️ Volver al menú principal', action: () => renderInlineChatContent(), isBack: true }
        ]);
      }, 300);
    } else if (node === 'comedor') {
      appendUserBubble('inline-feed-inner', '🍲 Comedor, Horarios y Secretaría');
      scrollChatToBottom('inline-chat-feed');
      setTimeout(() => {
        appendBotBubble('inline-feed-inner', `<strong>Servicios Generales de ${state.schoolName}:</strong><br>• <strong>Comedor escolar:</strong> Cocina propia y dietas adaptadas de 12:30 a 15:30 h.<br>• <strong>Secretaría:</strong> De 09:00 a 14:00 h y de 16:00 a 18:00 h.`);
        appendInlineConciergeOptions([
          { text: '⬅️ Volver al menú principal', action: () => renderInlineChatContent(), isBack: true }
        ]);
      }, 300);
    }
  };

  function showInlineStageInfo(stageName, details) {
    appendUserBubble('inline-feed-inner', stageName);
    scrollChatToBottom('inline-chat-feed');
    setTimeout(() => {
      appendBotBubble('inline-feed-inner', `<strong>${stageName} · ${state.schoolName}</strong><br>${details}`);
      appendInlineConciergeOptions([
        { text: '📝 Solicitar visita para esta etapa', action: () => renderStructuredVisitForm('inline-feed-inner') },
        { text: '⬅️ Volver a etapas', action: () => navigateInlineConcierge('etapas'), isBack: true }
      ]);
    }, 300);
  }

  function appendInlineConciergeOptions(options) {
    const feed = document.getElementById('inline-feed-inner');
    if (!feed) return;

    const optList = document.createElement('div');
    optList.className = 'demo-options-list';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `demo-opt-btn ${opt.isBack ? 'back-btn' : ''}`;
      btn.textContent = opt.text;
      btn.onclick = opt.action;
      optList.appendChild(btn);
    });
    feed.appendChild(optList);
    scrollChatToBottom('inline-chat-feed');
  }

  // ==================== FORMULARIO ESTRUCTURADO EXACTO (DEL CHATBOT ORIGINAL) ====================
  function renderStructuredVisitForm(containerId) {
    const feed = document.getElementById(containerId);
    if (!feed) return;

    const formId = `form-visita-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const formCard = document.createElement('div');
    formCard.className = 'chat-form-card';
    formCard.innerHTML = `
      <h4>📝 Solicitud de Información / Visita</h4>
      <p class="chat-form-subtitle">Rellena los datos oficiales para concertar una visita o solicitar información:</p>
      
      <div class="chat-form-alert">
        <span>ℹ️</span>
        <span>Asistente Oficial: Secretaría Virtual y Gestión Escolar para Familias.</span>
      </div>

      <form id="${formId}" novalidate>
        
        <!-- Nombre y Apellidos -->
        <div class="chat-form-group">
          <label>Nombre y Apellidos *</label>
          <input type="text" name="family_name" class="chat-form-input letters-only-input" required placeholder="Ej: Familia García Martínez" autocomplete="name">
          <div class="chat-form-error err-name">⚠️ Por favor, introduce un nombre y apellidos válidos.</div>
        </div>

        <!-- Teléfono con Selector de Prefijo Internacional y Bloqueo Estricto de Letras -->
        <div class="chat-form-group">
          <label>Teléfono de Contacto *</label>
          <div class="chat-phone-group">
            <select name="prefix" class="chat-prefix-select" aria-label="Prefijo de país">
              <option value="+34" selected>🇪🇸 +34</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+40">🇷🇴 +40</option>
              <option value="+212">🇲🇦 +212</option>
              <option value="+57">🇨🇴 +57</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+1">🇺🇸 +1</option>
            </select>
            <input type="tel" name="phone" class="chat-form-input phone-strict-input" required placeholder="612 345 678" inputmode="numeric" autocomplete="tel">
          </div>
          <div class="chat-form-error err-phone">⚠️ Introduce un número de teléfono válido (solo dígitos).</div>
        </div>

        <!-- Correo Electrónico -->
        <div class="chat-form-group">
          <label>Correo Electrónico *</label>
          <input type="email" name="email" class="chat-form-input" required placeholder="usuario@dominio.com" autocomplete="email">
          <div class="chat-form-error err-email">⚠️ Introduce un correo electrónico real con formato usuario@dominio.com</div>
        </div>

        <!-- Etapa Educativa de Interés -->
        <div class="chat-form-group">
          <label>Etapa Educativa de Interés *</label>
          <select name="stage" class="chat-form-select" required>
            <option value="">Selecciona etapa educativa...</option>
            <option value="Educación Infantil (3 a 6 años)">Educación Infantil (3 a 6 años)</option>
            <option value="Educación Primaria (6 a 12 años)">Educación Primaria (6 a 12 años)</option>
            <option value="Educación Secundaria (ESO)">Educación Secundaria (ESO)</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Formación Profesional (FP)">Formación Profesional (FP)</option>
          </select>
          <div class="chat-form-error err-stage">⚠️ Por favor, selecciona una etapa educativa.</div>
        </div>

        <!-- Comentarios Adicionales -->
        <div class="chat-form-group">
          <label>Comentarios adicionales o dudas (opcional)</label>
          <textarea name="comments" class="chat-form-textarea" placeholder="¿Deseas hacernos alguna consulta previa?"></textarea>
        </div>

        <button type="submit" class="chat-form-btn-submit" style="background-color: var(--school-brand-color);">Enviar Solicitud a Secretaría</button>
      </form>

      <div class="chat-form-footer">
        Secretaría Digital · ${state.schoolName} · RGPD Protegido
      </div>
    `;

    feed.appendChild(formCard);
    scrollChatToBottom(containerId.replace('-inner', ''));

    initStrictInputMasks();

    const formElement = document.getElementById(formId);
    if (!formElement) return;

    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      handleStrictFormSubmit(formElement, formCard);
    });
  }

  function handleStrictFormSubmit(form, card) {
    const nameInput = form.family_name;
    const phoneInput = form.phone;
    const prefixSelect = form.prefix;
    const emailInput = form.email;
    const stageSelect = form.stage;
    const commentsInput = form.comments;

    const errName = form.querySelector('.err-name');
    const errPhone = form.querySelector('.err-phone');
    const errEmail = form.querySelector('.err-email');
    const errStage = form.querySelector('.err-stage');

    let isValid = true;

    // 1. Validar Nombre
    if (!isValidName(nameInput.value)) {
      nameInput.classList.add('is-invalid');
      errName.classList.add('visible');
      isValid = false;
    } else {
      nameInput.classList.remove('is-invalid');
      errName.classList.remove('visible');
    }

    // 2. Validar Teléfono
    if (!isValidPhone(phoneInput.value, prefixSelect.value)) {
      phoneInput.classList.add('is-invalid');
      errPhone.classList.add('visible');
      isValid = false;
    } else {
      phoneInput.classList.remove('is-invalid');
      errPhone.classList.remove('visible');
    }

    // 3. Validar Email
    if (!isValidEmail(emailInput.value)) {
      emailInput.classList.add('is-invalid');
      errEmail.classList.add('visible');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      errEmail.classList.remove('visible');
    }

    // 4. Validar Etapa
    if (!stageSelect.value) {
      stageSelect.classList.add('is-invalid');
      errStage.classList.add('visible');
      isValid = false;
    } else {
      stageSelect.classList.remove('is-invalid');
      errStage.classList.remove('visible');
    }

    if (!isValid) return;

    const fullPhone = `${prefixSelect.value} ${phoneInput.value.trim()}`;
    const familyName = nameInput.value.trim();
    const stageName = stageSelect.value;
    const emailVal = emailInput.value.trim();
    const notesVal = commentsInput.value.trim() || 'Solicitud de visita recibida desde el asistente digital.';

    state.records.unshift({
      id: `REC-${Date.now().toString().slice(-3)}`,
      time: 'Ahora mismo',
      name: familyName,
      procedure: 'Visita Guiada (Chatbot)',
      stage: stageName,
      phone: fullPhone,
      email: emailVal,
      status: 'Pendiente',
      category: 'visitas',
      notes: notesVal
    });

    card.innerHTML = `
      <div style="padding: 18px; text-align: center; color: var(--white);">
        <div style="font-size: 26px; color: #34d399; margin-bottom: 6px;">✓</div>
        <h4 style="font-size: 15px; color: var(--white); margin-bottom: 6px; font-weight: 700;">¡Solicitud Registrada con Éxito!</h4>
        <p style="font-size: 13px; color: var(--slate-300); margin-bottom: 10px;">
          Gracias, <strong>${familyName}</strong>. El equipo de admisiones de <strong>${state.schoolName}</strong> contactará al teléfono <strong>${fullPhone}</strong>.
        </p>
        <span style="font-size: 11px; color: var(--mist);">Copia de confirmación enviada a ${emailVal}</span>
      </div>
    `;
    scrollChatToBottom('inline-chat-feed');
  }

  // ==================== MÁSCARAS Y BLOQUEO DE TECLADO ESTRICTO ====================
  function initStrictInputMasks() {
    // 1. Inputs de teléfono: Solo números
    document.querySelectorAll('.phone-strict-input, #demo-telefono').forEach(input => {
      input.removeEventListener('keydown', handlePhoneKeydown);
      input.removeEventListener('input', handlePhoneInput);
      input.addEventListener('keydown', handlePhoneKeydown);
      input.addEventListener('input', handlePhoneInput);
    });

    // 2. Inputs de nombres: Solo letras y espacios
    document.querySelectorAll('.letters-only-input, #demo-nombre').forEach(input => {
      input.removeEventListener('keydown', handleLettersKeydown);
      input.removeEventListener('input', handleLettersInput);
      input.addEventListener('keydown', handleLettersKeydown);
      input.addEventListener('input', handleLettersInput);
    });
  }

  function handlePhoneKeydown(e) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '+', '-', ' '];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePhoneInput(e) {
    e.target.value = e.target.value.replace(/[^0-9+\s-]/g, '');
  }

  function handleLettersKeydown(e) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', ' ', "'", '-'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handleLettersInput(e) {
    e.target.value = e.target.value.replace(/[0-9]/g, '');
  }

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(String(email).trim());
  }

  function isValidPhone(phone, prefix) {
    const clean = String(phone).replace(/\D/g, '');
    if (prefix === '+34') {
      return /^[6789]\d{8}$/.test(clean);
    }
    return clean.length >= 8 && clean.length <= 14;
  }

  function isValidName(name) {
    const trimmed = String(name).trim();
    return trimmed.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed);
  }

  // ==================== MODAL DE PANTALLA COMPLETA ====================
  window.openFullscreenModal = function (toolType) {
    state.activeModalTool = toolType || 'core-ia';
    const modal = document.getElementById('fullscreen-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateModalSwitcherTabs();
    renderActiveModalTool();
  };

  window.closeFullscreenModal = function () {
    const modal = document.getElementById('fullscreen-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.switchModalTool = function (toolType) {
    state.activeModalTool = toolType;
    updateModalSwitcherTabs();
    renderActiveModalTool();
  };

  function updateModalSwitcherTabs() {
    const tabCore = document.getElementById('modal-tab-core-ia');
    const tabConcierge = document.getElementById('modal-tab-concierge');
    const tabControl = document.getElementById('modal-tab-control');
    const modalContainer = document.getElementById('modal-window-container');

    if (tabCore) tabCore.classList.toggle('active', state.activeModalTool === 'core-ia');
    if (tabConcierge) tabConcierge.classList.toggle('active', state.activeModalTool === 'concierge');
    if (tabControl) tabControl.classList.toggle('active', state.activeModalTool === 'control');

    if (modalContainer) {
      modalContainer.classList.toggle('wide-mode', state.activeModalTool === 'control');
    }
  }

  function renderActiveModalTool() {
    const container = document.getElementById('modal-interactive-body');
    if (!container) return;

    if (state.activeModalTool === 'core-ia') {
      renderCoreIaInModal(container);
    } else if (state.activeModalTool === 'concierge') {
      renderConciergeInModal(container);
    } else if (state.activeModalTool === 'control') {
      renderDashboardInModal(container);
    }
  }

  function renderCoreIaInModal(container) {
    container.innerHTML = `
      <div class="interactive-chat-container">
        <div class="chat-demo-header-sub">
          <div class="chat-status-indicator">
            <span class="chat-status-dot"></span>
            <span><strong>SCHOLAIA Core</strong> · Asistente Conversacional</span>
          </div>
          <button type="button" class="chat-demo-reset-btn" id="btn-core-ia-reset">Reiniciar</button>
        </div>

        <div class="chat-feed-scroll" id="core-ia-feed">
          <div class="chat-feed-wrapper" id="core-ia-feed-inner">
            <!-- Mensajes -->
          </div>
        </div>

        <div class="chat-demo-input-bar">
          <form class="chat-input-inner" id="core-ia-input-form">
            <input type="text" id="core-ia-user-input" placeholder="Pregunta sobre admisiones, comedor, horarios o pide una visita..." autocomplete="off">
            <button type="submit" style="background-color: var(--school-brand-color);">Enviar</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-core-ia-reset').addEventListener('click', () => {
      initCoreIaWelcome();
    });

    document.getElementById('core-ia-input-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('core-ia-user-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      handleModalCoreIaMessage(text);
    });

    initCoreIaWelcome();
  }

  function initCoreIaWelcome() {
    const feed = document.getElementById('core-ia-feed-inner');
    if (!feed) return;

    feed.innerHTML = `
      <div class="demo-bubble bot">
        👋 ¡Hola! Te damos la bienvenida a la secretaría virtual de <strong>${state.schoolName}</strong>.<br><br>
        Puedo resolver tus dudas sobre admisiones, comedor y etapas escolares, o ayudarte a concertar una visita con Dirección.<br><br>
        ¿Qué información necesitas hoy?
      </div>
      <div class="demo-options-list">
        <button type="button" class="demo-opt-btn" onclick="triggerModalCoreAction('visita')">🏫 Concertar una visita guiada para conocer el centro &rarr;</button>
        <button type="button" class="demo-opt-btn" onclick="triggerModalCoreAction('comedor')">🍲 Menú y funcionamiento del comedor escolar &rarr;</button>
        <button type="button" class="demo-opt-btn" onclick="triggerModalCoreAction('orientacion')">🎓 Salidas académicas de 4º de ESO y Bachillerato &rarr;</button>
        <button type="button" class="demo-opt-btn" onclick="triggerModalCoreAction('horarios')">⏰ Horarios lectivos y secretaría &rarr;</button>
      </div>
    `;
    scrollChatToBottom('core-ia-feed');
  }

  window.triggerModalCoreAction = function (action) {
    if (action === 'visita') {
      appendUserBubble('core-ia-feed-inner', 'Quiero concertar una visita guiada para conocer el colegio.');
      scrollChatToBottom('core-ia-feed');
      setTimeout(() => {
        appendBotBubble('core-ia-feed-inner', `¡Estaremos encantados de recibiros en <strong>${state.schoolName}</strong>! Completa este breve formulario oficial para coordinar la cita:`);
        renderStructuredVisitForm('core-ia-feed-inner');
      }, 350);
    } else if (action === 'comedor') {
      appendUserBubble('core-ia-feed-inner', '¿Cómo funciona el comedor escolar?');
      scrollChatToBottom('core-ia-feed');
      setTimeout(() => {
        appendBotBubble('core-ia-feed-inner', `En <strong>${state.schoolName}</strong> disponemos de cocina propia y menús diarios supervisados por nutricionistas adaptados a celiaquía e intolerancias.`);
        scrollChatToBottom('core-ia-feed');
      }, 350);
    } else if (action === 'orientacion') {
      appendUserBubble('core-ia-feed-inner', '¿Qué opciones académicas se ofrecen tras terminar 4º de ESO?');
      scrollChatToBottom('core-ia-feed');
      setTimeout(() => {
        appendBotBubble('core-ia-feed-inner', `Ofrecemos modalidades de Bachillerato (Ciencias y Humanidades-CCSS) con preparación para la EVAU y Ciclos de Formación Profesional.`);
        scrollChatToBottom('core-ia-feed');
      }, 350);
    } else if (action === 'horarios') {
      appendUserBubble('core-ia-feed-inner', '¿Cuál es el horario del colegio y de secretaría?');
      scrollChatToBottom('core-ia-feed');
      setTimeout(() => {
        appendBotBubble('core-ia-feed-inner', `📅 <strong>Horarios de ${state.schoolName}:</strong><br>• <strong>Lectivo:</strong> 09:00 a 14:00 h.<br>• <strong>Secretaría:</strong> 09:00 a 14:00 h y 16:00 a 18:00 h.`);
        scrollChatToBottom('core-ia-feed');
      }, 350);
    }
  };

  function handleModalCoreIaMessage(text) {
    appendUserBubble('core-ia-feed-inner', text);
    scrollChatToBottom('core-ia-feed');
    const lower = text.toLowerCase();

    setTimeout(() => {
      if (lower.includes('visita') || lower.includes('cita') || lower.includes('conocer') || lower.includes('matricula')) {
        appendBotBubble('core-ia-feed-inner', `¡Con mucho gusto! En <strong>${state.schoolName}</strong> organizamos visitas personalizadas. Por favor, indícanos tus datos:`);
        renderStructuredVisitForm('core-ia-feed-inner');
      } else {
        appendBotBubble('core-ia-feed-inner', `Entendido. Como asistente de <strong>${state.schoolName}</strong> puedo resolver consultas de secretaría, horarios, comedor o admisiones.`);
      }
      scrollChatToBottom('core-ia-feed');
    }, 400);
  }

  function renderConciergeInModal(container) {
    container.innerHTML = `
      <div class="interactive-chat-container">
        <div class="chat-demo-header-sub">
          <div class="chat-status-indicator">
            <span class="chat-status-dot"></span>
            <span><strong>SCHOLAIA Lite</strong> · Secretaría Guiada por Botones (100% Determinista)</span>
          </div>
          <button type="button" class="chat-demo-reset-btn" id="btn-concierge-modal-reset">Menú inicial</button>
        </div>

        <div class="chat-feed-scroll" id="concierge-modal-feed">
          <div class="chat-feed-wrapper" id="concierge-modal-feed-inner">
            <!-- Renderizado -->
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-concierge-modal-reset').addEventListener('click', () => {
      initConciergeModalTree();
    });

    initConciergeModalTree();
  }

  function initConciergeModalTree() {
    const feed = document.getElementById('concierge-modal-feed-inner');
    if (!feed) return;

    feed.innerHTML = `
      <div class="demo-bubble bot">
        👋 ¡Hola! Te damos la bienvenida a la secretaría virtual de <strong>${state.schoolName}</strong>.<br><br>
        Selecciona la opción que deseas consultar:
      </div>
      <div class="demo-options-list">
        <button type="button" class="demo-opt-btn" onclick="navigateModalConcierge('admisiones')">🏫 Buscamos plaza (Admisiones y Visitas) &rarr;</button>
        <button type="button" class="demo-opt-btn" onclick="navigateModalConcierge('etapas')">🎒 Ya somos familia del centro (Infantil a FP) &rarr;</button>
        <button type="button" class="demo-opt-btn" onclick="navigateModalConcierge('comedor')">🍲 Comedor, Horarios y Secretaría &rarr;</button>
      </div>
    `;
    scrollChatToBottom('concierge-modal-feed');
  }

  window.navigateModalConcierge = function (node) {
    const feed = document.getElementById('concierge-modal-feed-inner');
    if (!feed) return;

    if (node === 'admisiones') {
      appendUserBubble('concierge-modal-feed-inner', '🏫 Buscamos plaza (Admisiones y Visitas)');
      scrollChatToBottom('concierge-modal-feed');
      setTimeout(() => {
        appendBotBubble('concierge-modal-feed-inner', `Las <strong>Jornadas de Puertas Abiertas</strong> y visitas individuales se coordinan con Dirección. Puedes solicitar una visita rellenando este formulario:`);
        renderStructuredVisitForm('concierge-modal-feed-inner');
        appendConciergeModalOptions([
          { text: '⬅️ Volver al menú principal', action: () => initConciergeModalTree(), isBack: true }
        ]);
      }, 300);
    } else if (node === 'etapas') {
      appendUserBubble('concierge-modal-feed-inner', '🎒 Etapas Educativas');
      scrollChatToBottom('concierge-modal-feed');
      setTimeout(() => {
        appendBotBubble('concierge-modal-feed-inner', `Selecciona la etapa educativa del alumno:`);
        appendConciergeModalOptions([
          { text: '🧸 Educación Infantil (3 a 6 años)', action: () => showModalStageInfo('Infantil', 'Comedor con siesta asistida y aula matinal.') },
          { text: '📚 Educación Primaria (6 a 12 años)', action: () => showModalStageInfo('Primaria', 'Comedor con estudio dirigido y banco de libros.') },
          { text: '🎓 Educación Secundaria (ESO)', action: () => showModalStageInfo('ESO', 'Jornada matinal continua y tutorías.') },
          { text: '🏛️ Bachillerato', action: () => showModalStageInfo('Bachillerato', 'Ciencias y Humanidades con preparación para la EVAU.') },
          { text: '💼 Formación Profesional', action: () => showModalStageInfo('FP', 'Ciclos Formativos de Grado Medio con prácticas.') },
          { text: '⬅️ Volver al menú principal', action: () => initConciergeModalTree(), isBack: true }
        ]);
      }, 300);
    } else if (node === 'comedor') {
      appendUserBubble('concierge-modal-feed-inner', '🍲 Comedor, Horarios y Secretaría');
      scrollChatToBottom('concierge-modal-feed');
      setTimeout(() => {
        appendBotBubble('concierge-modal-feed-inner', `<strong>Servicios Generales de ${state.schoolName}:</strong><br>• Comedor escolar: 12:30 a 15:30 h.<br>• Secretaría: 09:00 a 14:00 h y 16:00 a 18:00 h.`);
        appendConciergeModalOptions([
          { text: '⬅️ Volver al menú principal', action: () => initConciergeModalTree(), isBack: true }
        ]);
      }, 300);
    }
  };

  function showModalStageInfo(stageName, details) {
    appendUserBubble('concierge-modal-feed-inner', stageName);
    scrollChatToBottom('concierge-modal-feed');
    setTimeout(() => {
      appendBotBubble('concierge-modal-feed-inner', `<strong>${stageName} · ${state.schoolName}</strong><br>${details}`);
      appendConciergeModalOptions([
        { text: '📝 Solicitar visita para esta etapa', action: () => renderStructuredVisitForm('concierge-modal-feed-inner') },
        { text: '⬅️ Volver a etapas', action: () => navigateModalConcierge('etapas'), isBack: true }
      ]);
    }, 300);
  }

  function appendConciergeModalOptions(options) {
    const feed = document.getElementById('concierge-modal-feed-inner');
    if (!feed) return;

    const optList = document.createElement('div');
    optList.className = 'demo-options-list';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `demo-opt-btn ${opt.isBack ? 'back-btn' : ''}`;
      btn.textContent = opt.text;
      btn.onclick = opt.action;
      optList.appendChild(btn);
    });
    feed.appendChild(optList);
    scrollChatToBottom('concierge-modal-feed');
  }

  // ==================== PANEL DE CONTROL (DASHBOARD) ====================
  function renderDashboardInModal(container) {
    const totalConsultas = state.records.length + 128;
    const totalVisitas = state.records.filter(r => r.category === 'visitas').length + 22;
    const totalOrientacion = state.records.filter(r => r.category === 'orientacion').length + 38;

    container.innerHTML = `
      <div class="dashboard-embedded-view">
        
        <div class="db-top-bar">
          <div class="db-title-group">
            <span class="db-badge school-badge-preview" style="background-color: var(--school-brand-color);">${state.schoolBadge}</span>
            <div>
              <h4 class="school-name-preview">Panel de Control · ${state.schoolName}</h4>
              <small>Recepción centralizada de visitas, trámites y secretaría</small>
            </div>
          </div>
          <input type="text" class="db-search" id="db-search-input" placeholder="🔍 Buscar por nombre, trámite o teléfono...">
        </div>

        <div class="db-kpi-grid">
          <div class="db-kpi-card">
            <span class="db-kpi-num">${totalConsultas}</span>
            <span class="db-kpi-title">Consultas Totales</span>
            <span class="db-kpi-trend">↑ 100% de disponibilidad</span>
          </div>
          <div class="db-kpi-card">
            <span class="db-kpi-num">${totalVisitas}</span>
            <span class="db-kpi-title">Solicitudes de Visita</span>
            <span class="db-kpi-trend" style="color: var(--school-brand-color);">Infantil, Primaria y FP</span>
          </div>
          <div class="db-kpi-card">
            <span class="db-kpi-num">${totalOrientacion}</span>
            <span class="db-kpi-title">Orientación Académica</span>
            <span class="db-kpi-trend" style="color: var(--slate-700);">4º ESO y Bachillerato</span>
          </div>
          <div class="db-kpi-card">
            <span class="db-kpi-num">&lt; 1 min</span>
            <span class="db-kpi-title">Tiempo de Respuesta</span>
            <span class="db-kpi-trend">Sin colas en ventanilla</span>
          </div>
        </div>

        <div class="db-table-card">
          <div class="db-table-header">
            <div class="db-filters-bar">
              <button type="button" class="db-filter-btn active" data-filter="all">Todas (${state.records.length})</button>
              <button type="button" class="db-filter-btn" data-filter="visitas">Visitas & Admisiones</button>
              <button type="button" class="db-filter-btn" data-filter="orientacion">Orientación</button>
              <button type="button" class="db-filter-btn" data-filter="tramites">Trámites</button>
            </div>
            <button type="button" class="db-export-btn" id="db-btn-export-csv">📥 Descargar CSV</button>
          </div>

          <div class="db-table-wrapper">
            <table class="db-table" id="db-records-table">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Familia / Alumno</th>
                  <th>Trámite Solicitado</th>
                  <th>Etapa Educativa</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="db-table-body">
                <!-- Filas renderizadas -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    const searchInput = document.getElementById('db-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderDashboardTable(e.target.value, getActiveDbFilter());
      });
    }

    const filterBtns = document.querySelectorAll('.db-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDashboardTable(searchInput ? searchInput.value : '', btn.dataset.filter);
      });
    });

    const exportBtn = document.getElementById('db-btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportRecordsToCsv);
    }

    renderDashboardTable('', 'all');
  }

  function getActiveDbFilter() {
    const activeBtn = document.querySelector('.db-filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
  }

  function renderDashboardTable(searchQuery = '', filterCategory = 'all') {
    const tbody = document.getElementById('db-table-body');
    if (!tbody) return;

    const query = searchQuery.toLowerCase().trim();
    let filtered = state.records.filter(r => {
      const matchCat = filterCategory === 'all' || r.category === filterCategory;
      const matchQuery = !query || 
        r.name.toLowerCase().includes(query) ||
        r.procedure.toLowerCase().includes(query) ||
        r.stage.toLowerCase().includes(query) ||
        r.phone.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--slate-500); padding: 20px;">No se encontraron solicitudes.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((r) => {
      let statusClass = 'pend';
      if (r.status === 'En trámite') statusClass = 'proc';
      if (r.status === 'Completado') statusClass = 'comp';

      return `
        <tr>
          <td style="color: var(--slate-500);">${r.time}</td>
          <td><strong>${r.name}</strong></td>
          <td>${r.procedure}</td>
          <td>${r.stage}</td>
          <td><code>${r.phone}</code></td>
          <td>
            <span class="status-pill ${statusClass}" onclick="toggleRecordStatus('${r.id}')" title="Clic para alternar estado">${r.status}</span>
          </td>
          <td>
            <button type="button" class="db-action-link" onclick="openRecordDetailModal('${r.id}')">Ver Ficha</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleRecordStatus = function (recordId) {
    const rec = state.records.find(r => r.id === recordId);
    if (!rec) return;

    if (rec.status === 'Pendiente') rec.status = 'En trámite';
    else if (rec.status === 'En trámite') rec.status = 'Completado';
    else rec.status = 'Pendiente';

    const searchInput = document.getElementById('db-search-input');
    renderDashboardTable(searchInput ? searchInput.value : '', getActiveDbFilter());
  };

  window.openRecordDetailModal = function (recordId) {
    const rec = state.records.find(r => r.id === recordId);
    if (!rec) return;

    const drawer = document.createElement('div');
    drawer.className = 'record-drawer-modal';
    drawer.innerHTML = `
      <div class="record-drawer-card">
        <h4>📋 Ficha de Solicitud #${rec.id}</h4>
        <div class="record-info-grid">
          <div><span>Fecha:</span><strong>${rec.time}</strong></div>
          <div><span>Solicitante:</span><strong>${rec.name}</strong></div>
          <div><span>Trámite:</span><strong>${rec.procedure}</strong></div>
          <div><span>Etapa:</span><strong>${rec.stage}</strong></div>
          <div><span>Teléfono:</span><strong>${rec.phone}</strong></div>
          <div><span>Email:</span><strong>${rec.email}</strong></div>
          <div><span>Estado:</span><strong>${rec.status}</strong></div>
          <div style="flex-direction: column; gap: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
            <span>Notas de la gestión:</span>
            <p style="color: var(--slate-300); font-size: 13px;">${rec.notes}</p>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button type="button" class="button-liquid button-liquid--solid" onclick="this.closest('.record-drawer-modal').remove()">Cerrar Ficha</button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  };

  function exportRecordsToCsv() {
    const headers = ['ID', 'Fecha', 'Nombre', 'Tramite', 'Etapa', 'Telefono', 'Email', 'Estado', 'Notas'];
    const rows = state.records.map(r => [
      r.id,
      `"${r.time}"`,
      `"${r.name}"`,
      `"${r.procedure}"`,
      `"${r.stage}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.status}"`,
      `"${r.notes}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SCHOLAIA_Solicitudes_${state.schoolBadge}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==================== HELPERS DE BURBUJAS ====================
  function appendUserBubble(containerId, text) {
    const feed = document.getElementById(containerId);
    if (!feed) return;
    const bubble = document.createElement('div');
    bubble.className = 'demo-bubble user';
    // No fijamos style.backgroundColor inline para que reaccione automáticamente a la variable CSS del tema
    bubble.textContent = text;
    feed.appendChild(bubble);
  }

  function appendBotBubble(containerId, html) {
    const feed = document.getElementById(containerId);
    if (!feed) return;
    const bubble = document.createElement('div');
    bubble.className = 'demo-bubble bot';
    bubble.innerHTML = html;
    feed.appendChild(bubble);
  }

  function scrollChatToBottom(scrollId) {
    const el = document.getElementById(scrollId);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 150);
    }
  }

  // ==================== FORMULARIO DE DEMO OFICIAL EN LA LANDING ====================
  function initLandingDemoForm() {
    const form = document.getElementById('scholaia-demo-form');
    const feedback = document.getElementById('demo-form-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('demo-nombre');
      const cargo = document.getElementById('demo-cargo');
      const centro = document.getElementById('demo-centro');
      const email = document.getElementById('demo-email');
      const telefono = document.getElementById('demo-telefono');

      const errNombre = document.getElementById('err-demo-nombre');
      const errCargo = document.getElementById('err-demo-cargo');
      const errCentro = document.getElementById('err-demo-centro');
      const errEmail = document.getElementById('err-demo-email');
      const errTelefono = document.getElementById('err-demo-telefono');

      let isValid = true;

      // 1. Nombre
      if (!isValidName(nombre.value)) {
        nombre.classList.add('is-invalid');
        if (errNombre) errNombre.classList.add('visible');
        isValid = false;
      } else {
        nombre.classList.remove('is-invalid');
        if (errNombre) errNombre.classList.remove('visible');
      }

      // 2. Cargo
      if (!cargo.value) {
        cargo.classList.add('is-invalid');
        if (errCargo) errCargo.classList.add('visible');
        isValid = false;
      } else {
        cargo.classList.remove('is-invalid');
        if (errCargo) errCargo.classList.remove('visible');
      }

      // 3. Centro
      if (!centro.value.trim()) {
        centro.classList.add('is-invalid');
        if (errCentro) errCentro.classList.add('visible');
        isValid = false;
      } else {
        centro.classList.remove('is-invalid');
        if (errCentro) errCentro.classList.remove('visible');
      }

      // 4. Email
      if (!isValidEmail(email.value)) {
        email.classList.add('is-invalid');
        if (errEmail) errEmail.classList.add('visible');
        isValid = false;
      } else {
        email.classList.remove('is-invalid');
        if (errEmail) errEmail.classList.remove('visible');
      }

      // 5. Teléfono
      const cleanPhone = telefono.value.replace(/\D/g, '');
      if (cleanPhone.length !== 9) {
        telefono.classList.add('is-invalid');
        if (errTelefono) errTelefono.classList.add('visible');
        isValid = false;
      } else {
        telefono.classList.remove('is-invalid');
        if (errTelefono) errTelefono.classList.remove('visible');
      }

      if (!isValid) return;

      feedback.className = 'form-feedback success';
      feedback.innerHTML = `✓ ¡Muchas gracias, <strong>${nombre.value}</strong>! Hemos preparado la solicitud de demostración para <strong>${centro.value}</strong>. Nos pondremos en contacto contigo al teléfono <strong>${telefono.value}</strong> en menos de 24 horas.`;
      form.reset();
    });
  }

  // ==================== FONDO DINÁMICO & SPOTLIGHT INTERACTIVO ====================
  function initAmbientDynamicLighting() {
    const spotlight = document.getElementById('spotlight-beam');
    const orb1 = document.getElementById('orb-1');
    const orb2 = document.getElementById('orb-2');
    const orb3 = document.getElementById('orb-3');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 3;
    let targetX = mouseX;
    let targetY = mouseY;
    let currentX = mouseX;
    let currentY = mouseY;
    let isTicking = false;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isTicking) {
        requestAnimationFrame(updateLighting);
        isTicking = true;
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        requestAnimationFrame(updateLighting);
        isTicking = true;
      }
    }, { passive: true });

    function updateLighting() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      const scrollY = window.scrollY || window.pageYOffset;
      const xPercent = (currentX / window.innerWidth) - 0.5;
      const yOffset = (currentY * 0.15) + (scrollY * 0.08);

      if (spotlight) {
        spotlight.style.transform = `translateX(calc(-50% + ${xPercent * 70}px)) translateY(${yOffset * 0.35}px)`;
      }
      if (orb1) {
        orb1.style.transform = `translate(${xPercent * -35}px, ${scrollY * -0.04}px)`;
      }
      if (orb2) {
        orb2.style.transform = `translate(${xPercent * 45}px, ${scrollY * 0.03}px)`;
      }
      if (orb3) {
        orb3.style.transform = `translate(${xPercent * -25}px, ${scrollY * -0.02}px)`;
      }

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        requestAnimationFrame(updateLighting);
      } else {
        isTicking = false;
      }
    }
  }

  // Tecla Escape para cerrar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeFullscreenModal();
      const drawer = document.querySelector('.record-drawer-modal');
      if (drawer) drawer.remove();
    }
  });

  // Inicialización general en DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientDynamicLighting();
    initBrandCustomizer();
    initInlineChat();
    initStrictInputMasks();
    initLandingDemoForm();
    updateBrandUI();
  });

})();
