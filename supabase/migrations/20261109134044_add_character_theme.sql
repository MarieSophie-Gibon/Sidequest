-- Sidequest : thème visuel propre à un personnage.
-- null = le personnage utilise le thème par défaut de l'app.
-- Forme : { "themeName": "azure", "bgChoice": "custom", "bgOverlay": true, "customBg": "data:image/jpeg;base64,..." }

alter table characters
  add column if not exists theme jsonb;

-- Les policies RLS existantes sur "characters" couvrent cette nouvelle colonne.
