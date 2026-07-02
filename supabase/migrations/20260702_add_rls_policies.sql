-- ============================================================
-- RLS Policies for Sidequest
-- Pattern: tables with character_id → check ownership via characters.user_id
-- ============================================================

-- Helper: owned character IDs for the current user
-- Used in USING / WITH CHECK clauses below

-- ---- characters ----
ALTER TABLE IF EXISTS public.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own characters" ON public.characters;
CREATE POLICY "Users can manage own characters" ON public.characters
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---- resources ----
ALTER TABLE IF EXISTS public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own resources" ON public.resources;
CREATE POLICY "Users can manage own resources" ON public.resources
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- features ----
ALTER TABLE IF EXISTS public.features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own features" ON public.features;
CREATE POLICY "Users can manage own features" ON public.features
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- spells ----
ALTER TABLE IF EXISTS public.spells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own spells" ON public.spells;
CREATE POLICY "Users can manage own spells" ON public.spells
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- items ----
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own items" ON public.items;
CREATE POLICY "Users can manage own items" ON public.items
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- familiars ----
ALTER TABLE IF EXISTS public.familiars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own familiars" ON public.familiars;
CREATE POLICY "Users can manage own familiars" ON public.familiars
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- character_skills ----
ALTER TABLE IF EXISTS public.character_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own character_skills" ON public.character_skills;
CREATE POLICY "Users can manage own character_skills" ON public.character_skills
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- spell_slots ----
ALTER TABLE IF EXISTS public.spell_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own spell_slots" ON public.spell_slots;
CREATE POLICY "Users can manage own spell_slots" ON public.spell_slots
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- character_biography ----
ALTER TABLE IF EXISTS public.character_biography ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own character_biography" ON public.character_biography;
CREATE POLICY "Users can manage own character_biography" ON public.character_biography
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- ---- character_notes ----
ALTER TABLE IF EXISTS public.character_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own character_notes" ON public.character_notes;
CREATE POLICY "Users can manage own character_notes" ON public.character_notes
  FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
