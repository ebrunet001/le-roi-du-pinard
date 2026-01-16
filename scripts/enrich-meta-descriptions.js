const fs = require('fs');
const path = require('path');

const VINS_DIR = path.join(__dirname, '..', 'vins');

// Fonction pour extraire les informations d'une page vin
function extractWineInfo(html) {
  const info = {};

  // Extraire le nom du vin depuis le H1
  const h1Match = html.match(/<h1>([^<]+)<\/h1>/);
  if (h1Match) {
    info.name = h1Match[1].replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
  }

  // Extraire le producteur
  const producerMatch = html.match(/<dt>Producteur<\/dt>\s*<dd><a[^>]*>([^<]+)<\/a><\/dd>/);
  if (producerMatch) {
    info.producer = producerMatch[1].replace(/&amp;/g, '&').replace(/&#039;/g, "'");
  }

  // Extraire la région
  const regionMatch = html.match(/<dt>Région<\/dt>\s*<dd><a[^>]*>([^<]+)<\/a><\/dd>/);
  if (regionMatch) {
    info.region = regionMatch[1].replace(/&amp;/g, '&');
  }

  // Extraire l'appellation
  const appellationMatch = html.match(/<dt>Appellation<\/dt>\s*<dd><a[^>]*>([^<]+)<\/a><\/dd>/);
  if (appellationMatch) {
    info.appellation = appellationMatch[1].replace(/&amp;/g, '&');
  }

  // Extraire le cépage
  const cepageMatch = html.match(/<dt>Cépage\(s\)<\/dt><dd>([^<]+)<\/dd>/);
  if (cepageMatch) {
    info.cepage = cepageMatch[1].replace(/&amp;/g, '&');
  }

  // Extraire la couleur
  const colorMatch = html.match(/<span class="badge color-[^"]*">([^<]+)<\/span>/);
  if (colorMatch) {
    info.color = colorMatch[1].toLowerCase();
  }

  // Extraire les notes de dégustation
  const tastingMatch = html.match(/<h2>Notes de dégustation<\/h2>\s*<p>([^<]+)<\/p>/);
  if (tastingMatch) {
    info.tasting = tastingMatch[1].replace(/&amp;/g, '&').replace(/&#039;/g, "'");
  }

  // Extraire le score (si présent)
  const scoreMatch = html.match(/<span class="value">(\d+)<\/span>/);
  if (scoreMatch) {
    info.score = scoreMatch[1];
  }

  return info;
}

// Fonction pour générer une meta description enrichie
function generateEnrichedDescription(info) {
  const parts = [];

  // Nom simplifié du vin (sans le producteur s'il est répété)
  let wineName = info.name || '';
  if (info.producer && wineName.startsWith(info.producer)) {
    wineName = wineName.substring(info.producer.length).replace(/^[,\s]+/, '');
  }

  // Construction de la description
  // Format: "[Vin] de [Producteur] : [Cépage] [Appellation]. [Notes]. [Score si présent]"

  if (wineName && info.producer) {
    parts.push(`${wineName} de ${info.producer}`);
  } else if (info.name) {
    parts.push(info.name);
  }

  // Ajouter cépage et appellation
  const details = [];
  if (info.cepage) {
    details.push(info.cepage);
  }
  if (info.appellation) {
    details.push(info.appellation);
  }
  if (details.length > 0) {
    parts.push(details.join(', '));
  }

  // Ajouter les notes de dégustation (raccourcies si nécessaire)
  if (info.tasting) {
    let tasting = info.tasting;
    // Prendre les premiers mots jusqu'à 50 caractères
    if (tasting.length > 50) {
      tasting = tasting.substring(0, 50).replace(/,?\s*\w*$/, '...');
    }
    parts.push(tasting);
  }

  // Ajouter le score si présent
  if (info.score) {
    parts.push(`Note : ${info.score}/100`);
  }

  // Assembler la description
  let description = parts.join('. ');

  // S'assurer que la description fait entre 140 et 160 caractères
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  } else if (description.length < 100 && info.region) {
    // Ajouter la région si la description est trop courte
    description += `. Vin de ${info.region} à découvrir sur Le Roi du Pinard.`;
  }

  // Tronquer à 160 si nécessaire
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

// Fonction pour mettre à jour un fichier HTML
function updateMetaDescription(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Extraire les informations
  const info = extractWineInfo(html);

  if (!info.name) {
    return { status: 'skipped', reason: 'no wine name found' };
  }

  // Extraire la meta description actuelle
  const currentMetaMatch = html.match(/<meta name="description" content="([^"]+)">/);
  if (!currentMetaMatch) {
    return { status: 'skipped', reason: 'no meta description found' };
  }

  const currentDescription = currentMetaMatch[1];

  // Si la description est déjà longue (>120 car), ne pas modifier
  if (currentDescription.length > 120) {
    return { status: 'skipped', reason: 'description already long enough', length: currentDescription.length };
  }

  // Générer la nouvelle description
  const newDescription = generateEnrichedDescription(info);

  // Échapper les caractères spéciaux pour HTML
  const escapedDescription = newDescription
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#039;')
    .replace(/"/g, '&quot;');

  // Remplacer dans le HTML (meta description et og:description)
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapedDescription}">`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapedDescription}">`
  );

  fs.writeFileSync(filePath, html);

  return {
    status: 'updated',
    old: currentDescription,
    new: newDescription,
    oldLength: currentDescription.length,
    newLength: newDescription.length
  };
}

// Exécution principale
console.log('🔧 Enrichissement des meta descriptions des fiches vins...\n');

const files = fs.readdirSync(VINS_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
const stats = { updated: 0, skipped: 0, errors: 0 };

for (const file of files) {
  const filePath = path.join(VINS_DIR, file);
  try {
    const result = updateMetaDescription(filePath);

    if (result.status === 'updated') {
      console.log(`✅ ${file}`);
      console.log(`   Avant (${result.oldLength} car): "${result.old.substring(0, 60)}..."`);
      console.log(`   Après (${result.newLength} car): "${result.new.substring(0, 60)}..."\n`);
      stats.updated++;
    } else {
      console.log(`⏭️  ${file} - ${result.reason}${result.length ? ` (${result.length} car)` : ''}`);
      stats.skipped++;
    }
  } catch (err) {
    console.log(`❌ ${file} - ${err.message}`);
    stats.errors++;
  }
}

console.log('\n📊 Résumé:');
console.log(`   ✅ Mis à jour: ${stats.updated}`);
console.log(`   ⏭️  Ignorés: ${stats.skipped}`);
console.log(`   ❌ Erreurs: ${stats.errors}`);
