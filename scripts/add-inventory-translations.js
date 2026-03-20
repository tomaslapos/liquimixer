/**
 * Script to add inventory management translation keys to all 31 locale files.
 * Phase 1: products.type_tobacco, products.type_herbs, products.type_additive,
 *          stock.liquid_stock, liquid_matured, total, auto_deduct, auto_deduct_hint, auto_deducted
 * Phase 2: stock.pieces, add, remove_ml, remove, enter_ml (missing from product stock UI)
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

// Translations per language
const translations = {
  "en": {
    products: { type_tobacco: "Tobacco", type_herbs: "Herbs", type_additive: "Additive" },
    stock: {
      liquid_stock: "Liquid stock",
      liquid_matured: "Matured",
      total: "Total stock",
      auto_deduct: "Deduct ingredients from stock",
      auto_deduct_hint: "Automatically deducts used ingredients from linked products.",
      auto_deducted: "Ingredients have been deducted from stock."
    }
  },
  "cs": {
    products: { type_tobacco: "Tabák", type_herbs: "Bylinky", type_additive: "Aditivum" },
    stock: {
      liquid_stock: "Zásoba liquidu",
      liquid_matured: "Vyzrálo",
      total: "Celková zásoba",
      auto_deduct: "Odečíst ingredience ze zásob",
      auto_deduct_hint: "Automaticky odečte použité ingredience z propojených produktů.",
      auto_deducted: "Ingredience byly odečteny ze zásob."
    }
  },
  "sk": {
    products: { type_tobacco: "Tabak", type_herbs: "Bylinky", type_additive: "Aditívum" },
    stock: {
      liquid_stock: "Zásoba liquidu",
      liquid_matured: "Vyzreté",
      total: "Celková zásoba",
      auto_deduct: "Odpočítať ingrediencie zo zásob",
      auto_deduct_hint: "Automaticky odpočíta použité ingrediencie z prepojených produktov.",
      auto_deducted: "Ingrediencie boli odpočítané zo zásob."
    }
  },
  "de": {
    products: { type_tobacco: "Tabak", type_herbs: "Kräuter", type_additive: "Zusatzstoff" },
    stock: {
      liquid_stock: "Liquid-Vorrat",
      liquid_matured: "Gereift",
      total: "Gesamtvorrat",
      auto_deduct: "Zutaten vom Bestand abziehen",
      auto_deduct_hint: "Zieht automatisch verwendete Zutaten von verknüpften Produkten ab.",
      auto_deducted: "Zutaten wurden vom Bestand abgezogen."
    }
  },
  "fr": {
    products: { type_tobacco: "Tabac", type_herbs: "Herbes", type_additive: "Additif" },
    stock: {
      liquid_stock: "Stock de liquide",
      liquid_matured: "Maturé",
      total: "Stock total",
      auto_deduct: "Déduire les ingrédients du stock",
      auto_deduct_hint: "Déduit automatiquement les ingrédients utilisés des produits liés.",
      auto_deducted: "Les ingrédients ont été déduits du stock."
    }
  },
  "es": {
    products: { type_tobacco: "Tabaco", type_herbs: "Hierbas", type_additive: "Aditivo" },
    stock: {
      liquid_stock: "Stock de líquido",
      liquid_matured: "Madurado",
      total: "Stock total",
      auto_deduct: "Deducir ingredientes del stock",
      auto_deduct_hint: "Deduce automáticamente los ingredientes usados de los productos vinculados.",
      auto_deducted: "Los ingredientes han sido deducidos del stock."
    }
  },
  "it": {
    products: { type_tobacco: "Tabacco", type_herbs: "Erbe", type_additive: "Additivo" },
    stock: {
      liquid_stock: "Scorta liquido",
      liquid_matured: "Maturato",
      total: "Scorta totale",
      auto_deduct: "Deduci ingredienti dalle scorte",
      auto_deduct_hint: "Deduce automaticamente gli ingredienti usati dai prodotti collegati.",
      auto_deducted: "Gli ingredienti sono stati dedotti dalle scorte."
    }
  },
  "pt": {
    products: { type_tobacco: "Tabaco", type_herbs: "Ervas", type_additive: "Aditivo" },
    stock: {
      liquid_stock: "Stock de líquido",
      liquid_matured: "Maturado",
      total: "Stock total",
      auto_deduct: "Deduzir ingredientes do stock",
      auto_deduct_hint: "Deduz automaticamente os ingredientes usados dos produtos vinculados.",
      auto_deducted: "Os ingredientes foram deduzidos do stock."
    }
  },
  "nl": {
    products: { type_tobacco: "Tabak", type_herbs: "Kruiden", type_additive: "Additief" },
    stock: {
      liquid_stock: "Liquid voorraad",
      liquid_matured: "Gerijpt",
      total: "Totale voorraad",
      auto_deduct: "Ingrediënten aftrekken van voorraad",
      auto_deduct_hint: "Trekt automatisch gebruikte ingrediënten af van gekoppelde producten.",
      auto_deducted: "Ingrediënten zijn afgetrokken van de voorraad."
    }
  },
  "pl": {
    products: { type_tobacco: "Tytoń", type_herbs: "Zioła", type_additive: "Dodatek" },
    stock: {
      liquid_stock: "Zapas liquidu",
      liquid_matured: "Dojrzałe",
      total: "Łączny zapas",
      auto_deduct: "Odejmij składniki z zapasów",
      auto_deduct_hint: "Automatycznie odejmuje użyte składniki z powiązanych produktów.",
      auto_deducted: "Składniki zostały odjęte z zapasów."
    }
  },
  "hu": {
    products: { type_tobacco: "Dohány", type_herbs: "Gyógynövények", type_additive: "Adalékanyag" },
    stock: {
      liquid_stock: "Liquid készlet",
      liquid_matured: "Érlelt",
      total: "Összes készlet",
      auto_deduct: "Összetevők levonása a készletből",
      auto_deduct_hint: "Automatikusan levonja a felhasznált összetevőket a kapcsolt termékekből.",
      auto_deducted: "Az összetevők levonásra kerültek a készletből."
    }
  },
  "ro": {
    products: { type_tobacco: "Tutun", type_herbs: "Ierburi", type_additive: "Aditiv" },
    stock: {
      liquid_stock: "Stoc lichid",
      liquid_matured: "Maturat",
      total: "Stoc total",
      auto_deduct: "Deduceți ingredientele din stoc",
      auto_deduct_hint: "Deduce automat ingredientele utilizate din produsele legate.",
      auto_deducted: "Ingredientele au fost deduse din stoc."
    }
  },
  "bg": {
    products: { type_tobacco: "Тютюн", type_herbs: "Билки", type_additive: "Добавка" },
    stock: {
      liquid_stock: "Наличност на течност",
      liquid_matured: "Отлежало",
      total: "Обща наличност",
      auto_deduct: "Приспадане на съставки от наличността",
      auto_deduct_hint: "Автоматично приспада използваните съставки от свързаните продукти.",
      auto_deducted: "Съставките бяха приспаднати от наличността."
    }
  },
  "hr": {
    products: { type_tobacco: "Duhan", type_herbs: "Biljke", type_additive: "Aditiv" },
    stock: {
      liquid_stock: "Zaliha tekućine",
      liquid_matured: "Sazrjelo",
      total: "Ukupna zaliha",
      auto_deduct: "Oduzmi sastojke iz zaliha",
      auto_deduct_hint: "Automatski oduzima korištene sastojke iz povezanih proizvoda.",
      auto_deducted: "Sastojci su oduzeti iz zaliha."
    }
  },
  "sr": {
    products: { type_tobacco: "Дуван", type_herbs: "Биљке", type_additive: "Адитив" },
    stock: {
      liquid_stock: "Залиха течности",
      liquid_matured: "Одлежано",
      total: "Укупна залиха",
      auto_deduct: "Одузми састојке из залиха",
      auto_deduct_hint: "Аутоматски одузима коришћене састојке из повезаних производа.",
      auto_deducted: "Састојци су одузети из залиха."
    }
  },
  "ru": {
    products: { type_tobacco: "Табак", type_herbs: "Травы", type_additive: "Добавка" },
    stock: {
      liquid_stock: "Запас жидкости",
      liquid_matured: "Созревшее",
      total: "Общий запас",
      auto_deduct: "Вычесть ингредиенты из запасов",
      auto_deduct_hint: "Автоматически вычитает использованные ингредиенты из связанных продуктов.",
      auto_deducted: "Ингредиенты были вычтены из запасов."
    }
  },
  "uk": {
    products: { type_tobacco: "Тютюн", type_herbs: "Трави", type_additive: "Добавка" },
    stock: {
      liquid_stock: "Запас рідини",
      liquid_matured: "Дозріле",
      total: "Загальний запас",
      auto_deduct: "Відняти інгредієнти з запасів",
      auto_deduct_hint: "Автоматично віднімає використані інгредієнти зі зв'язаних продуктів.",
      auto_deducted: "Інгредієнти було віднято з запасів."
    }
  },
  "tr": {
    products: { type_tobacco: "Tütün", type_herbs: "Bitkiler", type_additive: "Katkı maddesi" },
    stock: {
      liquid_stock: "Likit stoku",
      liquid_matured: "Olgunlaşmış",
      total: "Toplam stok",
      auto_deduct: "Malzemeleri stoktan düş",
      auto_deduct_hint: "Kullanılan malzemeleri bağlı ürünlerden otomatik olarak düşer.",
      auto_deducted: "Malzemeler stoktan düşüldü."
    }
  },
  "el": {
    products: { type_tobacco: "Καπνός", type_herbs: "Βότανα", type_additive: "Πρόσθετο" },
    stock: {
      liquid_stock: "Απόθεμα υγρού",
      liquid_matured: "Ωριμασμένο",
      total: "Συνολικό απόθεμα",
      auto_deduct: "Αφαίρεση συστατικών από το απόθεμα",
      auto_deduct_hint: "Αφαιρεί αυτόματα τα χρησιμοποιημένα συστατικά από τα συνδεδεμένα προϊόντα.",
      auto_deducted: "Τα συστατικά αφαιρέθηκαν από το απόθεμα."
    }
  },
  "da": {
    products: { type_tobacco: "Tobak", type_herbs: "Urter", type_additive: "Tilsætningsstof" },
    stock: {
      liquid_stock: "Væskelager",
      liquid_matured: "Modnet",
      total: "Samlet lager",
      auto_deduct: "Fratræk ingredienser fra lager",
      auto_deduct_hint: "Fratrækker automatisk brugte ingredienser fra tilknyttede produkter.",
      auto_deducted: "Ingredienser er trukket fra lageret."
    }
  },
  "sv": {
    products: { type_tobacco: "Tobak", type_herbs: "Örter", type_additive: "Tillsats" },
    stock: {
      liquid_stock: "Vätskförråd",
      liquid_matured: "Mognad",
      total: "Totalt förråd",
      auto_deduct: "Dra av ingredienser från lager",
      auto_deduct_hint: "Drar automatiskt av använda ingredienser från länkade produkter.",
      auto_deducted: "Ingredienser har dragits av från lagret."
    }
  },
  "no": {
    products: { type_tobacco: "Tobakk", type_herbs: "Urter", type_additive: "Tilsetningsstoff" },
    stock: {
      liquid_stock: "Væskelager",
      liquid_matured: "Modnet",
      total: "Totalt lager",
      auto_deduct: "Trekk ingredienser fra lager",
      auto_deduct_hint: "Trekker automatisk brukte ingredienser fra tilknyttede produkter.",
      auto_deducted: "Ingredienser er trukket fra lageret."
    }
  },
  "fi": {
    products: { type_tobacco: "Tupakka", type_herbs: "Yrtit", type_additive: "Lisäaine" },
    stock: {
      liquid_stock: "Nestevarasto",
      liquid_matured: "Kypsynyt",
      total: "Kokonaisvarasto",
      auto_deduct: "Vähennä ainesosat varastosta",
      auto_deduct_hint: "Vähentää automaattisesti käytetyt ainesosat linkitetyistä tuotteista.",
      auto_deducted: "Ainesosat on vähennetty varastosta."
    }
  },
  "et": {
    products: { type_tobacco: "Tubakas", type_herbs: "Ürdid", type_additive: "Lisaaine" },
    stock: {
      liquid_stock: "Vedeliku varu",
      liquid_matured: "Küpsenud",
      total: "Koguvaru",
      auto_deduct: "Lahutage koostisosad varust",
      auto_deduct_hint: "Lahutab automaatselt kasutatud koostisosad seotud toodetest.",
      auto_deducted: "Koostisosad on varust lahutatud."
    }
  },
  "lt": {
    products: { type_tobacco: "Tabakas", type_herbs: "Žolės", type_additive: "Priedas" },
    stock: {
      liquid_stock: "Skysčio atsarga",
      liquid_matured: "Subrandinta",
      total: "Bendra atsarga",
      auto_deduct: "Atimti ingredientus iš atsargų",
      auto_deduct_hint: "Automatiškai atima panaudotus ingredientus iš susietų produktų.",
      auto_deducted: "Ingredientai buvo atimti iš atsargų."
    }
  },
  "lv": {
    products: { type_tobacco: "Tabaka", type_herbs: "Augi", type_additive: "Piedeva" },
    stock: {
      liquid_stock: "Šķidruma krājums",
      liquid_matured: "Nogatavināts",
      total: "Kopējais krājums",
      auto_deduct: "Atskaitīt sastāvdaļas no krājuma",
      auto_deduct_hint: "Automātiski atskaita izmantotas sastāvdaļas no saistītajiem produktiem.",
      auto_deducted: "Sastāvdaļas tika atskaitītas no krājuma."
    }
  },
  "ar-SA": {
    products: { type_tobacco: "تبغ", type_herbs: "أعشاب", type_additive: "مادة مضافة" },
    stock: {
      liquid_stock: "مخزون السائل",
      liquid_matured: "ناضج",
      total: "المخزون الكلي",
      auto_deduct: "خصم المكونات من المخزون",
      auto_deduct_hint: "يخصم تلقائياً المكونات المستخدمة من المنتجات المرتبطة.",
      auto_deducted: "تم خصم المكونات من المخزون."
    }
  },
  "ja": {
    products: { type_tobacco: "タバコ", type_herbs: "ハーブ", type_additive: "添加物" },
    stock: {
      liquid_stock: "リキッド在庫",
      liquid_matured: "熟成済み",
      total: "合計在庫",
      auto_deduct: "在庫から材料を差し引く",
      auto_deduct_hint: "リンクされた製品から使用した材料を自動的に差し引きます。",
      auto_deducted: "材料が在庫から差し引かれました。"
    }
  },
  "ko": {
    products: { type_tobacco: "담배", type_herbs: "허브", type_additive: "첨가제" },
    stock: {
      liquid_stock: "액상 재고",
      liquid_matured: "숙성됨",
      total: "전체 재고",
      auto_deduct: "재고에서 재료 차감",
      auto_deduct_hint: "연결된 제품에서 사용된 재료를 자동으로 차감합니다.",
      auto_deducted: "재료가 재고에서 차감되었습니다."
    }
  },
  "zh-CN": {
    products: { type_tobacco: "烟草", type_herbs: "草药", type_additive: "添加剂" },
    stock: {
      liquid_stock: "烟油库存",
      liquid_matured: "已熟化",
      total: "总库存",
      auto_deduct: "从库存中扣除原料",
      auto_deduct_hint: "自动从关联产品中扣除已使用的原料。",
      auto_deducted: "原料已从库存中扣除。"
    }
  },
  "zh-TW": {
    products: { type_tobacco: "菸草", type_herbs: "草藥", type_additive: "添加劑" },
    stock: {
      liquid_stock: "煙油庫存",
      liquid_matured: "已熟化",
      total: "總庫存",
      auto_deduct: "從庫存中扣除原料",
      auto_deduct_hint: "自動從關聯產品中扣除已使用的原料。",
      auto_deducted: "原料已從庫存中扣除。"
    }
  }
};

// Process each locale file
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
let updated = 0;

for (const file of files) {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  
  // Read existing translations
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  // Get translations for this language (fallback to English)
  const trans = translations[lang] || translations['en'];
  
  let changed = false;
  
  // Add products.type_tobacco, type_herbs, type_additive
  if (json.products) {
    for (const [key, value] of Object.entries(trans.products)) {
      if (!json.products[key]) {
        json.products[key] = value;
        changed = true;
      }
    }
  }
  
  // Add stock section
  if (!json.stock) {
    json.stock = {};
  }
  for (const [key, value] of Object.entries(trans.stock)) {
    if (!json.stock[key]) {
      json.stock[key] = value;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    updated++;
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped (no changes): ${file}`);
  }
}

console.log(`\nDone! Updated ${updated} of ${files.length} files.`);
