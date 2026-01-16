const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DEFAULT_IMAGE = 'https://leroidupinard.fr/assets/images/logo-roi-du-pinard.jpg';

// Fonction pour ajouter og:image et Twitter Cards
function addSocialMeta(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Vérifier si og:image existe déjà
  if (html.includes('og:image')) {
    return { status: 'skipped', reason: 'og:image already exists' };
  }

  // Extraire le title et description existants
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)">/);

  if (!titleMatch) {
    return { status: 'skipped', reason: 'no og:title found' };
  }

  const title = titleMatch[1];
  const description = descMatch ? descMatch[1] : '';

  // Créer les nouvelles balises
  const ogImage = `
  <meta property="og:image" content="${DEFAULT_IMAGE}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:image:alt" content="Le Roi du Pinard - Guide des vins de France">`;

  const twitterCards = `
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${DEFAULT_IMAGE}">`;

  // Insérer après og:site_name
  if (html.includes('<meta property="og:site_name"')) {
    html = html.replace(
      /(<meta property="og:site_name" content="[^"]+">)/,
      `$1${ogImage}${twitterCards}`
    );
  } else {
    return { status: 'error', reason: 'could not find insertion point' };
  }

  fs.writeFileSync(filePath, html);
  return { status: 'updated' };
}

// Fonction pour parcourir récursivement
function processDirectory(dir, stats = { updated: 0, skipped: 0, errors: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'prompt') {
      processDirectory(fullPath, stats);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const result = addSocialMeta(fullPath);
      const relativePath = path.relative(ROOT_DIR, fullPath);

      if (result.status === 'updated') {
        stats.updated++;
      } else if (result.status === 'skipped') {
        stats.skipped++;
      } else {
        console.log(`❌ ${relativePath} - ${result.reason}`);
        stats.errors++;
      }
    }
  }

  return stats;
}

// Exécution principale
console.log('🔧 Ajout de og:image et Twitter Cards...\n');

const stats = processDirectory(ROOT_DIR);

console.log('📊 Résumé:');
console.log(`   ✅ Mis à jour: ${stats.updated}`);
console.log(`   ⏭️  Ignorés: ${stats.skipped}`);
console.log(`   ❌ Erreurs: ${stats.errors}`);
