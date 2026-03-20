/**
 * Verify all new inventory translation keys across all 31 locale files.
 * Prints a table for visual inspection of language correctness.
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json')).sort();

const stockKeys = ['liquid_stock', 'liquid_matured', 'total', 'auto_deduct', 'auto_deduct_hint', 'auto_deducted', 'pieces', 'add', 'remove_ml', 'remove', 'enter_ml'];
const productKeys = ['type_tobacco', 'type_herbs', 'type_additive'];

console.log('=== STOCK KEYS ===\n');
console.log('LANG'.padEnd(8) + stockKeys.map(k => k.padEnd(30)).join(''));
console.log('-'.repeat(8 + stockKeys.length * 30));

for (const file of files) {
  const lang = file.replace('.json', '');
  const json = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  const stock = json.stock || {};
  const row = lang.padEnd(8) + stockKeys.map(k => (stock[k] || '❌ MISSING').substring(0, 28).padEnd(30)).join('');
  console.log(row);
}

console.log('\n=== PRODUCT TYPE KEYS ===\n');
console.log('LANG'.padEnd(8) + productKeys.map(k => k.padEnd(20)).join(''));
console.log('-'.repeat(8 + productKeys.length * 20));

for (const file of files) {
  const lang = file.replace('.json', '');
  const json = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  const products = json.products || {};
  const row = lang.padEnd(8) + productKeys.map(k => (products[k] || '❌ MISSING').substring(0, 18).padEnd(20)).join('');
  console.log(row);
}

// Check for duplicates: same translation in non-English files as English (possible untranslated)
console.log('\n=== POTENTIAL UNTRANSLATED (same as English) ===\n');
const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const enStock = enJson.stock || {};
const enProducts = enJson.products || {};

for (const file of files) {
  if (file === 'en.json') continue;
  const lang = file.replace('.json', '');
  const json = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  const stock = json.stock || {};
  const products = json.products || {};
  
  const dupes = [];
  for (const k of stockKeys) {
    if (stock[k] && stock[k] === enStock[k]) dupes.push(`stock.${k}`);
  }
  for (const k of productKeys) {
    if (products[k] && products[k] === enProducts[k]) dupes.push(`products.${k}`);
  }
  
  if (dupes.length > 0) {
    console.log(`${lang}: ${dupes.join(', ')}`);
  }
}
