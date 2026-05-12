/* ================================================================
   BROKERCOMPASS — optimizations.js
   Módulo de optimizaciones de rendimiento
   Incluir ANTES de main.js en index.html
   ================================================================ */

// ================================================================
// 1. UTILITY: Debounce
// ================================================================
function debounce(fn, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ================================================================
// 2. UTILITY: Throttle
// ================================================================
function throttle(fn, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ================================================================
// 3. LAZY LOADING CON INTERSECTION OBSERVER
// ================================================================
const LazyLoadManager = {
  init() {
    // Lazy load imágenes
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Precargar 50px antes
    });

    images.forEach(img => imageObserver.observe(img));

    // Lazy load secciones pesadas
    const lazySections = document.querySelectorAll('[data-lazy-section]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const moduleURL = section.dataset.lazySectionUrl;
          if (moduleURL) {
            this.loadModule(moduleURL);
          }
          sectionObserver.unobserve(section);
        }
      });
    }, { rootMargin: '100px' });

    lazySections.forEach(section => sectionObserver.observe(section));
  },

  loadModule(url) {
    console.log(`[LazyLoad] Cargando módulo: ${url}`);
    // Aquí cargarías módulos dinámicamente si fuera necesario
  }
};

// ================================================================
// 4. EVENT DELEGATION
// ================================================================
const EventManager = {
  init() {
    // Centralizar clicks en lugar de listeners individuales
    document.addEventListener('click', (e) => {
      // Brokers container
      const brokerCard = e.target.closest('[data-broker]');
      if (brokerCard) {
        this.handleBrokerClick(brokerCard);
        return;
      }

      // Guide buttons
      const guideBtn = e.target.closest('.guide-modal-btn');
      if (guideBtn) {
        this.handleGuideClick(guideBtn);
        return;
      }

      // CTA affiliate buttons
      const affiliateBtn = e.target.closest('[data-affiliate]');
      if (affiliateBtn) {
        this.handleAffiliateClick(affiliateBtn);
        return;
      }
    });
  },

  handleBrokerClick(card) {
    const brokerId = card.dataset.broker;
    console.log(`[Broker Clicked] ${brokerId}`);
    // Analytics tracking
    if (window.gtag) {
      gtag('event', 'broker_view', { broker_id: brokerId });
    }
  },

  handleGuideClick(btn) {
    const guideId = btn.dataset.guide;
    console.log(`[Guide Clicked] ${guideId}`);
  },

  handleAffiliateClick(btn) {
    const broker = btn.dataset.affiliate;
    // Trackear click de afiliado
    if (window.trackAffiliateClick) {
      trackAffiliateClick(broker, 'cta_click');
    }
  }
};

// ================================================================
// 5. DOM REFERENCE CACHING
// ================================================================
const DOMCache = {
  nav: null,
  progBar: null,
  pages: null,
  navLinks: null,

  init() {
    // Cache elementos que se acceden frecuentemente
    this.nav = document.getElementById('nav');
    this.progBar = document.getElementById('progBar');
    this.pages = document.querySelectorAll('.page');
    this.navLinks = document.querySelectorAll('[data-page]');
  },

  getNav() { return this.nav; },
  getProgBar() { return this.progBar; },
  getPages() { return this.pages; },
  getNavLinks() { return this.navLinks; }
};

// ================================================================
// 6. SCROLL OPTIMIZATION
// ================================================================
const ScrollOptimizer = {
  ticking: false,
  lastScrollY: 0,

  init() {
    // Usar passive: true para mejorar scroll performance
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
  },

  onScroll() {
    this.lastScrollY = window.scrollY;

    if (!this.ticking) {
      window.requestAnimationFrame(this.update.bind(this));
      this.ticking = true;
    }
  },

  update() {
    // Actualizar barra de progreso
    const progBar = DOMCache.getProgBar();
    if (progBar) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (this.lastScrollY / scrollHeight) * 100;
      progBar.style.width = scrolled + '%';
    }

    // Mostrar/ocultar navbar al scroll
    this.updateNavbar();

    this.ticking = false;
  },

  updateNavbar() {
    const nav = DOMCache.getNav();
    if (!nav) return;

    // Ocultar navbar al hacer scroll down, mostrar al scroll up
    if (this.lastScrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
};

// ================================================================
// 7. ANALYTICS HELPER
// ================================================================
const AnalyticsHelper = {
  trackEvent(category, action, label, value) {
    if (window.gtag) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value || undefined
      });
    }
  },

  trackAffiliateClick(broker, source) {
    this.trackEvent('affiliate', 'click', broker, 1);
    this.trackAffiliateServer(broker, source);
  },

  trackAffiliateServer(broker, source) {
    // Trackear en Supabase
    const timestamp = new Date().toISOString();
    
    // Enviar POST a un endpoint que maneje la inserción
    fetch('/api/track-affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broker: broker,
        source: source,
        timestamp: timestamp,
        referrer: document.referrer,
        pathname: location.pathname
      })
    }).catch(err => console.warn('Analytics failed:', err));
  }
};

// ================================================================
// 8. PERFORMANCE MONITORING
// ================================================================
const PerformanceMonitor = {
  init() {
    // Web Vitals
    if ('web-vital' in window) {
      // LCP (Largest Contentful Paint)
      window.addEventListener('load', () => {
        const lcpEntry = performance.getEntriesByName('largest-contentful-paint')[0];
        if (lcpEntry) {
          console.log(`[LCP] ${Math.round(lcpEntry.startTime)}ms`);
        }
      });
    }

    // First Paint
    if ('performance' in window) {
      const perfEntries = performance.getEntriesByType('paint');
      perfEntries.forEach(entry => {
        console.log(`[${entry.name}] ${Math.round(entry.startTime)}ms`);
      });
    }
  }
};

// ================================================================
// 9. INICIALIZACIÓN
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Orden importante: cache primero
  DOMCache.init();

  // Luego optimizaciones
  LazyLoadManager.init();
  EventManager.init();
  ScrollOptimizer.init();
  PerformanceMonitor.init();

  console.log('[Optimizations] Inicializadas correctamente');
});

// ================================================================
// 10. EXPORT PARA USO EN main.js
// ================================================================
window.OptimizationUtils = {
  debounce,
  throttle,
  trackEvent: AnalyticsHelper.trackEvent.bind(AnalyticsHelper),
  trackAffiliateClick: AnalyticsHelper.trackAffiliateClick.bind(AnalyticsHelper),
  DOMCache
};
