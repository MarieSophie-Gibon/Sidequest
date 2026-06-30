ALTER TABLE spells
  ADD COLUMN IF NOT EXISTS material_components TEXT,
  ADD COLUMN IF NOT EXISTS upcast_damage TEXT;
