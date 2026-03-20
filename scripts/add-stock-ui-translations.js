/**
 * Script to add missing stock UI translation keys (pieces, add, remove_ml, remove, enter_ml)
 * to all 31 locale files. These are used in product stock +/- buttons UI.
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

const translations = {
  "en": { pieces: "pcs", add: "Add", remove_ml: "Remove ml", remove: "Remove", enter_ml: "Please enter volume in ml." },
  "cs": { pieces: "ks", add: "Přidat", remove_ml: "Odebrat ml", remove: "Odebrat", enter_ml: "Zadejte objem v ml." },
  "sk": { pieces: "ks", add: "Pridať", remove_ml: "Odobrať ml", remove: "Odobrať", enter_ml: "Zadajte objem v ml." },
  "de": { pieces: "Stk", add: "Hinzufügen", remove_ml: "ml entfernen", remove: "Entfernen", enter_ml: "Bitte Volumen in ml eingeben." },
  "fr": { pieces: "pcs", add: "Ajouter", remove_ml: "Retirer ml", remove: "Retirer", enter_ml: "Veuillez entrer le volume en ml." },
  "es": { pieces: "uds", add: "Añadir", remove_ml: "Quitar ml", remove: "Quitar", enter_ml: "Ingrese el volumen en ml." },
  "it": { pieces: "pz", add: "Aggiungi", remove_ml: "Rimuovi ml", remove: "Rimuovi", enter_ml: "Inserisci il volume in ml." },
  "pt": { pieces: "pcs", add: "Adicionar", remove_ml: "Remover ml", remove: "Remover", enter_ml: "Insira o volume em ml." },
  "nl": { pieces: "st", add: "Toevoegen", remove_ml: "ml verwijderen", remove: "Verwijderen", enter_ml: "Voer het volume in ml in." },
  "pl": { pieces: "szt", add: "Dodaj", remove_ml: "Usuń ml", remove: "Usuń", enter_ml: "Podaj objętość w ml." },
  "hu": { pieces: "db", add: "Hozzáadás", remove_ml: "ml eltávolítása", remove: "Eltávolítás", enter_ml: "Kérjük, adja meg a térfogatot ml-ben." },
  "ro": { pieces: "buc", add: "Adaugă", remove_ml: "Elimină ml", remove: "Elimină", enter_ml: "Introduceți volumul în ml." },
  "bg": { pieces: "бр", add: "Добави", remove_ml: "Премахни мл", remove: "Премахни", enter_ml: "Въведете обем в мл." },
  "hr": { pieces: "kom", add: "Dodaj", remove_ml: "Ukloni ml", remove: "Ukloni", enter_ml: "Unesite volumen u ml." },
  "sr": { pieces: "ком", add: "Додај", remove_ml: "Уклони мл", remove: "Уклони", enter_ml: "Унесите запремину у мл." },
  "ru": { pieces: "шт", add: "Добавить", remove_ml: "Убрать мл", remove: "Убрать", enter_ml: "Введите объём в мл." },
  "uk": { pieces: "шт", add: "Додати", remove_ml: "Видалити мл", remove: "Видалити", enter_ml: "Введіть об'єм у мл." },
  "tr": { pieces: "ad", add: "Ekle", remove_ml: "ml kaldır", remove: "Kaldır", enter_ml: "Lütfen ml cinsinden hacim girin." },
  "el": { pieces: "τεμ", add: "Προσθήκη", remove_ml: "Αφαίρεση ml", remove: "Αφαίρεση", enter_ml: "Εισάγετε τον όγκο σε ml." },
  "da": { pieces: "stk", add: "Tilføj", remove_ml: "Fjern ml", remove: "Fjern", enter_ml: "Indtast volumen i ml." },
  "sv": { pieces: "st", add: "Lägg till", remove_ml: "Ta bort ml", remove: "Ta bort", enter_ml: "Ange volym i ml." },
  "no": { pieces: "stk", add: "Legg til", remove_ml: "Fjern ml", remove: "Fjern", enter_ml: "Vennligst oppgi volum i ml." },
  "fi": { pieces: "kpl", add: "Lisää", remove_ml: "Poista ml", remove: "Poista", enter_ml: "Syötä tilavuus ml." },
  "et": { pieces: "tk", add: "Lisa", remove_ml: "Eemalda ml", remove: "Eemalda", enter_ml: "Sisestage maht ml-des." },
  "lt": { pieces: "vnt", add: "Pridėti", remove_ml: "Pašalinti ml", remove: "Pašalinti", enter_ml: "Įveskite tūrį ml." },
  "lv": { pieces: "gab", add: "Pievienot", remove_ml: "Noņemt ml", remove: "Noņemt", enter_ml: "Ievadiet tilpumu ml." },
  "ar-SA": { pieces: "قطعة", add: "إضافة", remove_ml: "إزالة مل", remove: "إزالة", enter_ml: "يرجى إدخال الحجم بالمل." },
  "ja": { pieces: "個", add: "追加", remove_ml: "ml削除", remove: "削除", enter_ml: "mlでボリュームを入力してください。" },
  "ko": { pieces: "개", add: "추가", remove_ml: "ml 제거", remove: "제거", enter_ml: "ml 단위로 용량을 입력하세요." },
  "zh-CN": { pieces: "件", add: "添加", remove_ml: "移除 ml", remove: "移除", enter_ml: "请输入体积（ml）。" },
  "zh-TW": { pieces: "件", add: "新增", remove_ml: "移除 ml", remove: "移除", enter_ml: "請輸入體積（ml）。" }
};

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
let updated = 0;

for (const file of files) {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  const trans = translations[lang] || translations['en'];
  
  let changed = false;
  
  if (!json.stock) json.stock = {};
  
  for (const [key, value] of Object.entries(trans)) {
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
    console.log(`⏭️  Skipped: ${file}`);
  }
}

console.log(`\nDone! Updated ${updated} of ${files.length} files.`);
