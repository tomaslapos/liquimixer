/**
 * Script to generate remaining locale files from English template
 * Creates nested structure matching cs.json, en.json, sk.json
 * Run with: node scripts/generate-locales.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

// Read English template
const enTemplate = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// Language metadata and translations for key sections
const languages = {
  'es': {
    meta: { code: 'es', name: 'Spanish', nativeName: 'Español', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menú', login: 'Iniciar sesión', home: 'Inicio' },
    intro: {
      subtitle: 'CALCULADORA DE E-LÍQUIDOS',
      start_button: 'COMENZAR A MEZCLAR',
      disclaimer_title: 'Aviso',
      app_description: 'Calculadora para mezcla segura de e-líquidos con cálculos precisos de proporción PG/VG, sabores y nicotina. No empieces desde cero cada vez — guarda tus recetas y productos favoritos o compártelos con amigos. También funciona sin conexión en 31 idiomas.'
    }
  },
  'it': {
    meta: { code: 'it', name: 'Italian', nativeName: 'Italiano', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menu', login: 'Accedi', home: 'Home' },
    intro: {
      subtitle: 'CALCOLATORE E-LIQUID',
      start_button: 'INIZIA A MESCOLARE',
      disclaimer_title: 'Avviso',
      app_description: 'Calcolatore per la miscelazione sicura di e-liquid con calcoli precisi del rapporto PG/VG, aromi e nicotina. Non ricominciare da zero ogni volta — salva le tue ricette e i tuoi prodotti preferiti o condividili con gli amici. Funziona anche offline in 31 lingue.'
    }
  },
  'pt': {
    meta: { code: 'pt', name: 'Portuguese', nativeName: 'Português', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menu', login: 'Entrar', home: 'Início' },
    intro: {
      subtitle: 'CALCULADORA DE E-LÍQUIDOS',
      start_button: 'COMEÇAR A MISTURAR',
      disclaimer_title: 'Aviso',
      app_description: 'Calculadora para mistura segura de e-líquidos com cálculos precisos de proporção PG/VG, sabores e nicotina. Não comece do zero toda vez — salve suas receitas e produtos favoritos ou compartilhe com amigos. Também funciona offline em 31 idiomas.'
    }
  },
  'nl': {
    meta: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menu', login: 'Inloggen', home: 'Home' },
    intro: {
      subtitle: 'E-LIQUID CALCULATOR',
      start_button: 'BEGIN MET MENGEN',
      disclaimer_title: 'Disclaimer',
      app_description: 'Calculator voor veilig e-liquid mengen met nauwkeurige PG/VG-verhouding, smaak- en nicotineberekeningen. Begin niet elke keer opnieuw — bewaar je favoriete recepten en producten of deel ze met vrienden. Werkt ook offline in 31 talen.'
    }
  },
  'ru': {
    meta: { code: 'ru', name: 'Russian', nativeName: 'Русский', currency: 'RUB', currencySymbol: '₽' },
    nav: { menu: 'Меню', login: 'Войти', home: 'Главная' },
    intro: {
      subtitle: 'КАЛЬКУЛЯТОР ЖИДКОСТЕЙ',
      start_button: 'НАЧАТЬ СМЕШИВАНИЕ',
      disclaimer_title: 'Предупреждение',
      app_description: 'Калькулятор для безопасного смешивания e-liquid с точными расчётами соотношения PG/VG, ароматизаторов и никотина. Не начинайте каждый раз с нуля — сохраняйте любимые рецепты и продукты или делитесь ими с друзьями. Также работает офлайн на 31 языке.'
    }
  },
  'uk': {
    meta: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', currency: 'UAH', currencySymbol: '₴' },
    nav: { menu: 'Меню', login: 'Увійти', home: 'Головна' },
    intro: {
      subtitle: 'КАЛЬКУЛЯТОР РІДИН',
      start_button: 'ПОЧАТИ ЗМІШУВАННЯ',
      disclaimer_title: 'Попередження',
      app_description: 'Калькулятор для безпечного змішування e-liquid з точними розрахунками співвідношення PG/VG, ароматизаторів та нікотину. Не починайте щоразу з нуля — зберігайте улюблені рецепти та продукти або діліться ними з друзями. Також працює офлайн 31 мовою.'
    }
  },
  'hu': {
    meta: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', currency: 'HUF', currencySymbol: 'Ft' },
    nav: { menu: 'Menü', login: 'Bejelentkezés', home: 'Főoldal' },
    intro: {
      subtitle: 'E-LIQUID KALKULÁTOR',
      start_button: 'KEVERÉS INDÍTÁSA',
      disclaimer_title: 'Figyelmeztetés',
      app_description: 'Kalkulátor a biztonságos e-liquid keveréshez pontos PG/VG arány, aroma és nikotin számításokkal. Ne kezdj minden alkalommal az elejéről — mentsd el kedvenc receptjeidet és termékeidet, vagy oszd meg barátaiddal. Offline is működik 31 nyelven.'
    }
  },
  'ro': {
    meta: { code: 'ro', name: 'Romanian', nativeName: 'Română', currency: 'RON', currencySymbol: 'lei' },
    nav: { menu: 'Meniu', login: 'Autentificare', home: 'Acasă' },
    intro: {
      subtitle: 'CALCULATOR E-LICHID',
      start_button: 'ÎNCEPE AMESTECAREA',
      disclaimer_title: 'Avertisment',
      app_description: 'Calculator pentru amestecarea sigură a e-lichidului cu calcule precise ale raportului PG/VG, aromelor și nicotinei. Nu începe de la zero de fiecare dată — salvează-ți rețetele și produsele preferate sau împărtășește-le cu prietenii. Funcționează și offline în 31 de limbi.'
    }
  },
  'bg': {
    meta: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', currency: 'BGN', currencySymbol: 'лв' },
    nav: { menu: 'Меню', login: 'Вход', home: 'Начало' },
    intro: {
      subtitle: 'КАЛКУЛАТОР ЗА E-LIQUID',
      start_button: 'ЗАПОЧНИ СМЕСВАНЕ',
      disclaimer_title: 'Предупреждение',
      app_description: 'Калкулатор за безопасно смесване на e-liquid с точни изчисления на съотношението PG/VG, ароматизатори и никотин. Не започвайте всеки път от нулата — запазете любимите си рецепти и продукти или ги споделете с приятели. Работи и офлайн на 31 езика.'
    }
  },
  'hr': {
    meta: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izbornik', login: 'Prijava', home: 'Početna' },
    intro: {
      subtitle: 'KALKULATOR E-TEKUĆINA',
      start_button: 'ZAPOČNI MIJEŠANJE',
      disclaimer_title: 'Upozorenje',
      app_description: 'Kalkulator za sigurno miješanje e-liquida s preciznim izračunima omjera PG/VG, aroma i nikotina. Ne počinjite svaki put ispočetka — spremite omiljene recepte i proizvode ili ih podijelite s prijateljima. Radi i offline na 31 jeziku.'
    }
  },
  'sr': {
    meta: { code: 'sr', name: 'Serbian', nativeName: 'Српски', currency: 'RSD', currencySymbol: 'дин' },
    nav: { menu: 'Мени', login: 'Пријава', home: 'Почетна' },
    intro: {
      subtitle: 'КАЛКУЛАТОР Е-ТЕЧНОСТИ',
      start_button: 'ПОЧНИ МЕШАЊЕ',
      disclaimer_title: 'Упозорење',
      app_description: 'Калкулатор за безбедно мешање e-liquid са прецизним прорачунима односа PG/VG, арома и никотина. Не почињите сваки пут испочетка — сачувајте омиљене рецепте и производе или их поделите са пријатељима. Ради и офлајн на 31 језику.'
    }
  },
  'el': {
    meta: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Μενού', login: 'Σύνδεση', home: 'Αρχική' },
    intro: {
      subtitle: 'ΥΠΟΛΟΓΙΣΤΗΣ E-LIQUID',
      start_button: 'ΕΝΑΡΞΗ ΑΝΑΜΙΞΗΣ',
      disclaimer_title: 'Προειδοποίηση',
      app_description: 'Αριθμομηχανή για ασφαλή ανάμειξη e-liquid με ακριβείς υπολογισμούς αναλογίας PG/VG, αρωμάτων και νικοτίνης. Μην ξεκινάτε από το μηδέν κάθε φορά — αποθηκεύστε τις αγαπημένες σας συνταγές και προϊόντα ή μοιραστείτε τα με φίλους. Λειτουργεί επίσης εκτός σύνδεσης σε 31 γλώσσες.'
    }
  },
  'tr': {
    meta: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', currency: 'TRY', currencySymbol: '₺' },
    nav: { menu: 'Menü', login: 'Giriş', home: 'Ana Sayfa' },
    intro: {
      subtitle: 'E-SIVI HESAPLAYICISI',
      start_button: 'KARIŞTIRMAYA BAŞLA',
      disclaimer_title: 'Uyarı',
      app_description: 'Hassas PG/VG oranı, aroma ve nikotin hesaplamalarıyla güvenli e-sıvı karıştırma hesaplayıcısı. Her seferinde sıfırdan başlamayın — favori tariflerinizi ve ürünlerinizi kaydedin veya arkadaşlarınızla paylaşın. 31 dilde çevrimdışı da çalışır.'
    }
  },
  'ar-SA': {
    meta: { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', currency: 'SAR', currencySymbol: 'ر.س' },
    nav: { menu: 'القائمة', login: 'تسجيل الدخول', home: 'الرئيسية' },
    intro: {
      subtitle: 'حاسبة السوائل الإلكترونية',
      start_button: 'ابدأ الخلط',
      disclaimer_title: 'تحذير',
      app_description: 'حاسبة لخلط السوائل الإلكترونية بأمان مع حسابات دقيقة لنسبة PG/VG والنكهات والنيكوتين. لا تبدأ من الصفر في كل مرة — احفظ وصفاتك ومنتجاتك المفضلة أو شاركها مع الأصدقاء. يعمل أيضًا بدون اتصال بـ 31 لغة.'
    }
  },
  'ja': {
    meta: { code: 'ja', name: 'Japanese', nativeName: '日本語', currency: 'JPY', currencySymbol: '¥' },
    nav: { menu: 'メニュー', login: 'ログイン', home: 'ホーム' },
    intro: {
      subtitle: 'E-リキッド計算機',
      start_button: '調合を開始',
      disclaimer_title: '免責事項',
      app_description: '正確なPG/VG比率、フレーバー、ニコチン計算による安全なeリキッド調合計算機。毎回ゼロから始めずに、お気に入りのレシピや製品を保存したり、友達と共有したりできます。31言語でオフラインでも動作します。'
    }
  },
  'ko': {
    meta: { code: 'ko', name: 'Korean', nativeName: '한국어', currency: 'KRW', currencySymbol: '₩' },
    nav: { menu: '메뉴', login: '로그인', home: '홈' },
    intro: {
      subtitle: '전자담배액 계산기',
      start_button: '혼합 시작',
      disclaimer_title: '면책 조항',
      app_description: '정확한 PG/VG 비율, 향료 및 니코틴 계산으로 안전한 전자담배액 혼합 계산기. 매번 처음부터 시작하지 마세요 — 좋아하는 레시피와 제품을 저장하거나 친구와 공유하세요. 31개 언어로 오프라인에서도 작동합니다.'
    }
  },
  'zh-CN': {
    meta: { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', currency: 'CNY', currencySymbol: '¥' },
    nav: { menu: '菜单', login: '登录', home: '首页' },
    intro: {
      subtitle: '电子烟油计算器',
      start_button: '开始调配',
      disclaimer_title: '免责声明',
      app_description: '安全电子烟油混合计算器，精确计算PG/VG比例、香料和尼古丁。不必每次从头开始——保存您喜爱的配方和产品，或与朋友分享。支持31种语言离线使用。'
    }
  },
  'zh-TW': {
    meta: { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', currency: 'TWD', currencySymbol: 'NT$' },
    nav: { menu: '選單', login: '登入', home: '首頁' },
    intro: {
      subtitle: '電子煙油計算器',
      start_button: '開始調配',
      disclaimer_title: '免責聲明',
      app_description: '安全電子煙油混合計算器，精確計算PG/VG比例、香料和尼古丁。不必每次從頭開始——保存您喜愛的配方和產品，或與朋友分享。支援31種語言離線使用。'
    }
  },
  'sv': {
    meta: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', currency: 'SEK', currencySymbol: 'kr' },
    nav: { menu: 'Meny', login: 'Logga in', home: 'Hem' },
    intro: {
      subtitle: 'E-VÄTSKA KALKYLATOR',
      start_button: 'BÖRJA BLANDA',
      disclaimer_title: 'Ansvarsfriskrivning',
      app_description: 'Kalkylator för säker e-vätskeblandning med exakta PG/VG-förhållande, smak- och nikotinberäkningar. Börja inte från början varje gång — spara dina favoritrecept och produkter eller dela dem med vänner. Fungerar även offline på 31 språk.'
    }
  },
  'no': {
    meta: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', currency: 'NOK', currencySymbol: 'kr' },
    nav: { menu: 'Meny', login: 'Logg inn', home: 'Hjem' },
    intro: {
      subtitle: 'E-VÆSKE KALKULATOR',
      start_button: 'START BLANDING',
      disclaimer_title: 'Ansvarsfraskrivelse',
      app_description: 'Kalkulator for sikker e-væskeblanding med nøyaktige PG/VG-forhold, smak- og nikotinberegninger. Ikke start fra bunnen av hver gang — lagre favoritoppskriftene og produktene dine eller del dem med venner. Fungerer også offline på 31 språk.'
    }
  },
  'da': {
    meta: { code: 'da', name: 'Danish', nativeName: 'Dansk', currency: 'DKK', currencySymbol: 'kr' },
    nav: { menu: 'Menu', login: 'Log ind', home: 'Hjem' },
    intro: {
      subtitle: 'E-VÆSKE BEREGNER',
      start_button: 'BEGYND AT BLANDE',
      disclaimer_title: 'Ansvarsfraskrivelse',
      app_description: 'Beregner til sikker e-væskeblanding med præcise PG/VG-forhold, smags- og nikotinberegninger. Start ikke fra bunden hver gang — gem dine yndlingsopskrifter og produkter eller del dem med venner. Fungerer også offline på 31 sprog.'
    }
  },
  'fi': {
    meta: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Valikko', login: 'Kirjaudu', home: 'Etusivu' },
    intro: {
      subtitle: 'E-NESTELASKIN',
      start_button: 'ALOITA SEKOITUS',
      disclaimer_title: 'Vastuuvapauslauseke',
      app_description: 'Laskin turvalliseen e-nesteiden sekoittamiseen tarkalla PG/VG-suhteella, maku- ja nikotiinilaskelmilla. Älä aloita joka kerta alusta — tallenna suosikkireseptisi ja tuotteesi tai jaa ne ystäviesi kanssa. Toimii myös offline 31 kielellä.'
    }
  },
  'et': {
    meta: { code: 'et', name: 'Estonian', nativeName: 'Eesti', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menüü', login: 'Logi sisse', home: 'Avaleht' },
    intro: {
      subtitle: 'E-VEDELIKU KALKULAATOR',
      start_button: 'ALUSTA SEGAMIST',
      disclaimer_title: 'Vastutusest loobumine',
      app_description: 'Kalkulaator e-vedelike ohutuks segamiseks täpsete PG/VG suhte, maitse- ja nikotiiniarvutustega. Ärge alustage iga kord nullist — salvestage oma lemmikretseptid ja tooted või jagage neid sõpradega. Töötab ka võrguühenduseta 31 keeles.'
    }
  },
  'lv': {
    meta: { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izvēlne', login: 'Pieslēgties', home: 'Sākums' },
    intro: {
      subtitle: 'E-ŠĶIDRUMA KALKULATORS',
      start_button: 'SĀKT SAJAUKŠANU',
      disclaimer_title: 'Atruna',
      app_description: 'Kalkulators drošai e-šķidruma sajaukšanai ar precīziem PG/VG attiecības, garšas un nikotīna aprēķiniem. Nesāciet katru reizi no nulles — saglabājiet savas mīļākās receptes un produktus vai dalieties ar draugiem. Darbojas arī bezsaistē 31 valodā.'
    }
  },
  'lt': {
    meta: { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Meniu', login: 'Prisijungti', home: 'Pradžia' },
    intro: {
      subtitle: 'E-SKYSČIO SKAIČIUOKLĖ',
      start_button: 'PRADĖTI MAIŠYMĄ',
      disclaimer_title: 'Atsakomybės atsisakymas',
      app_description: 'Skaičiuoklė saugiam e-skysčių maišymui su tiksliais PG/VG santykio, skonio ir nikotino skaičiavimais. Nepradėkite kiekvieną kartą nuo nulio — išsaugokite mėgstamus receptus ir produktus arba pasidalykite su draugais. Veikia ir neprisijungus 31 kalba.'
    }
  }
};

// Deep merge function
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Generate locale files
Object.keys(languages).forEach(langCode => {
  const filePath = path.join(localesDir, `${langCode}.json`);
  const langData = languages[langCode];
  
  // Start with English template
  let newLocale = JSON.parse(JSON.stringify(enTemplate));
  
  // Override with language-specific data
  newLocale = deepMerge(newLocale, langData);
  
  // Write the file
  fs.writeFileSync(filePath, JSON.stringify(newLocale, null, 2) + '\n', 'utf8');
  console.log(`Generated ${langCode}.json`);
});

console.log('\nDone! Generated', Object.keys(languages).length, 'locale files.');

