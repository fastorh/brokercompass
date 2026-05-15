/* ================================================================
   BROKERCOMPASS — analytics.js
   GA4 event tracking: CTAs afiliado, quiz, newsletter, navegación
   ================================================================
   SETUP:
   1. Sustituye G-XXXXXXXXXX por tu Measurement ID de GA4
   2. Añade en index.html, justo antes de </head>:

      <!-- Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX', { send_page_view: false });
      </script>

   3. Añade en index.html, justo antes de </body> (después de main.js):
      <script src="analytics.js"></script>
   ================================================================ */

(function () {
  'use strict';

  /* ── Helper: dispara un evento GA4 sólo si gtag está disponible ── */
  function track(eventName, params) {
    if (typeof gtag !== 'function') return;
    gtag('event', eventName, params);
  }

  /* ── Mapeo broker → ID de sección para leer el nombre del broker ── */
  const BROKER_IDS = [
    'myinvestor',
    'indexa-capital',
    'degiro',
    'interactive-brokers',
    'etoro',
    'trade-republic',
    'finizens',
  ];

  /* ── Extrae el nombre del broker más cercano al elemento clicado ── */
  function getBrokerName(el) {
    const card = el.closest('[id]');
    if (card && BROKER_IDS.includes(card.id)) {
      return card.id;
    }
    // Fallback: busca el nombre en el h2 más cercano dentro de la card
    const brokerCard = el.closest('.broker-card');
    if (brokerCard) {
      const name = brokerCard.querySelector('.broker-name');
      return name ? name.textContent.trim() : 'desconocido';
    }
    return 'desconocido';
  }

  /* ── Detecta en qué sección de la página está el CTA ── */
  function getCtaContext(el) {
    if (el.closest('#comparativa') || el.closest('.page#comparativa')) return 'comparativa';
    if (el.closest('.broker-table'))   return 'tabla_comparativa';
    if (el.closest('#quizResult'))     return 'quiz_resultado';
    if (el.closest('.hero'))           return 'hero';
    return 'otro';
  }

  /* ================================================================
     1. CTA AFILIADO — "Abrir cuenta →"
     Evento: affiliate_click
     Params: broker_name, cta_context, destination_url
  ================================================================ */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('a[rel~="sponsored"], a[href*="refnocode"], a[href*="afiliado"]');
    if (!btn) return;

    const broker  = getBrokerName(btn);
    const context = getCtaContext(btn);
    const url     = btn.href || btn.getAttribute('href') || '';

    track('affiliate_click', {
      broker_name:     broker,
      cta_context:     context,
      destination_url: url,
      // GA4 lo marca como conversión si configuras 'generate_lead' en el panel
    });

    // También dispara generate_lead para el funnel de conversiones
    track('generate_lead', {
      currency: 'EUR',
      value:    1,          // actualiza con el CPL real cuando lo tengas
      broker_name: broker,
    });
  });

  /* ================================================================
     2. BOTONES "Abrir" de la tabla comparativa
     Evento: affiliate_click (misma lógica, distinto contexto)
  ================================================================ */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.broker-table .btn');
    if (!btn) return;

    // Si ya lo capturó el listener anterior, no duplicar
    if (btn.rel && btn.rel.includes('sponsored')) return;

    const row    = btn.closest('tr');
    const nombre = row ? row.querySelector('td strong') : null;

    track('affiliate_click', {
      broker_name:     nombre ? nombre.textContent.trim() : 'desconocido',
      cta_context:     'tabla_comparativa',
      destination_url: btn.href || '',
    });
  });

  /* ================================================================
     3. QUIZ — respuestas y resultado final
     Evento: quiz_answer (por pregunta)
     Evento: quiz_complete (al mostrar resultado)
  ================================================================ */
  document.addEventListener('click', function (e) {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;

    const pregunta = opt.dataset.q;
    const valor    = opt.dataset.val;

    // Mapa legible para el panel de GA4
    const labels = {
      '1': { small: 'menos_1000', medium: '1000_10000', large: 'mas_10000' },
      '2': { beginner: 'principiante', intermediate: 'intermedio', advanced: 'avanzado' },
      '3': { passive: 'inversion_pasiva', trading: 'trading', pension: 'pension' },
    };

    track('quiz_answer', {
      quiz_question: 'pregunta_' + pregunta,
      quiz_answer:   (labels[pregunta] && labels[pregunta][valor]) || valor,
    });
  });

  /* Resultado del quiz: observa cuándo aparece la pantalla de resultado */
  const quizResult = document.getElementById('quizResult');
  if (quizResult) {
    const observer = new MutationObserver(function () {
      if (quizResult.classList.contains('active')) {
        const brokerName = document.getElementById('quizBrokerName');
        track('quiz_complete', {
          broker_recommended: brokerName ? brokerName.textContent.trim() : 'desconocido',
        });
      }
    });
    observer.observe(quizResult, { attributes: true, attributeFilter: ['class'] });
  }

  /* ================================================================
     4. NEWSLETTER — suscripción
     Evento: newsletter_signup
  ================================================================ */
  document.querySelectorAll('.newsletter-form, #nlForm').forEach(function (form) {
    form.addEventListener('submit', function () {
      track('newsletter_signup', {
        form_location: getCtaContext(form),
      });
    });
  });

  /* ================================================================
     5. NAVEGACIÓN SPA — virtual pageviews
     Evento: page_view (manual, porque es SPA sin recarga)
     Se engancha al pushState que ya hace main.js
  ================================================================ */
  const _pushState = history.pushState.bind(history);
  history.pushState = function (state, title, url) {
    _pushState(state, title, url);
    const page = (state && state.page) || 'inicio';
    track('page_view', {
      page_title:    document.title,
      page_location: window.location.href,
      page_path:     '#' + page,
    });
  };

  /* Popstate (botón atrás del navegador) */
  window.addEventListener('popstate', function (e) {
    const page = (e.state && e.state.page) || 'inicio';
    track('page_view', {
      page_title:    document.title,
      page_location: window.location.href,
      page_path:     '#' + page,
    });
  });

  /* Pageview inicial (la SPA no dispara page_view automático) */
  track('page_view', {
    page_title:    document.title,
    page_location: window.location.href,
    page_path:     window.location.hash || '#inicio',
  });

  /* ================================================================
     6. GUÍAS — apertura de modal
     Evento: guide_open
  ================================================================ */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.guide-modal-btn');
    if (!btn) return;
    track('guide_open', {
      guide_id: btn.dataset.guide || 'desconocido',
    });
  });

  /* ================================================================
     7. SCROLL DEPTH — engagement real
     Evento: scroll_depth (25%, 50%, 75%, 100%)
  ================================================================ */
  const depthsReported = new Set();
  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY + window.innerHeight;
    const total    = document.body.scrollHeight;
    const pct      = Math.round((scrolled / total) * 100);

    [25, 50, 75, 100].forEach(function (threshold) {
      if (pct >= threshold && !depthsReported.has(threshold)) {
        depthsReported.add(threshold);
        track('scroll', { percent_scrolled: threshold });
      }
    });
  }, { passive: true });

  /* ================================================================
     8. TIEMPO EN PÁGINA — engagement mínimo garantizado
     Evento: time_on_page (a los 30s y 2 min)
  ================================================================ */
  [30, 120].forEach(function (seconds) {
    setTimeout(function () {
      track('timing_complete', {
        name:  'time_on_page',
        value: seconds * 1000,
        event_category: 'engagement',
      });
    }, seconds * 1000);
  });

})();
