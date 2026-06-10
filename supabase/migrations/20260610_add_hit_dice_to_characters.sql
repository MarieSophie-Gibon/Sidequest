-- Add hit dice tracking to characters
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS hit_die_type TEXT DEFAULT 'd8',
  ADD COLUMN IF NOT EXISTS hit_dice_current INTEGER;

-- Set hit_dice_current to character level for existing records where it's null
UPDATE characters
  SET hit_dice_current = level
  WHERE hit_dice_current IS NULL;
