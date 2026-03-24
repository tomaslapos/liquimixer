/**
 * LiquiMixer Affiliate Widget v1.0
 * Usage: <script src="https://www.liquimixer.com/widget/affiliate.js" data-slug="your-shop" data-country="CZ"></script>
 */
(function() {
  'use strict';

  var TEXTS = {
    'CZ': 'Spočítejte si ingredience pro váš recept',
    'SK': 'Spočítajte si ingrediencie pre váš recept',
    'DE': 'Berechnen Sie die Zutaten für Ihr Rezept',
    'AT': 'Berechnen Sie die Zutaten für Ihr Rezept',
    'CH': 'Berechnen Sie die Zutaten für Ihr Rezept',
    'PL': 'Oblicz składniki do swojego przepisu',
    'FR': 'Calculez les ingrédients de votre recette',
    'BE': 'Calculez les ingrédients de votre recette',
    'IT': 'Calcola gli ingredienti per la tua ricetta',
    'ES': 'Calcula los ingredientes para tu receta',
    'PT': 'Calcule os ingredientes para a sua receita',
    'NL': 'Bereken de ingrediënten voor uw recept',
    'GB': 'Calculate ingredients for your recipe',
    'US': 'Calculate ingredients for your recipe',
    'HU': 'Számolja ki a hozzávalókat a receptjéhez',
    'RO': 'Calculați ingredientele pentru rețeta dvs.',
    'BG': 'Изчислете съставките за вашата рецепта',
    'HR': 'Izračunajte sastojke za vaš recept',
    'RS': 'Израчунајте састојке за ваш рецепт',
    'TR': 'Tarifiniz için malzemeleri hesaplayın',
    'GR': 'Υπολογίστε τα συστατικά για τη συνταγή σας',
    'SE': 'Beräkna ingredienserna för ditt recept',
    'DK': 'Beregn ingredienserne til din opskrift',
    'NO': 'Beregn ingrediensene for oppskriften din',
    'FI': 'Laske reseptisi ainesosat',
    'EE': 'Arvutage oma retsepti koostisosad',
    'LV': 'Aprēķiniet savas receptes sastāvdaļas',
    'LT': 'Apskaičiuokite savo recepto ingredientus',
    'UA': 'Розрахуйте інгредієнти для вашого рецепту',
    'RU': 'Рассчитайте ингредиенты для вашего рецепта',
    'JP': 'レシピの材料を計算する',
    'KR': '레시피 재료를 계산하세요',
    'SA': 'احسب المكونات لوصفتك'
  };

  var FLASK_SVG = '<svg width="22" height="22" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M180 160V290L140 385Q120 425 160 445H352Q392 425 372 385L332 290V160" stroke="#00ffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M180 160V115Q180 95 200 95H312Q332 95 332 115V160" stroke="#00ffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M160 370Q140 405 175 425H337Q372 405 352 370L320 310H192Z" fill="#ff00ff" opacity="0.5"/>'
    + '<circle cx="220" cy="360" r="15" fill="#ff00ff" opacity="0.7"/>'
    + '<circle cx="280" cy="380" r="10" fill="#00ffff" opacity="0.7"/>'
    + '<circle cx="250" cy="340" r="12" fill="#ffff00" opacity="0.7"/>'
    + '</svg>';

  // Find the current script tag
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var slug = currentScript.getAttribute('data-slug');
  var country = (currentScript.getAttribute('data-country') || 'GB').toUpperCase();

  if (!slug) return;

  var text = TEXTS[country] || TEXTS['GB'];
  var url = 'https://www.liquimixer.com/' + slug;

  // Create widget element
  var a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = FLASK_SVG + ' ' + text;

  // Apply styles
  a.style.cssText = 'display:inline-flex;align-items:center;gap:10px;padding:12px 24px;'
    + 'background:linear-gradient(135deg,#0a0a15 0%,#1a1a2e 100%);'
    + 'color:#00ffff;border-radius:12px;text-decoration:none;'
    + 'font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:600;'
    + 'border:1px solid rgba(0,255,255,0.3);'
    + 'box-shadow:0 0 15px rgba(0,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.05);'
    + 'transition:all .3s;white-space:nowrap;line-height:1.4;';

  a.onmouseover = function() {
    this.style.boxShadow = '0 0 25px rgba(0,255,255,0.3),inset 0 1px 0 rgba(255,255,255,0.1)';
    this.style.borderColor = 'rgba(0,255,255,0.6)';
  };
  a.onmouseout = function() {
    this.style.boxShadow = '0 0 15px rgba(0,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.05)';
    this.style.borderColor = 'rgba(0,255,255,0.3)';
  };

  // Insert widget after the script tag
  currentScript.parentNode.insertBefore(a, currentScript.nextSibling);
})();
