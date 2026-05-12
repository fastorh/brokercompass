// ================================================================
// /api/track-affiliate.js
// Vercel Edge Function para trackear clicks de afiliados en Supabase
// ================================================================

import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://brokercompass.es');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      broker_id,
      event_type,
      source,
      timestamp,
      user_hash,
      page_path,
      referrer,
      commission_eur,
      deposit_amount
    } = req.body;

    // Validar datos mínimos
    if (!broker_id || !event_type || !user_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('affiliate_events')
      .insert([{
        broker_id,
        event_type, // 'click' o 'conversion'
        source: source || 'organic',
        user_hash,
        page_path: page_path || '/',
        referrer: referrer || null,
        commission_eur: commission_eur || null,
        deposit_amount: deposit_amount || null,
        timestamp: timestamp || new Date().toISOString(),
        ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'] || null
      }]);

    if (error) {
      console.error('[Supabase Error]', error);
      // No fallar al cliente si Supabase falla
      return res.status(200).json({ ok: true, warning: 'Database insert failed' });
    }

    // Si es conversión, actualizar estadísticas
    if (event_type === 'conversion') {
      await updateAffiliateStats(broker_id, commission_eur);
    }

    return res.status(200).json({ ok: true, data });

  } catch (error) {
    console.error('[API Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ================================================================
// Helper: Actualizar estadísticas de afiliado
// ================================================================

async function updateAffiliateStats(brokerId, commissionEur) {
  const { data, error } = await supabase
    .from('affiliate_stats')
    .update({
      conversions: supabase.raw('conversions + 1'),
      revenue_eur: supabase.raw(`revenue_eur + ${commissionEur}`),
      updated_at: new Date().toISOString()
    })
    .eq('broker_id', brokerId);

  if (error) {
    console.error('[Stats Update Error]', error);
  }

  return data;
}

// ================================================================
// /api/affiliate-stats.js
// GET endpoint para mostrar estadísticas
// ================================================================

export async function handleGetStats(req, res) {
  const { broker } = req.query;

  if (!broker) {
    return res.status(400).json({ error: 'Missing broker parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('affiliate_stats')
      .select('*')
      .eq('broker_id', broker)
      .single();

    if (error) {
      console.error('[Supabase Error]', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('[API Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
