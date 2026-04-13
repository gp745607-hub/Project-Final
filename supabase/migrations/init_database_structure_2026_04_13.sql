-- =====================================================
-- SCRIPT SQL COMPLET - ONG MADE HUMANITARIAN DATABASE
-- Date: 2026-04-13
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: PROFILES_BENEFICIAIRES
-- Gestion des bénéficiaires avec soft delete
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

-- Index pour performance du scanner
CREATE INDEX IF NOT EXISTS idx_code_barre ON public.profiles_beneficiaires(code_barre_unique);
CREATE INDEX IF NOT EXISTS idx_categorie ON public.profiles_beneficiaires(categorie);
CREATE INDEX IF NOT EXISTS idx_archived ON public.profiles_beneficiaires(is_archived);
CREATE INDEX IF NOT EXISTS idx_nom_prenom ON public.profiles_beneficiaires(nom, prenom);

-- =====================================================
-- TABLE 2: HISTORIQUE_POINTAGES
-- Système de pointage entrée/sortie
-- =====================================================
CREATE TABLE IF NOT EXISTS public.historique_pointages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES public.profiles_beneficiaires(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
    methode VARCHAR(10) NOT NULL CHECK (methode IN ('AUTO', 'MANUEL')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_pointages_beneficiaire ON public.historique_pointages(beneficiaire_id);
CREATE INDEX IF NOT EXISTS idx_pointages_timestamp ON public.historique_pointages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pointages_type ON public.historique_pointages(type);

-- =====================================================
-- TABLE 3: SERVICES_ONG
-- Suivi des services (cantine, médical, gargote)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.services_ong (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES public.profiles_beneficiaires(id) ON DELETE CASCADE,
    type_service VARCHAR(20) NOT NULL CHECK (type_service IN ('CANTINE', 'GARGOTE', 'MEDICAL')),
    date_service DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Index pour requêtes
CREATE INDEX IF NOT EXISTS idx_services_beneficiaire ON public.services_ong(beneficiaire_id);
CREATE INDEX IF NOT EXISTS idx_services_date ON public.services_ong(date_service DESC);
CREATE INDEX IF NOT EXISTS idx_services_type ON public.services_ong(type_service);

-- Contrainte : un seul service par type par jour par bénéficiaire
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_service_per_day 
ON public.services_ong(beneficiaire_id, type_service, date_service);

-- =====================================================
-- TABLE 4: AUDIT_LOGS
-- Journal de traçabilité totale
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id UUID,
    target_type VARCHAR(50),
    details_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_audit_email ON public.audit_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON public.audit_logs(target_id);

-- =====================================================
-- FONCTION TRIGGER: Mise à jour automatique updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur profiles_beneficiaires
DROP TRIGGER IF EXISTS update_beneficiaires_updated_at ON public.profiles_beneficiaires;
CREATE TRIGGER update_beneficiaires_updated_at
    BEFORE UPDATE ON public.profiles_beneficiaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTION TRIGGER: Audit automatique
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            NEW.id,
            TG_TABLE_NAME,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            NEW.id,
            TG_TABLE_NAME,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            OLD.id,
            TG_TABLE_NAME,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers d'audit sur toutes les tables
DROP TRIGGER IF EXISTS audit_beneficiaires ON public.profiles_beneficiaires;
CREATE TRIGGER audit_beneficiaires
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles_beneficiaires
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

DROP TRIGGER IF EXISTS audit_pointages ON public.historique_pointages;
CREATE TRIGGER audit_pointages
    AFTER INSERT OR UPDATE OR DELETE ON public.historique_pointages
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

DROP TRIGGER IF EXISTS audit_services ON public.services_ong;
CREATE TRIGGER audit_services
    AFTER INSERT OR UPDATE OR DELETE ON public.services_ong
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Accès restreint à Made711@gmail.com
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles_beneficiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_pointages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_ong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour profiles_beneficiaires
DROP POLICY IF EXISTS "Admin full access beneficiaires" ON public.profiles_beneficiaires;
CREATE POLICY "Admin full access beneficiaires" ON public.profiles_beneficiaires
    FOR ALL
    USING (auth.jwt()->>'email' = 'Made711@gmail.com')
    WITH CHECK (auth.jwt()->>'email' = 'Made711@gmail.com');

-- Politique pour historique_pointages
DROP POLICY IF EXISTS "Admin full access pointages" ON public.historique_pointages;
CREATE POLICY "Admin full access pointages" ON public.historique_pointages
    FOR ALL
    USING (auth.jwt()->>'email' = 'Made711@gmail.com')
    WITH CHECK (auth.jwt()->>'email' = 'Made711@gmail.com');

-- Politique pour services_ong
DROP POLICY IF EXISTS "Admin full access services" ON public.services_ong;
CREATE POLICY "Admin full access services" ON public.services_ong
    FOR ALL
    USING (auth.jwt()->>'email' = 'Made711@gmail.com')
    WITH CHECK (auth.jwt()->>'email' = 'Made711@gmail.com');

-- Politique pour audit_logs
DROP POLICY IF EXISTS "Admin full access audit" ON public.audit_logs;
CREATE POLICY "Admin full access audit" ON public.audit_logs
    FOR ALL
    USING (auth.jwt()->>'email' = 'Made711@gmail.com')
    WITH CHECK (auth.jwt()->>'email' = 'Made711@gmail.com');

-- =====================================================
-- STORAGE BUCKET POUR PHOTOS
-- =====================================================

-- Créer le bucket pour les photos des bénéficiaires
INSERT INTO storage.buckets (id, name, public)
VALUES ('beneficiaire-photos', 'beneficiaire-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de storage : upload restreint à l'admin
DROP POLICY IF EXISTS "Admin can upload photos" ON storage.objects;
CREATE POLICY "Admin can upload photos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'beneficiaire-photos' 
        AND auth.jwt()->>'email' = 'Made711@gmail.com'
    );

-- Politique de storage : lecture publique
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
CREATE POLICY "Public can view photos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'beneficiaire-photos');

-- Politique de storage : suppression restreinte à l'admin
DROP POLICY IF EXISTS "Admin can delete photos" ON storage.objects;
CREATE POLICY "Admin can delete photos" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'beneficiaire-photos' 
        AND auth.jwt()->>'email' = 'Made711@gmail.com'
    );

-- =====================================================
-- VUES UTILES POUR STATISTIQUES
-- =====================================================

-- Vue : Dernier pointage de chaque bénéficiaire
CREATE OR REPLACE VIEW public.v_dernier_pointage AS
SELECT DISTINCT ON (beneficiaire_id)
    beneficiaire_id,
    type,
    timestamp,
    methode
FROM public.historique_pointages
ORDER BY beneficiaire_id, timestamp DESC;

-- Vue : Statistiques du jour
CREATE OR REPLACE VIEW public.v_stats_jour AS
SELECT
    COUNT(DISTINCT CASE WHEN hp.type = 'ENTREE' THEN hp.beneficiaire_id END) as total_entrees,
    COUNT(DISTINCT CASE WHEN hp.type = 'ENTREE' AND pb.categorie = 'Enfant' THEN hp.beneficiaire_id END) as enfants_presents,
    COUNT(DISTINCT CASE WHEN so.type_service = 'CANTINE' THEN so.beneficiaire_id END) as repas_servis
FROM public.historique_pointages hp
LEFT JOIN public.profiles_beneficiaires pb ON hp.beneficiaire_id = pb.id
LEFT JOIN public.services_ong so ON so.beneficiaire_id = pb.id AND so.date_service = CURRENT_DATE
WHERE DATE(hp.timestamp) = CURRENT_DATE;

-- =====================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.profiles_beneficiaires IS 'Table principale des bénéficiaires avec soft delete';
COMMENT ON TABLE public.historique_pointages IS 'Historique complet des pointages entrée/sortie';
COMMENT ON TABLE public.services_ong IS 'Suivi des services fournis (cantine, médical, gargote)';
COMMENT ON TABLE public.audit_logs IS 'Journal d''audit pour traçabilité totale';
COMMENT ON COLUMN public.profiles_beneficiaires.code_barre_unique IS 'Code-barres unique Code 128 pour scanner laser';
COMMENT ON COLUMN public.profiles_beneficiaires.is_archived IS 'Soft delete : true = archivé, false = actif';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================