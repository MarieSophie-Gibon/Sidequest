/**
 * Aide-mémoire Pathfinder 1e : rappels de règles rédigés pour Sidequest
 * (résumés, pas une copie des livres). Vocabulaire et règles vérifiés sur le wiki
 * Pathfinder-fr (pathfinder-fr.org), traduction française officielle.
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
      { title: 'Ce que tu peux faire', text: 'À chaque round : une action simple, une action de mouvement et une action rapide, ainsi que des actions libres dans la limite du raisonnable. Tu peux toujours échanger ton action simple contre une seconde action de mouvement.' },
      { title: 'Action complexe', text: 'Elle occupe tout le round, à la place de l’action simple et de l’action de mouvement. Il te reste ton action rapide.' },
      { title: 'Pas de placement (1,50 m)', text: 'Si tu ne te déplaces pas d’une autre façon pendant le round, tu peux faire un pas de 1,50 m avant, pendant ou après ton action. Il ne provoque pas d’attaque d’opportunité.' },
      { title: 'Action immédiate', text: 'Semblable à une action rapide, mais utilisable à tout moment, même pendant le tour d’un autre. Elle compte comme l’action rapide de ton tour suivant.' },
      { title: 'Initiative', text: 'd20 + bonus d’initiative. Tant que tu n’as pas agi dans le combat, tu es pris au dépourvu : tu perds ton bonus de Dextérité (et d’esquive) à la CA.' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    entries: [
      { title: 'Action simple', text: 'Porter une attaque, lancer la plupart des sorts, activer un objet magique, aider quelqu’un (+2 à l’attaque d’un allié ou à sa CA), se mettre en défense totale (+4 d’esquive à la CA).' },
      { title: 'Action de mouvement', text: 'Se déplacer de sa vitesse, dégainer ou rengainer une arme, se relever, ramasser un objet, ouvrir une porte, sortir un objet de son sac.' },
      { title: 'Action complexe', text: 'Attaque à outrance (toutes tes attaques), charge, retraite, lancer un sort dont le temps d’incantation est de 1 round.' },
      { title: 'Action rapide', text: 'Une seule par round : sort à incantation rapide, certaines aptitudes de classe (par exemple la réserve magique du magus).' },
      { title: 'Action libre', text: 'Lâcher un objet, se laisser tomber à terre, dire quelques mots.' },
    ],
  },
  {
    id: 'combat',
    label: 'Combat',
    entries: [
      { title: 'Jet d’attaque', text: 'd20 + BBA + modificateur de Force (corps à corps) ou de Dextérité (distance) + modificateur de taille + autres bonus. L’attaque touche si le total égale ou dépasse la CA de la cible. Un 20 naturel touche toujours, un 1 naturel rate toujours.' },
      { title: 'Coup critique', text: 'Si le d20 tombe dans la zone de critique de l’arme et que l’attaque touche, relance l’attaque pour confirmer. En cas de confirmation, les dégâts sont multipliés, sauf les dés supplémentaires (attaque sournoise, effets de sort…).' },
      { title: 'Attaques multiples', text: 'Lors d’une attaque à outrance, un BBA de +6 donne une deuxième attaque à −5, un BBA de +11 une troisième à −10, et un BBA de +16 une quatrième à −15.' },
      { title: 'Attaque d’opportunité', text: 'Quitter une case contrôlée par un adversaire (sauf pas de placement), lancer un sort ou tenter une manœuvre sans le don approprié lui permet de t’attaquer gratuitement. Une seule par round, sauf avec Attaques réflexes.' },
      { title: 'Prise en tenaille', text: 'Quand un allié et toi êtes de part et d’autre d’un adversaire, vous gagnez +2 à vos attaques au corps à corps contre lui.' },
      { title: 'Combat sur la défensive', text: 'En attaquant (attaque simple ou à outrance), tu peux choisir de subir −4 à l’attaque pour gagner +2 d’esquive à la CA jusqu’à ton prochain tour.' },
      { title: 'Charge', text: 'Action complexe : déplace-toi en ligne droite d’au moins 3 m et d’au plus deux fois ta vitesse, puis attaque avec +2. Tu subis −2 à la CA jusqu’à ton prochain tour.' },
      { title: 'À 0 PV ou moins', text: 'À exactement 0 PV, tu es hors de combat : une seule action simple ou de mouvement par round. En dessous, tu es mourant et inconscient : chaque round, fais un test de Constitution DD 10 (avec un malus égal à tes PV négatifs) pour te stabiliser, sinon tu perds 1 PV. Tu meurs quand tes PV négatifs égalent ta valeur de Constitution.' },
    ],
  },
  {
    id: 'manoeuvres',
    label: 'Manœuvres',
    entries: [
      { title: 'Principe', text: 'd20 + BMO contre le DMD de la cible. Sauf mention contraire, une manœuvre provoque une attaque d’opportunité de la cible, à moins d’avoir le don « Science de… » correspondant.' },
      { title: 'Croc-en-jambe', text: 'La cible tombe à terre. Si tu rates de 10 ou plus, c’est toi qui tombes.' },
      { title: 'Désarmement', text: 'La cible lâche l’objet qu’elle tient. Si tu rates de 10 ou plus, c’est toi qui lâches ton arme.' },
      { title: 'Bousculade', text: 'Tu repousses la cible de 1,50 m, plus 1,50 m par tranche de 5 points de marge.' },
      { title: 'Lutte', text: 'En cas de réussite, vous êtes tous les deux agrippés. Pour garder ta prise, refais un test chaque round (avec +5) : tu peux alors déplacer, blesser ou immobiliser ta cible.' },
      { title: 'Autres manœuvres', text: 'Renversement, destruction, sale coup, repositionnement et subtilisation suivent le même principe (BMO contre DMD). Le détail de chacune est dans l’onglet Actions.' },
      { title: 'Feinte', text: 'Ce n’est pas une manœuvre : action simple, test de Bluff contre DD 10 + BBA + modificateur de Sagesse de la cible (ou 10 + son bonus de Psychologie, s’il est plus élevé). En cas de réussite, elle perd son bonus de Dextérité à la CA contre ta prochaine attaque au corps à corps.' },
    ],
  },
  {
    id: 'magie',
    label: 'Magie',
    entries: [
      { title: 'Préparer ses sorts', text: 'Après 8 heures de repos, un magicien ou un magus passe 1 heure à étudier son grimoire pour choisir les sorts du jour. Préparer deux fois le même sort occupe deux emplacements.' },
      { title: 'DD des sorts', text: '10 + niveau du sort + modificateur de la caractéristique d’incantation. L’appli le calcule pour chaque niveau.' },
      { title: 'Concentration', text: 'd20 + niveau de lanceur + modificateur d’incantation. Pour lancer sur la défensive (sans provoquer d’attaque d’opportunité) : DD 15 + 2 × niveau du sort. En cas d’échec, le sort est perdu.' },
      { title: 'Blessé pendant l’incantation', text: 'Test de concentration DD 10 + dégâts subis + niveau du sort.' },
      { title: 'Sort de contact', text: 'L’attaque de contact ignore l’armure, le bouclier et l’armure naturelle de la cible. Tu peux porter le contact gratuitement dans le round où tu lances le sort.' },
      { title: 'Échec des sorts profanes', text: 'En armure, un lanceur de sorts profanes lance un d100 : si le résultat est inférieur ou égal au pourcentage, le sort échoue. Certaines classes y échappent (le magus en armure légère, par exemple).' },
      { title: 'Résistance à la magie', text: 'Le sort n’affecte la cible que si d20 + niveau de lanceur égale ou dépasse sa RM.' },
    ],
  },
  {
    id: 'etats',
    label: 'États',
    entries: [
      { title: 'Pris au dépourvu', text: 'Perd son bonus de Dextérité (et d’esquive) à la CA. Ne peut pas faire d’attaque d’opportunité, sauf avec le don Attaques réflexes.' },
      { title: 'À terre', text: '−4 aux attaques au corps à corps. +4 à la CA contre les attaques à distance, −4 contre le corps à corps. Se relever est une action de mouvement qui provoque une attaque d’opportunité.' },
      { title: 'Agrippé', text: 'Ne peut pas se déplacer, −4 en Dextérité, −2 aux attaques et aux tests de manœuvre (sauf pour lutter ou se libérer). Pour lancer un sort : concentration DD 10 + BMO de l’adversaire + niveau du sort.' },
      { title: 'Secoué, effrayé, paniqué', text: 'Secoué : −2 aux attaques, sauvegardes, tests de compétence et de caractéristique. Effrayé : mêmes malus, et fuit la source de sa peur. Paniqué : mêmes malus, lâche ce qu’il tient et s’enfuit au hasard.' },
      { title: 'Fatigué, épuisé', text: 'Fatigué : −2 en Force et en Dextérité, ne peut ni courir ni charger. Épuisé : −6 en Force et en Dextérité, se déplace à la moitié de sa vitesse.' },
      { title: 'Étourdi', text: 'Lâche ce qu’il tient, ne peut entreprendre aucune action, −2 à la CA et perd son bonus de Dextérité à la CA.' },
      { title: 'Chancelant', text: 'Une seule action simple ou de mouvement par round (plus les actions rapides, immédiates et libres).' },
      { title: 'Aveuglé', text: '−2 à la CA, perd son bonus de Dextérité à la CA, −4 à la plupart des tests de Force et de Dextérité. Tous ses adversaires bénéficient d’un camouflage total (50 % de chances de rater).' },
      { title: 'Nauséeux, fiévreux', text: 'Nauséeux : une seule action de mouvement par round. Fiévreux : −2 aux attaques, aux dégâts des armes, aux sauvegardes et aux tests de compétence et de caractéristique.' },
    ],
  },
  {
    id: 'lexique',
    label: 'Lexique',
    entries: [
      { title: 'BBA', text: 'Bonus de base à l’attaque, déterminé par la classe et le niveau.' },
      { title: 'BMO / DMD', text: 'Bonus de manœuvre offensive (pour tenter une manœuvre) et degré de manœuvre défensive (pour y résister).' },
      { title: 'CA de contact / pris au dépourvu', text: 'Contact : sans armure, bouclier ni armure naturelle. Pris au dépourvu : sans bonus de Dextérité ni d’esquive.' },
      { title: 'Vigueur, Réflexes, Volonté', text: 'Les trois jets de sauvegarde, qui dépendent respectivement de la Constitution, de la Dextérité et de la Sagesse.' },
      { title: 'Rangs de compétence', text: 'Chaque niveau donne autant de rangs que l’indique la classe, plus le modificateur d’Intelligence. Une compétence ne peut pas avoir plus de rangs que ton niveau. Une compétence de classe avec au moins 1 rang gagne +3.' },
      { title: 'Malus d’armure aux tests', text: 'Il s’applique aux compétences basées sur la Force et la Dextérité (Acrobaties, Discrétion, Escalade…).' },
      { title: 'Cumul des bonus', text: 'Deux bonus du même type ne se cumulent pas : seul le plus élevé compte. Font exception les bonus d’esquive, les bonus sans type et les bonus de circonstances de sources différentes.' },
    ],
  },
  {
    id: 'elephant',
    label: 'Éléphant',
    entries: [
      { title: 'Règle maison « Elephant in the Room »', text: 'Certains dons jugés indispensables sont offerts gratuitement, à commencer par Attaque en finesse. Les dons de manœuvre (Science du croc-en-jambe, etc.) sont souvent regroupés. Vérifie la liste exacte avec ton MJ et ajoute les dons obtenus dans l’onglet Capacités.' },
    ],
  },
];
