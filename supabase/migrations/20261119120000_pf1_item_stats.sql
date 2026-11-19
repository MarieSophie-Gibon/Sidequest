-- Sidequest : caractéristiques Pathfinder 1e des armes et armures de l'inventaire
-- (type, prix, bonus, Dex max, malus, échec des sorts, vitesse / catégorie, dégâts, critique, portée…).
alter table public.items
  add column if not exists pf1 jsonb;
