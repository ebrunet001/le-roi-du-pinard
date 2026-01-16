const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://leroidupinard.fr';
const ROOT_DIR = path.join(__dirname, '..');

// Fonction pour extraire les items du breadcrumb HTML
function extractBreadcrumbItems(html) {
  const breadcrumbMatch = html.match(/<nav class="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
  if (!breadcrumbMatch) return null;

  const breadcrumbHtml = breadcrumbMatch[1];
  const items = [];

  // Extraire les liens <a href="...">Label</a>
  const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(breadcrumbHtml)) !== null) {
    items.push({
      url: match[1],
      label: match[2].replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"')
    });
  }

  // Extraire le dernier élément <span>Label</span>
  const spanMatch = breadcrumbHtml.match(/<span>([^<]+)<\/span>/);
  if (spanMatch) {
    items.push({
      label: spanMatch[1].replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"')
    });
  }

  return items.length > 0 ? items : null;
}

// Fonction pour générer le schema BreadcrumbList
function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.url ? { "item": `${BASE_URL}${item.url}` } : {})
    }))
  };
}

// Fonction pour vérifier si le schema BreadcrumbList existe déjà
function hasBreadcrumbSchema(html) {
  return html.includes('"@type": "BreadcrumbList"') || html.includes('"@type":"BreadcrumbList"');
}

// Fonction pour ajouter le schema à un fichier HTML
function addSchemaToFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Vérifier si le schema existe déjà
  if (hasBreadcrumbSchema(html)) {
    return { status: 'skipped', reason: 'already has schema' };
  }

  // Extraire les items du breadcrumb
  const items = extractBreadcrumbItems(html);
  if (!items) {
    return { status: 'skipped', reason: 'no breadcrumb found' };
  }

  // Générer le schema
  const schema = generateBreadcrumbSchema(items);
  const schemaScript = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;

  // Insérer avant le footer
  // Chercher le dernier </script> avant <footer
  const footerMatch = html.match(/<\/script>\s*\n+\s*<footer/);
  if (footerMatch) {
    html = html.replace(
      /<\/script>(\s*\n+\s*)<footer/,
      `</script>\n${schemaScript}$1<footer`
    );
  } else if (html.includes('</main>\n\n<footer')) {
    html = html.replace(
      '</main>\n\n<footer',
      `</main>\n\n${schemaScript}\n\n<footer`
    );
  } else if (html.includes('</main>\n<footer')) {
    html = html.replace(
      '</main>\n<footer',
      `</main>\n${schemaScript}\n<footer`
    );
  } else {
    return { status: 'error', reason: 'could not find insertion point' };
  }

  fs.writeFileSync(filePath, html);
  return { status: 'updated', items: items.length };
}

// Fonction pour parcourir récursivement un répertoire
function processDirectory(dir, stats = { updated: 0, skipped: 0, errors: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      processDirectory(fullPath, stats);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const result = addSchemaToFile(fullPath);
      const relativePath = path.relative(ROOT_DIR, fullPath);

      if (result.status === 'updated') {
        console.log(`✅ ${relativePath} (${result.items} items)`);
        stats.updated++;
      } else if (result.status === 'skipped') {
        console.log(`⏭️  ${relativePath} - ${result.reason}`);
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
console.log('🔧 Ajout des schemas BreadcrumbList aux fichiers HTML...\n');

const stats = processDirectory(ROOT_DIR);

console.log('\n📊 Résumé:');
console.log(`   ✅ Mis à jour: ${stats.updated}`);
console.log(`   ⏭️  Ignorés: ${stats.skipped}`);
console.log(`   ❌ Erreurs: ${stats.errors}`);
