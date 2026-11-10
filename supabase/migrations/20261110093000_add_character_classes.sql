-- Sidequest : multiclassage (D&D 5e et Pathfinder 1e).
-- classes = [{ "name": "Guerrier", "level": 3 }, { "name": "Magicien", "level": 2 }]
-- null = une seule classe (colonnes class + level, comme avant).
-- Quand classes est rempli, class et level restent tenus à jour (noms joints, somme des niveaux)
-- pour l'affichage du tableau de bord et des fiches partagées.

alter table public.characters
  add column if not exists classes jsonb;
