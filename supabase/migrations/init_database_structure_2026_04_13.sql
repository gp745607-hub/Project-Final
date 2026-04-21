-- =====================================================
-- SCRIPT SQL COMPLET CORRIGÉ - ONG MADE
-- Date: 2026-04-15
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES DE BASE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles_beneficiaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_url TEXT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('Mère', 'Enfant', 'Personnel', 'Individu', 'Visiteur')),
    date_naissance DATE,
    code_barre_unique VARCHAR(50) UNIQUE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.historique_pointages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES public.profiles_beneficiaires(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
    methode VARCHAR(10) NOT NULL CHECK (methode IN ('AUTO', 'MANUEL')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.services_ong (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES public.profiles_beneficiaires(id) ON DELETE CASCADE,
    type_service VARCHAR(20) NOT NULL CHECK (type_service IN ('CANTINE', 'GARGOTE', 'MEDICAL')),
    date_service DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id UUID,
    target_type VARCHAR(50),
    details_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEX DE PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_code_barre ON public.profiles_beneficiaires(code_barre_unique);
CREATE INDEX IF NOT EXISTS idx_pointages_timestamp ON public.historique_pointages(timestamp DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_service_per_day ON public.services_ong(beneficiaire_id, type_service, date_service);

-- 3. FONCTIONS ET TRIGGERS
-- =====================================================

-- Mise à jour auto de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_beneficiaires_updated_at 
BEFORE UPDATE ON public.profiles_beneficiaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit automatique (correction du JWT claims)
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
    v_admin_email := COALESCE(auth.jwt() ->> 'email', 'system');
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (v_admin_email, TG_OP, OLD.id, TG_TABLE_NAME, row_to_json(OLD));
        RETURN OLD;
    ELSE
        INSERT INTO public.audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (v_admin_email, TG_OP, NEW.id, TG_TABLE_NAME, row_to_json(NEW));
        RETURN NEW;
    END IF;
END; $$ LANGUAGE plpgsql;

-- Application des triggers d'audit
CREATE TRIGGER audit_beneficiaires AFTER INSERT OR UPDATE OR DELETE ON public.profiles_beneficiaires FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
CREATE TRIGGER audit_pointages AFTER INSERT OR UPDATE OR DELETE ON public.historique_pointages FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- 4. SÉCURITÉ RLS (Correction Critique)
-- =====================================================

ALTER TABLE public.profiles_beneficiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_pointages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_ong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Note : L'email doit être en minuscules pour correspondre au JWT de Supabase Auth
DO $$ 
BEGIN
    -- Suppression des anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Admin access" ON public.profiles_beneficiaires;
    DROP POLICY IF EXISTS "Admin access" ON public.historique_pointages;
    DROP POLICY IF EXISTS "Admin access" ON public.services_ong;
    DROP POLICY IF EXISTS "Admin access" ON public.audit_logs;

    -- Création des nouvelles politiques (Email corrigé : madecme711@gmail.com)
    CREATE POLICY "Admin access" ON public.profiles_beneficiaires FOR ALL USING (auth.jwt()->>'email' = 'madecme711@gmail.com');
    CREATE POLICY "Admin access" ON public.historique_pointages FOR ALL USING (auth.jwt()->>'email' = 'madecme711@gmail.com');
    CREATE POLICY "Admin access" ON public.services_ong FOR ALL USING (auth.jwt()->>'email' = 'madecme711@gmail.com');
    CREATE POLICY "Admin access" ON public.audit_logs FOR ALL USING (auth.jwt()->>'email' = 'madecme711@gmail.com');
END $$;

-- 5. STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('beneficiaire-photos', 'beneficiaire-photos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'beneficiaire-photos' AND auth.jwt()->>'email' = 'madecme711@gmail.com');
CREATE POLICY "Public view" ON storage.objects FOR SELECT USING (bucket_id = 'beneficiaire-photos');

-- 6. VUES STATISTIQUES
-- =====================================================
CREATE OR REPLACE VIEW public.v_stats_jour AS
SELECT
    (SELECT COUNT(*) FROM public.historique_pointages WHERE type = 'ENTREE' AND timestamp::date = CURRENT_DATE) as total_entrees,
    (SELECT COUNT(*) FROM public.services_ong WHERE type_service = 'CANTINE' AND date_service = CURRENT_DATE) as repas_servis;