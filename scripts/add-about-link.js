const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

function addAboutLink(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Vérifier si le lien À propos existe déjà
  if (html.includes('a-propos.html')) {
    return { status: 'skipped', reason: 'link already exists' };
  }

  // Ajouter le lien À propos avant Mentions légales
  const oldFooter = '<li><a href="/mentions-legales.html">Mentions légales</a></li>';
  const newFooter = '<li><a href="/a-propos.html">À propos</a></li>\n          <li><a href="/mentions-legales.html">Mentions légales</a></li>';

  if (!html.includes(oldFooter)) {
    return { status: 'skipped', reason: 'footer pattern not found' };
  }

  html = html.replace(oldFooter, newFooter);
  fs.writeFileSync(filePath, html);
  return { status: 'updated' };
}

function processDirectory(dir, stats = { updated: 0, skipped: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'prompt') {
      processDirectory(fullPath, stats);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const result = addAboutLink(fullPath);
      if (result.status === 'updated') {
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  }

  return stats;
}

console.log('🔧 Ajout du lien À propos dans les footers...\n');
const stats = processDirectory(ROOT_DIR);

console.log('📊 Résumé:');
console.log(`   ✅ Mis à jour: ${stats.updated}`);
console.log(`   ⏭️  Ignorés: ${stats.skipped}`);
