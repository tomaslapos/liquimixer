/**
 * Generate complete translations for all languages
 * Based on English template with full translations
 * Run with: node scripts/generate-all-translations.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const enTemplate = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// All language translations - complete sets
const allTranslations = {
  // Dutch (nl)
  'nl': {
    meta: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menu', login: 'Inloggen', home: 'Home' },
    auth: {
      login_title: 'Inloggen',
      login_subtitle: 'Log in om toegang te krijgen tot je opgeslagen recepten en producten',
      profile_title: 'Mijn account',
      logout: 'Uitloggen',
      my_recipes: 'Mijn recepten',
      favorite_products: 'Favoriete producten',
      language_label: 'App-taal',
      login_required_title: 'Inloggen vereist',
      login_required_text: 'Log in of registreer om toegang te krijgen tot deze functie.',
      premium_access_title: 'Premium functies',
      premium_access_text: 'Log in of registreer om premium functies te ontgrendelen!',
      login_button: 'Inloggen',
      register_button: 'Registreren',
      pro_required_title: 'PRO-functie',
      pro_required_text: 'Deze functie is alleen beschikbaar voor PRO-abonnees.',
      subscribe_button: 'Abonneer op PRO'
    },
    intro: {
      subtitle: 'E-LIQUID CALCULATOR',
      app_description: 'Calculator voor veilig e-liquid mengen met nauwkeurige PG/VG-verhouding, smaak- en nicotineberekeningen. Begin niet elke keer opnieuw — bewaar je favoriete recepten en producten of deel ze met vrienden. Werkt ook offline in 31 talen.',
      disclaimer_title: 'Disclaimer',
      disclaimer_text: 'Door te klikken op "Begin met mengen", bevestigt de gebruiker minstens 18 jaar oud te zijn. De gebruiker erkent dat LiquiMixer uitsluitend dient als rekenhulpmiddel en geen verantwoordelijkheid aanvaardt voor het eindproduct. De gebruiker draagt volledige verantwoordelijkheid voor correct mengen en veiligheidsprocedures.',
      start_button: 'BEGIN MET MENGEN',
      warning_title: 'Focus op veiligheidsrichtlijnen bij het mengen',
      warning_text: 'Draag altijd beschermende handschoenen en werk in een goed geventileerde ruimte, vooral bij gebruik van nicotine. Gebruik alleen kwaliteitsingrediënten van geverifieerde leveranciers.',
      prep_title: 'Bereid je voor op het mengen:',
      prep_pg: 'Propyleenglycol (PG)', prep_pg_detail: 'Kleurloze vloeistof voor smaakafgifte.',
      prep_vg: 'Plantaardige Glycerine (VG)', prep_vg_detail: 'Dikke vloeistof voor dampproductie.',
      prep_flavors: 'Smaken', prep_flavors_detail: 'Geconcentreerde aroma\'s voor e-liquids.',
      prep_nicotine: 'Nicotine', prep_nicotine_detail: 'Nicotine booster of zout.',
      prep_gloves: 'Handschoenen', prep_gloves_detail: 'Nitril of latex handschoenen.',
      prep_bottle: 'Lege fles', prep_bottle_detail: 'Glazen of plastic fles.',
      prep_dropper: 'Druppelaar', prep_dropper_detail: 'Voor nauwkeurige dosering.',
      prep_measuring: 'Meetgereedschap', prep_measuring_detail: 'Spuiten en meetcilinders.'
    },
    mode_select: {
      title: 'Wat wil je bereiden?',
      liquid_title: 'eLiquid', liquid_desc: 'Complete e-liquid met smaak en nicotine',
      dilute_title: 'Nicotinebasis verdunnen', dilute_desc: 'Basis verdunnen tot gewenste sterkte',
      back: '◀ TERUG'
    },
    form: {
      config_title: 'Mengselconfiguratie',
      tab_liquid: 'Liquid', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Liquid PRO',
      amount_label: 'Hoeveel liquid wil ik mengen?',
      nicotine_base_label: 'Sterkte nicotinebasis?',
      nicotine_none: 'Geen nicotine', nicotine_booster: 'Nicotine booster', nicotine_salt: 'Nicotinezout',
      flavor_label: 'Smaak', flavor_none: 'Geen smaak',
      add_flavor: '+ Smaak toevoegen', remove_flavor: 'Verwijderen',
      vgpg_label: 'VG/PG-verhouding', vg_label: 'VG', pg_label: 'PG',
      back: '◀ TERUG', mix_button: 'MENGEN!'
    },
    results: {
      title: 'Je recept',
      total_volume: 'Totaalvolume:', ratio: 'VG/PG:', nicotine: 'Nicotine:',
      table_component: 'Component', table_volume: 'Volume (ml)', table_drops: 'Druppels', table_percent: '%',
      component_nicotine_booster: 'Nicotine booster', component_nicotine_salt: 'Nicotinezout',
      component_flavor: 'Smaak', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ BEWERKEN', save: 'OPSLAAN'
    },
    recipes: { title: 'Mijn recepten', no_recipes: 'Geen recepten.', back: '◀ TERUG' },
    products: { title: 'Favoriete producten', no_products: 'Geen producten.', add_new: '+ NIEUW', back: '◀ TERUG' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Laden...', error: 'Fout', success: 'Succes', cancel: 'Annuleren', confirm: 'Bevestigen', yes: 'Ja', no: 'Nee' }
  },

  // Japanese (ja)
  'ja': {
    meta: { code: 'ja', name: 'Japanese', nativeName: '日本語', currency: 'JPY', currencySymbol: '¥' },
    nav: { menu: 'メニュー', login: 'ログイン', home: 'ホーム' },
    auth: {
      login_title: 'ログイン',
      login_subtitle: '保存したレシピと製品にアクセスするにはログインしてください',
      profile_title: 'マイアカウント',
      logout: 'ログアウト',
      my_recipes: 'マイレシピ',
      favorite_products: 'お気に入り製品',
      language_label: 'アプリ言語',
      login_required_title: 'ログインが必要です',
      login_required_text: 'この機能にアクセスするにはログインまたは登録してください。',
      login_button: 'ログイン',
      register_button: '登録',
      pro_required_title: 'PRO機能',
      pro_required_text: 'この機能はPRO購読者のみ利用可能です。',
      subscribe_button: 'PROに登録'
    },
    intro: {
      subtitle: 'E-リキッド計算機',
      app_description: 'PG/VG比率、フレーバー、ニコチン計算による安全なe-リキッド調合用計算機。毎回ゼロから始めずに、お気に入りのレシピと製品を保存したり、友人と共有したりできます。31言語でオフラインでも動作します。',
      disclaimer_title: '免責事項',
      disclaimer_text: '「調合開始」ボタンをクリックすることで、ユーザーは18歳以上であることを確認します。LiquiMixerは計算ツールとしてのみ機能し、最終製品に対する責任を負いません。正しい調合と安全手順の遵守はユーザーの責任です。',
      start_button: '調合開始',
      warning_title: '安全ガイドラインに集中してください',
      warning_text: 'ニコチンを使用する際は、常に保護手袋を着用し、換気の良い場所で作業してください。信頼できるサプライヤーの高品質な材料のみを使用してください。',
      prep_title: '調合の準備:',
      prep_pg: 'プロピレングリコール（PG）', prep_pg_detail: 'フレーバー伝達用の無色液体。',
      prep_vg: '植物性グリセリン（VG）', prep_vg_detail: '蒸気生成用の粘性液体。',
      prep_flavors: 'フレーバー', prep_flavors_detail: 'e-リキッド用濃縮アロマ。',
      prep_nicotine: 'ニコチン', prep_nicotine_detail: 'ニコチンブースターまたはソルト。',
      prep_gloves: '手袋', prep_gloves_detail: 'ニトリルまたはラテックス手袋。',
      prep_bottle: '空のボトル', prep_bottle_detail: 'ガラスまたはプラスチックボトル。',
      prep_dropper: 'スポイト', prep_dropper_detail: '正確な計量用。',
      prep_measuring: '計量器具', prep_measuring_detail: 'シリンジとメスシリンダー。'
    },
    mode_select: {
      title: '何を作りますか？',
      liquid_title: 'eリキッド', liquid_desc: 'フレーバーとニコチン入りの完全なe-リキッド',
      dilute_title: 'ニコチンベースを希釈', dilute_desc: 'ベースを希望の濃度に希釈',
      back: '◀ 戻る'
    },
    form: {
      config_title: '調合設定',
      tab_liquid: 'リキッド', tab_shakevape: 'シェイク＆ベイプ', tab_liquidpro: 'リキッド PRO',
      amount_label: '作りたいリキッドの量は？',
      nicotine_base_label: 'ニコチンベースの濃度は？',
      nicotine_none: 'ニコチンなし', nicotine_booster: 'ニコチンブースター', nicotine_salt: 'ニコチンソルト',
      flavor_label: 'フレーバー', flavor_none: 'フレーバーなし',
      add_flavor: '+ フレーバー追加', remove_flavor: '削除',
      vgpg_label: 'VG/PG比率', vg_label: 'VG', pg_label: 'PG',
      back: '◀ 戻る', mix_button: '調合！'
    },
    results: {
      title: 'あなたのレシピ',
      total_volume: '総量:', ratio: 'VG/PG:', nicotine: 'ニコチン:',
      table_component: '成分', table_volume: '量 (ml)', table_drops: '滴', table_percent: '%',
      component_nicotine_booster: 'ニコチンブースター', component_nicotine_salt: 'ニコチンソルト',
      component_flavor: 'フレーバー', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ 編集', save: '保存'
    },
    recipes: { title: 'マイレシピ', no_recipes: 'レシピがありません。', back: '◀ 戻る' },
    products: { title: 'お気に入り製品', no_products: '製品がありません。', add_new: '+ 新規追加', back: '◀ 戻る' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '読み込み中...', error: 'エラー', success: '成功', cancel: 'キャンセル', confirm: '確認', yes: 'はい', no: 'いいえ' }
  },

  // Korean (ko)
  'ko': {
    meta: { code: 'ko', name: 'Korean', nativeName: '한국어', currency: 'KRW', currencySymbol: '₩' },
    nav: { menu: '메뉴', login: '로그인', home: '홈' },
    auth: {
      login_title: '로그인',
      login_subtitle: '저장된 레시피와 제품에 액세스하려면 로그인하세요',
      profile_title: '내 계정',
      logout: '로그아웃',
      my_recipes: '내 레시피',
      favorite_products: '즐겨찾기 제품',
      language_label: '앱 언어',
      login_required_title: '로그인 필요',
      login_required_text: '이 기능에 액세스하려면 로그인 또는 등록하세요.',
      login_button: '로그인',
      register_button: '등록',
      pro_required_title: 'PRO 기능',
      pro_required_text: '이 기능은 PRO 구독자만 사용할 수 있습니다.',
      subscribe_button: 'PRO 구독'
    },
    intro: {
      subtitle: 'E-리퀴드 계산기',
      app_description: 'PG/VG 비율, 향료, 니코틴 계산으로 안전한 e-리퀴드 조합을 위한 계산기. 매번 처음부터 시작하지 마세요 — 좋아하는 레시피와 제품을 저장하거나 친구와 공유하세요. 31개 언어로 오프라인에서도 작동합니다.',
      disclaimer_title: '면책 조항',
      disclaimer_text: '"조합 시작" 버튼을 클릭하면 사용자는 18세 이상임을 확인합니다. LiquiMixer는 계산 도구로만 기능하며 최종 제품에 대한 책임을 지지 않습니다. 올바른 조합과 안전 절차 준수는 사용자의 책임입니다.',
      start_button: '조합 시작',
      warning_title: '안전 지침에 집중하세요',
      warning_text: '니코틴을 사용할 때는 항상 보호 장갑을 착용하고 환기가 잘 되는 곳에서 작업하세요. 검증된 공급업체의 고품질 재료만 사용하세요.',
      prep_title: '조합 준비:',
      prep_pg: '프로필렌 글리콜 (PG)', prep_pg_detail: '향료 전달을 위한 무색 액체.',
      prep_vg: '식물성 글리세린 (VG)', prep_vg_detail: '증기 생성을 위한 점성 액체.',
      prep_flavors: '향료', prep_flavors_detail: 'e-리퀴드용 농축 아로마.',
      prep_nicotine: '니코틴', prep_nicotine_detail: '니코틴 부스터 또는 솔트.',
      prep_gloves: '장갑', prep_gloves_detail: '니트릴 또는 라텍스 장갑.',
      prep_bottle: '빈 병', prep_bottle_detail: '유리 또는 플라스틱 병.',
      prep_dropper: '스포이드', prep_dropper_detail: '정확한 계량용.',
      prep_measuring: '계량 도구', prep_measuring_detail: '주사기와 계량 실린더.'
    },
    mode_select: {
      title: '무엇을 만들까요?',
      liquid_title: 'e리퀴드', liquid_desc: '향료와 니코틴이 포함된 완전한 e-리퀴드',
      dilute_title: '니코틴 베이스 희석', dilute_desc: '베이스를 원하는 농도로 희석',
      back: '◀ 뒤로'
    },
    form: {
      config_title: '조합 설정',
      tab_liquid: '리퀴드', tab_shakevape: '쉐이크 & 베이프', tab_liquidpro: '리퀴드 PRO',
      amount_label: '얼마나 만들까요?',
      nicotine_base_label: '니코틴 베이스 농도는?',
      nicotine_none: '니코틴 없음', nicotine_booster: '니코틴 부스터', nicotine_salt: '니코틴 솔트',
      flavor_label: '향료', flavor_none: '향료 없음',
      add_flavor: '+ 향료 추가', remove_flavor: '제거',
      vgpg_label: 'VG/PG 비율', vg_label: 'VG', pg_label: 'PG',
      back: '◀ 뒤로', mix_button: '조합!'
    },
    results: {
      title: '당신의 레시피',
      total_volume: '총량:', ratio: 'VG/PG:', nicotine: '니코틴:',
      table_component: '구성요소', table_volume: '양 (ml)', table_drops: '방울', table_percent: '%',
      component_nicotine_booster: '니코틴 부스터', component_nicotine_salt: '니코틴 솔트',
      component_flavor: '향료', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ 편집', save: '저장'
    },
    recipes: { title: '내 레시피', no_recipes: '레시피가 없습니다.', back: '◀ 뒤로' },
    products: { title: '즐겨찾기 제품', no_products: '제품이 없습니다.', add_new: '+ 새로 추가', back: '◀ 뒤로' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '로딩 중...', error: '오류', success: '성공', cancel: '취소', confirm: '확인', yes: '예', no: '아니오' }
  },

  // Turkish (tr)
  'tr': {
    meta: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', currency: 'TRY', currencySymbol: '₺' },
    nav: { menu: 'Menü', login: 'Giriş', home: 'Ana Sayfa' },
    auth: {
      login_title: 'Giriş Yap',
      login_subtitle: 'Kayıtlı tariflerinize ve ürünlerinize erişmek için giriş yapın',
      profile_title: 'Hesabım',
      logout: 'Çıkış',
      my_recipes: 'Tariflerim',
      favorite_products: 'Favori Ürünler',
      language_label: 'Uygulama Dili',
      login_required_title: 'Giriş Gerekli',
      login_required_text: 'Bu özelliğe erişmek için giriş yapın veya kayıt olun.',
      login_button: 'Giriş Yap',
      register_button: 'Kayıt Ol',
      pro_required_title: 'PRO Özellik',
      pro_required_text: 'Bu özellik sadece PRO aboneleri için kullanılabilir.',
      subscribe_button: 'PRO\'ya Abone Ol'
    },
    intro: {
      subtitle: 'E-LİKİT HESAPLAYICI',
      app_description: 'PG/VG oranı, aroma ve nikotin hesaplamalarıyla güvenli e-likit karıştırma için hesaplayıcı. Her seferinde sıfırdan başlamayın — favori tariflerinizi ve ürünlerinizi kaydedin veya arkadaşlarınızla paylaşın. 31 dilde çevrimdışı olarak da çalışır.',
      disclaimer_title: 'Feragatname',
      disclaimer_text: '"Karıştırmaya Başla" düğmesine tıklayarak, kullanıcı en az 18 yaşında olduğunu onaylar. Kullanıcı, LiquiMixer\'ın yalnızca bir hesaplama aracı olarak hizmet ettiğini ve nihai üründen sorumlu olmadığını kabul eder. Doğru karıştırma ve güvenlik prosedürlerine uyum kullanıcının sorumluluğundadır.',
      start_button: 'KARIŞTIRMAYA BAŞLA',
      warning_title: 'Karıştırırken güvenlik kurallarına odaklanın',
      warning_text: 'Nikotin kullanırken her zaman koruyucu eldiven giyin ve iyi havalandırılmış bir alanda çalışın. Sadece doğrulanmış tedarikçilerden kaliteli malzemeler kullanın.',
      prep_title: 'Karıştırma hazırlığı:',
      prep_pg: 'Propilen Glikol (PG)', prep_pg_detail: 'Aroma iletimi için renksiz sıvı.',
      prep_vg: 'Bitkisel Gliserin (VG)', prep_vg_detail: 'Buhar üretimi için viskoz sıvı.',
      prep_flavors: 'Aromalar', prep_flavors_detail: 'E-likit için konsantre aromalar.',
      prep_nicotine: 'Nikotin', prep_nicotine_detail: 'Nikotin booster veya tuz.',
      prep_gloves: 'Eldiven', prep_gloves_detail: 'Nitril veya lateks eldiven.',
      prep_bottle: 'Boş şişe', prep_bottle_detail: 'Cam veya plastik şişe.',
      prep_dropper: 'Damlalık', prep_dropper_detail: 'Hassas dozaj için.',
      prep_measuring: 'Ölçüm araçları', prep_measuring_detail: 'Şırıngalar ve ölçü silindirleri.'
    },
    mode_select: {
      title: 'Ne hazırlamak istiyorsunuz?',
      liquid_title: 'eLikit', liquid_desc: 'Aroma ve nikotinli tam e-likit',
      dilute_title: 'Nikotin bazını seyreltin', dilute_desc: 'Bazı istenen konsantrasyona seyreltin',
      back: '◀ GERİ'
    },
    form: {
      config_title: 'Karışım yapılandırması',
      tab_liquid: 'Likit', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Likit PRO',
      amount_label: 'Ne kadar likit karıştırmak istiyorum?',
      nicotine_base_label: 'Nikotin bazı konsantrasyonu?',
      nicotine_none: 'Nikotin yok', nicotine_booster: 'Nikotin booster', nicotine_salt: 'Nikotin tuzu',
      flavor_label: 'Aroma', flavor_none: 'Aroma yok',
      add_flavor: '+ Aroma ekle', remove_flavor: 'Kaldır',
      vgpg_label: 'VG/PG oranı', vg_label: 'VG', pg_label: 'PG',
      back: '◀ GERİ', mix_button: 'KARIŞTIR!'
    },
    results: {
      title: 'Tarifiniz',
      total_volume: 'Toplam hacim:', ratio: 'VG/PG:', nicotine: 'Nikotin:',
      table_component: 'Bileşen', table_volume: 'Hacim (ml)', table_drops: 'Damla', table_percent: '%',
      component_nicotine_booster: 'Nikotin booster', component_nicotine_salt: 'Nikotin tuzu',
      component_flavor: 'Aroma', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ DÜZENLE', save: 'KAYDET'
    },
    recipes: { title: 'Tariflerim', no_recipes: 'Tarif yok.', back: '◀ GERİ' },
    products: { title: 'Favori Ürünler', no_products: 'Ürün yok.', add_new: '+ YENİ EKLE', back: '◀ GERİ' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Yükleniyor...', error: 'Hata', success: 'Başarılı', cancel: 'İptal', confirm: 'Onayla', yes: 'Evet', no: 'Hayır' }
  },

  // Ukrainian (uk)
  'uk': {
    meta: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', currency: 'UAH', currencySymbol: '₴' },
    nav: { menu: 'Меню', login: 'Увійти', home: 'Головна' },
    auth: {
      login_title: 'Вхід',
      login_subtitle: 'Увійдіть, щоб отримати доступ до збережених рецептів і продуктів',
      profile_title: 'Мій акаунт',
      logout: 'Вийти',
      my_recipes: 'Мої рецепти',
      favorite_products: 'Улюблені продукти',
      language_label: 'Мова додатку',
      login_required_title: 'Потрібен вхід',
      login_required_text: 'Увійдіть або зареєструйтеся, щоб отримати доступ до цієї функції.',
      login_button: 'Увійти',
      register_button: 'Зареєструватися',
      pro_required_title: 'PRO функція',
      pro_required_text: 'Ця функція доступна лише для PRO підписників.',
      subscribe_button: 'Підписатися на PRO'
    },
    intro: {
      subtitle: 'КАЛЬКУЛЯТОР Е-РІДИН',
      app_description: 'Калькулятор для безпечного змішування е-рідин з точним розрахунком співвідношення PG/VG, ароматизаторів і нікотину. Не починайте щоразу спочатку — зберігайте улюблені рецепти та продукти або діліться ними з друзями. Працює офлайн на 31 мові.',
      disclaimer_title: 'Застереження',
      disclaimer_text: 'Натискаючи кнопку "Почати змішування", користувач підтверджує, що йому виповнилося 18 років. Користувач визнає, що LiquiMixer слугує лише як розрахунковий інструмент і не несе відповідальності за кінцевий продукт. Відповідальність за правильне змішування та дотримання заходів безпеки несе користувач.',
      start_button: 'ПОЧАТИ ЗМІШУВАННЯ',
      warning_title: 'Зосередьтеся на правилах безпеки',
      warning_text: 'При використанні нікотину завжди надягайте захисні рукавички та працюйте в добре провітрюваному приміщенні. Використовуйте лише якісні інгредієнти від перевірених постачальників.',
      prep_title: 'Підготовка до змішування:',
      prep_pg: 'Пропіленгліколь (PG)', prep_pg_detail: 'Безбарвна рідина для передачі смаку.',
      prep_vg: 'Рослинний гліцерин (VG)', prep_vg_detail: 'В\'язка рідина для утворення пари.',
      prep_flavors: 'Ароматизатори', prep_flavors_detail: 'Концентровані ароми для е-рідин.',
      prep_nicotine: 'Нікотин', prep_nicotine_detail: 'Нікотиновий бустер або сіль.',
      prep_gloves: 'Рукавички', prep_gloves_detail: 'Нітрилові або латексні рукавички.',
      prep_bottle: 'Порожня пляшка', prep_bottle_detail: 'Скляна або пластикова пляшка.',
      prep_dropper: 'Піпетка', prep_dropper_detail: 'Для точного дозування.',
      prep_measuring: 'Вимірювальні інструменти', prep_measuring_detail: 'Шприци та мірні циліндри.'
    },
    mode_select: {
      title: 'Що ви хочете приготувати?',
      liquid_title: 'еЛіквід', liquid_desc: 'Повна е-рідина з ароматом і нікотином',
      dilute_title: 'Розбавити нікотинову базу', dilute_desc: 'Розбавити базу до потрібної концентрації',
      back: '◀ НАЗАД'
    },
    form: {
      config_title: 'Конфігурація суміші',
      tab_liquid: 'Рідина', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Рідина PRO',
      amount_label: 'Скільки рідини я хочу змішати?',
      nicotine_base_label: 'Концентрація нікотинової бази?',
      nicotine_none: 'Без нікотину', nicotine_booster: 'Нікотиновий бустер', nicotine_salt: 'Нікотинова сіль',
      flavor_label: 'Ароматизатор', flavor_none: 'Без ароматизатора',
      add_flavor: '+ Додати аромат', remove_flavor: 'Видалити',
      vgpg_label: 'Співвідношення VG/PG', vg_label: 'VG', pg_label: 'PG',
      back: '◀ НАЗАД', mix_button: 'ЗМІШАТИ!'
    },
    results: {
      title: 'Ваш рецепт',
      total_volume: 'Загальний об\'єм:', ratio: 'VG/PG:', nicotine: 'Нікотин:',
      table_component: 'Компонент', table_volume: 'Об\'єм (мл)', table_drops: 'Краплі', table_percent: '%',
      component_nicotine_booster: 'Нікотиновий бустер', component_nicotine_salt: 'Нікотинова сіль',
      component_flavor: 'Ароматизатор', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ РЕДАГУВАТИ', save: 'ЗБЕРЕГТИ'
    },
    recipes: { title: 'Мої рецепти', no_recipes: 'Немає рецептів.', back: '◀ НАЗАД' },
    products: { title: 'Улюблені продукти', no_products: 'Немає продуктів.', add_new: '+ ДОДАТИ', back: '◀ НАЗАД' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Завантаження...', error: 'Помилка', success: 'Успіх', cancel: 'Скасувати', confirm: 'Підтвердити', yes: 'Так', no: 'Ні' }
  },

  // Russian (ru)
  'ru': {
    meta: { code: 'ru', name: 'Russian', nativeName: 'Русский', currency: 'RUB', currencySymbol: '₽' },
    nav: { menu: 'Меню', login: 'Войти', home: 'Главная' },
    auth: {
      login_title: 'Вход',
      login_subtitle: 'Войдите, чтобы получить доступ к сохранённым рецептам и продуктам',
      profile_title: 'Мой аккаунт',
      logout: 'Выйти',
      my_recipes: 'Мои рецепты',
      favorite_products: 'Избранные продукты',
      language_label: 'Язык приложения',
      login_required_title: 'Требуется вход',
      login_required_text: 'Войдите или зарегистрируйтесь для доступа к этой функции.',
      login_button: 'Войти',
      register_button: 'Зарегистрироваться',
      pro_required_title: 'PRO функция',
      pro_required_text: 'Эта функция доступна только для PRO подписчиков.',
      subscribe_button: 'Подписаться на PRO'
    },
    intro: {
      subtitle: 'КАЛЬКУЛЯТОР Е-ЖИДКОСТЕЙ',
      app_description: 'Калькулятор для безопасного смешивания е-жидкостей с точным расчётом соотношения PG/VG, ароматизаторов и никотина. Не начинайте каждый раз с нуля — сохраняйте любимые рецепты и продукты или делитесь ими с друзьями. Работает офлайн на 31 языке.',
      disclaimer_title: 'Предупреждение',
      disclaimer_text: 'Нажимая кнопку "Начать смешивание", пользователь подтверждает, что ему исполнилось 18 лет. Пользователь признаёт, что LiquiMixer служит только как расчётный инструмент и не несёт ответственности за конечный продукт. Ответственность за правильное смешивание и соблюдение мер безопасности несёт пользователь.',
      start_button: 'НАЧАТЬ СМЕШИВАНИЕ',
      warning_title: 'Сосредоточьтесь на правилах безопасности',
      warning_text: 'При использовании никотина всегда надевайте защитные перчатки и работайте в хорошо проветриваемом помещении. Используйте только качественные ингредиенты от проверенных поставщиков.',
      prep_title: 'Подготовка к смешиванию:',
      prep_pg: 'Пропиленгликоль (PG)', prep_pg_detail: 'Бесцветная жидкость для передачи вкуса.',
      prep_vg: 'Растительный глицерин (VG)', prep_vg_detail: 'Вязкая жидкость для образования пара.',
      prep_flavors: 'Ароматизаторы', prep_flavors_detail: 'Концентрированные ароматы для е-жидкостей.',
      prep_nicotine: 'Никотин', prep_nicotine_detail: 'Никотиновый бустер или соль.',
      prep_gloves: 'Перчатки', prep_gloves_detail: 'Нитриловые или латексные перчатки.',
      prep_bottle: 'Пустая бутылка', prep_bottle_detail: 'Стеклянная или пластиковая бутылка.',
      prep_dropper: 'Пипетка', prep_dropper_detail: 'Для точного дозирования.',
      prep_measuring: 'Измерительные инструменты', prep_measuring_detail: 'Шприцы и мерные цилиндры.'
    },
    mode_select: {
      title: 'Что вы хотите приготовить?',
      liquid_title: 'еЛиквид', liquid_desc: 'Полная е-жидкость с ароматом и никотином',
      dilute_title: 'Разбавить никотиновую базу', dilute_desc: 'Разбавить базу до нужной концентрации',
      back: '◀ НАЗАД'
    },
    form: {
      config_title: 'Конфигурация смеси',
      tab_liquid: 'Жидкость', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Жидкость PRO',
      amount_label: 'Сколько жидкости я хочу смешать?',
      nicotine_base_label: 'Концентрация никотиновой базы?',
      nicotine_none: 'Без никотина', nicotine_booster: 'Никотиновый бустер', nicotine_salt: 'Никотиновая соль',
      flavor_label: 'Ароматизатор', flavor_none: 'Без ароматизатора',
      add_flavor: '+ Добавить аромат', remove_flavor: 'Удалить',
      vgpg_label: 'Соотношение VG/PG', vg_label: 'VG', pg_label: 'PG',
      back: '◀ НАЗАД', mix_button: 'СМЕШАТЬ!'
    },
    results: {
      title: 'Ваш рецепт',
      total_volume: 'Общий объём:', ratio: 'VG/PG:', nicotine: 'Никотин:',
      table_component: 'Компонент', table_volume: 'Объём (мл)', table_drops: 'Капли', table_percent: '%',
      component_nicotine_booster: 'Никотиновый бустер', component_nicotine_salt: 'Никотиновая соль',
      component_flavor: 'Ароматизатор', component_vg: 'VG', component_pg: 'PG',
      edit: '◀ РЕДАКТИРОВАТЬ', save: 'СОХРАНИТЬ'
    },
    recipes: { title: 'Мои рецепты', no_recipes: 'Нет рецептов.', back: '◀ НАЗАД' },
    products: { title: 'Избранные продукты', no_products: 'Нет продуктов.', add_new: '+ ДОБАВИТЬ', back: '◀ НАЗАД' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Загрузка...', error: 'Ошибка', success: 'Успех', cancel: 'Отмена', confirm: 'Подтвердить', yes: 'Да', no: 'Нет' }
  },

  // Swedish (sv)
  'sv': {
    meta: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', currency: 'SEK', currencySymbol: 'kr' },
    nav: { menu: 'Meny', login: 'Logga in', home: 'Hem' },
    intro: {
      subtitle: 'E-VÄTSKEKALKYLATOR',
      app_description: 'Kalkylator för säker e-vätskeblandning med exakt PG/VG-förhållande, smak- och nikotinberäkningar. Börja inte om varje gång — spara dina favoritrecept och produkter eller dela dem med vänner. Fungerar även offline på 31 språk.',
      disclaimer_title: 'Friskrivning',
      disclaimer_text: 'Genom att klicka på "Börja blanda" bekräftar användaren att hen är minst 18 år. Användaren erkänner att LiquiMixer endast fungerar som ett beräkningsverktyg och inte tar ansvar för slutprodukten. Användaren bär fullt ansvar för korrekt blandning och säkerhetsrutiner.',
      start_button: 'BÖRJA BLANDA',
      warning_title: 'Fokusera på säkerhetsriktlinjer',
      warning_text: 'Bär alltid skyddshandskar och arbeta i välventilerat utrymme när du använder nikotin.',
      prep_title: 'Förbered för blandning:'
    },
    mode_select: { title: 'Vad vill du förbereda?', liquid_title: 'eVätska', dilute_title: 'Späd nikotinbas', back: '◀ TILLBAKA' },
    form: { config_title: 'Blandningskonfiguration', amount_label: 'Hur mycket vill jag blanda?', back: '◀ TILLBAKA', mix_button: 'BLANDA!' },
    results: { title: 'Ditt recept', edit: '◀ REDIGERA', save: 'SPARA' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Laddar...', error: 'Fel', success: 'Lyckat', cancel: 'Avbryt', confirm: 'Bekräfta', yes: 'Ja', no: 'Nej' }
  },

  // Danish (da)
  'da': {
    meta: { code: 'da', name: 'Danish', nativeName: 'Dansk', currency: 'DKK', currencySymbol: 'kr' },
    nav: { menu: 'Menu', login: 'Log ind', home: 'Hjem' },
    intro: {
      subtitle: 'E-VÆSKE BEREGNER',
      app_description: 'Beregner til sikker e-væske blanding med præcis PG/VG-forhold, smags- og nikotinberegninger. Start ikke forfra hver gang — gem dine favoritopskrifter og produkter eller del dem med venner. Fungerer også offline på 31 sprog.',
      disclaimer_title: 'Ansvarsfraskrivelse',
      disclaimer_text: 'Ved at klikke på "Start blanding" bekræfter brugeren at være mindst 18 år. Brugeren anerkender at LiquiMixer kun fungerer som beregningsværktøj og ikke påtager sig ansvar for slutproduktet. Brugeren bærer fuldt ansvar for korrekt blanding og sikkerhedsprocedurer.',
      start_button: 'START BLANDING',
      warning_title: 'Fokuser på sikkerhedsretningslinjer',
      warning_text: 'Bær altid beskyttelseshandsker og arbejd i velventileret område ved brug af nikotin.',
      prep_title: 'Forbered til blanding:'
    },
    mode_select: { title: 'Hvad vil du forberede?', liquid_title: 'eVæske', dilute_title: 'Fortyn nikotinbase', back: '◀ TILBAGE' },
    form: { config_title: 'Blandingskonfiguration', amount_label: 'Hvor meget vil jeg blande?', back: '◀ TILBAGE', mix_button: 'BLAND!' },
    results: { title: 'Din opskrift', edit: '◀ REDIGER', save: 'GEM' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Indlæser...', error: 'Fejl', success: 'Succes', cancel: 'Annuller', confirm: 'Bekræft', yes: 'Ja', no: 'Nej' }
  },

  // Norwegian (no)
  'no': {
    meta: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', currency: 'NOK', currencySymbol: 'kr' },
    nav: { menu: 'Meny', login: 'Logg inn', home: 'Hjem' },
    intro: {
      subtitle: 'E-VÆSKE KALKULATOR',
      app_description: 'Kalkulator for sikker e-væskeblanding med nøyaktig PG/VG-forhold, smaks- og nikotinberegninger. Ikke start fra bunnen hver gang — lagre favorittoppskrifter og produkter eller del dem med venner. Fungerer også offline på 31 språk.',
      disclaimer_title: 'Ansvarsfraskrivelse',
      disclaimer_text: 'Ved å klikke på "Start blanding" bekrefter brukeren å være minst 18 år. Brukeren erkjenner at LiquiMixer kun fungerer som beregningsverktøy og ikke påtar seg ansvar for sluttproduktet. Brukeren bærer fullt ansvar for korrekt blanding og sikkerhetsprosedyrer.',
      start_button: 'START BLANDING',
      warning_title: 'Fokuser på sikkerhetsretningslinjer',
      warning_text: 'Bruk alltid beskyttelseshansker og arbeid i godt ventilert område ved bruk av nikotin.',
      prep_title: 'Forbered til blanding:'
    },
    mode_select: { title: 'Hva vil du forberede?', liquid_title: 'eVæske', dilute_title: 'Fortynn nikotinbase', back: '◀ TILBAKE' },
    form: { config_title: 'Blandingskonfigurasjon', amount_label: 'Hvor mye vil jeg blande?', back: '◀ TILBAKE', mix_button: 'BLAND!' },
    results: { title: 'Din oppskrift', edit: '◀ REDIGER', save: 'LAGRE' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Laster...', error: 'Feil', success: 'Suksess', cancel: 'Avbryt', confirm: 'Bekreft', yes: 'Ja', no: 'Nei' }
  },

  // Finnish (fi)
  'fi': {
    meta: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Valikko', login: 'Kirjaudu', home: 'Koti' },
    intro: {
      subtitle: 'E-NESTELASKIN',
      app_description: 'Laskin turvalliseen e-nesteiden sekoittamiseen tarkalla PG/VG-suhteen, makujen ja nikotiinin laskennalla. Älä aloita alusta joka kerta — tallenna suosikkireseptit ja tuotteet tai jaa ne ystävien kanssa. Toimii myös offline 31 kielellä.',
      disclaimer_title: 'Vastuuvapauslauseke',
      disclaimer_text: 'Klikkaamalla "Aloita sekoitus" käyttäjä vahvistaa olevansa vähintään 18-vuotias. Käyttäjä ymmärtää, että LiquiMixer toimii vain laskutyökaluna eikä ota vastuuta lopputuotteesta. Käyttäjä kantaa täyden vastuun oikeasta sekoittamisesta ja turvallisuusmenettelyistä.',
      start_button: 'ALOITA SEKOITUS',
      warning_title: 'Keskity turvallisuusohjeisiin',
      warning_text: 'Käytä aina suojakäsineitä ja työskentele hyvin tuuletetussa tilassa käyttäessäsi nikotiinia.',
      prep_title: 'Valmistaudu sekoitukseen:'
    },
    mode_select: { title: 'Mitä haluat valmistaa?', liquid_title: 'eNeste', dilute_title: 'Laimenna nikotiinipohja', back: '◀ TAKAISIN' },
    form: { config_title: 'Sekoituskonfiguraatio', amount_label: 'Kuinka paljon haluan sekoittaa?', back: '◀ TAKAISIN', mix_button: 'SEKOITA!' },
    results: { title: 'Reseptisi', edit: '◀ MUOKKAA', save: 'TALLENNA' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Ladataan...', error: 'Virhe', success: 'Onnistui', cancel: 'Peruuta', confirm: 'Vahvista', yes: 'Kyllä', no: 'Ei' }
  },

  // Greek (el)
  'el': {
    meta: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Μενού', login: 'Σύνδεση', home: 'Αρχική' },
    intro: {
      subtitle: 'ΥΠΟΛΟΓΙΣΤΗΣ E-ΥΓΡΩΝ',
      app_description: 'Υπολογιστής για ασφαλή ανάμειξη e-υγρών με ακριβή υπολογισμό αναλογίας PG/VG, αρωμάτων και νικοτίνης. Μην ξεκινάτε από την αρχή κάθε φορά — αποθηκεύστε αγαπημένες συνταγές και προϊόντα ή μοιραστείτε τα με φίλους. Λειτουργεί και offline σε 31 γλώσσες.',
      disclaimer_title: 'Αποποίηση Ευθύνης',
      disclaimer_text: 'Κάνοντας κλικ στο "Έναρξη ανάμειξης", ο χρήστης επιβεβαιώνει ότι είναι τουλάχιστον 18 ετών. Ο χρήστης αναγνωρίζει ότι το LiquiMixer λειτουργεί μόνο ως εργαλείο υπολογισμού και δεν αναλαμβάνει ευθύνη για το τελικό προϊόν. Ο χρήστης φέρει πλήρη ευθύνη για τη σωστή ανάμειξη και τις διαδικασίες ασφαλείας.',
      start_button: 'ΕΝΑΡΞΗ ΑΝΑΜΕΙΞΗΣ',
      warning_title: 'Εστιάστε στις οδηγίες ασφαλείας',
      warning_text: 'Φοράτε πάντα προστατευτικά γάντια και εργάζεστε σε καλά αεριζόμενο χώρο όταν χρησιμοποιείτε νικοτίνη.',
      prep_title: 'Προετοιμασία για ανάμειξη:'
    },
    mode_select: { title: 'Τι θέλετε να ετοιμάσετε;', liquid_title: 'eΥγρό', dilute_title: 'Αραίωση βάσης νικοτίνης', back: '◀ ΠΙΣΩ' },
    form: { config_title: 'Διαμόρφωση μείγματος', amount_label: 'Πόσο υγρό θέλω να αναμείξω;', back: '◀ ΠΙΣΩ', mix_button: 'ΑΝΑΜΕΙΞΗ!' },
    results: { title: 'Η συνταγή σας', edit: '◀ ΕΠΕΞΕΡΓΑΣΙΑ', save: 'ΑΠΟΘΗΚΕΥΣΗ' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Φόρτωση...', error: 'Σφάλμα', success: 'Επιτυχία', cancel: 'Ακύρωση', confirm: 'Επιβεβαίωση', yes: 'Ναι', no: 'Όχι' }
  },

  // Arabic (ar-SA)
  'ar-SA': {
    meta: { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', currency: 'SAR', currencySymbol: 'ر.س' },
    nav: { menu: 'القائمة', login: 'تسجيل الدخول', home: 'الرئيسية' },
    intro: {
      subtitle: 'حاسبة السوائل الإلكترونية',
      app_description: 'حاسبة لخلط السوائل الإلكترونية بأمان مع حساب دقيق لنسبة PG/VG والنكهات والنيكوتين. لا تبدأ من الصفر في كل مرة — احفظ وصفاتك ومنتجاتك المفضلة أو شاركها مع الأصدقاء. تعمل أيضًا بدون اتصال بـ 31 لغة.',
      disclaimer_title: 'إخلاء المسؤولية',
      disclaimer_text: 'بالنقر على "بدء الخلط"، يؤكد المستخدم أنه يبلغ 18 عامًا على الأقل. يقر المستخدم بأن LiquiMixer يعمل فقط كأداة حساب ولا يتحمل مسؤولية المنتج النهائي. يتحمل المستخدم المسؤولية الكاملة عن الخلط الصحيح وإجراءات السلامة.',
      start_button: 'بدء الخلط',
      warning_title: 'ركز على إرشادات السلامة',
      warning_text: 'ارتدِ دائمًا قفازات واقية واعمل في مكان جيد التهوية عند استخدام النيكوتين.',
      prep_title: 'التحضير للخلط:'
    },
    mode_select: { title: 'ماذا تريد أن تحضر؟', liquid_title: 'سائل إلكتروني', dilute_title: 'تخفيف قاعدة النيكوتين', back: '◀ رجوع' },
    form: { config_title: 'إعدادات الخلط', amount_label: 'كم أريد أن أخلط؟', back: '◀ رجوع', mix_button: 'اخلط!' },
    results: { title: 'وصفتك', edit: '◀ تعديل', save: 'حفظ' },
    common: { ml: 'مل', mg_ml: 'مغ/مل', percent: '%', close: '✕', loading: 'جاري التحميل...', error: 'خطأ', success: 'نجاح', cancel: 'إلغاء', confirm: 'تأكيد', yes: 'نعم', no: 'لا' }
  },

  // Simplified Chinese (zh-CN)
  'zh-CN': {
    meta: { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', currency: 'CNY', currencySymbol: '¥' },
    nav: { menu: '菜单', login: '登录', home: '首页' },
    intro: {
      subtitle: '电子烟油计算器',
      app_description: '安全调配电子烟油的计算器，精确计算PG/VG比例、香精和尼古丁。不必每次从头开始——保存您喜爱的配方和产品，或与朋友分享。支持31种语言离线使用。',
      disclaimer_title: '免责声明',
      disclaimer_text: '点击"开始调配"即表示用户确认已年满18岁。用户确认LiquiMixer仅作为计算工具使用，不对最终产品承担责任。用户对正确调配和安全程序负全部责任。',
      start_button: '开始调配',
      warning_title: '请注意安全指南',
      warning_text: '使用尼古丁时，请始终佩戴防护手套并在通风良好的地方工作。',
      prep_title: '调配准备：'
    },
    mode_select: { title: '您想制作什么？', liquid_title: '电子烟油', dilute_title: '稀释尼古丁基底', back: '◀ 返回' },
    form: { config_title: '调配配置', amount_label: '我想调配多少？', back: '◀ 返回', mix_button: '调配！' },
    results: { title: '您的配方', edit: '◀ 编辑', save: '保存' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '加载中...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', yes: '是', no: '否' }
  },

  // Traditional Chinese (zh-TW)
  'zh-TW': {
    meta: { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', currency: 'TWD', currencySymbol: 'NT$' },
    nav: { menu: '選單', login: '登入', home: '首頁' },
    intro: {
      subtitle: '電子煙油計算器',
      app_description: '安全調配電子煙油的計算器，精確計算PG/VG比例、香精和尼古丁。不必每次從頭開始——儲存您喜愛的配方和產品，或與朋友分享。支援31種語言離線使用。',
      disclaimer_title: '免責聲明',
      disclaimer_text: '點擊「開始調配」即表示使用者確認已年滿18歲。使用者確認LiquiMixer僅作為計算工具使用，不對最終產品承擔責任。使用者對正確調配和安全程序負全部責任。',
      start_button: '開始調配',
      warning_title: '請注意安全指南',
      warning_text: '使用尼古丁時，請始終佩戴防護手套並在通風良好的地方工作。',
      prep_title: '調配準備：'
    },
    mode_select: { title: '您想製作什麼？', liquid_title: '電子煙油', dilute_title: '稀釋尼古丁基底', back: '◀ 返回' },
    form: { config_title: '調配配置', amount_label: '我想調配多少？', back: '◀ 返回', mix_button: '調配！' },
    results: { title: '您的配方', edit: '◀ 編輯', save: '儲存' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '載入中...', error: '錯誤', success: '成功', cancel: '取消', confirm: '確認', yes: '是', no: '否' }
  },

  // Hungarian (hu)
  'hu': {
    meta: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', currency: 'HUF', currencySymbol: 'Ft' },
    nav: { menu: 'Menü', login: 'Bejelentkezés', home: 'Főoldal' },
    intro: {
      subtitle: 'E-FOLYADÉK KALKULÁTOR',
      app_description: 'Kalkulátor a biztonságos e-folyadék keveréshez pontos PG/VG arány, íz- és nikotinszámítással. Ne kezdje mindig elölről — mentse el kedvenc receptjeit és termékeit, vagy ossza meg barátaival. 31 nyelven offline is működik.',
      disclaimer_title: 'Jogi nyilatkozat',
      disclaimer_text: 'A "Keverés indítása" gombra kattintva a felhasználó megerősíti, hogy elmúlt 18 éves. A felhasználó tudomásul veszi, hogy a LiquiMixer kizárólag számítási eszközként működik, és nem vállal felelősséget a végtermékért. A megfelelő keverésért és a biztonsági eljárások betartásáért a felhasználó felel.',
      start_button: 'KEVERÉS INDÍTÁSA',
      warning_title: 'Fókuszáljon a biztonsági irányelvekre',
      warning_text: 'Nikotin használatakor mindig viseljen védőkesztyűt és jól szellőző helyen dolgozzon.',
      prep_title: 'Felkészülés a keverésre:'
    },
    mode_select: { title: 'Mit szeretne készíteni?', liquid_title: 'eFolyadék', dilute_title: 'Nikotinalap hígítása', back: '◀ VISSZA' },
    form: { config_title: 'Keverési konfiguráció', amount_label: 'Mennyi folyadékot szeretnék keverni?', back: '◀ VISSZA', mix_button: 'KEVERÉS!' },
    results: { title: 'Az Ön receptje', edit: '◀ SZERKESZTÉS', save: 'MENTÉS' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Betöltés...', error: 'Hiba', success: 'Sikeres', cancel: 'Mégse', confirm: 'Megerősítés', yes: 'Igen', no: 'Nem' }
  },

  // Estonian (et)
  'et': {
    meta: { code: 'et', name: 'Estonian', nativeName: 'Eesti', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menüü', login: 'Logi sisse', home: 'Avaleht' },
    intro: {
      subtitle: 'E-VEDELIKU KALKULAATOR',
      app_description: 'Kalkulaator ohutuks e-vedeliku segamiseks täpse PG/VG suhte, maitse- ja nikotiiniarvutusega. Ärge alustage iga kord otsast — salvestage lemmikud retseptid ja tooted või jagage neid sõpradega. Töötab võrguühenduseta 31 keeles.',
      disclaimer_title: 'Vastutusest loobumine',
      disclaimer_text: 'Klõpsates "Alusta segamist", kinnitab kasutaja, et on vähemalt 18-aastane. Kasutaja tunnistab, et LiquiMixer toimib ainult arvutustööriistana ega võta vastutust lõpptoote eest. Kasutaja kannab täielikku vastutust õige segamise ja ohutusprotseduuride eest.',
      start_button: 'ALUSTA SEGAMIST',
      warning_title: 'Keskenduge ohutusjuhistele',
      warning_text: 'Nikotiini kasutamisel kandke alati kaitsekindaid ja töötage hästi ventileeritud kohas.',
      prep_title: 'Ettevalmistus segamiseks:'
    },
    mode_select: { title: 'Mida soovite valmistada?', liquid_title: 'eVedelik', dilute_title: 'Lahjenda nikotiinibaasi', back: '◀ TAGASI' },
    form: { config_title: 'Segu seadistamine', amount_label: 'Kui palju vedelikku soovin segada?', back: '◀ TAGASI', mix_button: 'SEGA!' },
    results: { title: 'Teie retsept', edit: '◀ MUUDA', save: 'SALVESTA' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Laadimine...', error: 'Viga', success: 'Õnnestus', cancel: 'Tühista', confirm: 'Kinnita', yes: 'Jah', no: 'Ei' }
  },

  // Latvian (lv)
  'lv': {
    meta: { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izvēlne', login: 'Ieiet', home: 'Sākums' },
    intro: {
      subtitle: 'E-ŠĶIDRUMA KALKULATORS',
      app_description: 'Kalkulators drošai e-šķidruma sajaukšanai ar precīzu PG/VG attiecību, garšas un nikotīna aprēķiniem. Nesāciet katru reizi no nulles — saglabājiet iecienītās receptes un produktus vai dalieties ar draugiem. Darbojas arī bezsaistē 31 valodā.',
      disclaimer_title: 'Atruna',
      disclaimer_text: 'Noklikšķinot uz "Sākt sajaukšanu", lietotājs apstiprina, ka ir vismaz 18 gadus vecs. Lietotājs atzīst, ka LiquiMixer darbojas tikai kā aprēķinu rīks un neuzņemas atbildību par gala produktu. Lietotājs uzņemas pilnu atbildību par pareizu sajaukšanu un drošības procedūrām.',
      start_button: 'SĀKT SAJAUKŠANU',
      warning_title: 'Koncentrējieties uz drošības vadlīnijām',
      warning_text: 'Izmantojot nikotīnu, vienmēr valkājiet aizsargcimdus un strādājiet labi vēdināmā telpā.',
      prep_title: 'Sagatavošanās sajaukšanai:'
    },
    mode_select: { title: 'Ko vēlaties sagatavot?', liquid_title: 'eŠķidrums', dilute_title: 'Atšķaidīt nikotīna bāzi', back: '◀ ATPAKAĻ' },
    form: { config_title: 'Maisījuma konfigurācija', amount_label: 'Cik daudz šķidruma vēlos sajaukt?', back: '◀ ATPAKAĻ', mix_button: 'SAJAUC!' },
    results: { title: 'Jūsu recepte', edit: '◀ REDIĢĒT', save: 'SAGLABĀT' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Ielādē...', error: 'Kļūda', success: 'Izdevās', cancel: 'Atcelt', confirm: 'Apstiprināt', yes: 'Jā', no: 'Nē' }
  },

  // Lithuanian (lt)
  'lt': {
    meta: { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Meniu', login: 'Prisijungti', home: 'Pagrindinis' },
    intro: {
      subtitle: 'E-SKYSČIO SKAIČIUOKLĖ',
      app_description: 'Skaičiuoklė saugiam e-skysčio maišymui su tiksliu PG/VG santykio, skonio ir nikotino skaičiavimu. Nepradėkite kaskart iš naujo — išsaugokite mėgstamus receptus ir produktus arba dalinkitės su draugais. Veikia ir neprisijungus 31 kalba.',
      disclaimer_title: 'Atsisakymas',
      disclaimer_text: 'Paspausdamas „Pradėti maišymą", vartotojas patvirtina, kad jam yra bent 18 metų. Vartotojas pripažįsta, kad LiquiMixer veikia tik kaip skaičiavimo įrankis ir neprisiima atsakomybės už galutinį produktą. Vartotojas prisiima visą atsakomybę už tinkamą maišymą ir saugos procedūras.',
      start_button: 'PRADĖTI MAIŠYMĄ',
      warning_title: 'Sutelkite dėmesį į saugos gaires',
      warning_text: 'Naudodami nikotiną, visada mūvėkite apsaugines pirštines ir dirbkite gerai vėdinamoje patalpoje.',
      prep_title: 'Pasiruošimas maišymui:'
    },
    mode_select: { title: 'Ką norite paruošti?', liquid_title: 'eSkystis', dilute_title: 'Praskiesti nikotino bazę', back: '◀ ATGAL' },
    form: { config_title: 'Mišinio konfigūracija', amount_label: 'Kiek skysčio noriu sumaišyti?', back: '◀ ATGAL', mix_button: 'MAIŠYTI!' },
    results: { title: 'Jūsų receptas', edit: '◀ REDAGUOTI', save: 'IŠSAUGOTI' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Kraunama...', error: 'Klaida', success: 'Sėkmė', cancel: 'Atšaukti', confirm: 'Patvirtinti', yes: 'Taip', no: 'Ne' }
  },

  // Romanian (ro)
  'ro': {
    meta: { code: 'ro', name: 'Romanian', nativeName: 'Română', currency: 'RON', currencySymbol: 'lei' },
    nav: { menu: 'Meniu', login: 'Autentificare', home: 'Acasă' },
    intro: {
      subtitle: 'CALCULATOR E-LICHID',
      app_description: 'Calculator pentru amestecarea sigură a e-lichidelor cu calcul precis al raportului PG/VG, aromelor și nicotinei. Nu începeți de la zero de fiecare dată — salvați rețetele și produsele preferate sau împărțiți-le cu prietenii. Funcționează și offline în 31 de limbi.',
      disclaimer_title: 'Declinare de responsabilitate',
      disclaimer_text: 'Făcând clic pe "Începe amestecarea", utilizatorul confirmă că are cel puțin 18 ani. Utilizatorul recunoaște că LiquiMixer funcționează doar ca instrument de calcul și nu își asumă responsabilitatea pentru produsul final. Utilizatorul poartă întreaga responsabilitate pentru amestecarea corectă și procedurile de siguranță.',
      start_button: 'ÎNCEPE AMESTECAREA',
      warning_title: 'Concentrați-vă pe liniile directoare de siguranță',
      warning_text: 'Când folosiți nicotină, purtați întotdeauna mănuși de protecție și lucrați într-un spațiu bine ventilat.',
      prep_title: 'Pregătire pentru amestecare:'
    },
    mode_select: { title: 'Ce doriți să preparați?', liquid_title: 'eLichid', dilute_title: 'Diluați baza de nicotină', back: '◀ ÎNAPOI' },
    form: { config_title: 'Configurare amestec', amount_label: 'Cât lichid vreau să amestec?', back: '◀ ÎNAPOI', mix_button: 'AMESTECĂ!' },
    results: { title: 'Rețeta dvs.', edit: '◀ EDITARE', save: 'SALVEAZĂ' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Se încarcă...', error: 'Eroare', success: 'Succes', cancel: 'Anulează', confirm: 'Confirmă', yes: 'Da', no: 'Nu' }
  },

  // Croatian (hr)
  'hr': {
    meta: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izbornik', login: 'Prijava', home: 'Početna' },
    intro: {
      subtitle: 'KALKULATOR E-TEKUĆINE',
      app_description: 'Kalkulator za sigurno miješanje e-tekućina s preciznim izračunom omjera PG/VG, aroma i nikotina. Ne počinjite svaki put ispočetka — spremite omiljene recepte i proizvode ili ih podijelite s prijateljima. Radi i offline na 31 jeziku.',
      disclaimer_title: 'Odricanje odgovornosti',
      disclaimer_text: 'Klikom na "Počni miješanje", korisnik potvrđuje da ima najmanje 18 godina. Korisnik priznaje da LiquiMixer služi samo kao alat za izračun i ne preuzima odgovornost za konačni proizvod. Korisnik snosi punu odgovornost za pravilno miješanje i sigurnosne postupke.',
      start_button: 'POČNI MIJEŠANJE',
      warning_title: 'Usredotočite se na sigurnosne smjernice',
      warning_text: 'Pri korištenju nikotina uvijek nosite zaštitne rukavice i radite u dobro prozračenom prostoru.',
      prep_title: 'Priprema za miješanje:'
    },
    mode_select: { title: 'Što želite pripremiti?', liquid_title: 'eTekućina', dilute_title: 'Razrijedite nikotinsku bazu', back: '◀ NATRAG' },
    form: { config_title: 'Konfiguracija mješavine', amount_label: 'Koliko tekućine želim miješati?', back: '◀ NATRAG', mix_button: 'MIJEŠAJ!' },
    results: { title: 'Vaš recept', edit: '◀ UREDI', save: 'SPREMI' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Učitavanje...', error: 'Greška', success: 'Uspjeh', cancel: 'Otkaži', confirm: 'Potvrdi', yes: 'Da', no: 'Ne' }
  },

  // Bulgarian (bg)
  'bg': {
    meta: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', currency: 'BGN', currencySymbol: 'лв' },
    nav: { menu: 'Меню', login: 'Вход', home: 'Начало' },
    intro: {
      subtitle: 'КАЛКУЛАТОР ЗА Е-ТЕЧНОСТИ',
      app_description: 'Калкулатор за безопасно смесване на е-течности с точно изчисление на съотношение PG/VG, аромати и никотин. Не започвайте от нулата всеки път — запазвайте любими рецепти и продукти или ги споделяйте с приятели. Работи и офлайн на 31 езика.',
      disclaimer_title: 'Отказ от отговорност',
      disclaimer_text: 'С натискане на "Започни смесване" потребителят потвърждава, че е навършил 18 години. Потребителят признава, че LiquiMixer служи само като изчислителен инструмент и не поема отговорност за крайния продукт. Потребителят носи пълна отговорност за правилното смесване и спазването на мерките за безопасност.',
      start_button: 'ЗАПОЧНИ СМЕСВАНЕ',
      warning_title: 'Съсредоточете се върху насоките за безопасност',
      warning_text: 'При използване на никотин винаги носете защитни ръкавици и работете на добре проветриво място.',
      prep_title: 'Подготовка за смесване:'
    },
    mode_select: { title: 'Какво искате да приготвите?', liquid_title: 'еТечност', dilute_title: 'Разредете никотиновата база', back: '◀ НАЗАД' },
    form: { config_title: 'Конфигурация на сместа', amount_label: 'Колко течност искам да смеся?', back: '◀ НАЗАД', mix_button: 'СМЕСИ!' },
    results: { title: 'Вашата рецепта', edit: '◀ РЕДАКТИРАНЕ', save: 'ЗАПАЗИ' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Зареждане...', error: 'Грешка', success: 'Успех', cancel: 'Отказ', confirm: 'Потвърди', yes: 'Да', no: 'Не' }
  },

  // Serbian (sr)
  'sr': {
    meta: { code: 'sr', name: 'Serbian', nativeName: 'Српски', currency: 'RSD', currencySymbol: 'дин' },
    nav: { menu: 'Мени', login: 'Пријава', home: 'Почетна' },
    intro: {
      subtitle: 'КАЛКУЛАТОР Е-ТЕЧНОСТИ',
      app_description: 'Калкулатор за безбедно мешање е-течности са прецизним израчунавањем односа PG/VG, арома и никотина. Не почињите сваки пут испочетка — сачувајте омиљене рецепте и производе или их поделите са пријатељима. Ради и офлајн на 31 језику.',
      disclaimer_title: 'Одрицање одговорности',
      disclaimer_text: 'Кликом на "Почни мешање", корисник потврђује да има најмање 18 година. Корисник признаје да LiquiMixer служи само као алат за израчунавање и не преузима одговорност за коначни производ. Корисник сноси пуну одговорност за правилно мешање и безбедносне поступке.',
      start_button: 'ПОЧНИ МЕШАЊЕ',
      warning_title: 'Усредсредите се на безбедносне смернице',
      warning_text: 'При коришћењу никотина увек носите заштитне рукавице и радите у добро проветреном простору.',
      prep_title: 'Припрема за мешање:'
    },
    mode_select: { title: 'Шта желите да припремите?', liquid_title: 'еТечност', dilute_title: 'Разблажите никотинску базу', back: '◀ НАЗАД' },
    form: { config_title: 'Конфигурација смеше', amount_label: 'Колико течности желим да мешам?', back: '◀ НАЗАД', mix_button: 'МЕШАЈ!' },
    results: { title: 'Ваш рецепт', edit: '◀ УРЕДИ', save: 'САЧУВАЈ' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Учитавање...', error: 'Грешка', success: 'Успех', cancel: 'Откажи', confirm: 'Потврди', yes: 'Да', no: 'Не' }
  }
};

// Deep merge function
function deepMerge(target, source) {
  const result = JSON.parse(JSON.stringify(target));
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Generate locale files
let count = 0;
Object.keys(allTranslations).forEach(langCode => {
  const filePath = path.join(localesDir, `${langCode}.json`);
  const langData = allTranslations[langCode];
  
  // Start with English template
  let newLocale = JSON.parse(JSON.stringify(enTemplate));
  
  // Override with language-specific data
  newLocale = deepMerge(newLocale, langData);
  
  // Write the file
  fs.writeFileSync(filePath, JSON.stringify(newLocale, null, 2) + '\n', 'utf8');
  console.log(`✓ Generated ${langCode}.json`);
  count++;
});

console.log(`\n✅ Done! Generated ${count} complete locale files.`);
console.log('\nRemaining files already translated: cs, sk, en, de, fr, pl, es, it, pt');

