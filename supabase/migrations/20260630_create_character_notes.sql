CREATE TABLE IF NOT EXISTS character_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE character_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own character notes"
  ON character_notes
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS character_notes_character_id_idx ON character_notes(character_id);
