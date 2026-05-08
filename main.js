/* ================================================================
   BROKERCOMPASS — main.js (SPA)
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================================
     1. SPA ROUTER
     ================================================================ */
  const pageTitles = {
    inicio:      'BrokerCompass | Mejor Broker para Invertir en España 2026',
    comparativa: 'Comparativa de Brokers en España 2026 | BrokerCompass',
    guias:       'Guías de Inversión en España | BrokerCompass',
    faq:         'Preguntas Frecuentes sobre Brokers | BrokerCompass',
    contacto:    'Contacto | BrokerCompass',
    legal:       'Información Legal | BrokerCompass'
  };
  const validPages = Object.keys(pageTitles);
  let counterTriggered = false;

  function showPage(id, section) {
    if (!validPages.includes(id)) id = 'inicio';

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');

    document.title = pageTitles[id];
    history.pushState({ page: id, section: section || null }, '', '#' + id);
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateNavActive(id);
    triggerPageAnimations(target);

    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }

    if (id === 'inicio' && !counterTriggered) {
      counterTriggered = true;
      animateCounters();
    }

    // Cerrar menú móvil si está abierto
    const ham = document.getElementById('ham');
    const mobMenu = document.getElementById('mobMenu');
    if (ham && mobMenu) {
      ham.classList.remove('open');
      mobMenu.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    }
  }

  /* Toast de notificación */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function updateNavActive(id) {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.classList.toggle('nav-act', link.dataset.page === id);
    });
  }

  function triggerPageAnimations(page) {
    const els = page.querySelectorAll('.fi:not(.visible)');
    els.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 30 + i * 40);
    });
  }

  // Capturar clicks en cualquier [data-page]
  document.addEventListener('click', e => {
    // Guías — abrir modal con contenido completo
    const guideBtn = e.target.closest('.guide-modal-btn');
    if (guideBtn) {
      e.preventDefault();
      openGuideModal(guideBtn.dataset.guide);
      return;
    }

    const link = e.target.closest('[data-page]');
    if (!link) return;
    e.preventDefault();
    showPage(link.dataset.page, link.dataset.section || null);
  });

  // Navegación back/forward del navegador
  window.addEventListener('popstate', e => {
    const id      = (e.state && e.state.page)    || 'inicio';
    const section = (e.state && e.state.section) || null;
    // Activar sin pushState
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    document.title = pageTitles[id] || pageTitles.inicio;
    updateNavActive(id);
    triggerPageAnimations(target);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
    if (id === 'inicio' && !counterTriggered) {
      counterTriggered = true;
      animateCounters();
    }
  });

  // Cargar página según hash inicial
  const initHash = location.hash.replace('#', '');
  const initPage = validPages.includes(initHash) ? initHash : 'inicio';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const initTarget = document.getElementById(initPage);
  if (initTarget) initTarget.classList.add('active');
  document.title = pageTitles[initPage];
  updateNavActive(initPage);

  // Pequeño retraso para que el layout esté listo antes de animar
  setTimeout(() => {
    if (initTarget) triggerPageAnimations(initTarget);
    if (initPage === 'inicio') {
      counterTriggered = true;
      animateCounters();
    }
  }, 50);

  /* ================================================================
     2. BARRA DE PROGRESO
     ================================================================ */
  const progBar = document.getElementById('progBar');
  if (progBar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const total = document.body.scrollHeight - window.innerHeight;
          progBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ================================================================
     3. NAVBAR BLUR AL SCROLL
     ================================================================ */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ================================================================
     4. HAMBURGER MENU
     ================================================================ */
  const ham = document.getElementById('ham');
  const mobMenu = document.getElementById('mobMenu');
  if (ham && mobMenu) {
    ham.addEventListener('click', () => {
      const isOpen = ham.classList.toggle('open');
      mobMenu.classList.toggle('open', isOpen);
      ham.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ================================================================
     5. BACK TO TOP
     ================================================================ */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     6. COOKIES BANNER
     ================================================================ */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieInfo  = document.getElementById('cookieInfo');

  if (cookieBanner && !localStorage.getItem('bc_cookies')) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
  }
  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      cookieBanner.classList.remove('show');
      localStorage.setItem('bc_cookies', '1');
    });
  }
  if (cookieInfo) {
    cookieInfo.addEventListener('click', e => {
      e.preventDefault();
      showPage('faq');
    });
  }

  /* ================================================================
     7. CONTADOR ANIMADO (stats del hero)
     ================================================================ */
  function animateCounters() {
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = (target >= 1000
          ? (current >= 1000 ? Math.floor(current / 1000) + 'k' : current)
          : current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = (target >= 1000 ? Math.floor(target / 1000) + 'k' : target) + suffix;
      }
      requestAnimationFrame(tick);
    });
  }

  /* ================================================================
     8. FAQ ACORDEÓN (event delegation — funciona en cualquier página)
     ================================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');

    // Cerrar todos los del mismo grupo
    const group = item.closest('.faq-category') || item.parentElement;
    group.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      const b = i.querySelector('.faq-q');
      if (b) b.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  /* ================================================================
     9. FILTROS DE BROKERS (event delegation)
     ================================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    document.querySelectorAll('.broker-card').forEach(card => {
      const levels = card.dataset.levels || '';
      const show = filter === 'all' || levels.includes(filter);

      if (show) {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity .3s ease, transform .3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.transition = 'opacity .2s ease';
        card.style.opacity = '0';
        setTimeout(() => { card.style.display = 'none'; }, 200);
      }
    });
  });

  /* ================================================================
     10. QUIZ
     ================================================================ */
  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    const answers = {};

    const brokerMap = {
      small: {
        beginner: {
          passive: { name: 'MyInvestor',         reason: 'Perfecto para empezar con poco dinero. Sin mínimo, sin comisiones en fondos indexados y muy fácil de usar.' },
          trading: { name: 'eToro',              reason: 'Ideal para iniciarte en el trading con cantidades pequeñas. Interfaz muy intuitiva y función CopyTrading.' },
          pension: { name: 'Finizens',           reason: 'El mejor para complementar tu pensión con poco capital. Desde 50€ y las comisiones más bajas del mercado.' }
        },
        intermediate: {
          passive: { name: 'MyInvestor',         reason: 'Gran variedad de fondos indexados y ETFs sin comisiones. Ideal para estrategias de inversión pasiva.' },
          trading: { name: 'DEGIRO',             reason: 'Comisiones muy bajas para operar en mercados internacionales. Perfecto para traders con experiencia.' },
          pension: { name: 'Finizens',           reason: 'Gestión automática y eficiente de tu plan de pensiones con costes mínimos.' }
        },
        advanced: {
          passive: { name: 'DEGIRO',             reason: 'Acceso a miles de ETFs globales con comisiones mínimas. Ideal para carteras bien diversificadas.' },
          trading: { name: 'Interactive Brokers',reason: 'La plataforma más completa para traders avanzados con acceso a todos los mercados globales.' },
          pension: { name: 'Indexa Capital',     reason: 'Roboadvisor con excelente rentabilidad ajustada al riesgo para objetivos a largo plazo.' }
        }
      },
      medium: {
        beginner: {
          passive: { name: 'Indexa Capital',     reason: 'Con 1.000€ puedes acceder a Indexa Capital: gestión automática, diversificada y de bajo coste.' },
          trading: { name: 'eToro',              reason: 'Plataforma intuitiva con CopyTrading para aprender copiando a los mejores inversores.' },
          pension: { name: 'Finizens',           reason: 'Gestión pasiva automatizada con las comisiones más bajas. Perfecto para planes a largo plazo.' }
        },
        intermediate: {
          passive: { name: 'Indexa Capital',     reason: 'El mejor roboadvisor para carteras a largo plazo. Gestión automática con rentabilidades excelentes.' },
          trading: { name: 'DEGIRO',             reason: 'Comisiones imbatibles para operar en bolsa internacional. La elección de traders experimentados.' },
          pension: { name: 'Indexa Capital',     reason: 'Planes de pensiones indexados con mínimas comisiones y excelente historial de rentabilidad.' }
        },
        advanced: {
          passive: { name: 'DEGIRO',             reason: 'Amplia selección de ETFs globales con costes reducidos. Ideal para quien gestiona su propia cartera.' },
          trading: { name: 'Interactive Brokers',reason: 'Herramientas avanzadas, todos los mercados y comisiones competitivas para traders profesionales.' },
          pension: { name: 'Indexa Capital',     reason: 'Gestión eficiente con fondos Vanguard y Dimensional de bajo coste.' }
        }
      },
      large: {
        beginner: {
          passive: { name: 'Indexa Capital',     reason: 'Para grandes importes, Indexa Capital ofrece la mejor gestión automatizada con costes decrecientes.' },
          trading: { name: 'MyInvestor',         reason: 'Gran plataforma con amplia variedad de activos. Empieza a invertir con seguridad.' },
          pension: { name: 'Indexa Capital',     reason: 'Para grandes patrimonios, Indexa Capital reduce sus comisiones progresivamente.' }
        },
        intermediate: {
          passive: { name: 'Indexa Capital',     reason: 'Para importes mayores de 10.000€, Indexa Capital reduce aún más sus comisiones.' },
          trading: { name: 'Interactive Brokers',reason: 'Con grandes capitales, IB ofrece las mejores condiciones y acceso a todos los mercados.' },
          pension: { name: 'Finizens',           reason: 'El roboadvisor con las comisiones más bajas del mercado para grandes patrimonios.' }
        },
        advanced: {
          passive: { name: 'Interactive Brokers',reason: 'La plataforma más completa para gestionar grandes carteras con acceso a todos los activos globales.' },
          trading: { name: 'Interactive Brokers',reason: 'La elección profesional: todos los mercados, todas las herramientas, comisiones institucionales.' },
          pension: { name: 'Indexa Capital',     reason: 'Gestión con fondos de clase institucional y comisiones mínimas para grandes importes.' }
        }
      }
    };

    const steps = quizCard.querySelectorAll('.quiz-step');

    function quizShowStep(idx) {
      steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    }

    function quizShowResult() {
      const amount = answers[1] || 'small';
      const exp    = answers[2] || 'beginner';
      const obj    = answers[3] || 'passive';
      const result = brokerMap[amount]?.[exp]?.[obj]
        || { name: 'MyInvestor', reason: 'Una excelente opción para la mayoría de inversores españoles.' };

      const nameEl   = document.getElementById('quizBrokerName');
      const reasonEl = document.getElementById('quizBrokerReason');
      if (nameEl)   nameEl.textContent   = result.name;
      if (reasonEl) reasonEl.textContent = result.reason;
      quizShowStep(steps.length - 1); // último paso = resultado
    }

    quizCard.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', function () {
        const q   = parseInt(this.dataset.q, 10);
        const val = this.dataset.val;
        answers[q] = val;
        this.closest('.quiz-step').querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        setTimeout(() => {
          if (q < 3) quizShowStep(q);
          else quizShowResult();
        }, 300);
      });
    });

    const quizRestart = document.getElementById('quizRestart');
    if (quizRestart) {
      quizRestart.addEventListener('click', () => {
        Object.keys(answers).forEach(k => delete answers[k]);
        quizCard.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
        quizShowStep(0);
      });
    }

    quizShowStep(0);
  }

  /* ================================================================
     11. NEWSLETTER (todos los formularios de suscripción)
     ================================================================ */
  document.querySelectorAll('.newsletter-form, #nlForm').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) return;
      const okMsg = form.parentElement.querySelector('#nlOk');
      if (okMsg) {
        form.style.display = 'none';
        okMsg.style.display = 'block';
      } else {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.textContent = '✓ ¡Suscrito!'; btn.disabled = true; }
        input.value = '';
      }
    });
  });

  /* ================================================================
     12. FORMULARIO DE CONTACTO
     ================================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    function showErr(id, msg) {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      el.style.display = msg ? 'block' : 'none';
    }
    function setInputErr(inputId, errorId, msg) {
      const input = document.getElementById(inputId);
      if (input) input.style.borderColor = '#ff4d6d';
      showErr(errorId, msg);
    }
    function clearErrors() {
      ['errorNombre','errorEmail','errorAsunto','errorMensaje'].forEach(id => showErr(id, ''));
      contactForm.querySelectorAll('.form-input').forEach(i => { i.style.borderColor = ''; });
    }

    ['contactNombre','contactEmail','contactAsunto','contactMensaje'].forEach((id, idx) => {
      const errorIds = ['errorNombre','errorEmail','errorAsunto','errorMensaje'];
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', () => { showErr(errorIds[idx], ''); input.style.borderColor = ''; });
    });

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors();
      let valid = true;

      const nombre  = document.getElementById('contactNombre');
      const email   = document.getElementById('contactEmail');
      const asunto  = document.getElementById('contactAsunto');
      const mensaje = document.getElementById('contactMensaje');

      if (!nombre?.value.trim())  { setInputErr('contactNombre','errorNombre','El nombre es obligatorio.');          valid = false; }
      if (!email?.value.trim())   { setInputErr('contactEmail','errorEmail','El email es obligatorio.');             valid = false; }
      else if (!email.value.trim().toLowerCase().endsWith('@gmail.com')) {
                                    setInputErr('contactEmail','errorEmail','Por favor introduce un email de Gmail (@gmail.com).');            valid = false; }
      if (!asunto?.value)         { setInputErr('contactAsunto','errorAsunto','Selecciona un asunto.');              valid = false; }
      if (!mensaje?.value.trim()) { setInputErr('contactMensaje','errorMensaje','El mensaje es obligatorio.');       valid = false; }
      else if (mensaje.value.trim().length < 20) {
                                    setInputErr('contactMensaje','errorMensaje','Mínimo 20 caracteres.');            valid = false; }
      if (!valid) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

      const SUPA_URL = 'https://zytdqlgqpybessewfeyd.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dGRxbGdxcHliZXNzZXdmZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ2MDgsImV4cCI6MjA5Mzc1MDYwOH0.r226GTofF9achTMauIIaDiMsFacwF0RntPLia5ERC2c';

      try {
        await fetch(`${SUPA_URL}/rest/v1/contactos_brokercompass`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPA_KEY,
            'Authorization': `Bearer ${SUPA_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            nombre:  nombre.value.trim(),
            email:   email.value.trim(),
            asunto:  asunto.value,
            mensaje: mensaje.value.trim()
          })
        });
      } catch (_) { /* fallo silencioso — la UX de éxito no cambia */ }

      contactForm.style.display = 'none';
      const ok = document.getElementById('contactOk');
      if (ok) ok.style.display = 'flex';
    });
  }

  /* ================================================================
     13. TOOLTIPS (tabla comparativa)
     ================================================================ */
  document.addEventListener('click', e => {
    const tip = e.target.closest('.tooltip');
    if (!tip) return;
    document.querySelectorAll('.tooltip').forEach(t => {
      if (t !== tip) t.classList.remove('tooltip-active');
    });
    tip.classList.toggle('tooltip-active');
  });

  /* ================================================================
     14. SISTEMA DE MODALES DE GUÍAS
     ================================================================ */
  const GUIAS_DATA = {
    'guia-1': {
      tag: 'Guía para principiantes',
      title: 'Cómo elegir tu primer broker en España',
      time: '8 min lectura',
      body: `
        <p>Elegir tu primer broker es una de las decisiones más importantes como inversor. Aquí están los criterios clave:</p>
        <h3>1. Regulación y seguridad</h3>
        <p>Asegúrate de que el broker esté regulado por la <strong>CNMV o el Banco de España</strong>. MyInvestor es banco regulado, DEGIRO está regulado por la AFM holandesa bajo supervisión europea (MiFID II).</p>
        <h3>2. Comisiones</h3>
        <p>Busca comisiones de custodia 0% y comisiones de compra/venta bajas. <strong>MyInvestor tiene 0% en fondos indexados</strong>. DEGIRO cobra desde 2€ por operación en ETFs.</p>
        <h3>3. Mínimo de inversión</h3>
        <p>Para empezar con poco, <strong>MyInvestor permite desde 1€</strong>. Indexa Capital requiere 1.000€ mínimo.</p>
        <h3>4. Facilidad de uso</h3>
        <p>Si eres principiante, prioriza interfaces simples. <strong>MyInvestor y eToro son los más intuitivos</strong>.</p>
        <h3>5. Oferta de productos</h3>
        <ul>
          <li>¿Quieres fondos indexados? → <strong>MyInvestor</strong></li>
          <li>¿ETFs directos? → <strong>DEGIRO o Interactive Brokers</strong></li>
          <li>¿Roboadvisor? → <strong>Indexa Capital o Finizens</strong></li>
        </ul>
        <div class="modal-highlight">💡 <strong>Conclusión:</strong> Para la mayoría de principiantes españoles, MyInvestor es el punto de partida ideal: regulado, sin comisiones en fondos y muy fácil de usar.</div>
      `
    },
    'guia-2': {
      tag: 'Análisis comparativo',
      title: 'Fondos indexados vs ETFs: ¿cuál es mejor?',
      time: '12 min lectura',
      body: `
        <p>Tanto los fondos indexados como los ETFs replican índices bursátiles, pero tienen diferencias importantes para el inversor español:</p>
        <h3>Fondos indexados</h3>
        <ul>
          <li>Se compran y venden al valor liquidativo del día (precio de cierre)</li>
          <li>En España tienen <strong>ventaja fiscal</strong>: puedes traspasar entre fondos SIN tributar hasta el reembolso final</li>
          <li>Disponibles en MyInvestor, Indexa Capital, Finizens</li>
          <li>Ideal para inversión a largo plazo en España por la ventaja fiscal</li>
        </ul>
        <h3>ETFs (Exchange Traded Funds)</h3>
        <ul>
          <li>Cotizan en bolsa como acciones: puedes comprarlos y venderlos en tiempo real</li>
          <li>Cada venta tributa en el IRPF (<strong>no hay traspaso libre de impuestos</strong>)</li>
          <li>Comisiones generalmente más bajas (TER desde 0,03%)</li>
          <li>Disponibles en DEGIRO, Interactive Brokers, Trade Republic</li>
        </ul>
        <h3>¿Cuál elegir?</h3>
        <div class="modal-highlight">🇪🇸 Si inviertes a largo plazo en España: <strong>fondos indexados</strong> por la ventaja fiscal del traspaso.<br><br>⚡ Si quieres flexibilidad y las comisiones más bajas: <strong>ETFs</strong>.<br><br>Para la mayoría de inversores españoles con horizonte +10 años, los fondos indexados son más eficientes fiscalmente.</div>
      `
    },
    'guia-3': {
      tag: 'Guía práctica',
      title: 'Cómo empezar a invertir con solo 100€',
      time: '6 min lectura',
      body: `
        <p>Invertir con 100€ es completamente posible y es el mejor momento para empezar. Aquí está el plan:</p>
        <h3>Paso 1: Abre una cuenta en MyInvestor</h3>
        <p>Sin mínimo, gratis, 10 minutos. Regístrate con tu DNI y datos bancarios, verifica tu identidad (foto del DNI + selfie). En 24-48h tienes la cuenta operativa.</p>
        <h3>Paso 2: Elige un fondo indexado global</h3>
        <ul>
          <li>Busca <strong>"Vanguard Global Stock Index"</strong> o <strong>"Amundi MSCI World"</strong></li>
          <li>Estos fondos invierten en más de 1.500 empresas de todo el mundo</li>
          <li>TER (comisión anual) inferior al 0,20%</li>
        </ul>
        <h3>Paso 3: Invierte tus 100€</h3>
        <ul>
          <li>Haz una aportación inicial de 100€</li>
          <li>Configura una aportación automática mensual (aunque sean 50€)</li>
          <li>Activa la reinversión de dividendos si está disponible</li>
        </ul>
        <h3>Paso 4: No toques nada</h3>
        <ul>
          <li>El mayor error es vender cuando el mercado baja</li>
          <li>Revisa tu cartera máximo una vez al mes</li>
          <li>Añade más dinero cuando puedas</li>
        </ul>
        <div class="modal-highlight">📈 Con 100€/mes al 8% anual durante 20 años tendrás aproximadamente <strong>58.000€</strong>. La constancia es más importante que la cantidad.</div>
      `
    },
    'guia-4': {
      tag: 'Fiscalidad',
      title: 'Cómo declarar inversiones en la renta',
      time: '10 min lectura',
      body: `
        <p>Declarar tus inversiones en el IRPF es obligatorio. Aquí está lo que necesitas saber:</p>
        <h3>¿Qué tienes que declarar?</h3>
        <ul>
          <li>Dividendos recibidos (aunque sean pequeños)</li>
          <li>Ganancias al vender fondos o ETFs con beneficio</li>
          <li>Pérdidas (que puedes compensar con ganancias)</li>
        </ul>
        <h3>Tramos del IRPF para inversiones 2026</h3>
        <ul>
          <li>Hasta 6.000€ de ganancia: <strong>19%</strong></li>
          <li>De 6.000€ a 50.000€: <strong>21%</strong></li>
          <li>De 50.000€ a 200.000€: <strong>23%</strong></li>
          <li>Más de 200.000€: <strong>27%</strong></li>
        </ul>
        <h3>Ventaja fiscal de los fondos indexados</h3>
        <p>Los traspasos entre fondos <strong>NO tributan</strong>. Solo pagas impuestos cuando retiras el dinero definitivamente. Esto te permite rebalancear tu cartera sin coste fiscal.</p>
        <div class="modal-highlight">📄 Tu broker te enviará un <strong>certificado fiscal antes del 31 de enero</strong> con todas las operaciones del año anterior. Ese documento tiene toda la información que necesitas para rellenar el IRPF.</div>
      `
    },
    'guia-5': {
      tag: 'Estrategia',
      title: 'Cómo diversificar tu cartera',
      time: '7 min lectura',
      body: `
        <p>La diversificación es la única estrategia gratuita para reducir el riesgo. Aquí está cómo hacerlo bien:</p>
        <h3>Diversificación geográfica</h3>
        <ul>
          <li><strong>MSCI World:</strong> 23 países desarrollados (EEUU 65%, Europa 20%, Japón 6%, resto 9%)</li>
          <li><strong>FTSE All-World:</strong> añade mercados emergentes (China, India, Brasil...)</li>
          <li>Recomendación: 80% países desarrollados, 20% emergentes</li>
        </ul>
        <h3>Diversificación por tipo de activo</h3>
        <ul>
          <li><strong>Acciones (renta variable):</strong> mayor rentabilidad, mayor riesgo → para largo plazo</li>
          <li><strong>Bonos (renta fija):</strong> menor rentabilidad, menor riesgo → para estabilidad</li>
          <li>Cartera clásica: 80% acciones / 20% bonos para perfil moderado</li>
        </ul>
        <h3>Diversificación temporal (DCA)</h3>
        <p>Invierte la misma cantidad cada mes independientemente del precio. Reduces el riesgo de invertir todo en el peor momento.</p>
        <div class="modal-highlight">⚠️ <strong>Lo que NO es diversificar:</strong> Tener 10 fondos que replican el mismo índice, o 5 acciones tecnológicas americanas. La verdadera diversificación requiere exposición a diferentes sectores, geografías y clases de activo.</div>
      `
    },
    'guia-6': {
      tag: 'Estrategia avanzada',
      title: 'Estrategia Buy & Hold explicada',
      time: '5 min lectura',
      body: `
        <p>Buy & Hold (comprar y mantener) es la estrategia de inversión más sencilla y, estadísticamente, una de las más rentables para el inversor particular.</p>
        <h3>¿En qué consiste?</h3>
        <p>Compras un fondo indexado global y lo mantienes durante décadas, independientemente de lo que haga el mercado. <strong>No vendes cuando baja. No intentas predecir subidas. Solo compras y esperas.</strong></p>
        <h3>¿Por qué funciona?</h3>
        <ul>
          <li>El mercado global ha subido históricamente ~7-10% anual a largo plazo</li>
          <li>Cada vez que intentas entrar y salir del mercado, aumentas el riesgo de equivocarte</li>
          <li>Los costes de transacción y los impuestos erosionan la rentabilidad del trading activo</li>
          <li>Warren Buffett recomienda esta estrategia para el inversor promedio</li>
        </ul>
        <h3>Ejemplo real</h3>
        <div class="modal-highlight">Si hubieras invertido <strong>10.000€ en el S&P 500 en 2004</strong> y no hubieras tocado nada, en 2024 tendrías aproximadamente <strong>71.000€</strong>. Si te hubieras perdido los 10 mejores días intentando hacer timing, tendrías solo <strong>32.000€</strong>.</div>
        <h3>Cómo implementarla</h3>
        <ul>
          <li>Abre cuenta en MyInvestor o DEGIRO</li>
          <li>Compra un fondo o ETF global (MSCI World o S&P 500)</li>
          <li>Configura aportaciones automáticas mensuales</li>
          <li>No mires la cartera más de una vez al mes</li>
          <li>Mantén durante 10, 20 o 30 años</li>
        </ul>
      `
    }
  };

  function openGuideModal(guideId) {
    const data = GUIAS_DATA[guideId];
    if (!data) return;
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.querySelector('.modal-tag').textContent        = data.tag;
    overlay.querySelector('.modal-title').textContent      = data.title;
    overlay.querySelector('.modal-read-time').innerHTML    = `⏱ ${data.time}`;
    overlay.querySelector('.modal-body').innerHTML         = data.body;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.modal-box').scrollTop = 0;
  }

  function closeGuideModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Cerrar modal al hacer click en overlay o botón cerrar
  document.addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeGuideModal();
    if (e.target.closest('#modalClose') || e.target.closest('#modalClose2')) closeGuideModal();
  });

  // Cerrar modal con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGuideModal();
  });

  /* ================================================================
     15. BOTÓN DE TRADUCCIÓN (Google Translate)
     ================================================================ */
  const translateBtn = document.getElementById('translateBtn');
  if (translateBtn) {
    let translated = false;

    function applyTranslation(toEnglish, attempts) {
      attempts = attempts || 0;

      // Método 1: doGTranslate (función global que expone el widget)
      if (typeof window.doGTranslate === 'function') {
        window.doGTranslate(toEnglish ? 'es|en' : 'es|es');
        return;
      }

      // Método 2: manipular el select del widget
      const select = document.querySelector('select.goog-te-combo');
      if (select) {
        select.value = toEnglish ? 'en' : '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input',  { bubbles: true }));
        return;
      }

      // Widget aún cargando — reintentar hasta 15 veces (3 segundos)
      if (attempts < 15) {
        setTimeout(() => applyTranslation(toEnglish, attempts + 1), 200);
      }
    }

    translateBtn.addEventListener('click', () => {
      translated = !translated;
      translateBtn.classList.toggle('active', translated);
      translateBtn.textContent = translated ? '🌐 Español' : '🌐 English';
      applyTranslation(translated);
    });
  }

});
