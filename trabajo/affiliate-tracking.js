/* ================================================================
   BROKERCOMPASS — affiliate-tracking.js
   Sistema de tracking de clientes afiliados
   ================================================================ */

// ================================================================
// 1. CONFIGURACIÓN
// ================================================================

const AFFILIATE_CONFIG = {
  brokers: {
    myinvestor: {
      name: 'MyInvestor',
      url: 'https://myinvestor.es?ref=brokercompass',
      commission_eur: 12,
      category: 'indexed_funds'
    },
    degiro: {
      name: 'DEGIRO',
      url: 'https://degiro.nl?ref=brokercompass',
      commission_eur: 15,
      category: 'stocks'
    },
    indexa: {
      name: 'Indexa Capital',
      url: 'https://indexacapital.com?ref=brokercompass',
      commission_eur: 20,
      category: 'indexed_funds'
    },
    interactive: {
      name: 'Interactive Brokers',
      url: 'https://interactivebrokers.com?ref=brokercompass',
      commission_eur: 25,
      category: 'professional'
    },
    finizens: {
      name: 'Finizens',
      url: 'https://finizens.com?ref=brokercompass',
      commission_eur: 18,
      category: 'robo_advisor'
    },
    etoro: {
      name: 'eToro',
      url: 'https://etoro.com?ref=brokercompass',
      commission_eur: 150,
      category: 'copy_trading'
    }
  }
};

// ================================================================
// 2. ANALYTICS TRACKING
// ================================================================

const AffiliateTracking = {
  // Inicializar Google Analytics (si está cargado)
  initGoogleAnalytics() {
    if (!window.gtag) {
      console.warn('[Affiliate] Google Analytics no está cargado');
      return;
    }

    // Configurar página virtual
    gtag('config', 'GA_MEASUREMENT_ID', {
      'page_path': location.pathname,
      'page_title': document.title,
      'custom_map': {
        'dimension1': 'broker_id',
        'dimension2': 'broker_category',
        'dimension3': 'traffic_source',
        'metric1': 'affiliate_clicks',
        'metric2': 'affiliate_value'
      }
    });
  },

  // Trackear click en broker
  trackBrokerClick(brokerId, source = 'organic') {
    const broker = AFFILIATE_CONFIG.brokers[brokerId];
    if (!broker) {
      console.error(`[Affiliate] Broker no encontrado: ${brokerId}`);
      return;
    }

    // Google Analytics event
    if (window.gtag) {
      gtag('event', 'affiliate_click', {
        'broker_id': brokerId,
        'broker_name': broker.name,
        'broker_category': broker.category,
        'traffic_source': source,
        'page_path': location.pathname,
        'referrer': document.referrer,
        'user_id': this.getAnonymousUserId()
      });
    }

    // Trackear en servidor
    this.trackToServer({
      broker_id: brokerId,
      event_type: 'click',
      source: source,
      timestamp: new Date().toISOString(),
      user_hash: this.getAnonymousUserId(),
      page_path: location.pathname,
      referrer: document.referrer
    });

    // Log local
    console.log(`[Affiliate Click] ${broker.name} (${source})`);
  },

  // Trackear conversión (simulated - en realidad lo haría el broker)
  trackConversion(brokerId, depositAmount = null) {
    const broker = AFFILIATE_CONFIG.brokers[brokerId];
    if (!broker) return;

    if (window.gtag) {
      gtag('event', 'affiliate_conversion', {
        'broker_id': brokerId,
        'broker_name': broker.name,
        'commission_value': broker.commission_eur,
        'deposit_amount': depositAmount,
        'user_id': this.getAnonymousUserId()
      });
    }

    this.trackToServer({
      broker_id: brokerId,
      event_type: 'conversion',
      commission_eur: broker.commission_eur,
      deposit_amount: depositAmount,
      timestamp: new Date().toISOString(),
      user_hash: this.getAnonymousUserId()
    });
  },

  // Crear hash anónimo del usuario (GDPR compliant)
  getAnonymousUserId() {
    let userId = sessionStorage.getItem('brokercompass_user_id');
    if (!userId) {
      // Generar ID anónimo basado en fecha + random
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      userId = `${timestamp}-${random}`;
      sessionStorage.setItem('brokercompass_user_id', userId);
    }
    return userId;
  },

  // Enviar data a servidor
  trackToServer(data) {
    // Usar un endpoint tuyo (Vercel Edge Function o similar)
    fetch('/api/track-affiliate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .catch(err => console.warn('[Affiliate] Server tracking failed:', err));
  }
};

// ================================================================
// 3. AFFILIATE LINK MANAGER
// ================================================================

const AffiliateLinks = {
  // Generar URL de afiliado con parámetros UTM
  generateAffiliateLink(brokerId, source = 'comparativa', medium = 'organic') {
    const broker = AFFILIATE_CONFIG.brokers[brokerId];
    if (!broker) return '';

    const url = new URL(broker.url);
    url.searchParams.append('utm_source', source);
    url.searchParams.append('utm_medium', medium);
    url.searchParams.append('utm_campaign', 'brokercompass');
    url.searchParams.append('utm_content', brokerId);

    return url.toString();
  },

  // Redirigir a broker y trackear click
  redirectToBroker(brokerId, source = 'comparativa') {
    AffiliateTracking.trackBrokerClick(brokerId, source);
    
    const url = this.generateAffiliateLink(brokerId, source, 'cpc');
    
    // Pequeño delay para asegurar que se envía el evento
    setTimeout(() => {
      window.open(url, '_blank');
    }, 100);
  }
};

// ================================================================
// 4. INSERTAR BOTONES DE AFILIADO DINÁMICAMENTE
// ================================================================

const AffiliateButtons = {
  // Insertar botón en cada tarjeta de broker
  insertButtons() {
    document.querySelectorAll('[data-broker-id]').forEach(card => {
      const brokerId = card.dataset.brokerId;
      const broker = AFFILIATE_CONFIG.brokers[brokerId];
      
      if (!broker) return;

      // Buscar o crear contenedor de CTA
      let ctaContainer = card.querySelector('.broker-cta');
      if (!ctaContainer) {
        ctaContainer = document.createElement('div');
        ctaContainer.className = 'broker-cta';
        card.appendChild(ctaContainer);
      }

      // Limpiar
      ctaContainer.innerHTML = '';

      // Crear botón
      const btn = document.createElement('a');
      btn.href = AffiliateLinks.generateAffiliateLink(brokerId, 'comparativa');
      btn.className = 'btn btn-primary';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.textContent = `Abrir ${broker.name} →`;
      btn.dataset.affiliate = brokerId;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        AffiliateTracking.trackBrokerClick(brokerId, 'comparison_table');
        window.open(AffiliateLinks.generateAffiliateLink(brokerId, 'table'), '_blank');
      });

      ctaContainer.appendChild(btn);
    });
  }
};

// ================================================================
// 5. DASHBOARD DE AFFILIATE STATS (Para ti)
// ================================================================

const AffiliateDashboard = {
  async fetchStats(brokerId) {
    try {
      const response = await fetch(`/api/affiliate-stats?broker=${brokerId}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  },

  async displayStats() {
    const dashboard = document.getElementById('affiliate-dashboard');
    if (!dashboard) return;

    const stats = await Promise.all(
      Object.keys(AFFILIATE_CONFIG.brokers).map(bid => this.fetchStats(bid))
    );

    // Generar HTML
    let html = '<table class="stats-table"><thead><tr><th>Broker</th><th>Clicks</th><th>Conversiones</th><th>Ingresos</th></tr></thead><tbody>';
    
    stats.forEach((stat, i) => {
      if (stat) {
        html += `<tr>
          <td>${stat.broker_name}</td>
          <td>${stat.clicks}</td>
          <td>${stat.conversions}</td>
          <td>€${stat.revenue}</td>
        </tr>`;
      }
    });

    html += '</tbody></table>';
    dashboard.innerHTML = html;
  }
};

// ================================================================
// 6. INICIALIZACIÓN
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  AffiliateTracking.initGoogleAnalytics();
  AffiliateButtons.insertButtons();

  console.log('[Affiliate System] Inicializado');
});

// ================================================================
// EXPORT para uso en main.js
// ================================================================

window.AffiliateSystem = {
  trackClick: AffiliateTracking.trackBrokerClick.bind(AffiliateTracking),
  trackConversion: AffiliateTracking.trackConversion.bind(AffiliateTracking),
  redirectToBroker: AffiliateLinks.redirectToBroker.bind(AffiliateLinks),
  generateLink: AffiliateLinks.generateAffiliateLink.bind(AffiliateLinks)
};
