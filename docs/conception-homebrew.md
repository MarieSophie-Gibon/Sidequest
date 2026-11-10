# Systèmes homebrew et modèles de fiche — document de conception

> Statut : **proposition**, à valider avant tout code.
> Décisions déjà prises : modèle créé par le MJ, fiche joueur **vide** que le joueur remplit lui-même,
> **structure copiée** dans la fiche, **aides de jeu liées** au modèle, pas de calcul automatique
> (tout se saisit à la main).

## 1. Objectif

Un MJ crée **son système de jeu** (un « modèle de fiche ») et le distribue à ses joueurs par un lien.
Chaque joueur obtient **sa propre fiche vide**, organisée selon ce modèle, et la remplit lui-même.
Le MJ joint au modèle des **aides de jeu** (règles maison, tableaux, rappels) que les joueurs consultent
depuis leur fiche, toujours dans leur dernière version.

## 2. Vocabulaire

| Terme | Sens |
|---|---|
| **Système** (ou modèle) | Définition créée par le MJ : quelles catégories existent sur la fiche et sous quels noms. |
| **Structure** | La partie du système qui décrit la fiche (caractéristiques, compétences, jauges…). **Copiée** dans chaque fiche créée. |
| **Aide de jeu** | Texte rédigé par le MJ, rattaché au système. **Liée** : une correction est vue par tous. |
| **Fiche homebrew** | Fiche d'un joueur créée à partir d'un système. |

## 3. Ce que le MJ peut configurer

Le MJ part d'une **base** qui pré-remplit la structure, puis coche, décoche, renomme ou ajoute :

| Base | Pré-remplissage |
|---|---|
| D&D 5e | 6 caractéristiques, 18 compétences, 6 sauvegardes, PV, CA, bourse po/pa/pc |
| Pathfinder 1e | 6 caractéristiques, 35 compétences, 3 sauvegardes, PV, CA, BMO/DMD |
| Libre | Rien : le MJ construit tout |

Catégories de la structure :

| Catégorie | Contenu configurable | Remarque |
|---|---|---|
| **Identité** | Libellés des champs (ex. « Race » → « Peuple », « Classe » → « Vocation ») ; niveau oui/non | |
| **Caractéristiques** | Liste : nom, abréviation, afficher un modificateur (oui/non) | |
| **Compétences** | Liste : nom, caractéristique associée (facultative) | |
| **Sauvegardes** | Liste : nom | |
| **Jauges** | PV toujours présents ; jauges en plus (Mana, Santé mentale, Stress…) avec max | |
| **Défense et combat** | Liste de valeurs (CA, Initiative, Vitesse…) ; chacune peut être **reliée ou non à une caractéristique** (liste déroulante) | Voir ci-dessous |
| **Valeurs spéciales** | Catalogue à cocher : Inspiration, Bonus de maîtrise, BBA, BMO, DMD, Perception passive… + valeurs personnalisées | Voir ci-dessous |
| **Bourse** | Liste des monnaies (po/pa/pc, ou « Crédits »…) ; ou désactivée | |
| **Sections** | Activer ou non : capacités, sorts (onglet à part, emplacements en option), inventaire, familiers, biographie, notes | Réutilisent les tables existantes |

**Défense et combat reliés à une caractéristique.** Pour chaque valeur, le MJ choisit dans une liste
déroulante « Aucune » ou une caractéristique du système. Si elle est reliée, le joueur saisit la base et
la fiche affiche **base + modificateur** de la caractéristique (ex. CA = 10 + mod. DEX), avec le détail.
Sinon, le joueur saisit directement la valeur.

**Valeurs spéciales cochables.** Le MJ coche celles de son système dans un catalogue, chacune avec un
type d'affichage :

| Valeur | Type | Base qui la pré-coche |
|---|---|---|
| Inspiration | case à cocher (activée / dépensée) | D&D 5e |
| Bonus de maîtrise | nombre | D&D 5e |
| BBA | nombre | Pathfinder 1e |
| BMO / DMD | nombre | Pathfinder 1e |
| Perception passive | nombre | D&D 5e |
| Personnalisée | nombre ou case à cocher, nom libre | — |

**Maîtrise des compétences et sauvegardes.** Option du système : afficher une **case de maîtrise** à côté
de chaque compétence et sauvegarde (comme en D&D). Le joueur la coche ; si le système a un « Bonus de
maîtrise », il est ajouté au total affiché.

**Attaques et sorts (dans les capacités).** Une capacité peut être cochée « C'est une attaque » et gagne
alors un bloc d'attaque. Le MJ active ou non les attaques dans son système, choisit les types disponibles
(**contact**, **distance**, **sort**) et la valeur spéciale servant de « bonus de base » au toucher
(Bonus de maîtrise, BBA…). Le joueur saisit chaque attaque :

| Champ | Contenu | Affichage |
|---|---|---|
| Type | Contact / Distance / Sort | badge sur la capacité |
| Toucher : caractéristique | liste déroulante (Aucune / FOR / DEX…) | |
| Toucher : bonus de base | case à cocher (ajoute la valeur spéciale du système) | |
| Toucher : divers | nombre | **total + détail** |
| DM : dés | texte libre (`1d8`, `2d6+1d4`) | |
| DM : caractéristique | liste déroulante (Aucune / …) | |
| DM : divers | nombre | **DM : 1d8+3** |
| Sort (facultatif) | DD ou sauvegarde visée, portée, coût (ressource ou jauge) | |

Les **DM** (dommages, notés en dés : « 1d6 + For ») sont **proposés par principe** (facultatifs, ex. sort de
contrôle sans dégâts). Hors v1 : attaques multiples (+6/+1), zone de critique et multiplicateur (champ texte
libre en attendant).

**Où vivent les sorts.**
- Si le MJ coche la section **Sorts** : la fiche a un **onglet Sorts à part** (grimoire, et emplacements de
  sorts si le MJ les active). Les attaques de sort s'y trouvent, avec les mêmes champs (toucher, DM, DD…).
  Le type « Sort » n'est alors pas proposé dans les capacités.
- Sinon : pas d'onglet Sorts ; un sort est une **capacité** de type d'attaque « Sort ».

Données : les champs d'attaque sont stockés sur la capacité (table `features`, nouvelle colonne `attack jsonb`,
nulle pour une capacité qui n'est pas une attaque).

Calculs limités à ces affichages : modificateur « (valeur − 10) / 2 », valeur reliée à une
caractéristique, bonus de maîtrise sur une compétence cochée, total au toucher et DM d'une attaque.
Tout le reste est saisi par le joueur.

## 4. Modèle de données

### Nouvelles tables

```
game_systems                      -- les systèmes des MJ
  id            uuid  pk
  owner_id      uuid  → auth.users (le MJ)
  name          text
  description   text
  base          text  ('dnd5e' | 'pf1e' | 'libre')
  structure     jsonb             -- voir §4.2
  share_token   uuid  unique      -- lien de distribution, régénérable (révoque l'ancien)
  created_at, updated_at

game_system_help                  -- aides de jeu (liées), une ligne = une carte
  id            uuid  pk
  system_id     uuid  → game_systems (on delete cascade)
  title         text
  description   text              -- texte libre (retours à la ligne conservés)
  list_items    jsonb             -- liste à puces facultative : ["…", "…"]
  table_data    jsonb             -- tableau facultatif : { "headers": ["…"], "rows": [["…"]] }
  position      int               -- ordre d'affichage
  created_at, updated_at
```

Une **carte d'aide de jeu** = un titre, une description, et au choix une liste, un tableau, ou les deux
(ex. « Table des coups critiques » : description + tableau d20 / effet).

### Fiche homebrew (table `characters` existante)

- `system = 'homebrew'` (nouvelle valeur autorisée par la contrainte `characters_system_check`).
- Nouvelle colonne `game_system_id uuid → game_systems (on delete set null)` : sert à retrouver
  les **aides de jeu** (liées). Si le MJ supprime son système, la fiche reste utilisable, sans aides.
- `system_data` contient :
  - `structure` : **copie** de la structure au moment de la création (la fiche ne change plus de forme) ;
  - `values` : les valeurs saisies par le joueur (caractéristiques, compétences, jauges, monnaies…),
    indexées par les identifiants de la structure.

Capacités, sorts, objets, ressources, familiers, biographie et notes restent dans leurs tables
actuelles : rien à changer.

### 4.2 Forme de `structure` (jsonb)

```json
{
  "version": 1,
  "identity": { "race": "Peuple", "class": "Vocation", "showLevel": true },
  "stats":    [{ "id": "for", "name": "Force", "short": "FOR", "showMod": true }],
  "proficiency": true,
  "skills":   [{ "id": "athle", "name": "Athlétisme", "statId": "for" }],
  "saves":    [{ "id": "vig", "name": "Vigueur", "statId": "con" }],
  "gauges":   [{ "id": "mana", "name": "Mana", "defaultMax": 10 }],
  "combat":   [{ "id": "ca", "name": "CA", "statId": "dex" }, { "id": "vit", "name": "Vitesse", "statId": null }],
  "specials": [{ "id": "inspi", "kind": "inspiration", "name": "Inspiration", "type": "checkbox" },
               { "id": "maitrise", "kind": "proficiency", "name": "Bonus de maîtrise", "type": "number" }],
  "currencies": [{ "id": "po", "name": "po" }],
  "attacks":  { "enabled": true, "types": ["contact", "distance", "sort"], "baseBonusId": "maitrise" },
  "spellSlots": true,
  "sections": { "features": true, "spells": true, "inventory": true, "familiars": false, "biography": true, "notes": true }
}
```

Les identifiants (`id`) sont générés à la création d'un élément et ne changent jamais, même si on
renomme : les valeurs du joueur restent attachées au bon élément.

## 5. Sécurité (RLS)

| Table | Qui lit | Qui écrit |
|---|---|---|
| `game_systems` | le MJ propriétaire ; les joueurs dont une fiche y est rattachée (nom, description) | le MJ propriétaire |
| `game_system_help` | le MJ ; les joueurs dont une fiche est rattachée au système | le MJ |

- Le `share_token` n'est **jamais** lisible par les joueurs : la lecture joueur passe par une vue ou une
  fonction qui n'expose que nom, description et aides.
- La création d'une fiche depuis un lien passe par une fonction `create_character_from_system(token, name)`
  (security definer) : elle vérifie le jeton, copie la structure et rattache la fiche au joueur connecté.
- Comme pour le partage : compte obligatoire.

## 6. Écrans

### MJ
1. **Accueil → catégorie « Mes modèles »** : comme « Partagées avec moi », une catégorie à part de la liste
   des fiches, visible dès qu'un modèle existe ; toucher un modèle ouvre l'éditeur. Pas d'onglets sur l'accueil.
2. **Éditeur de système** (une page, encarts repliables) :
   - *Général* : nom, description, base (au moment de la création uniquement) ;
   - *Fiche* : une liste par catégorie (cocher, renommer, ajouter, réordonner, supprimer) ; pour
     Défense et combat, liste déroulante « Reliée à : Aucune / FOR / DEX… » ; catalogue des valeurs
     spéciales à cocher ; option « case de maîtrise » ;
   - *Aides de jeu* : cartes (titre, description, liste et/ou tableau), ajout, modification, ordre ;
   - *Distribution* : lien à copier/partager, bouton « Régénérer le lien », nombre de fiches créées.
3. **Aperçu** : la fiche telle que la verra un joueur, en lecture seule.

### Joueur
1. Ouvre le lien → écran « Créer une fiche avec *Nom du système* (MJ : *pseudo*) » → nom du personnage.
2. **Fiche homebrew** : mêmes onglets que les autres fiches, construits à partir de la structure :
   - en-tête : nom, identité, PV + jauges ;
   - accueil : caractéristiques, sauvegardes, valeurs de combat ;
   - compétences ; capacités, sorts, inventaire, biographie, notes (si activés) ;
   - nouvel onglet **Aides de jeu** : les cartes du MJ (lecture seule, à jour en direct).

## 7. Découpage proposé

| Lot | Contenu | Livrable testable |
|---|---|---|
| **1. Systèmes** | Tables + RLS, catégorie « Mes modèles » sur l'accueil, éditeur (Général + Fiche) | Le MJ crée et modifie un système |
| **2. Fiche homebrew** | Rendu générique de la fiche à partir de la structure ; le MJ peut créer une fiche de test | Une fiche homebrew se remplit à la main |
| **3. Aides de jeu** | Éditeur MJ + onglet joueur (liées) | Le joueur lit les aides, mises à jour par le MJ |
| **4. Distribution** | Lien, `create_character_from_system`, écran joueur | Un joueur crée sa fiche depuis le lien du MJ |

## 8. Hors périmètre de la v1

- Formules et calculs automatiques (bonus, modificateurs dérivés, jets de dés).
- Mise à jour de la structure des fiches déjà créées quand le MJ modifie son système.
- Systèmes publics ou partagés entre MJ, catalogue communautaire.
- Mise en forme riche des aides de jeu au-delà des cartes (markdown libre, images).
- Convertir une fiche D&D / Pathfinder existante en fiche homebrew.

## 9. Décisions et questions ouvertes

Décidé :
- Modèles affichés dans une **catégorie à part « Mes modèles »** de l’accueil (comme les fiches partagées), sans onglets ; création depuis « Forger un nouveau héros ».
- **Création d’un héros** : système « Homebrew » dans « Forger un nouveau héros ». Modèle existant → héros créé directement. « + Nouveau modèle » → nom + base → **écran de configuration** (étape 2/2 : « Éléments de la fiche » à cocher, détail de chaque catégorie) → « Créer le héros avec ce modèle ».
- **Éléments de la fiche** : chaque catégorie (caractéristiques, compétences, sauvegardes, jauges, défense, valeurs spéciales, attaques, bourse) et chaque onglet (capacités, sorts, inventaire, familiers, biographie, notes) se coche ou se décoche ; décochée, elle est absente de la fiche mais son contenu reste dans le modèle.
- **Plus de choix de base** à la création : tout modèle part de « Libre » avec, par défaut, les 6 caractéristiques de D&D et l’identité Race + Classe ; le reste se coche (cocher Compétences ajoute les 18 de D&D). Tout est modifiable ou supprimable.
- **Identité** : Race et Classe par défaut (style D&D), renommables et supprimables (jeu sans races), plus des champs ajoutés par le MJ.
- **Modificateurs** : règle D&D (10 = 0, 12 = +1…) par défaut, ou libre (saisi par le joueur).
- Valeurs de défense et de combat **reliables à une caractéristique** (liste déroulante).
- **Valeurs spéciales cochables** (Inspiration, Bonus de maîtrise, BBA, BMO, DMD…) + case de maîtrise.
- **Attaques** dans les capacités : contact / distance / sort, toucher (caractéristique + bonus de base + divers) et **DM (dommages en dés) proposés par principe**.
- **Sorts** : onglet Sorts à part si le MJ coche la section (emplacements en option) ; sinon, un sort est une capacité de type « Sort ».
- Aides de jeu en **cartes** : titre, description, liste et/ou tableau.

Reste ouvert :
1. **Partage automatique** : quand un joueur crée sa fiche depuis le lien, la partager automatiquement en
   lecture seule avec le MJ (et la ranger dans une campagne choisie par le MJ) ? À trancher avant le lot 4.
