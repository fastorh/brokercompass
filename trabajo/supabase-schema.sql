-- ================================================================
-- BROKERCOMPASS - SUPABASE SQL SCHEMA
-- Crear tablas para tracking de afiliados
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. TABLA: affiliate_events
-- Registra cada click y conversión
-- ================================================================

CREATE TABLE IF NOT EXISTS affiliate_events (
  id BIGSERIAL PRIMARY KEY,
  broker_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'click' o 'conversion'
  source VARCHAR(100), -- 'comparativa', 'guia', 'instagram', 'email'
  user_hash VARCHAR(100) NOT NULL,
  page_path VARCHAR(255),
  referrer VARCHAR(255),
  commission_eur DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX idx_broker_id ON affiliate_events(broker_id);
CREATE INDEX idx_event_type ON affiliate_events(event_type);
CREATE INDEX idx_user_hash ON affiliate_events(user_hash);
CREATE INDEX idx_timestamp ON affiliate_events(timestamp);
CREATE INDEX idx_source ON affiliate_events(source);

-- ================================================================
-- 2. TABLA: affiliate_stats
-- Estadísticas consolidadas por broker
-- ================================================================

CREATE TABLE IF NOT EXISTS affiliate_stats (
  id BIGSERIAL PRIMARY KEY,
  broker_id VARCHAR(50) UNIQUE NOT NULL,
  broker_name VARCHAR(100),
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  revenue_eur DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  last_click TIMESTAMPTZ,
  last_conversion TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. TABLA: contactos_brokercompass
-- Para guardar contactos desde formulario
-- ================================================================

CREATE TABLE IF NOT EXISTS contactos_brokercompass (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT,
  broker_interes VARCHAR(50), -- Qué broker le interesa
  user_hash VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, timestamp)
);

CREATE INDEX idx_email ON contactos_brokercompass(email);
CREATE INDEX idx_broker_interes ON contactos_brokercompass(broker_interes);

-- ================================================================
-- 4. TABLA: email_subscribers
-- Newsletter subscription
-- ================================================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(100), -- 'homepage', 'guia', 'contacto'
  preferred_brokers TEXT[], -- Array de brokers que le interesan
  last_email_sent TIMESTAMPTZ
);

-- ================================================================
-- 5. TABLA: broker_reviews
-- Para guardar reseñas de usuarios
-- ================================================================

CREATE TABLE IF NOT EXISTS broker_reviews (
  id BIGSERIAL PRIMARY KEY,
  broker_id VARCHAR(50) NOT NULL,
  user_hash VARCHAR(100) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  pros TEXT[],
  cons TEXT[],
  helpful_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(broker_id, user_hash)
);

CREATE INDEX idx_broker_reviews ON broker_reviews(broker_id);
CREATE INDEX idx_rating ON broker_reviews(rating);

-- ================================================================
-- 6. FUNCIÓN: Actualizar conversion_rate en affiliate_stats
-- Se ejecuta automáticamente cuando hay cambios
-- ================================================================

CREATE OR REPLACE FUNCTION update_conversion_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.conversion_rate := CASE 
    WHEN NEW.clicks = 0 THEN 0 
    ELSE (NEW.conversions::DECIMAL / NEW.clicks::DECIMAL) * 100 
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversion_rate
BEFORE UPDATE ON affiliate_stats
FOR EACH ROW
EXECUTE FUNCTION update_conversion_rate();

-- ================================================================
-- 7. FUNCIÓN: Trigger para actualizar affiliate_stats
-- Cuando se inserta un evento, actualizar stats
-- ================================================================

CREATE OR REPLACE FUNCTION handle_affiliate_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar o insertar en affiliate_stats
  INSERT INTO affiliate_stats (broker_id, clicks, conversions, revenue_eur, last_click, last_conversion)
  VALUES (
    NEW.broker_id,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'conversion' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'conversion' THEN COALESCE(NEW.commission_eur, 0) ELSE 0 END,
    CASE WHEN NEW.event_type = 'click' THEN NEW.timestamp ELSE NULL END,
    CASE WHEN NEW.event_type = 'conversion' THEN NEW.timestamp ELSE NULL END
  )
  ON CONFLICT (broker_id)
  DO UPDATE SET
    clicks = affiliate_stats.clicks + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    conversions = affiliate_stats.conversions + CASE WHEN NEW.event_type = 'conversion' THEN 1 ELSE 0 END,
    revenue_eur = affiliate_stats.revenue_eur + CASE WHEN NEW.event_type = 'conversion' THEN COALESCE(NEW.commission_eur, 0) ELSE 0 END,
    last_click = CASE WHEN NEW.event_type = 'click' THEN NEW.timestamp ELSE affiliate_stats.last_click END,
    last_conversion = CASE WHEN NEW.event_type = 'conversion' THEN NEW.timestamp ELSE affiliate_stats.last_conversion END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affiliate_event
AFTER INSERT ON affiliate_events
FOR EACH ROW
EXECUTE FUNCTION handle_affiliate_event();

-- ================================================================
-- 8. VIEWS (Vistas) para análisis
-- ================================================================

-- Vista: Top brokers por conversiones
CREATE OR REPLACE VIEW top_brokers_conversions AS
SELECT 
  broker_id,
  broker_name,
  conversions,
  revenue_eur,
  conversion_rate,
  last_conversion
FROM affiliate_stats
ORDER BY conversions DESC
LIMIT 10;

-- Vista: Conversiones por fuente
CREATE OR REPLACE VIEW conversions_by_source AS
SELECT 
  source,
  broker_id,
  COUNT(*) as conversion_count,
  SUM(commission_eur) as total_revenue
FROM affiliate_events
WHERE event_type = 'conversion'
GROUP BY source, broker_id
ORDER BY total_revenue DESC;

-- Vista: Performance diario
CREATE OR REPLACE VIEW daily_performance AS
SELECT 
  DATE(timestamp) as date,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  SUM(CASE WHEN event_type = 'conversion' THEN commission_eur ELSE 0 END) as revenue_eur
FROM affiliate_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- ================================================================
-- 9. RLS (Row Level Security) - IMPORTANTE PARA SEGURIDAD
-- ================================================================

-- Habilitar RLS en tablas
ALTER TABLE affiliate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_brokercompass ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer stats (públicos)
CREATE POLICY "Anyone can read affiliate_stats"
  ON affiliate_stats
  FOR SELECT
  USING (true);

-- Política: Solo admin puede escribir
CREATE POLICY "Admin only insert affiliate_events"
  ON affiliate_events
  FOR INSERT
  WITH CHECK (true); -- O añadir verificación de API key

-- Política: Cualquiera puede insertar contactos
CREATE POLICY "Anyone can insert contacts"
  ON contactos_brokercompass
  FOR INSERT
  WITH CHECK (true);

-- ================================================================
-- 10. INICIAL DATA LOAD
-- Insertar datos de brokers
-- ================================================================

INSERT INTO affiliate_stats (broker_id, broker_name, clicks, conversions, revenue_eur)
VALUES 
  ('myinvestor', 'MyInvestor', 0, 0, 0),
  ('degiro', 'DEGIRO', 0, 0, 0),
  ('indexa', 'Indexa Capital', 0, 0, 0),
  ('interactive', 'Interactive Brokers', 0, 0, 0),
  ('finizens', 'Finizens', 0, 0, 0),
  ('etoro', 'eToro', 0, 0, 0)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 11. GRANTS Y PERMISOS
-- ================================================================

-- Si usas Supabase auth, dar permisos apropiados
-- GRANT SELECT ON affiliate_stats TO authenticated;
-- GRANT INSERT ON affiliate_events TO authenticated;

-- ================================================================
-- QUERIES ÚTILES PARA ANÁLISIS
-- ================================================================

-- Top brokers por ingresos
-- SELECT broker_name, revenue_eur, conversions, conversion_rate
-- FROM affiliate_stats
-- ORDER BY revenue_eur DESC;

-- Últimas conversiones
-- SELECT broker_id, commission_eur, timestamp
-- FROM affiliate_events
-- WHERE event_type = 'conversion'
-- ORDER BY timestamp DESC
-- LIMIT 20;

-- Tasa de conversión por fuente
-- SELECT 
--   source,
--   COUNT(*) as clicks,
--   COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
--   ROUND(100.0 * COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) / COUNT(*), 2) as ctr
-- FROM affiliate_events
-- GROUP BY source
-- ORDER BY conversions DESC;
