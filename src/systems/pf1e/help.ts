/**
 * Aide-mémoire Pathfinder 1e : rappels de règles rédigés pour Sidequest
 * (résumés, pas une copie des livres). Contenu statique pour le MVP.
 */
export interface Pf1HelpEntry {
  title: string;
  text: string;
}

export interface Pf1HelpSection {
  id: string;
  label: string;
  entries: Pf1HelpEntry[];
}

export const PF1_HELP: Pf1HelpSection[] = [
  {
    id: 'tour',
    label: 'Mon tour',
    entries: [
      { title: 'Le budget du tour', text: '1 action simple + 1 action de mouvement + 1 action rapide, plus autant d’actions libres que le MJ l’accepte. On peut remplacer l’action simple par une 2e action de mouvement.' },
      { title: 'Ou bien : action complexe', text: 'Une action complexe prend l’action simple ET l’action de mouvement. Il reste l’action rapide.' },
      { title: 'Pas de placement (1,50 m)', text: 'Si tu ne te déplaces pas autrement pendant le tour, tu peux faire un pas de 1,50 m qui ne provoque pas d’attaque d’opportunité.' },
      { title: 'Action immédiate', text: 'Comme une action rapide, mais utilisable pendant le tour d’un autre. Elle consomme l’action rapide de ton prochain tour.' },
      { title: 'Initiative', text: 'd20 + bonus d’initiative. Avant ton premier tour, tu es pris au dépourvu : pas de Dex ni d’esquive à la CA.' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    entries: [
      { title: 'Simple', text: 'Une attaque, lancer la plupart des sorts, utiliser un objet magique, aider un allié (+2), se mettre en défense totale (+4 esquive à la CA).' },
      { title: 'Mouvement', text: 'Se déplacer de sa vitesse, dégainer une arme, se relever, ramasser un objet, ouvrir une porte, prendre un objet dans un sac.' },
      { title: 'Complexe', text: 'Attaque à outrance (toutes tes attaques au BBA), charge, retraite, lancer un sort de 1 round complet.' },
      { title: 'Rapide', text: 'Une par tour : sort à incantation rapide, certaines capacités de classe (ex. Réserve magique du Magus).' },
      { title: 'Libre', text: 'Lâcher un objet, se laisser tomber à terre, parler brièvement.' },
    ],
  },
  {
    id: 'combat',
    label: 'Combat',
    entries: [
      { title: 'Jet d’attaque', text: 'd20 + BBA + For (corps à corps) ou Dex (distance) + taille + bonus divers. Touche si le total ≥ CA de la cible. 20 naturel : touche toujours ; 1 naturel : rate toujours.' },
      { title: 'Critique', text: 'Si le d20 tombe dans la zone de critique et que l’attaque touche, refais le jet d’attaque pour confirmer. Confirmé : multiplie les dégâts (pas les dés en plus comme les sorts ou l’attaque sournoise).' },
      { title: 'Attaques multiples', text: 'Avec un BBA de +6 ou plus, une attaque à outrance donne une attaque supplémentaire à −5, puis −10 à +11, etc.' },
      { title: 'Attaque d’opportunité', text: 'Quitter une case menacée (hors pas de placement), lancer un sort ou faire une manœuvre sans le don adapté provoque une attaque gratuite des ennemis adjacents. Une par round sauf Réflexes de combat.' },
      { title: 'Prise en tenaille', text: 'Deux alliés de part et d’autre d’un ennemi : +2 à l’attaque au corps à corps.' },
      { title: 'Combat sur la défensive', text: 'Action simple ou complexe : −4 à l’attaque, +2 d’esquive à la CA.' },
      { title: 'Charge', text: 'Action complexe : déplace-toi en ligne droite (jusqu’à 2× ta vitesse) et attaque à +2. −2 à la CA jusqu’à ton prochain tour.' },
      { title: 'À 0 PV ou moins', text: '0 PV : hors de combat (une seule action par tour). Négatif : mourant, tu perds 1 PV par round sauf réussite d’un test de Constitution DD 10 (avec le malus des PV négatifs). Mort quand les PV négatifs atteignent ta valeur de Constitution.' },
    ],
  },
  {
    id: 'manoeuvres',
    label: 'Manœuvres',
    entries: [
      { title: 'Principe', text: 'd20 + BMO contre le DMD de la cible. Sans le don « Science de… », la manœuvre provoque une attaque d’opportunité.' },
      { title: 'Croc-en-jambe', text: 'La cible tombe à terre. Raté de 10 ou plus : c’est toi qui tombes.' },
      { title: 'Désarmement', text: 'La cible lâche son arme. Raté de 10 ou plus : c’est toi qui lâches la tienne.' },
      { title: 'Bousculade', text: 'Repousse la cible de 1,50 m, +1,50 m par tranche de 5 au-dessus du DMD.' },
      { title: 'Lutte', text: 'Les deux sont agrippés (−4 Dex, −2 attaque). Ensuite, à chaque tour, le maître de la lutte peut déplacer, blesser ou immobiliser.' },
      { title: 'Renversement, destruction, sale coup, repositionnement, vol, feinte', text: 'Mêmes principes : BMO contre DMD. Demande au MJ l’effet exact.' },
    ],
  },
  {
    id: 'magie',
    label: 'Magie',
    entries: [
      { title: 'Préparer ses sorts', text: 'Après 8 h de repos et 1 h d’étude, choisis dans ton grimoire les sorts du jour. Un sort préparé deux fois occupe deux emplacements.' },
      { title: 'DD du sort', text: '10 + niveau du sort + modificateur de la caractéristique d’incantation. L’appli le calcule par niveau.' },
      { title: 'Concentration', text: 'd20 + niveau de lanceur + mod. d’incantation. Lancer sur la défensive (pour ne pas provoquer) : DD 15 + 2× niveau du sort. Raté : sort perdu.' },
      { title: 'Blessé pendant l’incantation', text: 'Concentration DD 10 + dégâts subis + niveau du sort.' },
      { title: 'Sort de contact', text: 'Attaque de contact : la cible n’ajoute ni armure, ni bouclier, ni armure naturelle. Tu peux toucher gratuitement dans le même round où tu lances le sort.' },
      { title: 'Échec des sorts profanes', text: 'En armure, un lanceur profane rate son sort sur un d100 sous le pourcentage, sauf aptitude de classe (ex. le Magus en armure légère).' },
      { title: 'Résistance à la magie', text: 'd20 + niveau de lanceur doit égaler ou dépasser la RM de la cible pour que le sort l’affecte.' },
    ],
  },
  {
    id: 'etats',
    label: 'États',
    entries: [
      { title: 'Pris au dépourvu', text: 'Pas de bonus de Dex ni d’esquive à la CA. Pas d’attaque d’opportunité.' },
      { title: 'À terre', text: '−4 aux attaques au corps à corps. +4 CA contre la distance, −4 CA contre le corps à corps. Se relever : action de mouvement (provoque).' },
      { title: 'Agrippé', text: '−4 Dex, −2 attaque et BMO (sauf pour lutter), ne peut pas se déplacer. Sort : concentration DD 10 + BMO de l’agrippeur + niveau du sort.' },
      { title: 'Secoué / Effrayé / Paniqué', text: 'Secoué : −2 aux attaques, sauvegardes, compétences. Effrayé : idem et fuit. Paniqué : idem, fuit et lâche ce qu’il tient.' },
      { title: 'Fatigué / Épuisé', text: 'Fatigué : −2 For et Dex, pas de course ni de charge. Épuisé : −6 For et Dex, demi-vitesse.' },
      { title: 'Étourdi', text: 'Lâche ce qu’il tient, aucune action, −2 CA, perd son bonus de Dex.' },
      { title: 'Chancelant', text: 'Une seule action simple OU de mouvement par tour.' },
      { title: 'Aveuglé', text: '−2 CA, perd la Dex à la CA, −4 à la plupart des tests de For/Dex, 50 % de chance de rater (camouflage total des cibles).' },
      { title: 'Nauséeux / Fiévreux', text: 'Nauséeux : seulement une action de mouvement. Fiévreux : −2 attaque, dégâts, sauvegardes, compétences.' },
    ],
  },
  {
    id: 'lexique',
    label: 'Lexique',
    entries: [
      { title: 'BBA', text: 'Bonus de base à l’attaque, fixé par la classe et le niveau.' },
      { title: 'BMO / DMD', text: 'Bonus de manœuvre offensive (attaquer en manœuvre) et Degré de manœuvre défensive (y résister).' },
      { title: 'CA contact / dépourvu', text: 'Contact : sans armure, bouclier ni armure naturelle. Dépourvu : sans Dex ni esquive.' },
      { title: 'Vigueur / Réflexes / Volonté', text: 'Les trois jets de sauvegarde, basés sur Con, Dex et Sag.' },
      { title: 'Rangs de compétence', text: 'Chaque niveau donne (rangs de classe + mod. Int) rangs. Max 1 rang par niveau dans une compétence. Compétence de classe avec au moins 1 rang : +3.' },
      { title: 'Malus d’armure aux tests', text: 'S’applique aux compétences de For et de Dex (Acrobaties, Discrétion, Escalade…).' },
      { title: 'Bonus du même type', text: 'Deux bonus du même type ne s’additionnent pas (on garde le meilleur), sauf esquive et circonstances.' },
    ],
  },
  {
    id: 'elephant',
    label: 'Éléphant',
    entries: [
      { title: 'Règle maison « Elephant in the Room »', text: 'Certains dons jugés indispensables sont gratuits. Le plus connu : Attaque en finesse donnée automatiquement. Les dons de manœuvre (Science du croc-en-jambe, etc.) sont souvent regroupés. Vérifie la liste exacte avec ton MJ et ajoute les dons obtenus dans l’onglet Capacités.' },
    ],
  },
];
