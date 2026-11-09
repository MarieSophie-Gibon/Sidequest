-- Add recharge column to features if missing
ALTER TABLE features
  ADD COLUMN IF NOT EXISTS recharge TEXT NOT NULL DEFAULT 'LONG_REST'
    CHECK (recharge IN ('SHORT_REST', 'LONG_REST', 'PERMANENT'));

-- Features actives sans recharge défini → LONG_REST par défaut
UPDATE features
  SET recharge = 'LONG_REST'
  WHERE recharge IS NULL AND category = 'active';

-- Features passives → PERMANENT
UPDATE features
  SET recharge = 'PERMANENT'
  WHERE category = 'passive';
