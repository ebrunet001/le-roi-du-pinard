const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const PROMPTS_DIR = '/home/ebrunet001/projects/prompts/Le Roi du Pinard';
const OUTPUT_DIR = '/home/ebrunet001/projects/le-roi-du-pinard';
const BASE_URL = 'https://leroidupinard.fr';

// Traductions
const TRANSLATIONS = {
  colors: {
    'Red': 'Rouge',
    'White': 'Blanc',
    'Rosé': 'Rosé',
    'Rose': 'Rosé',
    'Sparkling': 'Effervescent'
  },
  regions: {
    'Burgundy': 'Bourgogne',
    'Northern Rhône': 'Rhône Nord',
    'Southern Rhône': 'Rhône Sud',
    'Loire Valley': 'Vallée de la Loire',
    'Tuscany': 'Toscane',
    'Beaujolais': 'Beaujolais',
    'Champagne': 'Champagne',
    'Bordeaux': 'Bordeaux',
    'Provence': 'Provence',
    'Languedoc': 'Languedoc',
    'Jura': 'Jura',
    'Savoie': 'Savoie',
    'France': 'France',
    'Ardèche': 'Ardèche',
    'Mâconnais': 'Mâconnais'
  }
};

// Dictionnaire de traduction pour phrases complètes (prioritaires)
const WINE_PHRASES_FR = {
  // Terroir - Phrases complètes
  'Chalk and limestone soils of Champagne': 'Sols de craie et calcaire de Champagne',
  'Limestone and clay soils of Burgundy': 'Sols argilo-calcaires de Bourgogne',
  'Limestone and clay-limestone soils': 'Sols calcaires et argilo-calcaires',
  'Limestone, marl and clay': 'Calcaire, marne et argile',
  'Clay and limestone': 'Argile et calcaire',
  'Clay-limestone': 'Argilo-calcaire',
  'Limestone with chalky subsoil': 'Calcaire avec sous-sol crayeux',
  'Limestone - near quarry': 'Calcaire - près de la carrière',
  'Varied limestone and clay soils': 'Sols variés de calcaire et argile',
  'Granite and schist slopes': 'Coteaux de granit et schiste',
  'Blue and grey marl, limestone': 'Marne bleue et grise, calcaire',
  'Old worn granite (gores)': 'Granit ancien altéré (gores)',
  'Deep gravel over clay': 'Graves profondes sur argile',
  'Gravel and clay': 'Graves et argile',
  'Tuffeau limestone': 'Tuffeau calcaire',

  // Viticulture - Phrases complètes
  'Traditional': 'Traditionnelle',
  'Organic certified': 'Agriculture biologique certifiée',
  'Organic, biodynamic influences': 'Biologique, influences biodynamiques',
  'Organic, biodynamic practices': 'Biologique, pratiques biodynamiques',
  'Organic, moving towards biodynamic': 'Biologique, en conversion biodynamique',
  'Sustainable viticulture': 'Viticulture raisonnée',
  'Sustainable': 'Raisonnée',
  'Traditional, organic practices': 'Traditionnelle, pratiques biologiques',
  'Traditional, old vine focus': 'Traditionnelle, accent vieilles vignes',
  'Certified biodynamic (Demeter)': 'Biodynamie certifiée (Demeter)',
  '100% biodynamic (certified), horses used in vineyard': 'Biodynamie 100% certifiée, travail au cheval',
  'Organic, biodynamic, max 6 bunches/vine': 'Biologique, biodynamique, max 6 grappes/pied',
  'Organic, biodynamic, very old vines': 'Biologique, biodynamique, très vieilles vignes',

  // Vinification - Phrases complètes
  'Traditional method, secondary fermentation in bottle': 'Méthode traditionnelle, prise de mousse en bouteille',
  'Traditional Burgundian methods, barrel fermentation and aging': 'Méthodes bourguignonnes traditionnelles, fermentation et élevage en fûts',
  'Traditional Burgundian methods': 'Méthodes bourguignonnes traditionnelles',
  'Traditional Burgundian': 'Bourguignonne traditionnelle',
  'Traditional methods, structured approach': 'Méthodes traditionnelles, approche structurée',
  'Traditional methods, long aging': 'Méthodes traditionnelles, élevage long',
  'Traditional winemaking methods': 'Méthodes de vinification traditionnelles',
  'Traditional approach': 'Approche traditionnelle',
  'Traditional Moreau approach': 'Approche traditionnelle Moreau',
  'Traditional Boisson methods, long lees aging': 'Méthodes traditionnelles Boisson, longue lies',
  'Traditional Loire methods': 'Méthodes ligériennes traditionnelles',
  'Traditional Jura methods, oxidative or ouillé': 'Méthodes jurassiennes traditionnelles, oxydatif ou ouillé',
  'Formal training, international experience': 'Formation classique, expérience internationale',
  'Respect for fruit, silky extraction': 'Respect du fruit, extraction soyeuse',
  'Indigenous yeast': 'Levures indigènes',
  'natural yeast': 'levures naturelles',

  // Élevage - Phrases complètes
  'Oak barrels': 'Fûts de chêne',
  'Oak barrels, extended aging': 'Fûts de chêne, élevage prolongé',
  'Old oak barrels': 'Vieux fûts de chêne',
  'Old oak barrels, 18-24 months': 'Vieux fûts de chêne, 18-24 mois',
  'Old oak barrels, 24+ months': 'Vieux fûts de chêne, 24+ mois',
  'Old oak barrels, 12-18 months': 'Vieux fûts de chêne, 12-18 mois',
  'Old oak barrels, 12-18 months on lees': 'Vieux fûts de chêne, 12-18 mois sur lies',
  'Used barrels': 'Fûts usagés',
  '12 months used barrels': '12 mois en fûts usagés',
  '12-18 months in oak (30-40% new)': '12-18 mois en fûts (30-40% neufs)',
  'Mostly used oak': 'Majoritairement fûts usagés',
  '18-24 months in old oak': '18-24 mois en vieux fûts',
  'Extended barrel aging': 'Élevage prolongé en fûts',

  // Terroir termes additionnels
  'Decomposed granite and schist': 'Granit décomposé et schiste',
  'Decomposed granite': 'Granit décomposé',
  'decomposed granite': 'granit décomposé',
  'granite and schist': 'granit et schiste',
  'Granite and schist slopes': 'Coteaux de granit et schiste',

  // Vinification termes additionnels
  'natural winemaking': 'vinification naturelle',
  'Natural winemaking': 'Vinification naturelle',
  'Semi-carbonic': 'Semi-carbonique',
  'semi-carbonic': 'semi-carbonique',
  'carbonic maceration': 'macération carbonique',
  'Carbonic maceration': 'Macération carbonique',
  'or traditional fermentation': 'ou fermentation traditionnelle',
  'traditional fermentation': 'fermentation traditionnelle',
  'Traditional fermentation': 'Fermentation traditionnelle',

  // Style termes additionnels
  'age-worthy': 'de garde',
  'Age-worthy': 'De garde',
  'Beaujolais cru': 'cru du Beaujolais',
  'Structured, age-worthy Beaujolais cru': 'Cru du Beaujolais structuré, de garde',

  // Termes simples qui peuvent apparaître seuls
  'Biodynamic': 'Biodynamique',
  'Organic': 'Biologique',
  'Practicing organic': 'En conversion biologique',
  'Whole cluster': 'Grappe entière',
  'Whole bunch': 'Vendange entière',
  'Limestone': 'Calcaire',
  'limestone': 'calcaire',
  'Chalk': 'Craie',
  'chalk': 'craie',
  'Chalk, limestone': 'Craie, calcaire',
  'Granite': 'Granit',
  'granite': 'granit',
  'Clay': 'Argile',
  'clay': 'argile',
  'Marl': 'Marne',
  'marl': 'marne',
  'Sand': 'Sable',
  'sand': 'sable',

  // Vinification termes additionnels
  'Levures indigèness': 'Levures indigènes',  // Correction typo source
  'no malo': 'sans malo',
  'new oak': 'fûts neufs',
  '% new oak': '% fûts neufs',
  'indigenous yeast': 'levures indigènes',
  'Indigenous yeast': 'Levures indigènes',
  'native yeast': 'levures indigènes',
  'Native yeast': 'Levures indigènes',
  'wild yeast': 'levures sauvages',
  'Wild yeast': 'Levures sauvages',
  'partial whole cluster': 'grappe entière partielle',
  'Partial whole cluster': 'Grappe entière partielle',

  // Élevage termes additionnels
  'months on lees': 'mois sur lies',
  'years on lees': 'ans sur lies',
  'on lees': 'sur lies',
  'in tank': 'en cuve',
  'in barrel': 'en fût',
  'in barrels': 'en fûts',
  'stainless steel': 'inox',
  'Stainless steel': 'Inox',
  'concrete': 'béton',
  'Concrete': 'Béton',
  'amphora': 'amphore',
  'Amphora': 'Amphore',

  // Style termes additionnels
  'Rich': 'Riche',
  'rich': 'riche',
  'Bold': 'Audacieux',
  'bold': 'audacieux',
  'with bubbles': 'effervescent',
  'Burgundy with bubbles': 'Bourgogne effervescent',
  'Rich, bold': 'Riche, audacieux',
  'Rich, bold, Burgundy with bubbles': 'Riche, audacieux, Crémant de Bourgogne',
  'Fine bubbles, complex, elegant sparkling wine': 'Fines bulles, complexe, effervescent élégant',
  'Fine bubbles': 'Fines bulles',
  'sparkling wine': 'effervescent',
  'sparkling': 'effervescent',
  'Sparkling': 'Effervescent',
  'certified': 'certifié',
  'Certified': 'Certifié',
  'Tense': 'Tendu',
  'tense': 'tendu',
  'Crisp': 'Vif',
  'crisp': 'vif',
  'Round': 'Rond',
  'round': 'rond',
  'Soft': 'Souple',
  'soft': 'souple',
  'Dry': 'Sec',
  'dry': 'sec',
  'Sweet': 'Doux',
  'sweet': 'doux',
  'Light': 'Léger',
  'light': 'léger',
  'Full-bodied': 'Corsé',
  'full-bodied': 'corsé',
  'Medium-bodied': 'Mi-corsé',
  'medium-bodied': 'mi-corsé',
  'Aromatic': 'Aromatique',
  'aromatic': 'aromatique',
  'Floral': 'Floral',
  'floral': 'floral',
  'Spicy': 'Épicé',
  'spicy': 'épicé',
  'Smoky': 'Fumé',
  'smoky': 'fumé',
  'Oaky': 'Boisé',
  'oaky': 'boisé',
  'Toasty': 'Toasté',
  'toasty': 'toasté',

  // Style - Phrases complètes
  'Traditional Burgundy red with finesse and terroir expression': 'Rouge bourguignon traditionnel avec finesse et expression du terroir',
  'Firm, tannic, earthy red Burgundy': 'Bourgogne rouge ferme, tannique, terreux',
  'Powerful, classic': 'Puissant, classique',
  'Elegant, mineral': 'Élégant, minéral',
  'Pure, classic': 'Pur, classique',
  'Structured, deep': 'Structuré, profond',
  'Classic, complex': 'Classique, complexe',
  'Fresh, fruity Loire Cabernet Franc': 'Cabernet Franc de Loire frais et fruité',
  'Fresh, silky, accessible': 'Frais, soyeux, accessible',
  'Powerful, concentrated, age-worthy Syrah': 'Syrah puissante, concentrée, de garde',
  'Distinctive Jura character with nutty, oxidative notes': 'Caractère jurassien distinctif avec notes de noix, oxydatif',
  'Classic white Burgundy with purity and mineral character': 'Bourgogne blanc classique avec pureté et caractère minéral',
  'Fresh, precise': 'Frais, précis',
  'Balanced, accessible Burgundy with fruit and structure': 'Bourgogne équilibré et accessible avec fruit et structure',
  'Precise, mineral': 'Précis, minéral',
  'Elegant, precise': 'Élégant, précis',
  'Vibrant, zesty': 'Vibrant, vif',
  'Pure, mineral': 'Pur, minéral',
  'Elegant': 'Élégant',
  'Complex, silky': 'Complexe, soyeux'
};

// Fonction pour traduire un texte technique
function translateWineTerms(text) {
  if (!text) return '';

  // Si le texte est déjà majoritairement en français, le retourner tel quel
  const frenchIndicators = ['é', 'è', 'ê', 'à', 'ù', 'ç', 'œ', 'î', 'ô'];
  const hasFrenchChars = frenchIndicators.some(c => text.includes(c));
  const englishIndicators = ['Traditional', 'Organic', 'Oak', 'oak', 'lees', 'Chalk', 'chalk', 'Rich', 'Bold', 'months', 'years', 'Limestone', 'limestone', 'Decomposed', 'granite', 'schist', 'winemaking', 'carbonic', 'fermentation', 'age-worthy', 'Structured', 'clay', 'Clay', 'marl', 'Marl', 'slopes', 'soils'];
  const hasEnglish = englishIndicators.some(e => text.includes(e));
  if (hasFrenchChars && !hasEnglish) {
    return text;
  }

  // D'abord chercher une correspondance exacte dans les phrases
  if (WINE_PHRASES_FR[text]) {
    return WINE_PHRASES_FR[text];
  }

  // Sinon, essayer de remplacer les phrases connues dans le texte
  let result = text;
  const sortedPhrases = Object.keys(WINE_PHRASES_FR).sort((a, b) => b.length - a.length);

  for (const phrase of sortedPhrases) {
    if (result.includes(phrase)) {
      result = result.split(phrase).join(WINE_PHRASES_FR[phrase]);
    }
  }

  // Patterns avec regex pour les nombres variables
  result = result.replace(/(\d+)\s*%\s*new oak/gi, '$1% fûts neufs');
  result = result.replace(/(\d+)\+?\s*months?\s+on\s+lees/gi, '$1+ mois sur lies');
  result = result.replace(/(\d+)\+?\s*years?\s+on\s+lees/gi, '$1+ ans sur lies');
  result = result.replace(/(\d+)-(\d+)\s*months?\s+in\s+(oak|barrel)/gi, '$1-$2 mois en fûts');
  result = result.replace(/(\d+)\s*months?\s+in\s+(oak|barrel)/gi, '$1 mois en fûts');

  return result;
}

// =============================================================================
// GÉNÉRATION FAQ ENRICHIE
// =============================================================================

function generateDegustationAnswer(wine) {
  const parts = [];
  const color = wine.colorFr || 'Rouge';
  const region = wine.regionFr || '';
  const style = translateWineTerms(wine.Style || '');
  const drinkingWindow = wine.Drinking_Window || '';
  const servingTemp = wine.Serving_Temp || '';
  const decanting = wine.Decanting || '';
  const agingPotential = wine.Aging_Potential || '';

  // Introduction basée sur la fenêtre de dégustation
  if (drinkingWindow) {
    if (drinkingWindow.includes('now') || drinkingWindow.includes('maintenant')) {
      parts.push(`Ce ${color.toLowerCase()} peut être dégusté dès maintenant, même s'il gagnera en complexité avec quelques années de cave.`);
    } else if (drinkingWindow.includes('+') || drinkingWindow.includes('years')) {
      parts.push(`Ce ${color.toLowerCase()} est un vin de garde. La fenêtre de dégustation optimale se situe ${drinkingWindow.replace('years', 'ans').replace('-', ' à ')}.`);
    } else {
      parts.push(`La fenêtre de dégustation optimale pour ce ${color.toLowerCase()} se situe ${drinkingWindow.replace('years', 'ans').replace('-', ' à ')}.`);
    }
  } else {
    if (color === 'Rouge') {
      parts.push(`Ce rouge peut être apprécié dans sa jeunesse pour son fruit éclatant, ou conservé quelques années pour développer des arômes tertiaires plus complexes.`);
    } else if (color === 'Blanc') {
      parts.push(`Ce blanc révèle toute sa fraîcheur et sa minéralité dans les premières années, tout en ayant un beau potentiel de garde pour les amateurs de vins évolués.`);
    } else if (color === 'Effervescent') {
      parts.push(`Ce champagne/crémant peut être dégusté dès maintenant pour profiter de sa vivacité, ou conservé pour développer des notes plus vineuses et briochées.`);
    } else {
      parts.push(`Ce vin peut être apprécié dès maintenant ou conservé quelques années selon vos préférences.`);
    }
  }

  // Température de service
  if (servingTemp) {
    parts.push(`Servir à ${servingTemp} pour une dégustation optimale.`);
  } else {
    if (color === 'Rouge') {
      parts.push(`Servir entre 16 et 18°C. Sortir la bouteille de la cave 30 minutes avant le service.`);
    } else if (color === 'Blanc') {
      parts.push(`Servir frais, entre 10 et 12°C. Une légère fraîcheur sublimera sa minéralité.`);
    } else if (color === 'Rosé') {
      parts.push(`Servir bien frais, entre 8 et 10°C.`);
    } else if (color === 'Effervescent') {
      parts.push(`Servir frais, entre 8 et 10°C. Éviter le seau à glace qui masque les arômes.`);
    }
  }

  // Carafage
  if (decanting) {
    parts.push(translateWineTerms(decanting));
  } else if (color === 'Rouge' && (style.includes('puissant') || style.includes('structuré') || style.includes('tannique'))) {
    parts.push(`Un passage en carafe d'une à deux heures permettra d'assouplir les tanins et de révéler toute la palette aromatique.`);
  }

  return parts.join(' ');
}

function generateAccordAnswer(wine) {
  const parts = [];
  const color = wine.colorFr || 'Rouge';
  const region = wine.regionFr || '';
  const style = translateWineTerms(wine.Style || '').toLowerCase();
  const grape = wine.Grape_Variety || '';
  const foodPairing = wine.Food_Pairing || '';

  // Si on a des accords spécifiques
  if (foodPairing && foodPairing.length > 20) {
    return translateWineTerms(foodPairing);
  }

  // Sinon, générer selon le type de vin
  if (color === 'Rouge') {
    if (region === 'Bourgogne') {
      parts.push(`Les Pinot Noir bourguignons s'accordent merveilleusement avec les volailles rôties (poulet de Bresse, pintade), le bœuf bourguignon, les viandes blanches en sauce, et les fromages à croûte lavée comme l'Époisses.`);
      if (style.includes('puissant') || style.includes('structuré')) {
        parts.push(`Pour ce vin plus charpenté, privilégiez le gibier (faisan, chevreuil) ou un carré d'agneau aux herbes.`);
      } else if (style.includes('élégant') || style.includes('soyeux')) {
        parts.push(`Sa finesse l'oriente vers des préparations délicates : pigeon rôti, ris de veau, ou champignons des bois.`);
      }
    } else if (region === 'Rhône Nord') {
      parts.push(`Cette Syrah du Rhône Nord accompagne idéalement les viandes grillées, le gibier à plumes, l'agneau aux herbes de Provence, ou les plats épicés comme un tajine d'agneau.`);
    } else {
      parts.push(`Ce rouge s'accordera avec les viandes rouges grillées ou en sauce, les plats mijotés, le gibier, et les fromages affinés.`);
    }
  } else if (color === 'Blanc') {
    if (region === 'Bourgogne') {
      parts.push(`Les grands Chardonnay bourguignons subliment les poissons nobles (turbot, sole meunière, bar), les crustacés (homard, langoustines), les volailles à la crème, et les fromages comme le Comté affiné.`);
      if (style.includes('minéral') || style.includes('tendu')) {
        parts.push(`Sa tension minérale en fait un compagnon idéal des huîtres, des fruits de mer, et des poissons crus.`);
      } else if (style.includes('riche') || style.includes('opulent')) {
        parts.push(`Sa richesse permet des accords avec des plats plus opulents : ris de veau, volaille truffée, ou foie gras mi-cuit.`);
      }
    } else if (region === 'Loire') {
      parts.push(`Ce blanc ligérien est parfait avec les poissons de rivière, les fromages de chèvre (crottin de Chavignol, Selles-sur-Cher), et les fruits de mer.`);
    } else {
      parts.push(`Ce blanc accompagnera poissons, fruits de mer, volailles en sauce blanche, et fromages frais.`);
    }
  } else if (color === 'Effervescent') {
    parts.push(`Ce champagne/crémant est idéal à l'apéritif, mais brille également à table avec des huîtres, du caviar, des sushis de qualité, ou une volaille truffée. Les cuvées vinifiées en fût supportent même le foie gras.`);
  } else if (color === 'Rosé') {
    parts.push(`Ce rosé accompagne parfaitement la cuisine méditerranéenne, les grillades estivales, la cuisine asiatique légèrement épicée, et les salades composées.`);
  }

  // Ajouter conseil régional si disponible
  if (region && !parts[0]?.includes(region)) {
    parts.push(`Pensez également aux spécialités de ${region} pour un accord régional authentique.`);
  }

  return parts.join(' ');
}

// =============================================================================
// GÉNÉRATION TEXTE VIVINO HUMORISTIQUE
// =============================================================================

function generateVivinoHumor(profile) {
  if (!profile || profile === 'Données insuffisantes') return null;

  // Dictionnaire de traductions humoristiques pour les profils Vivino
  const humorMap = {
    // Fruits
    'Fruit rouge': 'des cerises qui ont fait de la danse classique',
    'Fruit noir': 'des mûres qui ont voyagé en première classe',
    "Fruit d'arbre": 'des pommes qui ont fréquenté les grandes écoles',
    'Agrume': "des citrons qui n'ont peur de rien",
    'Fruit tropical': 'des mangues en vacances sur la Côte d\'Azur',
    'Baie': 'des framboises avec un CV impressionnant',

    // Terroir / Minéralité
    'Terreux': 'un parfum de sous-bois après la pluie royale',
    'Minéral': 'des cailloux léchés par les anges',
    'Pierre': 'le goût d\'un château qu\'on aurait pu construire',

    // Boisé / Élevage
    'Boisé': 'un petit séjour dans des fûts 5 étoiles',
    'Vieillissement': 'la sagesse des moines qui ont gardé le secret',
    'Chêne': 'des chênes centenaires qui ont des histoires à raconter',
    'Toast': 'une baguette grillée par un artisan dévoué',
    'Vanille': 'la douceur d\'une grand-mère gâteau',

    // Épices
    'Épices': 'des épices rapportées des croisades',
    'Épicé': 'un petit côté aventurier très séduisant',
    'Poivre': 'un moulin à poivre qui a des opinions',

    // Floral
    'Floral': 'des fleurs cueillies à l\'aube par une princesse',
    'Rose': 'des pétales de rose dans un bain moussant',

    // Autres
    'Crémeux': 'du velours pour les papilles',
    'Gras': 'une texture qui fait des câlins',
    'Frais': 'une brise matinale sur le vignoble',
    'Vif': 'une acidité qui vous réveille mieux que le clairon',
    'Tannique': 'des tanins qui ont fait de la musculation'
  };

  // Séparer les termes du profil
  const terms = profile.split(',').map(t => t.trim());

  // Traduire chaque terme
  const humorousTerms = terms.map(term => {
    // Chercher une correspondance exacte ou partielle
    for (const [key, value] of Object.entries(humorMap)) {
      if (term.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(term.toLowerCase())) {
        return value;
      }
    }
    // Si pas de correspondance, garder le terme original avec une touche d'humour
    return `un soupçon de ${term.toLowerCase()} mystérieux`;
  });

  // Construire la phrase finale
  if (humorousTerms.length === 1) {
    return `Les dégustateurs de Vivino y ont décelé ${humorousTerms[0]}.`;
  } else if (humorousTerms.length === 2) {
    return `Les dégustateurs de Vivino y ont trouvé ${humorousTerms[0]} et ${humorousTerms[1]}.`;
  } else {
    const last = humorousTerms.pop();
    return `Les dégustateurs de Vivino y ont repéré ${humorousTerms.join(', ')}, et ${last}.`;
  }
}

function formatVivinoRating(rating) {
  if (!rating || isNaN(parseFloat(rating))) return null;
  const r = parseFloat(rating);
  const fullStars = Math.floor(r);
  const halfStar = r % 1 >= 0.3 && r % 1 < 0.8;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

function formatVivinoReviews(reviews) {
  if (!reviews) return null;
  const str = String(reviews).trim();
  if (str.includes('<')) return str; // "< 20" par exemple
  const num = parseInt(str.replace(/\s/g, ''));
  if (isNaN(num)) return str;
  if (num >= 1000) return Math.round(num / 1000) + 'k+ avis';
  return num + ' avis';
}

// =============================================================================
// CORRECTION DES FAUTES DE FRAPPE
// =============================================================================

function fixTypos(text) {
  if (!text) return '';

  return text
    .replace(/Ce cette/g, 'Cette')
    .replace(/ce cette/g, 'cette')
    .replace(/de de /g, 'de ')
    .replace(/le le /g, 'le ')
    .replace(/la la /g, 'la ')
    .replace(/un un /g, 'un ')
    .replace(/une une /g, 'une ');
}

// =============================================================================
// UTILITAIRES
// =============================================================================

function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function translateColor(color) {
  return TRANSLATIONS.colors[color] || color;
}

function translateRegion(region) {
  return TRANSLATIONS.regions[region] || region;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readExcel(filename) {
  const filePath = path.join(PROMPTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found: ${filename}`);
    return [];
  }
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

// =============================================================================
// CHARGEMENT DES DONNÉES
// =============================================================================

function loadData() {
  console.log('Chargement des données...');

  // Base de données principale des vins
  const wines = readExcel('Wine_Database_440_COMPLET_FINAL.xlsx');
  console.log(`  - ${wines.length} vins chargés`);

  // Données XXL avec avis du Roi du Pinard
  const winesXXL = readExcel('Wine_Database_Roi_Pinard_XXL.xlsx');
  console.log(`  - ${winesXXL.length} avis du Roi chargés`);

  // Données Vivino
  const winesVivino = readExcel('Wine_Database_Complete_Final_CORRIGEE.xlsx');
  console.log(`  - ${winesVivino.length} données Vivino chargées`);

  // Producteurs (mixer les deux sources)
  const producers1 = readExcel('Page_producteurs_complete_1.xlsx');
  const producers2 = readExcel('Page producteurs - contenus.xlsx');
  console.log(`  - Producteurs: ${producers1.length} + ${producers2.length} sources`);

  // Régions/Catégories (mixer les deux sources)
  const categories1 = readExcel('Pages_categories_complete.xlsx');
  const categories2 = readExcel('Pages catégories - descriptions remplies.xlsx');
  console.log(`  - Catégories: ${categories1.length} + ${categories2.length} sources`);

  // Sous-catégories/Appellations (mixer les deux sources)
  const subcat1 = readExcel('Pages_sous_categories_complete_1.xlsx');
  const subcat2 = readExcel('Pages sous catégories - descriptions.xlsx');
  console.log(`  - Sous-catégories: ${subcat1.length} + ${subcat2.length} sources`);

  return {
    wines,
    winesXXL,
    winesVivino,
    producers1,
    producers2,
    categories1,
    categories2,
    subcat1,
    subcat2
  };
}

// =============================================================================
// TRAITEMENT DES DONNÉES
// =============================================================================

function processWines(wines, winesXXL = [], winesVivino = []) {
  // Créer un map des données XXL par nom de vin
  const xxlMap = new Map();
  winesXXL.forEach(w => {
    if (w.WINE) xxlMap.set(w.WINE, w);
  });

  // Créer un map des données Vivino par nom de vin
  const vivinoMap = new Map();
  winesVivino.forEach(w => {
    if (w.WINE) vivinoMap.set(w.WINE, w);
  });

  return wines.map(wine => {
    const regionFr = translateRegion(wine.Region || '');
    const colorFr = translateColor(wine.COLOR || '');

    // Récupérer l'avis du Roi du Pinard depuis le fichier XXL
    const xxlData = xxlMap.get(wine.WINE) || {};

    // Récupérer les données Vivino
    const vivinoData = vivinoMap.get(wine.WINE) || {};

    return {
      ...wine,
      slug: createSlug(wine.WINE),
      regionFr,
      regionSlug: createSlug(regionFr),
      colorFr,
      appellationSlug: createSlug(wine.Appellation),
      producerSlug: createSlug(wine.Producer),
      avisRoiPinard: fixTypos(xxlData.L_Avis_du_Roi_du_Pinard || ''),
      vivinoRating: vivinoData.Vivino_Rating || null,
      vivinoReviews: vivinoData.Vivino_Reviews || null,
      vivinoProfile: vivinoData.Vivino_Profile || null
    };
  });
}

function processProducers(producers1, producers2, wines) {
  // Créer un map des producteurs à partir des vins
  const producerMap = new Map();

  wines.forEach(wine => {
    if (!wine.Producer) return;
    if (!producerMap.has(wine.Producer)) {
      producerMap.set(wine.Producer, {
        name: wine.Producer,
        slug: createSlug(wine.Producer),
        region: wine.regionFr,
        regionSlug: wine.regionSlug,
        wines: [],
        appellations: new Set()
      });
    }
    const producer = producerMap.get(wine.Producer);
    producer.wines.push(wine);
    if (wine.Appellation) {
      producer.appellations.add(wine.Appellation);
    }
  });

  // Mixer les contenus des deux sources
  const contentMap1 = new Map();
  const contentMap2 = new Map();

  producers1.forEach(p => {
    if (p.Producer) contentMap1.set(p.Producer, p);
  });
  producers2.forEach(p => {
    if (p.Producer) contentMap2.set(p.Producer, p);
  });

  // Enrichir chaque producteur avec le contenu mixé
  producerMap.forEach((producer, name) => {
    const content1 = contentMap1.get(name) || {};
    const content2 = contentMap2.get(name) || {};

    // Prendre le meilleur des deux sources
    producer.descriptionSerieuse = content1['Description sérieuse de l\'appelation'] ||
                                    content2['Description sérieuse de l\'appelation'] ||
                                    content1['Description sérieuse'] ||
                                    content2['Description sérieuse'] || '';

    producer.descriptionRoi = content1['Description de l\'appelation par le Roi du Pinard'] ||
                              content2['Description de l\'appelation par le Roi du Pinard'] ||
                              content1['Description par le Roi du Pinard'] ||
                              content2['Description par le Roi du Pinard'] || '';

    producer.appellations = Array.from(producer.appellations);
  });

  return Array.from(producerMap.values());
}

function processRegions(categories1, categories2, wines) {
  // Extraire les régions uniques des vins
  const regionMap = new Map();

  wines.forEach(wine => {
    if (!wine.regionFr) return;
    if (!regionMap.has(wine.regionFr)) {
      regionMap.set(wine.regionFr, {
        name: wine.regionFr,
        slug: wine.regionSlug,
        wines: [],
        appellations: new Set(),
        producers: new Set()
      });
    }
    const region = regionMap.get(wine.regionFr);
    region.wines.push(wine);
    if (wine.Appellation) region.appellations.add(wine.Appellation);
    if (wine.Producer) region.producers.add(wine.Producer);
  });

  // Mixer les contenus
  const contentMap1 = new Map();
  const contentMap2 = new Map();

  categories1.forEach(c => {
    const regionFr = translateRegion(c.Region || '');
    if (regionFr) contentMap1.set(regionFr, c);
  });
  categories2.forEach(c => {
    const regionFr = translateRegion(c.Region || '');
    if (regionFr) contentMap2.set(regionFr, c);
  });

  regionMap.forEach((region, name) => {
    const content1 = contentMap1.get(name) || {};
    const content2 = contentMap2.get(name) || {};

    region.descriptionSerieuse = content1['Description sérieuse de l\'appelation'] ||
                                  content2['Description sérieuse de l\'appelation'] ||
                                  content1['Description sérieuse'] ||
                                  content2['Description sérieuse'] || '';

    region.descriptionRoi = content1['Description de l\'appelation par le Roi du Pinard'] ||
                            content2['Description de l\'appelation par le Roi du Pinard'] ||
                            content1['Description par le Roi du Pinard'] ||
                            content2['Description par le Roi du Pinard'] || '';

    region.appellations = Array.from(region.appellations);
    region.producers = Array.from(region.producers);
  });

  return Array.from(regionMap.values());
}

function processAppellations(subcat1, subcat2, wines) {
  // Extraire les appellations uniques
  const appellationMap = new Map();

  wines.forEach(wine => {
    if (!wine.Appellation) return;
    const key = `${wine.regionFr}-${wine.Appellation}`;
    if (!appellationMap.has(key)) {
      appellationMap.set(key, {
        name: wine.Appellation,
        slug: wine.appellationSlug,
        region: wine.regionFr,
        regionSlug: wine.regionSlug,
        wines: []
      });
    }
    appellationMap.get(key).wines.push(wine);
  });

  // Mixer les contenus
  const contentMap1 = new Map();
  const contentMap2 = new Map();

  subcat1.forEach(s => {
    if (s.Appellation) {
      const regionFr = translateRegion(s.Region || '');
      contentMap1.set(s.Appellation, { ...s, regionFr });
    }
  });
  subcat2.forEach(s => {
    if (s.Appellation) {
      const regionFr = translateRegion(s.Region || '');
      contentMap2.set(s.Appellation, { ...s, regionFr });
    }
  });

  appellationMap.forEach((appellation, key) => {
    const content1 = contentMap1.get(appellation.name) || {};
    const content2 = contentMap2.get(appellation.name) || {};

    appellation.descriptionSerieuse = content1['Description sérieuse de l\'appelation'] ||
                                       content2['Description sérieuse de l\'appelation'] ||
                                       content1['Description sérieuse'] ||
                                       content2['Description sérieuse'] || '';

    appellation.descriptionRoi = content1['Description de l\'appelation par le Roi du Pinard'] ||
                                  content2['Description de l\'appelation par le Roi du Pinard'] ||
                                  content1['Description par le Roi du Pinard'] ||
                                  content2['Description par le Roi du Pinard'] || '';
  });

  return Array.from(appellationMap.values());
}

// =============================================================================
// TEMPLATES HTML
// =============================================================================

function getHead(title, description, canonicalUrl, type = 'website') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(truncate(description, 155))}">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(truncate(description, 155))}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Le Roi du Pinard">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/responsive.css">

  <link rel="icon" type="image/jpeg" href="/assets/images/logo-roi-du-pinard.jpg">

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-HYPPWGGV19"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HYPPWGGV19');
  </script>
</head>`;
}

function getHeader() {
  return `
<header class="site-header">
  <div class="container">
    <a href="/" class="logo">
      <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard">
      <span>Le Roi du Pinard</span>
    </a>
    <nav class="main-nav">
      <a href="/regions/">Régions</a>
      <a href="/producteurs/">Producteurs</a>
      <a href="/vins/">Tous les Vins</a>
      <a href="/search.html" class="nav-icon" title="Rechercher">🔍</a>
      <a href="#" onclick="randomWine(); return false;" class="btn-random">🎲 Surprenez-moi !</a>
    </nav>
    <button class="menu-toggle" aria-label="Menu">☰</button>
  </div>
</header>`;
}

function getFooter() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-brand">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="footer-logo">
        <p><strong>LeRoiDuPinard.fr</strong></p>
        <p>Parce que le vin, c'est sérieux, mais pas trop.</p>
      </div>
      <div class="footer-links">
        <h4>Navigation</h4>
        <ul>
          <li><a href="/regions/">Régions viticoles</a></li>
          <li><a href="/producteurs/">Producteurs</a></li>
          <li><a href="/vins/">Tous les vins</a></li>
          <li><a href="/search.html">Recherche</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Informations</h4>
        <ul>
          <li><a href="/mentions-legales.html">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="alcohol-warning">⚠️ L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p>
      <p class="copyright">© ${new Date().getFullYear()} Le Roi du Pinard. Tous droits réservés.</p>
    </div>
  </div>
</footer>
<script src="/js/main.js"></script>
<script src="/js/random.js"></script>
</body>
</html>`;
}

function getBreadcrumb(items) {
  const links = items.map((item, i) => {
    if (i === items.length - 1) {
      return `<span>${escapeHtml(item.label)}</span>`;
    }
    return `<a href="${item.url}">${escapeHtml(item.label)}</a>`;
  }).join(' › ');

  return `<nav class="breadcrumb" aria-label="Fil d'Ariane">${links}</nav>`;
}

function getBreadcrumbSchema(items) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.url ? { "item": `${BASE_URL}${item.url}` } : {})
    }))
  };
  return schema;
}

// =============================================================================
// GÉNÉRATION DES PAGES
// =============================================================================

function generateWinePage(wine, allWines) {
  const title = `${wine.WINE} | Le Roi du Pinard`;
  const description = wine.Tasting_Notes || wine.Style || `Découvrez ${wine.WINE}, un ${wine.colorFr} de ${wine.Appellation}.`;
  const canonicalUrl = `${BASE_URL}/vins/${wine.slug}.html`;

  // Trouver les vins liés (même producteur ou appellation)
  const relatedWines = allWines
    .filter(w => w.slug !== wine.slug && (w.Producer === wine.Producer || w.Appellation === wine.Appellation))
    .slice(0, 4);

  // Construire les scores
  const scores = [];
  if (wine.WS_Score) scores.push({ value: wine.WS_Score, source: 'Wine Spectator' });
  if (wine.WA_Score) scores.push({ value: wine.WA_Score, source: 'Wine Advocate' });
  if (wine.JR_Score) scores.push({ value: wine.JR_Score, source: 'Jancis Robinson' });
  if (wine.Vinous_Score) scores.push({ value: wine.Vinous_Score, source: 'Vinous' });

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + parseFloat(s.value), 0) / scores.length)
    : null;

  // Schema.org JSON-LD
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": wine.WINE,
    "brand": { "@type": "Brand", "name": wine.Producer },
    "category": "Wine",
    "description": truncate(description, 500)
  };

  if (avgScore) {
    schemaProduct.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgScore,
      "bestRating": "100",
      "worstRating": "0",
      "ratingCount": scores.length
    };
  }

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Quel est le meilleur moment pour déguster ${wine.WINE} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": generateDegustationAnswer(wine)
        }
      },
      {
        "@type": "Question",
        "name": `Quels plats accompagnent ${wine.WINE} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": generateAccordAnswer(wine)
        }
      }
    ]
  };

  const breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Régions', url: '/regions/' },
    { label: wine.regionFr, url: `/regions/${wine.regionSlug}/` },
    { label: wine.Appellation, url: `/regions/${wine.regionSlug}/appellations/${wine.appellationSlug}.html` },
    { label: wine.WINE }
  ];

  const schemaBreadcrumb = getBreadcrumbSchema(breadcrumbItems);

  let html = getHead(title, description, canonicalUrl, 'product');

  html += `
<body class="wine-page">
${getHeader()}

<main class="container">
  ${getBreadcrumb(breadcrumbItems)}

  <article class="wine-detail">
    <section class="wine-hero">
      <h1>${escapeHtml(wine.WINE)}</h1>
      <div class="wine-badges">
        <span class="badge color-${wine.COLOR?.toLowerCase() || 'red'}">${escapeHtml(wine.colorFr)}</span>
        <span class="badge region">${escapeHtml(wine.regionFr)}</span>
        <span class="badge appellation">${escapeHtml(wine.Appellation)}</span>
        ${wine.Classification ? `<span class="badge classification">${escapeHtml(wine.Classification)}</span>` : ''}
      </div>
    </section>

    <section class="wine-info">
      <h2>Caractéristiques</h2>
      <dl class="info-grid">
        <dt>Producteur</dt>
        <dd><a href="/producteurs/${wine.producerSlug}.html">${escapeHtml(wine.Producer)}</a></dd>

        <dt>Région</dt>
        <dd><a href="/regions/${wine.regionSlug}/">${escapeHtml(wine.regionFr)}</a></dd>

        <dt>Appellation</dt>
        <dd><a href="/regions/${wine.regionSlug}/appellations/${wine.appellationSlug}.html">${escapeHtml(wine.Appellation)}</a></dd>

        ${wine.Grape_Variety ? `<dt>Cépage(s)</dt><dd>${escapeHtml(wine.Grape_Variety)}</dd>` : ''}
        ${wine.Terroir_Soil ? `<dt>Terroir</dt><dd>${escapeHtml(translateWineTerms(wine.Terroir_Soil))}</dd>` : ''}
        ${wine.Viticulture ? `<dt>Viticulture</dt><dd>${escapeHtml(translateWineTerms(wine.Viticulture))}</dd>` : ''}
        ${wine.Winemaking ? `<dt>Vinification</dt><dd>${escapeHtml(translateWineTerms(wine.Winemaking))}</dd>` : ''}
        ${wine.Aging ? `<dt>Élevage</dt><dd>${escapeHtml(translateWineTerms(wine.Aging))}${wine.Aging_Duration ? ` (${wine.Aging_Duration})` : ''}</dd>` : ''}
        ${wine.Style ? `<dt>Style</dt><dd>${escapeHtml(translateWineTerms(wine.Style))}</dd>` : ''}
      </dl>
    </section>

    ${wine.Tasting_Notes || wine.Food_Pairing ? `
    <section class="wine-tasting">
      <h2>Notes de dégustation</h2>
      ${wine.Tasting_Notes ? `<p>${escapeHtml(wine.Tasting_Notes)}</p>` : ''}

      ${wine.Food_Pairing ? `
      <h3>Accords mets-vins</h3>
      <p>${escapeHtml(wine.Food_Pairing)}</p>
      ` : ''}

      <div class="serving-info">
        ${wine.Serving_Temp ? `<span>🌡️ ${escapeHtml(wine.Serving_Temp)}</span>` : ''}
        ${wine.Drinking_Window ? `<span>⏰ À boire : ${escapeHtml(wine.Drinking_Window)}</span>` : ''}
        ${wine.Decanting ? `<span>🍷 ${escapeHtml(wine.Decanting)}</span>` : ''}
      </div>
    </section>
    ` : ''}

    ${scores.length > 0 ? `
    <section class="wine-scores">
      <h2>Notes des critiques</h2>
      <div class="scores-grid">
        ${scores.map(s => `
        <div class="score">
          <span class="value">${escapeHtml(String(s.value))}</span>
          <span class="source">${escapeHtml(s.source)}</span>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${wine.avisRoiPinard ? `
    <section class="roi-says">
      <div class="roi-header">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="roi-avatar">
        <h2>👑 Ce qu'en dit le Roi du Pinard</h2>
      </div>
      <blockquote class="roi-quote">
        ${escapeHtml(wine.avisRoiPinard)}
      </blockquote>
    </section>
    ` : ''}

    ${wine.Ce_qui_rend_ce_vin_special ? `
    <section class="soyons-serieux">
      <h2>📚 Soyons sérieux</h2>
      <p>${escapeHtml(wine.Ce_qui_rend_ce_vin_special)}</p>

      ${wine.CellarTracker_Consensus ? `
      <div class="community-says">
        <h3>🗣️ La parole aux sujets du royaume</h3>
        <p>${escapeHtml(wine.CellarTracker_Consensus)}</p>
      </div>
      ` : ''}

      ${wine.vivinoRating ? `
      <div class="vivino-says">
        <h3>🍷 Ça jase chez Vivino</h3>
        <div class="vivino-rating">
          <span class="stars">${formatVivinoRating(wine.vivinoRating)}</span>
          <span class="score">${wine.vivinoRating}/5</span>
          ${wine.vivinoReviews ? `<span class="reviews">(${formatVivinoReviews(wine.vivinoReviews)})</span>` : ''}
        </div>
        ${wine.vivinoProfile && wine.vivinoProfile !== 'Données insuffisantes' ? `
        <p class="vivino-profile">${generateVivinoHumor(wine.vivinoProfile)}</p>
        ` : ''}
      </div>
      ` : ''}
    </section>
    ` : ''}

    <section class="wine-faq">
      <h2>Questions fréquentes sur ${escapeHtml(wine.WINE)}</h2>

      <div class="faq-item">
        <h3>Quel est le meilleur moment pour déguster ${escapeHtml(wine.WINE)} ?</h3>
        <p>${escapeHtml(generateDegustationAnswer(wine))}</p>
      </div>

      <div class="faq-item">
        <h3>Quels plats accompagnent ${escapeHtml(wine.WINE)} ?</h3>
        <p>${escapeHtml(generateAccordAnswer(wine))}</p>
      </div>
    </section>

    <section class="buy-wine">
      <h2>🗝️ Ça goûte bien, achetez-le chez les copains</h2>
      <p>Envie de mettre la main sur cette merveille ? Filez donc faire un tour chez <a href="https://www.connoisseurs.wine/" target="_blank" rel="noopener">Connoisseurs.wine</a>, des passionnés qui savent dénicher les bonnes bouteilles.</p>
      <p class="sheet-mention">Ils ont même un <a href="https://docs.google.com/spreadsheets/d/1y4Wc6UDRQiPfKMoeithka2iGzXhk2qe3/" target="_blank" rel="noopener">Google Sheet</a> antédiluvien avec leurs pinards à monnayer !</p>
    </section>

    ${relatedWines.length > 0 ? `
    <section class="related-wines">
      <h2>Autres vins à découvrir</h2>
      <div class="wine-cards">
        ${relatedWines.map(w => `
        <a href="/vins/${w.slug}.html" class="wine-card">
          <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
          <div class="card-content">
            <h3>${escapeHtml(w.WINE)}</h3>
            <p>${escapeHtml(w.Producer)} • ${escapeHtml(w.Appellation)}</p>
          </div>
        </a>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </article>
</main>

<script type="application/ld+json">
${JSON.stringify(schemaProduct, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(schemaFAQ, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(schemaBreadcrumb, null, 2)}
</script>
`;

  html += getFooter();
  return html;
}

function generateProducerPage(producer) {
  const title = `${producer.name} - Vins & Domaine | Le Roi du Pinard`;
  const description = producer.descriptionSerieuse || `Découvrez le domaine ${producer.name}, ses vins et l'avis décalé du Roi du Pinard. ${producer.wines.length} vins à explorer.`;
  const canonicalUrl = `${BASE_URL}/producteurs/${producer.slug}.html`;

  const schemaWinery = {
    "@context": "https://schema.org",
    "@type": "Winery",
    "name": producer.name,
    "description": truncate(description, 500),
    "address": {
      "@type": "PostalAddress",
      "addressRegion": producer.region
    }
  };

  const breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Producteurs', url: '/producteurs/' },
    { label: producer.name }
  ];

  const schemaBreadcrumb = getBreadcrumbSchema(breadcrumbItems);

  let html = getHead(title, description, canonicalUrl);

  html += `
<body class="producer-page">
${getHeader()}

<main class="container">
  ${getBreadcrumb(breadcrumbItems)}

  <article class="producer-detail">
    <h1>${escapeHtml(producer.name)}</h1>

    <section class="producer-info">
      <h2>Le domaine</h2>
      ${producer.descriptionSerieuse ? `<p>${escapeHtml(producer.descriptionSerieuse)}</p>` : ''}

      <dl class="info-grid">
        <dt>Région</dt>
        <dd><a href="/regions/${producer.regionSlug}/">${escapeHtml(producer.region)}</a></dd>

        <dt>Appellations</dt>
        <dd>${producer.appellations.map(a => escapeHtml(a)).join(', ')}</dd>

        <dt>Nombre de vins</dt>
        <dd>${producer.wines.length} vins référencés</dd>
      </dl>
    </section>

    ${producer.descriptionRoi ? `
    <section class="roi-says">
      <div class="roi-header">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="roi-avatar">
        <h2>👑 L'avis du Roi</h2>
      </div>
      <blockquote class="roi-quote">
        ${escapeHtml(producer.descriptionRoi)}
      </blockquote>
    </section>
    ` : ''}

    <section class="producer-wines">
      <h2>Les vins de ${escapeHtml(producer.name)}</h2>
      <div class="wine-list">
        ${producer.wines.map(w => `
        <a href="/vins/${w.slug}.html" class="wine-card">
          <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
          <div class="card-content">
            <h3>${escapeHtml(w.WINE)}</h3>
            <p>${escapeHtml(w.colorFr)} • ${escapeHtml(w.Appellation)}</p>
          </div>
        </a>
        `).join('')}
      </div>
    </section>
  </article>
</main>

<script type="application/ld+json">
${JSON.stringify(schemaWinery, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(schemaBreadcrumb, null, 2)}
</script>
`;

  html += getFooter();
  return html;
}

function generateRegionPage(region, allAppellations = []) {
  const title = `Vins de ${region.name} - Guide complet | Le Roi du Pinard`;
  const description = region.descriptionSerieuse || `Explorez les vins de ${region.name} : ${region.appellations.length} appellations, ${region.producers.length} producteurs. Guide complet et avis humoristiques du Roi du Pinard.`;
  const canonicalUrl = `${BASE_URL}/regions/${region.slug}/`;

  // Créer un map des appellations avec leurs descriptions
  const appellationMap = new Map();
  allAppellations.forEach(a => {
    if (a.region === region.name) {
      appellationMap.set(a.name, a);
    }
  });

  const breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Régions', url: '/regions/' },
    { label: region.name }
  ];

  const schemaBreadcrumb = getBreadcrumbSchema(breadcrumbItems);

  let html = getHead(title, description, canonicalUrl);

  html += `
<body class="region-page">
${getHeader()}

<main class="container">
  ${getBreadcrumb(breadcrumbItems)}

  <article class="region-detail">
    <h1>Vins de ${escapeHtml(region.name)}</h1>

    <section class="region-info">
      <h2>La région</h2>
      ${region.descriptionSerieuse ? `<p>${escapeHtml(region.descriptionSerieuse)}</p>` : `<p>Découvrez les vins de ${region.name}, une région viticole française riche en terroirs et en histoire.</p>`}

      <div class="region-stats">
        <div class="stat">
          <span class="stat-value">${region.appellations.length}</span>
          <span class="stat-label">Appellations</span>
        </div>
        <div class="stat">
          <span class="stat-value">${region.producers.length}</span>
          <span class="stat-label">Producteurs</span>
        </div>
        <div class="stat">
          <span class="stat-value">${region.wines.length}</span>
          <span class="stat-label">Vins</span>
        </div>
      </div>
    </section>

    ${region.descriptionRoi ? `
    <section class="roi-says">
      <div class="roi-header">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="roi-avatar">
        <h2>👑 Le Roi explore ${escapeHtml(region.name)}</h2>
      </div>
      <blockquote class="roi-quote">
        ${escapeHtml(region.descriptionRoi)}
      </blockquote>
    </section>
    ` : ''}

    <section class="region-appellations">
      <h2>Les appellations de ${escapeHtml(region.name)}</h2>
      <div class="appellation-grid">
        ${region.appellations.map(aName => {
          const appellation = appellationMap.get(aName);
          const desc = appellation?.descriptionSerieuse || '';
          const sentences = desc.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
          const excerpt = truncate(sentences, 200);
          const wineCount = appellation?.wines?.length || 0;
          return `
        <a href="/regions/${region.slug}/appellations/${createSlug(aName)}.html" class="appellation-card">
          <h3>${escapeHtml(aName)}</h3>
          ${wineCount > 0 ? `<p class="appellation-meta">${wineCount} vins</p>` : ''}
          ${excerpt ? `<p class="appellation-excerpt">${escapeHtml(excerpt)}</p>` : ''}
        </a>
        `;
        }).join('')}
      </div>
    </section>

    <section class="region-producers">
      <h2>Les producteurs de ${escapeHtml(region.name)}</h2>
      <ul class="producer-list">
        ${region.producers.map(p => `
        <li><a href="/producteurs/${createSlug(p)}.html">${escapeHtml(p)}</a></li>
        `).join('')}
      </ul>
    </section>

    <section class="region-wines">
      <h2>Tous les vins de ${escapeHtml(region.name)}</h2>
      <div class="wine-list">
        ${region.wines.slice(0, 12).map(w => `
        <a href="/vins/${w.slug}.html" class="wine-card">
          <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
          <div class="card-content">
            <h3>${escapeHtml(w.WINE)}</h3>
            <p>${escapeHtml(w.Producer)} • ${escapeHtml(w.Appellation)}</p>
          </div>
        </a>
        `).join('')}
      </div>
      ${region.wines.length > 12 ? `<p class="see-more"><a href="/vins/?region=${region.slug}">Voir les ${region.wines.length} vins de ${region.name} →</a></p>` : ''}
    </section>
  </article>
</main>

<script type="application/ld+json">
${JSON.stringify(schemaBreadcrumb, null, 2)}
</script>
`;

  html += getFooter();
  return html;
}

function generateAppellationPage(appellation) {
  const title = `${appellation.name} - Vins & Terroir | Le Roi du Pinard`;
  const description = appellation.descriptionSerieuse || `Tout savoir sur ${appellation.name} : terroir, cépages, producteurs et vins. Découvrez l'avis royal du Roi du Pinard.`;
  const canonicalUrl = `${BASE_URL}/regions/${appellation.regionSlug}/appellations/${appellation.slug}.html`;

  const breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Régions', url: '/regions/' },
    { label: appellation.region, url: `/regions/${appellation.regionSlug}/` },
    { label: appellation.name }
  ];

  const schemaBreadcrumb = getBreadcrumbSchema(breadcrumbItems);

  let html = getHead(title, description, canonicalUrl);

  html += `
<body class="appellation-page">
${getHeader()}

<main class="container">
  ${getBreadcrumb(breadcrumbItems)}

  <article class="appellation-detail">
    <h1>${escapeHtml(appellation.name)}</h1>

    <section class="appellation-info">
      <h2>L'appellation</h2>
      ${appellation.descriptionSerieuse ? `<p>${escapeHtml(appellation.descriptionSerieuse)}</p>` : `<p>Découvrez l'appellation ${appellation.name}, située dans la région ${appellation.region}.</p>`}

      <dl class="info-grid">
        <dt>Région</dt>
        <dd><a href="/regions/${appellation.regionSlug}/">${escapeHtml(appellation.region)}</a></dd>

        <dt>Nombre de vins</dt>
        <dd>${appellation.wines.length} vins référencés</dd>
      </dl>
    </section>

    ${appellation.descriptionRoi ? `
    <section class="roi-says">
      <div class="roi-header">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="roi-avatar">
        <h2>👑 Le verdict royal sur ${escapeHtml(appellation.name)}</h2>
      </div>
      <blockquote class="roi-quote">
        ${escapeHtml(appellation.descriptionRoi)}
      </blockquote>
    </section>
    ` : ''}

    <section class="appellation-wines">
      <h2>Les vins de ${escapeHtml(appellation.name)}</h2>
      <div class="wine-list">
        ${appellation.wines.map(w => `
        <a href="/vins/${w.slug}.html" class="wine-card">
          <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
          <div class="card-content">
            <h3>${escapeHtml(w.WINE)}</h3>
            <p>${escapeHtml(w.Producer)} • ${escapeHtml(w.colorFr)}</p>
          </div>
        </a>
        `).join('')}
      </div>
    </section>
  </article>
</main>

<script type="application/ld+json">
${JSON.stringify(schemaBreadcrumb, null, 2)}
</script>
`;

  html += getFooter();
  return html;
}

function generateHomepage(wines, regions, producers) {
  const title = 'Le Roi du Pinard — Apprends le vin sans te prendre le bouchon';
  const description = 'Découvrez les vins de France avec humour ! 440 vins, 17 régions, 143 producteurs. Le Roi du Pinard vous guide dans le monde du vin avec sérieux et décalage.';
  const canonicalUrl = BASE_URL + '/';

  // Sélectionner quelques vins aléatoires pour la homepage
  const featuredWines = wines.sort(() => Math.random() - 0.5).slice(0, 6);

  let html = getHead(title, description, canonicalUrl);

  html += `
<body class="homepage">
${getHeader()}

<main>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="hero-logo">
        <h1>Bienvenue dans mon Royaume, Assoiffés de Savoir !</h1>
        <p class="hero-intro">Moi, le Roi du Pinard, Premier du Nom, Seigneur des Cépages et Protecteur des Tire-Bouchons, je vous ouvre les portes de ma cave royale ! Ici, point de snobisme qui pique le nez comme un Muscadet trop frais. Non ! Ici, on apprend le vin en rigolant, on découvre les terroirs en trinquant, et on devient connaisseur sans se prendre le chou... ni le raisin.</p>
        <p class="hero-tagline"><strong>J'ai bu pour vous. J'ai souffert pour vous. J'ai même recraché (une fois, par accident).</strong></p>
        <div class="hero-cta">
          <a href="/regions/" class="btn btn-primary">Explorer le Royaume</a>
          <a href="#" onclick="randomWine(); return false;" class="btn btn-secondary">🎲 Au Petit Bonheur</a>
        </div>
      </div>
    </div>
  </section>

  <section class="stats-banner">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${wines.length}</span>
          <span class="stat-label">Vins référencés</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${regions.length}</span>
          <span class="stat-label">Régions viticoles</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${producers.length}</span>
          <span class="stat-label">Producteurs</span>
        </div>
      </div>
    </div>
  </section>

  <section class="navigation-blocks">
    <div class="container">
      <h2>Comment Surfer sur ce Site (Sans Tomber dans le Tonneau)</h2>
      <div class="nav-grid">
        <a href="/regions/" class="nav-card">
          <span class="nav-icon">🍇</span>
          <h3>Les Régions</h3>
          <p>Parcourez les terroirs de France comme je parcours mes domaines : avec curiosité et une soif insatiable.</p>
        </a>
        <a href="/producteurs/" class="nav-card">
          <span class="nav-icon">🏆</span>
          <h3>Les Producteurs</h3>
          <p>Découvrez les vignerons qui font le vin que vous aimez (ou que vous allez aimer).</p>
        </a>
        <a href="/vins/" class="nav-card">
          <span class="nav-icon">🍾</span>
          <h3>Tous les Vins</h3>
          <p>440 fiches de vins détaillées avec mes commentaires royaux. De quoi occuper vos soirées !</p>
        </a>
        <a href="#" onclick="randomWine(); return false;" class="nav-card">
          <span class="nav-icon">🎲</span>
          <h3>Au Petit Bonheur</h3>
          <p>Cliquez et laissez le destin choisir votre prochaine découverte !</p>
        </a>
      </div>
    </div>
  </section>

  <section class="featured-wines">
    <div class="container">
      <h2>Quelques Pépites de la Cave Royale</h2>
      <div class="wine-cards">
        ${featuredWines.map(w => `
        <a href="/vins/${w.slug}.html" class="wine-card">
          <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
          <div class="card-content">
            <h3>${escapeHtml(w.WINE)}</h3>
            <p>${escapeHtml(w.Producer)}</p>
            <span class="badge">${escapeHtml(w.regionFr)}</span>
          </div>
        </a>
        `).join('')}
      </div>
      <p class="see-all"><a href="/vins/">Voir tous les vins →</a></p>
    </div>
  </section>

  <section class="did-you-know">
    <div class="container">
      <h2>🎯 Le Saviez-Vous ?</h2>
      <div class="facts-grid">
        <div class="fact-card">
          <p>🍇 Le vin rouge n'existe pas. C'est du jus de raisin blanc fermenté avec la peau des raisins noirs. <strong>COMPLOT RÉVÉLÉ.</strong></p>
        </div>
        <div class="fact-card">
          <p>🍇 Il y a plus de 10 000 cépages dans le monde. Et j'ai l'intention de tous les goûter. J'en suis à 847. <strong>IL ME RESTE DU TRAVAIL.</strong></p>
        </div>
        <div class="fact-card">
          <p>🍇 Les moines du Moyen Âge buvaient environ 1,5 litre de vin par jour. "Pour la santé." <strong>ILS AVAIENT COMPRIS LA VIE.</strong></p>
        </div>
        <div class="fact-card">
          <p>🍇 "Trinquer" vient de l'époque où l'on cognait les verres pour que le vin passe d'un verre à l'autre, prouvant qu'il n'était pas empoisonné. <strong>J'AI GARDÉ L'HABITUDE.</strong></p>
        </div>
      </div>
    </div>
  </section>

  <section class="royal-quote">
    <div class="container">
      <blockquote>
        <p>"Le vin est la seule chose qui s'améliore quand on la laisse dans un coin sombre pendant des années. Comme mon humour."</p>
        <cite>— Le Roi du Pinard</cite>
      </blockquote>
    </div>
  </section>

  <section class="regions-preview">
    <div class="container">
      <h2>Les Régions du Royaume</h2>
      <div class="regions-grid">
        ${regions.slice(0, 8).map(r => `
        <a href="/regions/${r.slug}/" class="region-card">
          <h3>${escapeHtml(r.name)}</h3>
          <p>${r.wines.length} vins • ${r.appellations.length} appellations</p>
        </a>
        `).join('')}
      </div>
      <p class="see-all"><a href="/regions/">Voir toutes les régions →</a></p>
    </div>
  </section>

  <section class="testimonials">
    <div class="container">
      <h2>🏆 Ce Qu'ils Disent de Nous</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <p>"Depuis que je lis ce site, je ne dis plus 'c'est bon' mais 'quelle belle expression du terroir'. Ma femme me regarde bizarrement, mais JE SAIS ce que je dis maintenant !"</p>
          <cite>— Gontran de la Treille, écuyer repenti</cite>
        </div>
        <div class="testimonial-card">
          <p>"Le Roi du Pinard m'a appris que le rosé n'était pas un vin de débutant. J'ai arrêté d'avoir honte."</p>
          <cite>— Dame Cunégonde, consommatrice éclairée</cite>
        </div>
        <div class="testimonial-card">
          <p>"Grâce à ce site, j'ai impressionné mon beau-père au dîner de Noël. Il ne m'adresse toujours pas la parole, mais maintenant c'est par RESPECT."</p>
          <cite>— Perceval le Hardi, gendre victorieux</cite>
        </div>
      </div>
    </div>
  </section>
</main>
`;

  html += getFooter();
  return html;
}

function generateIndexPages(wines, regions, producers) {
  const pages = {};

  // Index des régions
  const regionsBreadcrumb = [
    { label: 'Accueil', url: '/' },
    { label: 'Régions' }
  ];
  const regionsBreadcrumbSchema = getBreadcrumbSchema(regionsBreadcrumb);

  let regionsHtml = getHead(
    'Régions viticoles de France | Le Roi du Pinard',
    'Découvrez toutes les régions viticoles de France : Bourgogne, Bordeaux, Champagne, Rhône et bien d\'autres.',
    `${BASE_URL}/regions/`
  );

  regionsHtml += `
<body class="index-page">
${getHeader()}
<main class="container">
  ${getBreadcrumb(regionsBreadcrumb)}

  <h1>Les Régions Viticoles de France</h1>
  <p class="intro">Explorez les ${regions.length} régions viticoles référencées dans le royaume du Roi du Pinard.</p>

  <div class="regions-grid">
    ${regions.map(r => {
      // Extraire 1-2 phrases de la description sérieuse
      const desc = r.descriptionSerieuse || '';
      const sentences = desc.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
      const excerpt = truncate(sentences, 200);
      return `
    <a href="/regions/${r.slug}/" class="region-card">
      <h2>${escapeHtml(r.name)}</h2>
      <div class="region-stats">
        <span>${r.wines.length} vins</span>
        <span>${r.appellations.length} appellations</span>
        <span>${r.producers.length} producteurs</span>
      </div>
      ${excerpt ? `<p class="region-excerpt">${escapeHtml(excerpt)}</p>` : ''}
    </a>
    `;
    }).join('')}
  </div>
</main>
<script type="application/ld+json">
${JSON.stringify(regionsBreadcrumbSchema, null, 2)}
</script>
${getFooter()}`;
  pages['regions/index.html'] = regionsHtml;

  // Index des producteurs
  const producersBreadcrumb = [
    { label: 'Accueil', url: '/' },
    { label: 'Producteurs' }
  ];
  const producersBreadcrumbSchema = getBreadcrumbSchema(producersBreadcrumb);

  let producersHtml = getHead(
    'Producteurs de vins de France | Le Roi du Pinard',
    `Découvrez les ${producers.length} producteurs et domaines viticoles référencés par le Roi du Pinard.`,
    `${BASE_URL}/producteurs/`
  );

  producersHtml += `
<body class="index-page">
${getHeader()}
<main class="container">
  ${getBreadcrumb(producersBreadcrumb)}

  <h1>Les Producteurs du Royaume</h1>
  <p class="intro">${producers.length} domaines et vignerons à découvrir.</p>

  <div class="producer-grid">
    ${producers.sort((a, b) => a.name.localeCompare(b.name)).map(p => {
      // Extraire 1-2 phrases de la description sérieuse
      const desc = p.descriptionSerieuse || '';
      const sentences = desc.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
      const excerpt = truncate(sentences, 200);
      return `
    <a href="/producteurs/${p.slug}.html" class="producer-card">
      <h2>${escapeHtml(p.name)}</h2>
      <p class="producer-meta">${escapeHtml(p.region)} • ${p.wines.length} vins</p>
      ${excerpt ? `<p class="producer-excerpt">${escapeHtml(excerpt)}</p>` : ''}
    </a>
    `;
    }).join('')}
  </div>
</main>
<script type="application/ld+json">
${JSON.stringify(producersBreadcrumbSchema, null, 2)}
</script>
${getFooter()}`;
  pages['producteurs/index.html'] = producersHtml;

  // Index des vins
  const winesBreadcrumb = [
    { label: 'Accueil', url: '/' },
    { label: 'Tous les vins' }
  ];
  const winesBreadcrumbSchema = getBreadcrumbSchema(winesBreadcrumb);

  let winesHtml = getHead(
    'Tous les vins de France | Le Roi du Pinard',
    `Découvrez les ${wines.length} vins référencés par le Roi du Pinard. Fiches détaillées, notes de dégustation et avis royaux.`,
    `${BASE_URL}/vins/`
  );

  winesHtml += `
<body class="index-page">
${getHeader()}
<main class="container">
  ${getBreadcrumb(winesBreadcrumb)}

  <h1>Tous les Vins du Royaume</h1>
  <p class="intro">${wines.length} vins à explorer. De quoi occuper vos soirées pour les années à venir !</p>

  <div class="filters">
    <label>Filtrer par couleur :</label>
    <button class="filter-btn active" data-color="all">Tous</button>
    <button class="filter-btn" data-color="red">Rouge</button>
    <button class="filter-btn" data-color="white">Blanc</button>
    <button class="filter-btn" data-color="rosé">Rosé</button>
  </div>

  <div class="wine-grid" id="wine-grid">
    ${wines.sort((a, b) => a.WINE.localeCompare(b.WINE)).map(w => `
    <a href="/vins/${w.slug}.html" class="wine-card" data-color="${w.COLOR?.toLowerCase() || 'red'}">
      <div class="color-indicator ${w.COLOR?.toLowerCase() || 'red'}"></div>
      <div class="card-content">
        <h3>${escapeHtml(w.WINE)}</h3>
        <p>${escapeHtml(w.Producer)}</p>
        <span class="badge">${escapeHtml(w.regionFr)}</span>
      </div>
    </a>
    `).join('')}
  </div>
</main>
<script>
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const color = this.dataset.color;
    document.querySelectorAll('.wine-card').forEach(card => {
      if (color === 'all' || card.dataset.color === color) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
</script>
<script type="application/ld+json">
${JSON.stringify(winesBreadcrumbSchema, null, 2)}
</script>
${getFooter()}`;
  pages['vins/index.html'] = winesHtml;

  return pages;
}

function generateSearchPage() {
  const title = 'Recherche | Le Roi du Pinard';
  const description = 'Recherchez parmi les 440 vins, producteurs et appellations du royaume du Roi du Pinard.';
  const canonicalUrl = `${BASE_URL}/search.html`;

  let html = getHead(title, description, canonicalUrl);

  html += `
<body class="search-page">
${getHeader()}
<main class="container">
  ${getBreadcrumb([
    { label: 'Accueil', url: '/' },
    { label: 'Recherche' }
  ])}

  <h1>Recherche dans le Royaume</h1>

  <div class="search-box">
    <input type="text" id="search-input" placeholder="Rechercher un vin, producteur, appellation..." autofocus>
    <span class="search-icon">🔍</span>
  </div>

  <div id="search-results" class="search-results">
    <p class="search-hint">Tapez votre recherche pour explorer les vins du royaume...</p>
  </div>
</main>
<script src="/js/search.js"></script>
${getFooter()}`;

  return html;
}

function generateSpecialPages() {
  const pages = {};

  // Page 404
  let html404 = getHead('Page non trouvée | Le Roi du Pinard', 'Cette page n\'existe pas.', `${BASE_URL}/404.html`);
  html404 += `
<body class="error-page">
${getHeader()}
<main class="container">
  <div class="error-content">
    <h1>🍷 OH NON ! Cette page a été bue !</h1>
    <p>Vous cherchez quelque chose qui n'existe pas. Ou plus. Comme ma patience pour les mauvais vins.</p>
    <p>Peut-être que :</p>
    <ul>
      <li>L'URL a fait une faute de frappe (ça arrive après le 3ème verre)</li>
      <li>La page a été déplacée (comme mes meubles après un banquet)</li>
      <li>Elle n'a jamais existé (comme ma sobriété supposée)</li>
    </ul>
    <div class="error-cta">
      <a href="/" class="btn btn-primary">Retourner à la cave royale</a>
      <a href="#" onclick="randomWine(); return false;" class="btn btn-secondary">🎲 Découvrir un vin au hasard</a>
    </div>
    <blockquote>
      <p>"Un homme qui ne trouve pas ce qu'il cherche devrait chercher autre chose. De préférence une bonne bouteille."</p>
      <cite>— Le Roi du Pinard</cite>
    </blockquote>
  </div>
</main>
${getFooter()}`;
  pages['404.html'] = html404;

  // Mentions légales
  let htmlMentions = getHead('Mentions légales | Le Roi du Pinard', 'Mentions légales du site Le Roi du Pinard.', `${BASE_URL}/mentions-legales.html`);
  htmlMentions += `
<body class="legal-page">
${getHeader()}
<main class="container">
  ${getBreadcrumb([
    { label: 'Accueil', url: '/' },
    { label: 'Mentions légales' }
  ])}

  <article class="legal-content">
    <h1>Mentions légales</h1>

    <h2>Éditeur du site</h2>
    <p>
      <strong>ITQS</strong><br>
      SIREN : 914 985 858<br>
      <a href="https://annuaire-entreprises.data.gouv.fr/entreprise/itqs-914985858" target="_blank" rel="noopener">Voir la fiche entreprise</a>
    </p>

    <h2>Hébergeur</h2>
    <p>
      <strong>Vercel Inc.</strong><br>
      340 S Lemon Ave #4133<br>
      Walnut, CA 91789<br>
      États-Unis
    </p>

    <h2>Propriété intellectuelle</h2>
    <p>L'ensemble des contenus (textes, images, graphismes) présents sur le site leroidupinard.fr sont protégés par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>

    <h2>Données personnelles</h2>
    <p>Ce site utilise Google Analytics pour analyser son audience. Ces données sont anonymisées et ne permettent pas d'identifier les visiteurs.</p>

    <h2>Responsabilité</h2>
    <p>Les informations présentes sur ce site sont fournies à titre indicatif. Le Roi du Pinard décline toute responsabilité quant à l'exactitude des informations et aux conséquences de leur utilisation.</p>

    <h2>Avertissement sur l'alcool</h2>
    <p><strong>L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</strong></p>
  </article>
</main>
${getFooter()}`;
  pages['mentions-legales.html'] = htmlMentions;

  // Maintenance
  let htmlMaintenance = getHead('Maintenance | Le Roi du Pinard', 'Le site est en maintenance.', `${BASE_URL}/maintenance.html`);
  htmlMaintenance += `
<body class="maintenance-page">
<main class="container">
  <div class="maintenance-content">
    <img src="/assets/images/logo-roi-du-pinard.jpg" alt="Le Roi du Pinard" class="maintenance-logo">
    <h1>🔧 Le Roi Remet de l'Ordre dans sa Cave !</h1>
    <p>Patience, nobles visiteurs ! Notre site est actuellement en travaux.</p>
    <p>Nos équipes (moi et mon échanson) travaillent d'arrache-pied pour :</p>
    <ul>
      <li>🔧 Réparer les tonneaux qui fuient</li>
      <li>🧹 Nettoyer les araignées des bouteilles millésimées</li>
      <li>📝 Corriger les fautes d'orthographe (nombreuses après 18h)</li>
    </ul>
    <p><strong>Temps estimé :</strong> Le temps de finir cette bouteille.</p>
    <p><em>En attendant, pourquoi ne pas en ouvrir une vous-même ?</em></p>
  </div>
</main>
</body>
</html>`;
  pages['maintenance.html'] = htmlMaintenance;

  return pages;
}

function generateSitemap(wines, regions, appellations, producers) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/regions/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/producteurs/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/vins/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/search.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

  // Régions
  regions.forEach(r => {
    xml += `  <url>
    <loc>${BASE_URL}/regions/${r.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Appellations
  appellations.forEach(a => {
    xml += `  <url>
    <loc>${BASE_URL}/regions/${a.regionSlug}/appellations/${a.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Producteurs
  producers.forEach(p => {
    xml += `  <url>
    <loc>${BASE_URL}/producteurs/${p.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Vins
  wines.forEach(w => {
    xml += `  <url>
    <loc>${BASE_URL}/vins/${w.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  xml += '</urlset>';
  return xml;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

function generateWinesJson(wines) {
  return wines.map(w => ({
    slug: w.slug,
    name: w.WINE,
    producer: w.Producer,
    region: w.regionFr,
    appellation: w.Appellation,
    color: w.colorFr,
    grape_variety: w.Grape_Variety || '',
    classification: w.Classification || ''
  }));
}

// =============================================================================
// SCRIPT PRINCIPAL
// =============================================================================

async function build() {
  console.log('🍷 Le Roi du Pinard - Génération du site\n');

  // Charger les données
  const data = loadData();

  // Traiter les données
  console.log('\nTraitement des données...');
  const wines = processWines(data.wines, data.winesXXL, data.winesVivino);
  const producers = processProducers(data.producers1, data.producers2, wines);
  const regions = processRegions(data.categories1, data.categories2, wines);
  const appellations = processAppellations(data.subcat1, data.subcat2, wines);

  console.log(`  - ${wines.length} vins traités`);
  console.log(`  - ${producers.length} producteurs traités`);
  console.log(`  - ${regions.length} régions traitées`);
  console.log(`  - ${appellations.length} appellations traitées`);

  // Créer les répertoires
  console.log('\nCréation des répertoires...');
  ensureDir(path.join(OUTPUT_DIR, 'vins'));
  ensureDir(path.join(OUTPUT_DIR, 'producteurs'));
  ensureDir(path.join(OUTPUT_DIR, 'regions'));
  ensureDir(path.join(OUTPUT_DIR, 'data'));

  regions.forEach(r => {
    ensureDir(path.join(OUTPUT_DIR, 'regions', r.slug, 'appellations'));
  });

  // Générer les pages de vins
  console.log('\nGénération des pages de vins...');
  let count = 0;
  wines.forEach(wine => {
    const html = generateWinePage(wine, wines);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'vins', `${wine.slug}.html`), html);
    count++;
    if (count % 50 === 0) console.log(`  - ${count}/${wines.length} vins générés`);
  });
  console.log(`  - ${count} pages de vins générées`);

  // Générer les pages de producteurs
  console.log('\nGénération des pages de producteurs...');
  producers.forEach(producer => {
    const html = generateProducerPage(producer);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'producteurs', `${producer.slug}.html`), html);
  });
  console.log(`  - ${producers.length} pages de producteurs générées`);

  // Générer les pages de régions
  console.log('\nGénération des pages de régions...');
  regions.forEach(region => {
    const html = generateRegionPage(region, appellations);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'regions', region.slug, 'index.html'), html);
  });
  console.log(`  - ${regions.length} pages de régions générées`);

  // Générer les pages d'appellations
  console.log('\nGénération des pages d\'appellations...');
  appellations.forEach(appellation => {
    const html = generateAppellationPage(appellation);
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'regions', appellation.regionSlug, 'appellations', `${appellation.slug}.html`),
      html
    );
  });
  console.log(`  - ${appellations.length} pages d'appellations générées`);

  // Générer la homepage
  console.log('\nGénération de la homepage...');
  const homepageHtml = generateHomepage(wines, regions, producers);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), homepageHtml);

  // Générer les index
  console.log('\nGénération des pages d\'index...');
  const indexPages = generateIndexPages(wines, regions, producers);
  Object.entries(indexPages).forEach(([filename, content]) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
  });

  // Générer la page de recherche
  console.log('\nGénération de la page de recherche...');
  const searchHtml = generateSearchPage();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'search.html'), searchHtml);

  // Générer les pages spéciales
  console.log('\nGénération des pages spéciales...');
  const specialPages = generateSpecialPages();
  Object.entries(specialPages).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), content);
  });

  // Générer le JSON pour la recherche
  console.log('\nGénération du fichier JSON de recherche...');
  const winesJson = generateWinesJson(wines);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'data', 'wines.json'), JSON.stringify(winesJson, null, 2));

  // Générer le sitemap
  console.log('\nGénération du sitemap...');
  const sitemap = generateSitemap(wines, regions, appellations, producers);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);

  // Générer robots.txt
  console.log('\nGénération du robots.txt...');
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robotsTxt);

  console.log('\n✅ Génération terminée !');
  console.log(`\nRécapitulatif :`);
  console.log(`  - Homepage: 1`);
  console.log(`  - Pages de vins: ${wines.length}`);
  console.log(`  - Pages de producteurs: ${producers.length}`);
  console.log(`  - Pages de régions: ${regions.length}`);
  console.log(`  - Pages d'appellations: ${appellations.length}`);
  console.log(`  - Pages d'index: ${Object.keys(indexPages).length}`);
  console.log(`  - Pages spéciales: ${Object.keys(specialPages).length}`);
  console.log(`  - Total: ${1 + wines.length + producers.length + regions.length + appellations.length + Object.keys(indexPages).length + Object.keys(specialPages).length + 1} pages`);
}

build().catch(console.error);
