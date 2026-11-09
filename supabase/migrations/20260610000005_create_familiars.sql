CREATE TABLE IF NOT EXISTS familiars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT,
  description TEXT,
  hp_current INTEGER NOT NULL DEFAULT 1,
  hp_max INTEGER NOT NULL DEFAULT 1,
  ac INTEGER,
  speed TEXT,
  str INTEGER,
  dex INTEGER,
  con INTEGER,
  int INTEGER,
  wis INTEGER,
  cha INTEGER,
  passive_perception INTEGER,
  senses TEXT,
  abilities TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'distant', 'unconscious', 'dead')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Si la table existait déjà sans les nouvelles colonnes :
ALTER TABLE familiars
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS str INTEGER,
  ADD COLUMN IF NOT EXISTS dex INTEGER,
  ADD COLUMN IF NOT EXISTS con INTEGER,
  ADD COLUMN IF NOT EXISTS int INTEGER,
  ADD COLUMN IF NOT EXISTS wis INTEGER,
  ADD COLUMN IF NOT EXISTS cha INTEGER;
