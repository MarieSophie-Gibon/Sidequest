-- Bonus ou effet d'un objet de l'inventaire (objet magique…), en texte libre.
alter table public.items add column if not exists effect text;
