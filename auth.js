/* ================================================================
   BrokerCompass — auth.js
   Sistema de autenticación con Supabase (email + Google OAuth)
   ================================================================ */

// ⚠️  REEMPLAZA estos valores con los de tu proyecto Supabase:
//   Dashboard → Settings → API → Project URL y Project API Keys (anon/public)
const SUPABASE_URL      = 'https://zytdqlgqpybessewfeyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dGRxbGdxcHliZXNzZXdmZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ2MDgsImV4cCI6MjA5Mzc1MDYwOH0.r226GTofF9achTMauIIaDiMsFacwF0RntPLia5ERC2c';
const GOOGLE_CLIENT_ID  = '837704481625-ahbc92035j1ilsor2mrj2nka8dkqs43v.apps.googleusercontent.com';

const _READY = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

let _db = null;
try {
  if (_READY && window.supabase) {
    _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
} catch (e) {
  console.warn('[BrokerCompass Auth] Supabase init error:', e);
}

let _user           = null;
let _activePanel    = null;
let _gisReady       = false;
let _googlePendingBtn = null;

// ================================================================
// INICIALIZACIÓN
// ================================================================

function initAuth() {
  if (!_db) {
    console.warn('[BrokerCompass Auth] Supabase no configurado. Rellena SUPABASE_URL y SUPABASE_ANON_KEY en auth.js');
    return;
  }
  _db.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
      _user = session.user;
      _setNavUI(_user);
      await _postLogin(_user);
    } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
      _user = null;
      _setNavUI(null);
    }
  });
}

// Se ejecuta tras cada SIGNED_IN: verifica el perfil y actúa en consecuencia
async function _postLogin(user) {
  const isGoogle = user.app_metadata?.provider === 'google';
  const intent   = sessionStorage.getItem('oauth_intent') || 'login';
  if (isGoogle) sessionStorage.removeItem('oauth_intent');

  const exists = await _hasProfile(user.id);

  if (exists) {
    // Usuario con cuenta existente → siempre dejar entrar, sin importar intent
    _closeModal();
    await _refreshDisplay(user);
    return;
  }

  const meta = user.user_metadata || {};

  // Google + intent login → no tiene cuenta, rechazar con mensaje claro
  if (isGoogle && intent === 'login') {
    await _db.auth.signOut();
    _user = null;
    _openModal('login');
    _globalErr('login', 'No tienes cuenta con ese email. Pulsa "Regístrate gratis" para crear una.');
    return;
  }

  // Email con metadata del signup → crear perfil directamente
  if (!isGoogle && meta.username) {
    const err = await _insertProfile({
      id:             user.id,
      nombre:         meta.nombre   || '',
      apellido:       meta.apellido || '',
      username:       meta.username,
      email:          user.email    || '',
      proveedor_auth: 'email',
    });
    if (!err) {
      _closeModal();
      await _refreshDisplay(user);
      return;
    }
    // Conflict de username → caer al modal de completar perfil con error visible
    const fullName2  = meta.full_name || meta.name || '';
    const nameParts2 = fullName2.trim().split(/\s+/);
    _openModal('complete-profile', {
      nombre:   meta.given_name  || nameParts2[0]                  || meta.nombre   || '',
      apellido: meta.family_name || nameParts2.slice(1).join(' ')  || meta.apellido || '',
      username: meta.username || '',
    });
    setTimeout(() => _fieldErr('cpUsernameErr', 'Este nombre de usuario ya está en uso, elige otro'), 200);
    return;
  }

  // Google (intent register) o email con conflict → pedir datos de perfil
  const fullName  = meta.full_name || meta.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  _openModal('complete-profile', {
    nombre:   meta.given_name  || nameParts[0]                 || meta.nombre   || '',
    apellido: meta.family_name || nameParts.slice(1).join(' ') || meta.apellido || '',
    username: meta.username || '',
  });
}

// ================================================================
// INTERFAZ DE NAVEGACIÓN
// ================================================================

function _setNavUI(user) {
  const authBtns = document.getElementById('authNavBtns');
  const userMenu = document.getElementById('navUserMenu');
  const mobAuth  = document.getElementById('mobAuthBtns');
  const mobUser  = document.getElementById('mobUserSection');

  if (user) {
    if (authBtns) authBtns.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (mobAuth)  mobAuth.style.display  = 'none';
    if (mobUser)  mobUser.style.display  = 'flex';
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (mobAuth)  mobAuth.style.display  = 'flex';
    if (mobUser)  mobUser.style.display  = 'none';
  }
}

async function _refreshDisplay(user) {
  try {
    if (!_db) return;
    const { data } = await _db.from('profiles')
      .select('nombre')
      .eq('id', user.id)
      .single();

    const name    = data?.nombre || user.email?.split('@')[0] || 'Usuario';
    const initial = (name[0] || 'U').toUpperCase();

    document.querySelectorAll('.auth-user-name').forEach(el => (el.textContent = name));
    document.querySelectorAll('.auth-avatar').forEach(el => (el.textContent = initial));
  } catch (_) {}
}

// ================================================================
// MODAL
// ================================================================

function _openModal(mode, prefill = {}) {
  // Cierra el menú móvil si está abierto
  document.getElementById('mobMenu')?.classList.remove('open');
  const ham = document.getElementById('ham');
  if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); }

  _switchPanel(mode, prefill);

  const overlay = document.getElementById('authModal');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function _switchPanel(mode, prefill = {}) {
  _activePanel = mode;
  _clearErrors();

  const overlay = document.getElementById('authModal');
  if (!overlay) return;

  overlay.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  const panel = overlay.querySelector(`[data-panel="${mode}"]`);
  if (!panel) return;
  panel.classList.add('active');

  // Ocultar botón X cuando completar perfil es obligatorio
  const closeBtn = document.getElementById('authModalClose');
  if (closeBtn) closeBtn.style.display = mode === 'complete-profile' ? 'none' : '';

  // Pre-rellenar campos del formulario de perfil
  if (mode === 'complete-profile') {
    const n = document.getElementById('cpNombre');
    const a = document.getElementById('cpApellido');
    const u = document.getElementById('cpUsername');
    if (n && prefill.nombre   && !n.value) n.value = prefill.nombre;
    if (a && prefill.apellido && !a.value) a.value = prefill.apellido;
    if (u && prefill.username && !u.value) u.value = prefill.username;
  }

  setTimeout(() => panel.querySelector('input')?.focus(), 130);
}

function _closeModal() {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  _activePanel = null;
  _clearErrors();
}

// ================================================================
// ERRORES
// ================================================================

function _clearErrors() {
  document.querySelectorAll('.auth-field-error, .auth-global-err').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function _fieldErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function _globalErr(panel, msg) {
  const el = document.querySelector(`[data-panel="${panel}"] .auth-global-err`);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

// ================================================================
// ESTADO DE CARGA
// ================================================================

function _setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (on) {
    btn.disabled      = true;
    btn.dataset.orig  = btn.innerHTML;
    btn.innerHTML     = '<span class="auth-spinner"></span>Cargando...';
  } else {
    btn.disabled  = false;
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
  }
}

// ================================================================
// BASE DE DATOS
// ================================================================

async function _hasProfile(uid) {
  if (!_db) return false;
  const { data } = await _db.from('profiles').select('id').eq('id', uid).maybeSingle();
  return data !== null;
}

async function _usernameAvailable(username) {
  if (!_db) return true;
  const { data, error } = await _db.rpc('check_username_available', {
    username_to_check: username.toLowerCase(),
  });
  if (error) {
    console.warn('[BrokerCompass] check_username_available error:', error);
    return true; // ante error de RPC, permitir continuar
  }
  return data === true;
}

async function _insertProfile(payload) {
  if (!_db) return new Error('Supabase no configurado');
  const { error } = await _db.from('profiles').insert(payload);
  return error || null;
}

// ================================================================
// VALIDACIÓN
// ================================================================

function _validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function _validPw(v) {
  if (v.length < 8) return 'Mínimo 8 caracteres';
  if (!/[0-9!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(v)) return 'Incluye al menos 1 número o símbolo';
  return null;
}

function _validUsername(v) {
  if (v.length < 3)              return 'Mínimo 3 caracteres';
  if (v.length > 20)             return 'Máximo 20 caracteres';
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Solo letras, números y _';
  return null;
}

// ================================================================
// ACCIONES DE AUTENTICACIÓN
// ================================================================

async function _doLogin(e) {
  e.preventDefault();
  _clearErrors();

  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPassword').value;
  let ok = true;

  if (!email)              { _fieldErr('loginEmailErr', 'Campo obligatorio'); ok = false; }
  else if (!_validEmail(email)) { _fieldErr('loginEmailErr', 'Email no válido'); ok = false; }
  if (!pw)                 { _fieldErr('loginPwErr', 'Campo obligatorio'); ok = false; }
  if (!ok) return;

  if (!_db) { _globalErr('login', 'Configura las credenciales de Supabase en auth.js para activar el login.'); return; }
  _setLoading('loginBtn', true);
  const { error } = await _db.auth.signInWithPassword({ email, password: pw });
  _setLoading('loginBtn', false);

  if (!error) return; // onAuthStateChange gestiona el éxito

  const msg = error.message.toLowerCase();
  if (msg.includes('invalid'))  _globalErr('login', 'Email o contraseña incorrectos');
  else if (msg.includes('confirm')) _globalErr('login', 'Verifica tu email antes de iniciar sesión. Revisa tu bandeja.');
  else _globalErr('login', 'Error al iniciar sesión. Inténtalo de nuevo.');
}

async function _doRegister(e) {
  e.preventDefault();
  _clearErrors();

  const nombre   = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const email    = document.getElementById('regEmail').value.trim();
  const pw       = document.getElementById('regPw').value;

  let ok = true;
  if (!nombre)   { _fieldErr('regNombreErr',   'Obligatorio'); ok = false; }
  if (!apellido) { _fieldErr('regApellidoErr', 'Obligatorio'); ok = false; }
  if (!username) { _fieldErr('regUsernameErr', 'Obligatorio'); ok = false; }
  else { const e = _validUsername(username); if (e) { _fieldErr('regUsernameErr', e); ok = false; } }
  if (!email)    { _fieldErr('regEmailErr', 'Obligatorio'); ok = false; }
  else if (!_validEmail(email)) { _fieldErr('regEmailErr', 'Email no válido'); ok = false; }
  if (!pw)       { _fieldErr('regPwErr', 'Obligatorio'); ok = false; }
  else { const e = _validPw(pw); if (e) { _fieldErr('regPwErr', e); ok = false; } }
  if (!ok) return;

  if (!_db) { _globalErr('register', 'Configura las credenciales de Supabase en auth.js para activar el registro.'); return; }
  _setLoading('registerBtn', true);
  const avail = await _usernameAvailable(username);
  if (!avail) {
    _fieldErr('regUsernameErr', 'Nombre de usuario ya en uso');
    _setLoading('registerBtn', false);
    return;
  }

  const { data, error } = await _db.auth.signUp({
    email,
    password: pw,
    options: { data: { nombre, apellido, username } },
  });
  _setLoading('registerBtn', false);

  if (error) {
    const msg = error.message.toLowerCase();
    _globalErr('register', msg.includes('registered')
      ? 'Este email ya está registrado. Inicia sesión.'
      : 'Error al crear la cuenta. Inténtalo de nuevo.');
    return;
  }

  if (!data.session) {
    // Confirmación de email requerida → mostrar panel de verificación
    _switchPanel('verify-email');
    const el = document.getElementById('verifyEmailText');
    if (el) el.textContent = email;
  }
  // Si data.session existe, onAuthStateChange lo gestiona automáticamente
}

function _initGIS() {
  if (_gisReady || !window.google?.accounts?.id) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: _handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    itp_support: true,
  });
  _gisReady = true;
}

async function _handleGoogleCredential(response) {
  if (!_db) return;
  if (_googlePendingBtn) _setGoogleLoading(_googlePendingBtn, false);

  const { error } = await _db.auth.signInWithIdToken({
    provider: 'google',
    token: response.credential,
  });

  _googlePendingBtn = null;

  if (error) {
    _globalErr(_activePanel || 'login', 'Error al iniciar sesión con Google. Inténtalo de nuevo.');
  }
  // Éxito gestionado por onAuthStateChange
}

async function _doGoogle() {
  if (!_db) {
    _globalErr(_activePanel || 'login', 'Google login no disponible: configura las credenciales de Supabase en auth.js');
    return;
  }

  if (!window.google?.accounts?.id) {
    _globalErr(_activePanel || 'login', 'Google no está disponible. Recarga la página e inténtalo de nuevo.');
    return;
  }

  const intent = _activePanel === 'register' ? 'register' : 'login';
  sessionStorage.setItem('oauth_intent', intent);

  const btnId = intent === 'register' ? 'registerGoogleBtn' : 'loginGoogleBtn';
  _initGIS();
  _googlePendingBtn = btnId;
  _setGoogleLoading(btnId, true);

  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      if (_googlePendingBtn) {
        _setGoogleLoading(_googlePendingBtn, false);
        _googlePendingBtn = null;
      }
      _globalErr(
        _activePanel || 'login',
        'No se pudo mostrar el selector de Google. Prueba a limpiar las cookies de Google o usa otro navegador.'
      );
    }
  });
}

function _setGoogleLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (on) {
    btn.disabled     = true;
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML    = '<span class="auth-spinner"></span>Conectando con Google...';
  } else {
    btn.disabled  = false;
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
  }
}

async function _doCompleteProfile(e) {
  e.preventDefault();
  _clearErrors();
  if (!_user) return;

  const nombre   = document.getElementById('cpNombre').value.trim();
  const apellido = document.getElementById('cpApellido').value.trim();
  const username = document.getElementById('cpUsername').value.trim().toLowerCase();

  let ok = true;
  if (!nombre)   { _fieldErr('cpNombreErr',   'Obligatorio'); ok = false; }
  if (!apellido) { _fieldErr('cpApellidoErr', 'Obligatorio'); ok = false; }
  if (!username) { _fieldErr('cpUsernameErr', 'Obligatorio'); ok = false; }
  else { const e = _validUsername(username); if (e) { _fieldErr('cpUsernameErr', e); ok = false; } }
  if (!ok) return;

  _setLoading('cpBtn', true);
  const avail = await _usernameAvailable(username);
  if (!avail) {
    _fieldErr('cpUsernameErr', 'Nombre de usuario ya en uso');
    _setLoading('cpBtn', false);
    return;
  }

  const err = await _insertProfile({
    id:             _user.id,
    nombre,
    apellido,
    username,
    email:          _user.email          || '',
    proveedor_auth: _user.app_metadata?.provider || 'google',
  });
  _setLoading('cpBtn', false);

  if (err) {
    if (err.code === '23505') _fieldErr('cpUsernameErr', 'Nombre de usuario ya en uso');
    else _globalErr('complete-profile', 'Error al guardar el perfil. Inténtalo de nuevo.');
    return;
  }

  _closeModal();
  await _refreshDisplay(_user);
}

async function _doLogout() {
  document.getElementById('userDropdown')?.classList.remove('open');
  if (_db) await _db.auth.signOut();
  window.location.href = window.location.origin + '/';
}

// ================================================================
// EVENTOS
// ================================================================

function _debounce(fn, ms) {
  let t;
  return function () { clearTimeout(t); t = setTimeout(() => fn(), ms); };
}

function _setupEvents() {
  // Abrir modal desde botones del nav
  ['navLoginBtn', 'mobLoginBtn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => _openModal('login'))
  );
  ['navRegisterBtn', 'mobRegisterBtn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => _openModal('register'))
  );

  // Cerrar modal
  document.getElementById('authModalClose')?.addEventListener('click', _closeModal);
  document.querySelectorAll('[data-auth-close]').forEach(btn =>
    btn.addEventListener('click', _closeModal)
  );
  document.getElementById('authModal')?.addEventListener('click', e => {
    if (e.target.id === 'authModal') _closeModal();
  });

  // Cambiar entre paneles
  document.querySelectorAll('[data-auth-to]').forEach(el =>
    el.addEventListener('click', () => _openModal(el.dataset.authTo))
  );

  // Formularios
  document.getElementById('loginForm')?.addEventListener('submit', _doLogin);
  document.getElementById('registerForm')?.addEventListener('submit', _doRegister);
  document.getElementById('cpForm')?.addEventListener('submit', _doCompleteProfile);

  // Google OAuth
  document.querySelectorAll('[data-auth-google]').forEach(btn =>
    btn.addEventListener('click', _doGoogle)
  );

  // Cerrar sesión
  document.querySelectorAll('[data-auth-logout]').forEach(btn =>
    btn.addEventListener('click', _doLogout)
  );

  // Dropdown del usuario en desktop
  document.getElementById('navUserMenuBtn')?.addEventListener('click', () =>
    document.getElementById('userDropdown')?.classList.toggle('open')
  );
  document.addEventListener('click', e => {
    if (!e.target.closest('#navUserMenu'))
      document.getElementById('userDropdown')?.classList.remove('open');
  });

  // Tecla ESC (no cierra complete-profile porque es obligatorio)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _activePanel && _activePanel !== 'complete-profile')
      _closeModal();
  });

  // Validación de username en tiempo real con debounce
  const _debRegUser = _debounce(async () => {
    const u = (document.getElementById('regUsername')?.value || '').trim().toLowerCase();
    if (!u) return;
    const e = _validUsername(u);
    if (e) { _fieldErr('regUsernameErr', e); return; }
    const el = document.getElementById('regUsernameErr');
    if (el) el.style.display = 'none';
    const avail = await _usernameAvailable(u);
    if (!avail) _fieldErr('regUsernameErr', 'Nombre de usuario ya en uso');
  }, 600);

  const _debCpUser = _debounce(async () => {
    const u = (document.getElementById('cpUsername')?.value || '').trim().toLowerCase();
    if (!u) return;
    const e = _validUsername(u);
    if (e) { _fieldErr('cpUsernameErr', e); return; }
    const el = document.getElementById('cpUsernameErr');
    if (el) el.style.display = 'none';
    const avail = await _usernameAvailable(u);
    if (!avail) _fieldErr('cpUsernameErr', 'Nombre de usuario ya en uso');
  }, 600);

  document.getElementById('regUsername')?.addEventListener('input', _debRegUser);
  document.getElementById('cpUsername')?.addEventListener('input', _debCpUser);
}

// ================================================================
// ARRANQUE
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  _setupEvents();
  initAuth();
});
