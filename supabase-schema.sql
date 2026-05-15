-- ============================================================
-- BrokerCompass — Supabase Schema
-- Ejecutar en: Dashboard de Supabase → SQL Editor
-- ============================================================

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE public.profiles (
  id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  apellido       TEXT        NOT NULL,
  username       TEXT        NOT NULL,
  email          TEXT,
  proveedor_auth TEXT        NOT NULL DEFAULT 'email',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_unique  UNIQUE (username),
  CONSTRAINT username_length  CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format  CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT nombre_nonempty  CHECK (char_length(trim(nombre)) >= 1),
  CONSTRAINT apellido_nonempty CHECK (char_length(trim(apellido)) >= 1)
);

-- 2. ÍNDICE para búsquedas eficientes por username (case-insensitive)
CREATE INDEX idx_profiles_username ON public.profiles (LOWER(username));

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICA: solo el propio usuario puede VER su perfil
CREATE POLICY "perfil_select_propio"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. POLÍTICA: solo el propio usuario puede INSERTAR su perfil
CREATE POLICY "perfil_insert_propio"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. POLÍTICA: solo el propio usuario puede ACTUALIZAR su perfil
CREATE POLICY "perfil_update_propio"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. FUNCIÓN: Verifica si un username está disponible
--    SECURITY DEFINER permite que anónimos consulten sin tocar datos privados
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$;

-- 8. Permisos de ejecución para usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon, authenticated;
