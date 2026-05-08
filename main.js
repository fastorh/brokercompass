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
  const pageTitlesEN = {
    inicio:      'BrokerCompass | Best Broker to Invest in Spain 2026',
    comparativa: 'Broker Comparison Spain 2026 | BrokerCompass',
    guias:       'Investment Guides Spain | BrokerCompass',
    faq:         'Frequently Asked Questions about Brokers | BrokerCompass',
    contacto:    'Contact | BrokerCompass',
    legal:       'Legal Information | BrokerCompass'
  };
  const validPages = Object.keys(pageTitles);
  let counterTriggered = false;
  let currentPage = 'inicio';

  function showPage(id, section) {
    if (!validPages.includes(id)) id = 'inicio';
    currentPage = id;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');

    const titles = currentLang === 'en' ? pageTitlesEN : pageTitles;
    document.title = titles[id];
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

    const ham = document.getElementById('ham');
    const mobMenu = document.getElementById('mobMenu');
    if (ham && mobMenu) {
      ham.classList.remove('open');
      mobMenu.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    }
  }

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

  document.addEventListener('click', e => {
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

  window.addEventListener('popstate', e => {
    const id      = (e.state && e.state.page)    || 'inicio';
    const section = (e.state && e.state.section) || null;
    currentPage = id;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    const titles = currentLang === 'en' ? pageTitlesEN : pageTitles;
    document.title = titles[id] || pageTitles.inicio;
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

  const initHash = location.hash.replace('#', '');
  const initPage = validPages.includes(initHash) ? initHash : 'inicio';
  currentPage = initPage;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const initTarget = document.getElementById(initPage);
  if (initTarget) initTarget.classList.add('active');
  document.title = pageTitles[initPage];
  updateNavActive(initPage);

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
  const cookieInfo   = document.getElementById('cookieInfo');

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
     8. FAQ ACORDEÓN
     ================================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');

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
     9. FILTROS DE BROKERS
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
          passive: { name: 'MyInvestor',          reason: { es: 'Perfecto para empezar con poco dinero. Sin mínimo, sin comisiones en fondos indexados y muy fácil de usar.', en: 'Perfect for getting started with little money. No minimum, no fees on index funds and very easy to use.' } },
          trading: { name: 'eToro',               reason: { es: 'Ideal para iniciarte en el trading con cantidades pequeñas. Interfaz muy intuitiva y función CopyTrading.', en: 'Ideal for getting started in trading with small amounts. Very intuitive interface and CopyTrading feature.' } },
          pension: { name: 'Finizens',            reason: { es: 'El mejor para complementar tu pensión con poco capital. Desde 50€ y las comisiones más bajas del mercado.', en: 'The best to supplement your pension with little capital. From €50 and the lowest fees on the market.' } }
        },
        intermediate: {
          passive: { name: 'MyInvestor',          reason: { es: 'Gran variedad de fondos indexados y ETFs sin comisiones. Ideal para estrategias de inversión pasiva.', en: 'Great variety of index funds and ETFs with no fees. Ideal for passive investment strategies.' } },
          trading: { name: 'DEGIRO',              reason: { es: 'Comisiones muy bajas para operar en mercados internacionales. Perfecto para traders con experiencia.', en: 'Very low fees to trade on international markets. Perfect for experienced traders.' } },
          pension: { name: 'Finizens',            reason: { es: 'Gestión automática y eficiente de tu plan de pensiones con costes mínimos.', en: 'Automatic and efficient management of your pension plan with minimal costs.' } }
        },
        advanced: {
          passive: { name: 'DEGIRO',              reason: { es: 'Acceso a miles de ETFs globales con comisiones mínimas. Ideal para carteras bien diversificadas.', en: 'Access to thousands of global ETFs with minimal fees. Ideal for well-diversified portfolios.' } },
          trading: { name: 'Interactive Brokers', reason: { es: 'La plataforma más completa para traders avanzados con acceso a todos los mercados globales.', en: 'The most complete platform for advanced traders with access to all global markets.' } },
          pension: { name: 'Indexa Capital',      reason: { es: 'Roboadvisor con excelente rentabilidad ajustada al riesgo para objetivos a largo plazo.', en: 'Robo-advisor with excellent risk-adjusted returns for long-term goals.' } }
        }
      },
      medium: {
        beginner: {
          passive: { name: 'Indexa Capital',      reason: { es: 'Con 1.000€ puedes acceder a Indexa Capital: gestión automática, diversificada y de bajo coste.', en: 'With €1,000 you can access Indexa Capital: automatic, diversified and low-cost management.' } },
          trading: { name: 'eToro',               reason: { es: 'Plataforma intuitiva con CopyTrading para aprender copiando a los mejores inversores.', en: 'Intuitive platform with CopyTrading to learn by copying the best investors.' } },
          pension: { name: 'Finizens',            reason: { es: 'Gestión pasiva automatizada con las comisiones más bajas. Perfecto para planes a largo plazo.', en: 'Automated passive management with the lowest fees. Perfect for long-term plans.' } }
        },
        intermediate: {
          passive: { name: 'Indexa Capital',      reason: { es: 'El mejor roboadvisor para carteras a largo plazo. Gestión automática con rentabilidades excelentes.', en: 'The best robo-advisor for long-term portfolios. Automatic management with excellent returns.' } },
          trading: { name: 'DEGIRO',              reason: { es: 'Comisiones imbatibles para operar en bolsa internacional. La elección de traders experimentados.', en: 'Unbeatable fees to trade on international stock exchanges. The choice of experienced traders.' } },
          pension: { name: 'Indexa Capital',      reason: { es: 'Planes de pensiones indexados con mínimas comisiones y excelente historial de rentabilidad.', en: 'Indexed pension plans with minimal fees and excellent performance history.' } }
        },
        advanced: {
          passive: { name: 'DEGIRO',              reason: { es: 'Amplia selección de ETFs globales con costes reducidos. Ideal para quien gestiona su propia cartera.', en: 'Wide selection of global ETFs with reduced costs. Ideal for those who manage their own portfolio.' } },
          trading: { name: 'Interactive Brokers', reason: { es: 'Herramientas avanzadas, todos los mercados y comisiones competitivas para traders profesionales.', en: 'Advanced tools, all markets and competitive fees for professional traders.' } },
          pension: { name: 'Indexa Capital',      reason: { es: 'Gestión eficiente con fondos Vanguard y Dimensional de bajo coste.', en: 'Efficient management with low-cost Vanguard and Dimensional funds.' } }
        }
      },
      large: {
        beginner: {
          passive: { name: 'Indexa Capital',      reason: { es: 'Para grandes importes, Indexa Capital ofrece la mejor gestión automatizada con costes decrecientes.', en: 'For large amounts, Indexa Capital offers the best automated management with decreasing costs.' } },
          trading: { name: 'MyInvestor',          reason: { es: 'Gran plataforma con amplia variedad de activos. Empieza a invertir con seguridad.', en: 'Great platform with wide variety of assets. Start investing safely.' } },
          pension: { name: 'Indexa Capital',      reason: { es: 'Para grandes patrimonios, Indexa Capital reduce sus comisiones progresivamente.', en: 'For large assets, Indexa Capital progressively reduces its fees.' } }
        },
        intermediate: {
          passive: { name: 'Indexa Capital',      reason: { es: 'Para importes mayores de 10.000€, Indexa Capital reduce aún más sus comisiones.', en: 'For amounts over €10,000, Indexa Capital reduces its fees even further.' } },
          trading: { name: 'Interactive Brokers', reason: { es: 'Con grandes capitales, IB ofrece las mejores condiciones y acceso a todos los mercados.', en: 'With large capital, IB offers the best conditions and access to all markets.' } },
          pension: { name: 'Finizens',            reason: { es: 'El roboadvisor con las comisiones más bajas del mercado para grandes patrimonios.', en: 'The robo-advisor with the lowest fees on the market for large assets.' } }
        },
        advanced: {
          passive: { name: 'Interactive Brokers', reason: { es: 'La plataforma más completa para gestionar grandes carteras con acceso a todos los activos globales.', en: 'The most complete platform for managing large portfolios with access to all global assets.' } },
          trading: { name: 'Interactive Brokers', reason: { es: 'La elección profesional: todos los mercados, todas las herramientas, comisiones institucionales.', en: 'The professional choice: all markets, all tools, institutional fees.' } },
          pension: { name: 'Indexa Capital',      reason: { es: 'Gestión con fondos de clase institucional y comisiones mínimas para grandes importes.', en: 'Management with institutional-class funds and minimal fees for large amounts.' } }
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
        || { name: 'MyInvestor', reason: { es: 'Una excelente opción para la mayoría de inversores españoles.', en: 'An excellent option for most Spanish investors.' } };

      const nameEl   = document.getElementById('quizBrokerName');
      const reasonEl = document.getElementById('quizBrokerReason');
      if (nameEl)   nameEl.textContent   = result.name;
      if (reasonEl) reasonEl.textContent = result.reason[currentLang] || result.reason.es;
      quizShowStep(steps.length - 1);
    }

    // Expose for language switching
    window._quizShowResult = quizShowResult;
    window._quizAnswers = answers;

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
     11. NEWSLETTER
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

      const t = translations[currentLang];

      if (!nombre?.value.trim())  { setInputErr('contactNombre','errorNombre', t['err.name']);    valid = false; }
      if (!email?.value.trim())   { setInputErr('contactEmail','errorEmail',   t['err.email']);   valid = false; }
      else if (!email.value.trim().toLowerCase().endsWith('@gmail.com')) {
                                    setInputErr('contactEmail','errorEmail',   t['err.gmail']);   valid = false; }
      if (!asunto?.value)         { setInputErr('contactAsunto','errorAsunto', t['err.subject']); valid = false; }
      if (!mensaje?.value.trim()) { setInputErr('contactMensaje','errorMensaje',t['err.message']);valid = false; }
      else if (mensaje.value.trim().length < 20) {
                                    setInputErr('contactMensaje','errorMensaje',t['err.minchars']);valid = false; }
      if (!valid) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = t['contact.sending']; }

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
      } catch (_) { /* fallo silencioso */ }

      contactForm.style.display = 'none';
      const ok = document.getElementById('contactOk');
      if (ok) ok.style.display = 'flex';
    });
  }

  /* ================================================================
     13. TOOLTIPS
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
     14. MODALES DE GUÍAS
     ================================================================ */
  const GUIAS_DATA = {
    'guia-1': {
      es: { tag: 'Guía para principiantes', title: 'Cómo elegir tu primer broker en España', time: '8 min lectura', body: `<p>Elegir tu primer broker es una de las decisiones más importantes como inversor. Aquí están los criterios clave:</p><h3>1. Regulación y seguridad</h3><p>Asegúrate de que el broker esté regulado por la <strong>CNMV o el Banco de España</strong>. MyInvestor es banco regulado, DEGIRO está regulado por la AFM holandesa bajo supervisión europea (MiFID II).</p><h3>2. Comisiones</h3><p>Busca comisiones de custodia 0% y comisiones de compra/venta bajas. <strong>MyInvestor tiene 0% en fondos indexados</strong>. DEGIRO cobra desde 2€ por operación en ETFs.</p><h3>3. Mínimo de inversión</h3><p>Para empezar con poco, <strong>MyInvestor permite desde 1€</strong>. Indexa Capital requiere 1.000€ mínimo.</p><h3>4. Facilidad de uso</h3><p>Si eres principiante, prioriza interfaces simples. <strong>MyInvestor y eToro son los más intuitivos</strong>.</p><h3>5. Oferta de productos</h3><ul><li>¿Quieres fondos indexados? → <strong>MyInvestor</strong></li><li>¿ETFs directos? → <strong>DEGIRO o Interactive Brokers</strong></li><li>¿Roboadvisor? → <strong>Indexa Capital o Finizens</strong></li></ul><div class="modal-highlight">💡 <strong>Conclusión:</strong> Para la mayoría de principiantes españoles, MyInvestor es el punto de partida ideal: regulado, sin comisiones en fondos y muy fácil de usar.</div>` },
      en: { tag: 'Beginner guide', title: 'How to choose your first broker in Spain', time: '8 min read', body: `<p>Choosing your first broker is one of the most important decisions as an investor. Here are the key criteria:</p><h3>1. Regulation and security</h3><p>Make sure the broker is regulated by the <strong>CNMV or Banco de España</strong>. MyInvestor is a regulated bank, DEGIRO is regulated by the Dutch AFM under European supervision (MiFID II).</p><h3>2. Fees</h3><p>Look for 0% custody fees and low buy/sell commissions. <strong>MyInvestor has 0% on index funds</strong>. DEGIRO charges from €2 per ETF operation.</p><h3>3. Minimum investment</h3><p>To start small, <strong>MyInvestor allows from €1</strong>. Indexa Capital requires a minimum of €1,000.</p><h3>4. Ease of use</h3><p>If you are a beginner, prioritize simple interfaces. <strong>MyInvestor and eToro are the most intuitive</strong>.</p><h3>5. Product range</h3><ul><li>Want index funds? → <strong>MyInvestor</strong></li><li>Direct ETFs? → <strong>DEGIRO or Interactive Brokers</strong></li><li>Robo-advisor? → <strong>Indexa Capital or Finizens</strong></li></ul><div class="modal-highlight">💡 <strong>Conclusion:</strong> For most Spanish beginners, MyInvestor is the ideal starting point: regulated, no fees on funds and very easy to use.</div>` }
    },
    'guia-2': {
      es: { tag: 'Análisis comparativo', title: 'Fondos indexados vs ETFs: ¿cuál es mejor?', time: '12 min lectura', body: `<p>Tanto los fondos indexados como los ETFs replican índices bursátiles, pero tienen diferencias importantes para el inversor español:</p><h3>Fondos indexados</h3><ul><li>Se compran y venden al valor liquidativo del día (precio de cierre)</li><li>En España tienen <strong>ventaja fiscal</strong>: puedes traspasar entre fondos SIN tributar hasta el reembolso final</li><li>Disponibles en MyInvestor, Indexa Capital, Finizens</li><li>Ideal para inversión a largo plazo en España por la ventaja fiscal</li></ul><h3>ETFs</h3><ul><li>Cotizan en bolsa como acciones: puedes comprarlos y venderlos en tiempo real</li><li>Cada venta tributa en el IRPF (<strong>no hay traspaso libre de impuestos</strong>)</li><li>Comisiones generalmente más bajas (TER desde 0,03%)</li><li>Disponibles en DEGIRO, Interactive Brokers</li></ul><div class="modal-highlight">🇪🇸 Si inviertes a largo plazo en España: <strong>fondos indexados</strong> por la ventaja fiscal del traspaso.<br><br>⚡ Si quieres flexibilidad y las comisiones más bajas: <strong>ETFs</strong>.</div>` },
      en: { tag: 'Comparative analysis', title: 'Index funds vs ETFs: which is better?', time: '12 min read', body: `<p>Both index funds and ETFs replicate stock market indices, but they have important differences for the Spanish investor:</p><h3>Index funds</h3><ul><li>Bought and sold at the day's net asset value (closing price)</li><li>In Spain they have a <strong>tax advantage</strong>: you can transfer between funds WITHOUT paying tax until the final redemption</li><li>Available at MyInvestor, Indexa Capital, Finizens</li><li>Ideal for long-term investing in Spain due to the tax advantage</li></ul><h3>ETFs</h3><ul><li>Trade on the stock exchange like stocks: you can buy and sell them in real time</li><li>Each sale is taxed in income tax (<strong>no tax-free transfers</strong>)</li><li>Generally lower fees (TER from 0.03%)</li><li>Available at DEGIRO, Interactive Brokers</li></ul><div class="modal-highlight">🇪🇸 If you invest long-term in Spain: <strong>index funds</strong> for the transfer tax advantage.<br><br>⚡ If you want flexibility and the lowest fees: <strong>ETFs</strong>.</div>` }
    },
    'guia-3': {
      es: { tag: 'Guía práctica', title: 'Cómo empezar a invertir con solo 100€', time: '6 min lectura', body: `<p>Invertir con 100€ es completamente posible y es el mejor momento para empezar. Aquí está el plan:</p><h3>Paso 1: Abre una cuenta en MyInvestor</h3><p>Sin mínimo, gratis, 10 minutos. Regístrate con tu DNI y datos bancarios.</p><h3>Paso 2: Elige un fondo indexado global</h3><ul><li>Busca <strong>"Vanguard Global Stock Index"</strong> o <strong>"Amundi MSCI World"</strong></li><li>Estos fondos invierten en más de 1.500 empresas de todo el mundo</li><li>TER inferior al 0,20%</li></ul><h3>Paso 3: Invierte tus 100€</h3><ul><li>Haz una aportación inicial de 100€</li><li>Configura una aportación automática mensual</li></ul><h3>Paso 4: No toques nada</h3><ul><li>El mayor error es vender cuando el mercado baja</li><li>Revisa tu cartera máximo una vez al mes</li></ul><div class="modal-highlight">📈 Con 100€/mes al 8% anual durante 20 años tendrás aproximadamente <strong>58.000€</strong>. La constancia es más importante que la cantidad.</div>` },
      en: { tag: 'Practical guide', title: 'How to start investing with just €100', time: '6 min read', body: `<p>Investing with €100 is completely possible and now is the best time to start. Here is the plan:</p><h3>Step 1: Open an account at MyInvestor</h3><p>No minimum, free, 10 minutes. Register with your ID and bank details.</p><h3>Step 2: Choose a global index fund</h3><ul><li>Search for <strong>"Vanguard Global Stock Index"</strong> or <strong>"Amundi MSCI World"</strong></li><li>These funds invest in more than 1,500 companies worldwide</li><li>TER below 0.20%</li></ul><h3>Step 3: Invest your €100</h3><ul><li>Make an initial contribution of €100</li><li>Set up a monthly automatic contribution</li></ul><h3>Step 4: Don't touch anything</h3><ul><li>The biggest mistake is selling when the market falls</li><li>Review your portfolio at most once a month</li></ul><div class="modal-highlight">📈 With €100/month at 8% per year for 20 years you will have approximately <strong>€58,000</strong>. Consistency is more important than the amount.</div>` }
    },
    'guia-4': {
      es: { tag: 'Fiscalidad', title: 'Cómo declarar inversiones en la renta', time: '10 min lectura', body: `<p>Declarar tus inversiones en el IRPF es obligatorio. Aquí está lo que necesitas saber:</p><h3>¿Qué tienes que declarar?</h3><ul><li>Dividendos recibidos</li><li>Ganancias al vender fondos o ETFs con beneficio</li><li>Pérdidas (que puedes compensar con ganancias)</li></ul><h3>Tramos del IRPF para inversiones 2026</h3><ul><li>Hasta 6.000€: <strong>19%</strong></li><li>De 6.000€ a 50.000€: <strong>21%</strong></li><li>De 50.000€ a 200.000€: <strong>23%</strong></li><li>Más de 200.000€: <strong>27%</strong></li></ul><h3>Ventaja fiscal de los fondos indexados</h3><p>Los traspasos entre fondos <strong>NO tributan</strong>. Solo pagas impuestos cuando retiras el dinero definitivamente.</p><div class="modal-highlight">📄 Tu broker te enviará un <strong>certificado fiscal antes del 31 de enero</strong> con todas las operaciones del año anterior.</div>` },
      en: { tag: 'Taxation', title: 'How to declare investments in your tax return', time: '10 min read', body: `<p>Declaring your investments in income tax is mandatory. Here is what you need to know:</p><h3>What do you need to declare?</h3><ul><li>Dividends received</li><li>Gains when selling funds or ETFs at a profit</li><li>Losses (which you can offset against gains)</li></ul><h3>Income tax brackets for investments 2026</h3><ul><li>Up to €6,000: <strong>19%</strong></li><li>From €6,000 to €50,000: <strong>21%</strong></li><li>From €50,000 to €200,000: <strong>23%</strong></li><li>Over €200,000: <strong>27%</strong></li></ul><h3>Tax advantage of index funds</h3><p>Transfers between funds are <strong>NOT taxed</strong>. You only pay taxes when you withdraw the money definitively.</p><div class="modal-highlight">📄 Your broker will send you a <strong>tax certificate before January 31</strong> with all the operations of the previous year.</div>` }
    },
    'guia-5': {
      es: { tag: 'Estrategia', title: 'Cómo diversificar tu cartera', time: '7 min lectura', body: `<p>La diversificación es la única estrategia gratuita para reducir el riesgo.</p><h3>Diversificación geográfica</h3><ul><li><strong>MSCI World:</strong> 23 países desarrollados</li><li><strong>FTSE All-World:</strong> añade mercados emergentes</li><li>Recomendación: 80% desarrollados, 20% emergentes</li></ul><h3>Diversificación por tipo de activo</h3><ul><li><strong>Acciones:</strong> mayor rentabilidad, mayor riesgo</li><li><strong>Bonos:</strong> menor rentabilidad, menor riesgo</li><li>Cartera clásica: 80% acciones / 20% bonos</li></ul><h3>Diversificación temporal (DCA)</h3><p>Invierte la misma cantidad cada mes independientemente del precio.</p><div class="modal-highlight">⚠️ <strong>Lo que NO es diversificar:</strong> Tener 10 fondos que replican el mismo índice, o 5 acciones tecnológicas americanas.</div>` },
      en: { tag: 'Strategy', title: 'How to diversify your portfolio', time: '7 min read', body: `<p>Diversification is the only free strategy to reduce risk.</p><h3>Geographic diversification</h3><ul><li><strong>MSCI World:</strong> 23 developed countries</li><li><strong>FTSE All-World:</strong> adds emerging markets</li><li>Recommendation: 80% developed, 20% emerging</li></ul><h3>Asset type diversification</h3><ul><li><strong>Stocks:</strong> higher returns, higher risk</li><li><strong>Bonds:</strong> lower returns, lower risk</li><li>Classic portfolio: 80% stocks / 20% bonds</li></ul><h3>Time diversification (DCA)</h3><p>Invest the same amount every month regardless of price.</p><div class="modal-highlight">⚠️ <strong>What is NOT diversifying:</strong> Having 10 funds that replicate the same index, or 5 American tech stocks.</div>` }
    },
    'guia-6': {
      es: { tag: 'Estrategia avanzada', title: 'Estrategia Buy & Hold explicada', time: '5 min lectura', body: `<p>Buy & Hold (comprar y mantener) es la estrategia de inversión más sencilla y, estadísticamente, una de las más rentables para el inversor particular.</p><h3>¿En qué consiste?</h3><p>Compras un fondo indexado global y lo mantienes durante décadas. <strong>No vendes cuando baja. No intentas predecir subidas. Solo compras y esperas.</strong></p><h3>¿Por qué funciona?</h3><ul><li>El mercado global ha subido históricamente ~7-10% anual a largo plazo</li><li>Cada vez que intentas entrar y salir del mercado, aumentas el riesgo de equivocarte</li><li>Warren Buffett recomienda esta estrategia para el inversor promedio</li></ul><div class="modal-highlight">Si hubieras invertido <strong>10.000€ en el S&P 500 en 2004</strong> y no hubieras tocado nada, en 2024 tendrías aproximadamente <strong>71.000€</strong>.</div>` },
      en: { tag: 'Advanced strategy', title: 'Buy & Hold strategy explained', time: '5 min read', body: `<p>Buy & Hold is the simplest investment strategy and, statistically, one of the most profitable for the individual investor.</p><h3>What does it consist of?</h3><p>You buy a global index fund and hold it for decades. <strong>You don't sell when it falls. You don't try to predict rises. You just buy and wait.</strong></p><h3>Why does it work?</h3><ul><li>The global market has historically risen ~7-10% per year in the long term</li><li>Every time you try to enter and exit the market, you increase the risk of getting it wrong</li><li>Warren Buffett recommends this strategy for the average investor</li></ul><div class="modal-highlight">If you had invested <strong>€10,000 in the S&P 500 in 2004</strong> and hadn't touched anything, in 2024 you would have approximately <strong>€71,000</strong>.</div>` }
    }
  };

  function openGuideModal(guideId) {
    const guideData = GUIAS_DATA[guideId];
    if (!guideData) return;
    const data = guideData[currentLang] || guideData.es;
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.querySelector('.modal-tag').textContent     = data.tag;
    overlay.querySelector('.modal-title').textContent   = data.title;
    overlay.querySelector('.modal-read-time').innerHTML = `⏱ ${data.time}`;
    overlay.querySelector('.modal-body').innerHTML      = data.body;
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

  document.addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeGuideModal();
    if (e.target.closest('#modalClose') || e.target.closest('#modalClose2')) closeGuideModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGuideModal();
  });

  /* ================================================================
     15. SISTEMA DE TRADUCCIÓN PROPIO
     ================================================================ */
  const translations = {
    es: {
      // Nav
      'nav.home':        'Inicio',
      'nav.comparison':  'Comparativa',
      'nav.guides':      'Guías',
      'nav.contact':     'Contacto',
      'nav.cta':         'Ver mejores brokers →',
      // Hero
      'hero.badge':      '✓ Actualizado mayo 2026',
      'hero.title':      'Encuentra el mejor broker para<br><span class="gradient-text">invertir en España</span>',
      'hero.sub':        'Comparativa independiente y actualizada de los brokers más populares. Sin publicidad encubierta, sin letra pequeña. Solo datos.',
      'hero.cta':        'Ver comparativa completa →',
      'hero.stat1':      'Brokers analizados',
      'hero.stat2':      'Usuarios ayudados',
      'hero.stat3':      'Análisis independiente',
      // Top 3
      'top.title':       '⭐ Los mejores brokers de 2026',
      'top.sub':         'Basado en comisiones, seguridad y experiencia de usuario',
      'mi.badge':        'Mejor para principiantes',
      'mi.desc':         'El mejor broker español para empezar. Sin comisiones en fondos indexados y desde 1€ de inversión mínima.',
      'ic.badge':        'Mejor roboadvisor',
      'ic.desc':         'El roboadvisor líder en España. Gestión automática diversificada con costes muy competitivos.',
      'de.badge':        'Mejor para ETFs',
      'de.desc':         'El broker europeo con las comisiones más competitivas para ETFs y mercados internacionales.',
      'see.analysis':    'Ver análisis →',
      // Quiz
      'quiz.title':      '🎯 ¿Qué broker es para ti?',
      'quiz.sub':        'Responde 3 preguntas y te recomendamos el broker perfecto para tu perfil',
      'quiz.q1.label':   'Pregunta 1 de 3',
      'quiz.q1.text':    '¿Cuánto dinero quieres invertir inicialmente?',
      'quiz.q1.opt1':    'Menos de 1.000€',
      'quiz.q1.opt2':    'Entre 1.000€ y 10.000€',
      'quiz.q1.opt3':    'Más de 10.000€',
      'quiz.q2.label':   'Pregunta 2 de 3',
      'quiz.q2.text':    '¿Cuál es tu experiencia invirtiendo?',
      'quiz.q2.opt1':    'Nunca he invertido',
      'quiz.q2.opt2':    'Algo de experiencia',
      'quiz.q2.opt3':    'Inversor experimentado',
      'quiz.q3.label':   'Pregunta 3 de 3',
      'quiz.q3.text':    '¿Cuál es tu objetivo principal?',
      'quiz.q3.opt1':    'Inversión pasiva a largo plazo',
      'quiz.q3.opt2':    'Hacer trading activo',
      'quiz.q3.opt3':    'Complementar mi pensión',
      'quiz.result':     'Tu broker ideal es:',
      'quiz.result.cta': 'Ver análisis completo →',
      'quiz.restart':    'Volver a empezar',
      // Trust
      'trust.title':     '¿Por qué confiar en BrokerCompass?',
      'trust1.title':    'Análisis independiente',
      'trust1.desc':     'No somos propiedad de ningún broker. Nuestras puntuaciones reflejan datos reales, no acuerdos comerciales.',
      'trust2.title':    'Actualizamos cada mes',
      'trust2.desc':     'Las comisiones y condiciones cambian. Revisamos cada análisis mensualmente para que siempre tengas datos frescos.',
      'trust3.title':    'Sin letra pequeña',
      'trust3.desc':     'Explicamos todas las comisiones, incluidas las ocultas. Si hay un inconveniente, lo decimos claramente.',
      'trust4.title':    '50.000+ usuarios satisfechos',
      'trust4.desc':     'Miles de inversores españoles han encontrado su broker ideal gracias a nuestras comparativas.',
      // Blog preview
      'blog.title':      '📚 Aprende a invertir',
      'blog.sub':        'Todo lo que necesitas saber para empezar',
      'blog1.meta':      'Guía · Mayo 2026',
      'blog1.title':     'Cómo elegir tu primer broker en España',
      'blog1.desc':      'Paso a paso para abrir tu primera cuenta de inversión sin cometer los errores más comunes.',
      'blog2.meta':      'Guía · Abril 2026',
      'blog2.title':     'Fondos indexados vs ETFs: ¿cuál es mejor?',
      'blog2.desc':      'Comparamos en profundidad fondos indexados y ETFs para que sepas cuál encaja con tu estrategia.',
      'blog3.meta':      'Guía · Marzo 2026',
      'blog3.title':     'Cómo empezar a invertir con solo 100€',
      'blog3.desc':      'Demuestra que no hace falta mucho capital. Con 100€ ya puedes construir una cartera diversificada.',
      'blog.read':       'Leer guía →',
      'blog.all':        'Ver todas las guías →',
      // Comparativa page
      'comp.eyebrow':    '📊 Actualizado mayo 2026',
      'comp.title':      'Comparativa completa de brokers<br>en España 2026',
      'comp.sub':        'Analizamos en profundidad los 6 mejores brokers del mercado español. Comisiones reales, pros y contras, y todo lo que necesitas para elegir con confianza.',
      'filter.all':      'Todos',
      'filter.beginner': 'Principiante',
      'filter.inter':    'Intermedio',
      'filter.advanced': 'Avanzado',
      // Broker shared labels
      'bstat.fees':      'Comisiones',
      'bstat.min':       'Mínimo',
      'bstat.type':      'Tipo',
      'bstat.markets':   'Mercados',
      'pros.title':      '✓ Puntos fuertes',
      'cons.title':      '✗ Puntos débiles',
      // MyInvestor card
      'mi.full.badge':   'Mejor para principiantes',
      'mi.full.fees':    '0% fondos',
      'mi.full.type':    'Broker · Roboadvisor',
      'mi.full.markets': 'Fondos · ETFs · Acciones',
      'mi.pro1':         'Sin comisiones en fondos indexados',
      'mi.pro2':         'Gran variedad de productos',
      'mi.pro3':         'Interfaz sencilla para principiantes',
      'mi.con1':         'Aplicación móvil mejorable',
      'mi.con2':         'Soporte al cliente lento',
      'mi.cta':          'Abrir cuenta gratis →',
      'mi.regulated':    '🔒 Regulado CNMV',
      'mi.note':         '* Enlace de afiliado — sin coste para ti',
      // Indexa Capital card
      'ic.full.badge':   'Mejor roboadvisor',
      'ic.full.fees':    '0.43% anual',
      'ic.full.type':    'Roboadvisor',
      'ic.full.markets': 'Fondos indexados · Pensiones',
      'ic.pro1':         'Gestión completamente automatizada',
      'ic.pro2':         'Bajo coste frente a fondos activos',
      'ic.pro3':         'Excelente historial de rentabilidad',
      'ic.con1':         'Mínimo de inversión 1.000€',
      'ic.con2':         'Sin acciones individuales',
      'ic.cta':          'Probar gratis 6 meses →',
      'ic.regulated':    '🔒 Regulado CNMV',
      'ic.note':         '* Enlace de afiliado — sin coste para ti',
      // DEGIRO card
      'de.full.badge':   'Mejor para ETFs',
      'de.full.fees':    'Desde 0€ ETFs',
      'de.full.type':    'Broker',
      'de.full.markets': 'ETFs · Acciones · Opciones',
      'de.pro1':         'Comisiones muy bajas en ETFs',
      'de.pro2':         'Gran variedad de mercados internacionales',
      'de.pro3':         'Sin mínimo de inversión',
      'de.con1':         'Sin fondos indexados tradicionales',
      'de.con2':         'Atención al cliente solo en inglés',
      'de.cta':          'Abrir cuenta →',
      'de.regulated':    '🔒 Regulado BaFin / CNMV',
      'de.note':         '* Enlace de afiliado — sin coste para ti',
      // Interactive Brokers card
      'ib.badge':        'Mejor para avanzados',
      'ib.fees':         'Desde 0€',
      'ib.type':         'Broker profesional',
      'ib.markets':      'Todos los activos globales',
      'ib.pro1':         'El broker más completo del mercado',
      'ib.pro2':         'Acceso a todos los mercados globales',
      'ib.pro3':         'Herramientas profesionales avanzadas',
      'ib.con1':         'Interfaz compleja para principiantes',
      'ib.con2':         'Comisiones de inactividad',
      'ib.cta':          'Abrir cuenta →',
      'ib.regulated':    '🔒 Regulado SEC / FCA / CNMV',
      'ib.note':         '* Enlace de afiliado — sin coste para ti',
      // Finizens card
      'fz.badge':        'Comisiones más bajas',
      'fz.fees':         'Desde 0.12%',
      'fz.type':         'Roboadvisor',
      'fz.markets':      'Fondos indexados · Pensiones',
      'fz.pro1':         'Las comisiones más bajas del mercado',
      'fz.pro2':         'Muy fácil de usar',
      'fz.pro3':         'Aportaciones automáticas programables',
      'fz.con1':         'Sin acciones individuales',
      'fz.con2':         'Poca flexibilidad de cartera',
      'fz.cta':          'Empezar →',
      'fz.regulated':    '🔒 Regulado CNMV',
      'fz.note':         '* Enlace de afiliado — sin coste para ti',
      // eToro card
      'et.badge':        'Mejor app',
      'et.fees':         '0% acciones',
      'et.type':         'Broker social',
      'et.markets':      'Acciones · ETFs · Criptos',
      'et.pro1':         'CopyTrading único en el mercado',
      'et.pro2':         'Aplicación excelente e intuitiva',
      'et.pro3':         'Gran comunidad de inversores',
      'et.con1':         'Spread en operaciones (coste oculto)',
      'et.con2':         'No ideal para inversión a largo plazo',
      'et.cta':          'Abrir cuenta →',
      'et.regulated':    '🔒 Regulado CySEC / FCA',
      'et.note':         '* Enlace de afiliado — sin coste para ti',
      // Table
      'tbl.title':       'Comparativa rápida',
      'tbl.sub':         'Todos los brokers de un vistazo',
      'th.broker':       'Broker',
      'th.score':        'Puntuación',
      'th.fees':         'Comisiones',
      'th.min':          'Mínimo',
      'th.bestfor':      'Mejor para',
      'th.reg':          'Regulación',
      'th.action':       'Acción',
      'td.beginner':     'Principiante',
      'td.inter':        'Intermedio',
      'td.intadv':       'Intermedio/Avanzado',
      'td.advanced':     'Avanzado',
      'td.begint':       'Principiante/Intermedio',
      'tbl.open':        'Abrir',
      'tbl.6m':          '6 meses gratis',
      'tbl.start':       'Empezar',
      // Methodology
      'meth.title':      '¿Cómo elegimos los brokers?',
      'meth.sub':        'Evaluamos cada broker con los mismos criterios objetivos para que puedas confiar en nuestros análisis.',
      'meth1.title':     'Seguridad y regulación',
      'meth1.desc':      'Verificamos que todos los brokers estén regulados por organismos reconocidos (CNMV, FCA, BaFin, SEC). La protección de tu dinero es lo primero.',
      'meth2.title':     'Comisiones y costes',
      'meth2.desc':      'Analizamos todas las comisiones, incluidas las ocultas: spreads, comisiones de inactividad, cambio de divisa y retiradas.',
      'meth3.title':     'Facilidad de uso',
      'meth3.desc':      'Probamos la plataforma web y la app móvil. Valoramos la curva de aprendizaje, la claridad de la interfaz y la experiencia real del usuario.',
      'meth4.title':     'Variedad de productos',
      'meth4.desc':      'Evaluamos la gama de activos disponibles: acciones, ETFs, fondos, criptos, opciones y más.',
      'meth5.title':     'Atención al cliente',
      'meth5.desc':      'Contactamos con el equipo de soporte de cada broker para evaluar tiempos de respuesta y calidad de las respuestas.',
      // Guides page
      'guides.eyebrow':  '📚 Educación financiera',
      'guides.title':    'Guías para invertir en España',
      'guides.sub':      'Todo lo que necesitas saber para empezar a invertir de forma inteligente',
      'g1.title':        'Cómo elegir tu primer broker',
      'g1.desc':         'Paso a paso para abrir tu primera cuenta de inversión en España sin cometer los errores más comunes. Desde la regulación hasta las comisiones.',
      'g1.badge':        'Principiantes',
      'g1.time':         '⏱ 8 min lectura',
      'g1.link':         'Leer guía →',
      'g2.title':        'Fondos indexados: guía completa',
      'g2.desc':         'Qué son, cómo funcionan y por qué son la opción favorita de los inversores a largo plazo. Incluye los mejores fondos disponibles en España.',
      'g2.badge':        'Fondos',
      'g2.time':         '⏱ 12 min lectura',
      'g2.link':         'Leer guía →',
      'g3.title':        'ETFs vs Fondos indexados',
      'g3.desc':         'Diferencias clave en fiscalidad, liquidez y acceso. Descubre cuál de los dos encaja mejor con tu estrategia de inversión y horizonte temporal.',
      'g3.badge':        'ETFs',
      'g3.time':         '⏱ 6 min lectura',
      'g3.link':         'Leer guía →',
      'g4.title':        'Cómo declarar inversiones en la renta',
      'g4.desc':         'Todo sobre la tributación de acciones, fondos y ETFs en España. Cuándo pagar, cómo calcular ganancias y qué casillas rellenar.',
      'g4.badge':        'Fiscalidad',
      'g4.time':         '⏱ 10 min lectura',
      'g4.link':         'Leer guía →',
      'g5.title':        'Cómo diversificar tu cartera',
      'g5.desc':         'La regla de oro de la inversión explicada con ejemplos reales. Aprende a distribuir tu dinero para minimizar el riesgo sin sacrificar rentabilidad.',
      'g5.badge':        'Estrategia',
      'g5.time':         '⏱ 7 min lectura',
      'g5.link':         'Leer guía →',
      'g6.title':        'Estrategia Buy & Hold explicada',
      'g6.desc':         'La estrategia favorita de Warren Buffett aplicada al inversor español. Comprar y mantener: por qué funciona y cómo implementarla paso a paso.',
      'g6.badge':        'Estrategia',
      'g6.time':         '⏱ 5 min lectura',
      'g6.link':         'Leer guía →',
      // FAQ page
      'faq.eyebrow':     '❓ Resolvemos tus dudas',
      'faq.title':       'Preguntas frecuentes',
      'faq.sub':         'Resolvemos las dudas más comunes sobre brokers e inversión en España',
      'faq.cat1':        '🏦 Sobre Brokers',
      'faq.q1':          '¿Son seguros estos brokers?',
      'faq.a1':          'Sí. Todos los brokers de nuestra comparativa están regulados por organismos oficiales como la CNMV en España o equivalentes europeos (MiFID II). Tu dinero está protegido hasta 100.000€ por el Fondo de Garantía de Inversores (FOGAIN) en caso de insolvencia del broker.',
      'faq.q2':          '¿Cuánto dinero necesito para empezar a invertir?',
      'faq.a2':          'Puedes empezar con tan solo 1€ en brokers como MyInvestor. La clave no es el capital inicial, sino la constancia. Muchos inversores de éxito empezaron con 50-100€ al mes y fueron aumentando gradualmente.',
      'faq.q3':          '¿Qué diferencia hay entre un broker y un roboadvisor?',
      'faq.a3':          'Un broker te permite comprar y vender activos financieros tú mismo (acciones, ETFs, fondos). Un roboadvisor gestiona tu cartera automáticamente según tu perfil de riesgo, sin que tengas que tomar decisiones. Los roboadvisores son ideales para inversores que prefieren una estrategia "set and forget".',
      'faq.q4':          '¿Puedo tener varios brokers a la vez?',
      'faq.a4':          'Sí, es completamente legal y habitual. Muchos inversores españoles tienen MyInvestor para fondos indexados sin comisión, y DEGIRO para operar con ETFs. Cada broker declara tus operaciones de forma independiente y recibirás un informe fiscal de cada uno a principios de año.',
      'faq.cat2':        '📈 Sobre Inversión',
      'faq.q5':          '¿Puedo perder todo mi dinero invirtiendo?',
      'faq.a5':          'En fondos indexados diversificados globalmente es prácticamente imposible perderlo todo, ya que requeriría la quiebra simultánea de miles de empresas en todo el mundo. Sin embargo, sí puedes perder parte de tu inversión a corto plazo. Invertir en acciones individuales o productos apalancados conlleva un riesgo mucho mayor.',
      'faq.q6':          '¿Qué son los fondos indexados?',
      'faq.a6':          'Los fondos indexados son fondos de inversión que replican automáticamente un índice bursátil, como el S&P 500 (las 500 mayores empresas de EE.UU.) o el MSCI World (empresas de todo el mundo). Al invertir en un fondo indexado, inviertes en todas las empresas del índice a la vez, logrando una diversificación muy amplia con comisiones muy bajas.',
      'faq.q7':          '¿Qué es un ETF y cómo funciona?',
      'faq.a7':          'Un ETF (Exchange Traded Fund) es similar a un fondo indexado pero cotiza en bolsa como si fuera una acción, lo que permite comprarlo y venderlo en cualquier momento del día. En España, los ETFs tienen una fiscalidad diferente a los fondos indexados: no puedes hacer traspasos sin tributar, pero suelen tener comisiones aún más bajas.',
      'faq.q8':          '¿Cuánto tiempo necesito para ver resultados?',
      'faq.a8':          'La inversión en fondos indexados está diseñada para el largo plazo (mínimo 5-10 años). A corto plazo el mercado puede bajar, pero históricamente siempre ha subido a largo plazo. El S&P 500 ha dado una rentabilidad media anual de aproximadamente el 10% en los últimos 100 años.',
      'faq.cat3':        '🧭 Sobre BrokerCompass',
      'faq.q9':          '¿Cómo gana dinero BrokerCompass?',
      'faq.a9':          'Recibimos comisiones cuando un usuario abre una cuenta a través de nuestros enlaces de afiliado. Esto no supone ningún coste adicional para ti. Sin embargo, este modelo de negocio NO afecta a nuestras puntuaciones ni al orden de los brokers, que se determina exclusivamente por nuestro análisis independiente.',
      'faq.q10':         '¿Son objetivas vuestras comparativas?',
      'faq.a10':         'Sí. El ranking lo determina exclusivamente nuestro análisis basado en comisiones, seguridad y regulación, facilidad de uso, variedad de productos y atención al cliente. Si un broker tiene mejores condiciones, sube en el ranking aunque no tengamos acuerdo de afiliación con él.',
      'faq.q11':         '¿Con qué frecuencia actualizáis la información?',
      'faq.a11':         'Revisamos las condiciones de cada broker al menos una vez al mes. Si un broker cambia sus comisiones o condiciones de forma relevante, actualizamos la información de inmediato. En la parte superior de cada página indicamos la fecha de la última actualización.',
      'faq.q12':         '¿Puedo sugerir un broker para analizar?',
      'faq.a12':         '¡Por supuesto! Escríbenos a través de nuestro formulario de contacto indicando el nombre del broker que te gustaría que analizáramos. Evaluamos todas las sugerencias y añadimos nuevos brokers cuando cumplen nuestros criterios de calidad y seguridad.',
      'faq.cta.title':   '¿Listo para elegir tu broker?',
      'faq.cta.sub':     'Consulta nuestra comparativa completa y encuentra el que mejor se adapta a ti',
      'faq.cta.btn':     'Ver comparativa completa →',
      // Contact page
      'ct.eyebrow':      '📬 Estamos aquí para ayudarte',
      'ct.title':        'Contacta con BrokerCompass',
      'ct.sub':          '¿Tienes alguna duda o sugerencia? Escríbenos. Respondemos en menos de 48 horas.',
      'ct.form.title':   'Envíanos un mensaje',
      'ct.name.label':   'Nombre completo',
      'ct.email.label':  'Email',
      'ct.subj.label':   'Asunto',
      'ct.subj.ph':      'Selecciona un asunto…',
      'ct.subj.opt1':    'Consulta general',
      'ct.subj.opt2':    'Sugerir un broker',
      'ct.subj.opt3':    'Reportar un error',
      'ct.subj.opt4':    'Colaboración',
      'ct.subj.opt5':    'Otro',
      'ct.msg.label':    'Mensaje',
      'ct.msg.ph':       'Escribe tu mensaje aquí (mínimo 20 caracteres)…',
      'ct.submit':       'Enviar mensaje →',
      'contact.sending': 'Enviando…',
      'ct.ok.strong':    '¡Mensaje enviado!',
      'ct.ok.sub':       'Te respondemos en menos de 48 horas.',
      'ct.info.title':   'Información de contacto',
      'ct.resp.label':   'Respuesta',
      'ct.resp.value':   'Menos de 48 horas',
      'ct.loc.label':    'Ubicación',
      'ct.loc.value':    'España',
      'ct.social.title': 'Síguenos',
      'ct.faq.title':    'Preguntas frecuentes',
      'ct.faq.desc':     '¿Tienes dudas sobre inversión? Quizás ya tenemos la respuesta.',
      'ct.faq.btn':      'Ver FAQ →',
      // Footer
      'ft.desc':         'Comparativa independiente de brokers de inversión para el mercado español, actualizada cada mes.',
      'ft.pages':        'Páginas',
      'ft.legal':        'Legal',
      'ft.about':        'Sobre nosotros',
      'ft.method':       'Metodología',
      'ft.privacy':      'Política de privacidad',
      'ft.cookies':      'Política de cookies',
      // Cookie banner
      'ck.text':         '🍪 Usamos cookies para mejorar tu experiencia.',
      'ck.policy':       'Política de cookies',
      'ck.accept':       'Aceptar',
      'ck.info':         'Más info',
      // Form errors
      'err.name':        'El nombre es obligatorio.',
      'err.email':       'El email es obligatorio.',
      'err.gmail':       'Por favor introduce un email de Gmail (@gmail.com).',
      'err.subject':     'Selecciona un asunto.',
      'err.message':     'El mensaje es obligatorio.',
      'err.minchars':    'Mínimo 20 caracteres.',
    },
    en: {
      // Nav
      'nav.home':        'Home',
      'nav.comparison':  'Comparison',
      'nav.guides':      'Guides',
      'nav.contact':     'Contact',
      'nav.cta':         'Best brokers →',
      // Hero
      'hero.badge':      '✓ Updated May 2026',
      'hero.title':      'Find the best broker to<br><span class="gradient-text">invest in Spain</span>',
      'hero.sub':        'Independent and up-to-date comparison of the most popular brokers. No hidden advertising, no fine print. Just data.',
      'hero.cta':        'See full comparison →',
      'hero.stat1':      'Brokers analyzed',
      'hero.stat2':      'Users helped',
      'hero.stat3':      'Independent analysis',
      // Top 3
      'top.title':       '⭐ Best brokers of 2026',
      'top.sub':         'Based on fees, security and user experience',
      'mi.badge':        'Best for beginners',
      'mi.desc':         'The best Spanish broker to get started. No fees on index funds and from just €1 minimum investment.',
      'ic.badge':        'Best robo-advisor',
      'ic.desc':         'The leading robo-advisor in Spain. Diversified automatic management with very competitive costs.',
      'de.badge':        'Best for ETFs',
      'de.desc':         'The European broker with the most competitive fees for ETFs and international markets.',
      'see.analysis':    'See analysis →',
      // Quiz
      'quiz.title':      '🎯 Which broker is for you?',
      'quiz.sub':        'Answer 3 questions and we recommend the perfect broker for your profile',
      'quiz.q1.label':   'Question 1 of 3',
      'quiz.q1.text':    'How much money do you want to invest initially?',
      'quiz.q1.opt1':    'Less than €1,000',
      'quiz.q1.opt2':    'Between €1,000 and €10,000',
      'quiz.q1.opt3':    'More than €10,000',
      'quiz.q2.label':   'Question 2 of 3',
      'quiz.q2.text':    'What is your investing experience?',
      'quiz.q2.opt1':    'I have never invested',
      'quiz.q2.opt2':    'Some experience',
      'quiz.q2.opt3':    'Experienced investor',
      'quiz.q3.label':   'Question 3 of 3',
      'quiz.q3.text':    'What is your main goal?',
      'quiz.q3.opt1':    'Passive long-term investment',
      'quiz.q3.opt2':    'Active trading',
      'quiz.q3.opt3':    'Supplement my pension',
      'quiz.result':     'Your ideal broker is:',
      'quiz.result.cta': 'See full analysis →',
      'quiz.restart':    'Start again',
      // Trust
      'trust.title':     'Why trust BrokerCompass?',
      'trust1.title':    'Independent analysis',
      'trust1.desc':     'We are not owned by any broker. Our scores reflect real data, not commercial agreements.',
      'trust2.title':    'Updated every month',
      'trust2.desc':     'Fees and conditions change. We review each analysis monthly so you always have fresh data.',
      'trust3.title':    'No fine print',
      'trust3.desc':     'We explain all fees, including hidden ones. If there is a drawback, we say so clearly.',
      'trust4.title':    '50,000+ satisfied users',
      'trust4.desc':     'Thousands of Spanish investors have found their ideal broker thanks to our comparisons.',
      // Blog preview
      'blog.title':      '📚 Learn to invest',
      'blog.sub':        'Everything you need to know to get started',
      'blog1.meta':      'Guide · May 2026',
      'blog1.title':     'How to choose your first broker in Spain',
      'blog1.desc':      'Step by step to open your first investment account without making the most common mistakes.',
      'blog2.meta':      'Guide · April 2026',
      'blog2.title':     'Index funds vs ETFs: which is better?',
      'blog2.desc':      'We compare index funds and ETFs in depth so you know which one fits your strategy.',
      'blog3.meta':      'Guide · March 2026',
      'blog3.title':     'How to start investing with just €100',
      'blog3.desc':      "Proves that you don't need much capital. With €100 you can already build a diversified portfolio.",
      'blog.read':       'Read guide →',
      'blog.all':        'See all guides →',
      // Comparativa page
      'comp.eyebrow':    '📊 Updated May 2026',
      'comp.title':      'Complete broker comparison<br>in Spain 2026',
      'comp.sub':        'We analyze in depth the 6 best brokers on the Spanish market. Real fees, pros and cons, and everything you need to choose with confidence.',
      'filter.all':      'All',
      'filter.beginner': 'Beginner',
      'filter.inter':    'Intermediate',
      'filter.advanced': 'Advanced',
      // Broker shared labels
      'bstat.fees':      'Fees',
      'bstat.min':       'Minimum',
      'bstat.type':      'Type',
      'bstat.markets':   'Markets',
      'pros.title':      '✓ Strengths',
      'cons.title':      '✗ Weaknesses',
      // MyInvestor card
      'mi.full.badge':   'Best for beginners',
      'mi.full.fees':    '0% funds',
      'mi.full.type':    'Broker · Robo-advisor',
      'mi.full.markets': 'Funds · ETFs · Stocks',
      'mi.pro1':         'No fees on index funds',
      'mi.pro2':         'Wide variety of products',
      'mi.pro3':         'Simple interface for beginners',
      'mi.con1':         'Mobile app could be improved',
      'mi.con2':         'Slow customer support',
      'mi.cta':          'Open free account →',
      'mi.regulated':    '🔒 Regulated CNMV',
      'mi.note':         '* Affiliate link — no extra cost for you',
      // Indexa Capital card
      'ic.full.badge':   'Best robo-advisor',
      'ic.full.fees':    '0.43% annual',
      'ic.full.type':    'Robo-advisor',
      'ic.full.markets': 'Index funds · Pensions',
      'ic.pro1':         'Fully automated management',
      'ic.pro2':         'Low cost compared to active funds',
      'ic.pro3':         'Excellent performance track record',
      'ic.con1':         'Minimum investment €1,000',
      'ic.con2':         'No individual stocks',
      'ic.cta':          'Try free for 6 months →',
      'ic.regulated':    '🔒 Regulated CNMV',
      'ic.note':         '* Affiliate link — no extra cost for you',
      // DEGIRO card
      'de.full.badge':   'Best for ETFs',
      'de.full.fees':    'From €0 ETFs',
      'de.full.type':    'Broker',
      'de.full.markets': 'ETFs · Stocks · Options',
      'de.pro1':         'Very low ETF fees',
      'de.pro2':         'Wide variety of international markets',
      'de.pro3':         'No minimum investment',
      'de.con1':         'No traditional index funds',
      'de.con2':         'Customer support in English only',
      'de.cta':          'Open account →',
      'de.regulated':    '🔒 Regulated BaFin / CNMV',
      'de.note':         '* Affiliate link — no extra cost for you',
      // Interactive Brokers card
      'ib.badge':        'Best for advanced',
      'ib.fees':         'From €0',
      'ib.type':         'Professional broker',
      'ib.markets':      'All global assets',
      'ib.pro1':         'The most complete broker on the market',
      'ib.pro2':         'Access to all global markets',
      'ib.pro3':         'Advanced professional tools',
      'ib.con1':         'Complex interface for beginners',
      'ib.con2':         'Inactivity fees',
      'ib.cta':          'Open account →',
      'ib.regulated':    '🔒 Regulated SEC / FCA / CNMV',
      'ib.note':         '* Affiliate link — no extra cost for you',
      // Finizens card
      'fz.badge':        'Lowest fees',
      'fz.fees':         'From 0.12%',
      'fz.type':         'Robo-advisor',
      'fz.markets':      'Index funds · Pensions',
      'fz.pro1':         'The lowest fees on the market',
      'fz.pro2':         'Very easy to use',
      'fz.pro3':         'Programmable automatic contributions',
      'fz.con1':         'No individual stocks',
      'fz.con2':         'Low portfolio flexibility',
      'fz.cta':          'Get started →',
      'fz.regulated':    '🔒 Regulated CNMV',
      'fz.note':         '* Affiliate link — no extra cost for you',
      // eToro card
      'et.badge':        'Best app',
      'et.fees':         '0% stocks',
      'et.type':         'Social broker',
      'et.markets':      'Stocks · ETFs · Cryptos',
      'et.pro1':         'Unique CopyTrading on the market',
      'et.pro2':         'Excellent and intuitive app',
      'et.pro3':         'Large investor community',
      'et.con1':         'Spread on operations (hidden cost)',
      'et.con2':         'Not ideal for long-term investment',
      'et.cta':          'Open account →',
      'et.regulated':    '🔒 Regulated CySEC / FCA',
      'et.note':         '* Affiliate link — no extra cost for you',
      // Table
      'tbl.title':       'Quick comparison',
      'tbl.sub':         'All brokers at a glance',
      'th.broker':       'Broker',
      'th.score':        'Score',
      'th.fees':         'Fees',
      'th.min':          'Minimum',
      'th.bestfor':      'Best for',
      'th.reg':          'Regulation',
      'th.action':       'Action',
      'td.beginner':     'Beginner',
      'td.inter':        'Intermediate',
      'td.intadv':       'Intermediate/Advanced',
      'td.advanced':     'Advanced',
      'td.begint':       'Beginner/Intermediate',
      'tbl.open':        'Open',
      'tbl.6m':          '6 months free',
      'tbl.start':       'Start',
      // Methodology
      'meth.title':      'How do we choose brokers?',
      'meth.sub':        'We evaluate each broker with the same objective criteria so you can trust our analyses.',
      'meth1.title':     'Security and regulation',
      'meth1.desc':      'We verify that all brokers are regulated by recognized bodies (CNMV, FCA, BaFin, SEC). Protecting your money comes first.',
      'meth2.title':     'Fees and costs',
      'meth2.desc':      'We analyze all fees, including hidden ones: spreads, inactivity fees, currency exchange and withdrawals.',
      'meth3.title':     'Ease of use',
      'meth3.desc':      'We test the web platform and mobile app. We value the learning curve, interface clarity and real user experience.',
      'meth4.title':     'Product variety',
      'meth4.desc':      'We evaluate the range of available assets: stocks, ETFs, funds, cryptos, options and more.',
      'meth5.title':     'Customer service',
      'meth5.desc':      "We contact each broker's support team to evaluate response times and quality of answers.",
      // Guides page
      'guides.eyebrow':  '📚 Financial education',
      'guides.title':    'Guides to invest in Spain',
      'guides.sub':      'Everything you need to know to start investing intelligently',
      'g1.title':        'How to choose your first broker',
      'g1.desc':         'Step by step to open your first investment account in Spain without making the most common mistakes. From regulation to fees.',
      'g1.badge':        'Beginners',
      'g1.time':         '⏱ 8 min read',
      'g1.link':         'Read guide →',
      'g2.title':        'Index funds: complete guide',
      'g2.desc':         'What they are, how they work and why they are the favorite option of long-term investors. Includes the best funds available in Spain.',
      'g2.badge':        'Funds',
      'g2.time':         '⏱ 12 min read',
      'g2.link':         'Read guide →',
      'g3.title':        'ETFs vs Index funds',
      'g3.desc':         'Key differences in taxation, liquidity and access. Discover which of the two fits better with your investment strategy and time horizon.',
      'g3.badge':        'ETFs',
      'g3.time':         '⏱ 6 min read',
      'g3.link':         'Read guide →',
      'g4.title':        'How to declare investments in your tax return',
      'g4.desc':         'Everything about the taxation of stocks, funds and ETFs in Spain. When to pay, how to calculate gains and which boxes to fill in.',
      'g4.badge':        'Taxation',
      'g4.time':         '⏱ 10 min read',
      'g4.link':         'Read guide →',
      'g5.title':        'How to diversify your portfolio',
      'g5.desc':         'The golden rule of investing explained with real examples. Learn to distribute your money to minimize risk without sacrificing returns.',
      'g5.badge':        'Strategy',
      'g5.time':         '⏱ 7 min read',
      'g5.link':         'Read guide →',
      'g6.title':        'Buy & Hold strategy explained',
      'g6.desc':         "Warren Buffett's favorite strategy applied to the Spanish investor. Buy and hold: why it works and how to implement it step by step.",
      'g6.badge':        'Strategy',
      'g6.time':         '⏱ 5 min read',
      'g6.link':         'Read guide →',
      // FAQ page
      'faq.eyebrow':     '❓ We answer your questions',
      'faq.title':       'Frequently asked questions',
      'faq.sub':         'We answer the most common questions about brokers and investing in Spain',
      'faq.cat1':        '🏦 About Brokers',
      'faq.q1':          'Are these brokers safe?',
      'faq.a1':          'Yes. All brokers in our comparison are regulated by official bodies such as the CNMV in Spain or European equivalents (MiFID II). Your money is protected up to €100,000 by the Investor Guarantee Fund (FOGAIN) in the event of broker insolvency.',
      'faq.q2':          'How much money do I need to start investing?',
      'faq.a2':          'You can start with as little as €1 with brokers like MyInvestor. The key is not the initial capital, but consistency. Many successful investors started with €50-100 per month and gradually increased.',
      'faq.q3':          'What is the difference between a broker and a robo-advisor?',
      'faq.a3':          'A broker lets you buy and sell financial assets yourself (stocks, ETFs, funds). A robo-advisor manages your portfolio automatically according to your risk profile, without you having to make decisions. Robo-advisors are ideal for investors who prefer a "set and forget" strategy.',
      'faq.q4':          'Can I have multiple brokers at the same time?',
      'faq.a4':          'Yes, it is completely legal and common. Many Spanish investors have MyInvestor for commission-free index funds, and DEGIRO for trading ETFs. Each broker reports your operations independently and you will receive a tax report from each one at the beginning of the year.',
      'faq.cat2':        '📈 About Investing',
      'faq.q5':          'Can I lose all my money investing?',
      'faq.a5':          'In globally diversified index funds it is practically impossible to lose everything, as it would require the simultaneous bankruptcy of thousands of companies worldwide. However, you can lose part of your investment in the short term. Investing in individual stocks or leveraged products carries much greater risk.',
      'faq.q6':          'What are index funds?',
      'faq.a6':          'Index funds are investment funds that automatically replicate a stock market index, such as the S&P 500 (the 500 largest US companies) or the MSCI World (companies from around the world). By investing in an index fund, you invest in all companies in the index at once, achieving very broad diversification with very low fees.',
      'faq.q7':          'What is an ETF and how does it work?',
      'faq.a7':          'An ETF (Exchange Traded Fund) is similar to an index fund but trades on the stock exchange like a stock, allowing you to buy and sell it at any time of day. In Spain, ETFs have different taxation than index funds: you cannot transfer without paying tax, but they usually have even lower fees.',
      'faq.q8':          'How long do I need to see results?',
      'faq.a8':          'Investing in index funds is designed for the long term (minimum 5-10 years). In the short term the market may fall, but historically it has always risen in the long term. The S&P 500 has delivered an average annual return of approximately 10% over the last 100 years.',
      'faq.cat3':        '🧭 About BrokerCompass',
      'faq.q9':          'How does BrokerCompass make money?',
      'faq.a9':          'We receive commissions when a user opens an account through our affiliate links. This does not involve any additional cost for you. However, this business model does NOT affect our scores or the order of brokers, which is determined exclusively by our independent analysis.',
      'faq.q10':         'Are your comparisons objective?',
      'faq.a10':         'Yes. The ranking is determined exclusively by our analysis based on fees, security and regulation, ease of use, product variety and customer service. If a broker has better conditions, it rises in the ranking even if we have no affiliate agreement with it.',
      'faq.q11':         'How often do you update the information?',
      'faq.a11':         "We review each broker's conditions at least once a month. If a broker changes its fees or conditions significantly, we update the information immediately. At the top of each page we indicate the date of the last update.",
      'faq.q12':         'Can I suggest a broker to analyze?',
      'faq.a12':         'Of course! Write to us through our contact form indicating the name of the broker you would like us to analyze. We evaluate all suggestions and add new brokers when they meet our quality and safety criteria.',
      'faq.cta.title':   'Ready to choose your broker?',
      'faq.cta.sub':     'Check our full comparison and find the one that best suits you',
      'faq.cta.btn':     'See full comparison →',
      // Contact page
      'ct.eyebrow':      '📬 We are here to help you',
      'ct.title':        'Contact BrokerCompass',
      'ct.sub':          'Do you have a question or suggestion? Write to us. We respond within 48 hours.',
      'ct.form.title':   'Send us a message',
      'ct.name.label':   'Full name',
      'ct.email.label':  'Email',
      'ct.subj.label':   'Subject',
      'ct.subj.ph':      'Select a subject…',
      'ct.subj.opt1':    'General inquiry',
      'ct.subj.opt2':    'Suggest a broker',
      'ct.subj.opt3':    'Report an error',
      'ct.subj.opt4':    'Collaboration',
      'ct.subj.opt5':    'Other',
      'ct.msg.label':    'Message',
      'ct.msg.ph':       'Write your message here (minimum 20 characters)…',
      'ct.submit':       'Send message →',
      'contact.sending': 'Sending…',
      'ct.ok.strong':    'Message sent!',
      'ct.ok.sub':       'We will respond within 48 hours.',
      'ct.info.title':   'Contact information',
      'ct.resp.label':   'Response time',
      'ct.resp.value':   'Less than 48 hours',
      'ct.loc.label':    'Location',
      'ct.loc.value':    'Spain',
      'ct.social.title': 'Follow us',
      'ct.faq.title':    'Frequently asked questions',
      'ct.faq.desc':     'Do you have questions about investing? We may already have the answer.',
      'ct.faq.btn':      'See FAQ →',
      // Footer
      'ft.desc':         'Independent broker comparison for the Spanish market, updated every month.',
      'ft.pages':        'Pages',
      'ft.legal':        'Legal',
      'ft.about':        'About us',
      'ft.method':       'Methodology',
      'ft.privacy':      'Privacy policy',
      'ft.cookies':      'Cookie policy',
      // Cookie banner
      'ck.text':         '🍪 We use cookies to improve your experience.',
      'ck.policy':       'Cookie policy',
      'ck.accept':       'Accept',
      'ck.info':         'More info',
      // Form errors
      'err.name':        'Name is required.',
      'err.email':       'Email is required.',
      'err.gmail':       'Please enter a Gmail address (@gmail.com).',
      'err.subject':     'Please select a subject.',
      'err.message':     'Message is required.',
      'err.minchars':    'Minimum 20 characters.',
    }
  };

  let currentLang = 'es';

  function setLanguage(lang) {
    currentLang = lang;

    // Simple text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = translations[lang][key];
      if (val !== undefined) el.textContent = val;
    });

    // HTML content (for elements with inner tags like <span>, <br>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      const val = translations[lang][key];
      if (val !== undefined) el.innerHTML = val;
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      const val = translations[lang][key];
      if (val !== undefined) el.placeholder = val;
    });

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update page title
    const titles = lang === 'en' ? pageTitlesEN : pageTitles;
    document.title = titles[currentPage] || titles.inicio;

    // Update translate button
    const btn = document.getElementById('translateBtn');
    if (btn) btn.textContent = lang === 'es' ? '🌐 EN' : '🌐 ES';

    // Re-render quiz result if visible
    const quizResult = document.getElementById('quizResult');
    if (quizResult && quizResult.classList.contains('active') && window._quizShowResult) {
      window._quizShowResult();
    }
  }

  const translateBtn = document.getElementById('translateBtn');
  if (translateBtn) {
    translateBtn.addEventListener('click', () => {
      setLanguage(currentLang === 'es' ? 'en' : 'es');
    });
  }

});
