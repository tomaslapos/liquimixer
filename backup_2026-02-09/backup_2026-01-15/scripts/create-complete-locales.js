/**
 * Script to generate complete locale files for all remaining languages
 * Run with: node scripts/create-complete-locales.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

// Key translations for all languages (most important UI elements)
const translations = {
  'sv': {
    meta: { name: 'Swedish', nativeName: 'Svenska', currency: 'SEK', currencySymbol: 'kr' },
    nav: { menu: 'Meny', login: 'Logga in', home: 'Hem' },
    auth: { login_title: 'Logga in', profile_title: 'Mitt konto', logout: 'Logga ut', my_recipes: 'Mina recept', favorite_products: 'Favoritprodukter', login_button: 'Logga in', register_button: 'Registrera' },
    intro: { subtitle: 'E-VÄTSKA KALKYLATOR', warning_title: 'Fokusera på att följa säkerhetsriktlinjer vid blandning', prep_title: 'Förbered innan blandning:', disclaimer_title: 'Ansvarsfriskrivning', start_button: 'STARTA BLANDNING', app_description: 'Kalkylator för säker e-vätskeblandning med exakta PG/VG-förhållande, smak- och nikotinberäkningar.' },
    mode_select: { title: 'Vad vill du förbereda?', liquid_title: 'eVätska', back: '◀ TILLBAKA' },
    form: { amount_label: 'Hur mycket vätska vill jag blanda?', flavor_label: 'Smak', mix_button: 'BLANDA!', back: '◀ TILLBAKA' },
    results: { title: 'Ditt recept', save: 'SPARA', edit: '◀ REDIGERA' },
    recipes: { title: 'Mina recept', back: '◀ TILLBAKA' },
    products: { title: 'Favoritprodukter', back: '◀ TILLBAKA' },
    common: { loading: 'Laddar...', error: 'Fel', success: 'Framgång', cancel: 'Avbryt', confirm: 'Bekräfta', yes: 'Ja', no: 'Nej' },
    subscription: { title: 'LiquiMixer Prenumeration', per_year: '/ år', pay_button: 'Betala och aktivera' },
    terms: { title: 'Villkor', section3_text: 'Prenumerationspriset inkluderar moms. Betalningen är en engångsavgift för 365 dagar via GP webpay betalningsgateway.', section4_text: 'På grund av digitalt innehåll och omedelbar tjänsteaktivering samtycker konsumenten till att avstå från ångerrätten. Efter betalning avstår användaren från rätten till återbetalning av prenumerationen, eftersom de administrativa kostnaderna för återbetalning överstiger själva prenumerationsbetalningen.' }
  },
  'da': {
    meta: { name: 'Danish', nativeName: 'Dansk', currency: 'DKK', currencySymbol: 'kr' },
    nav: { menu: 'Menu', login: 'Log ind', home: 'Hjem' },
    auth: { login_title: 'Log ind', profile_title: 'Min konto', logout: 'Log ud', my_recipes: 'Mine opskrifter', favorite_products: 'Favoritprodukter', login_button: 'Log ind', register_button: 'Registrer' },
    intro: { subtitle: 'E-VÆSKE BEREGNER', warning_title: 'Fokuser på at følge sikkerhedsretningslinjer ved blanding', prep_title: 'Forbered inden blanding:', disclaimer_title: 'Ansvarsfraskrivelse', start_button: 'START BLANDING', app_description: 'Beregner til sikker e-væskeblanding med præcise PG/VG-forhold, smags- og nikotinberegninger.' },
    mode_select: { title: 'Hvad vil du forberede?', liquid_title: 'eVæske', back: '◀ TILBAGE' },
    form: { amount_label: 'Hvor meget væske vil jeg blande?', flavor_label: 'Smag', mix_button: 'BLAND!', back: '◀ TILBAGE' },
    results: { title: 'Din opskrift', save: 'GEM', edit: '◀ REDIGER' },
    recipes: { title: 'Mine opskrifter', back: '◀ TILBAGE' },
    products: { title: 'Favoritprodukter', back: '◀ TILBAGE' },
    common: { loading: 'Indlæser...', error: 'Fejl', success: 'Succes', cancel: 'Annuller', confirm: 'Bekræft', yes: 'Ja', no: 'Nej' },
    subscription: { title: 'LiquiMixer Abonnement', per_year: '/ år', pay_button: 'Betal og aktiver' },
    terms: { title: 'Vilkår og betingelser', section3_text: 'Abonnementsprisen inkluderer moms. Betalingen er en engangsgebyr for 365 dage via GP webpay betalingsgateway.', section4_text: 'På grund af digitalt indhold og øjeblikkelig tjenesteaktivering accepterer forbrugeren at give afkald på fortrydelsesretten. Efter betaling giver brugeren afkald på retten til refusion af abonnementet, da de administrative omkostninger ved refusion overstiger selve abonnementsbetalingen.' }
  },
  'fi': {
    meta: { name: 'Finnish', nativeName: 'Suomi', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Valikko', login: 'Kirjaudu', home: 'Koti' },
    auth: { login_title: 'Kirjaudu', profile_title: 'Oma tili', logout: 'Kirjaudu ulos', my_recipes: 'Omat reseptit', favorite_products: 'Suosikkituotteet', login_button: 'Kirjaudu', register_button: 'Rekisteröidy' },
    intro: { subtitle: 'E-NESTE LASKIN', warning_title: 'Keskity turvallisuusohjeiden noudattamiseen sekoittaessa', prep_title: 'Valmistele ennen sekoitusta:', disclaimer_title: 'Vastuuvapauslauseke', start_button: 'ALOITA SEKOITUS', app_description: 'Laskin turvalliseen e-nestesekoitukseen tarkoilla PG/VG-suhde-, maku- ja nikotiinilaskelmilla.' },
    mode_select: { title: 'Mitä haluat valmistaa?', liquid_title: 'eNeste', back: '◀ TAKAISIN' },
    form: { amount_label: 'Kuinka paljon nestettä haluan sekoittaa?', flavor_label: 'Maku', mix_button: 'SEKOITA!', back: '◀ TAKAISIN' },
    results: { title: 'Reseptisi', save: 'TALLENNA', edit: '◀ MUOKKAA' },
    recipes: { title: 'Omat reseptit', back: '◀ TAKAISIN' },
    products: { title: 'Suosikkituotteet', back: '◀ TAKAISIN' },
    common: { loading: 'Ladataan...', error: 'Virhe', success: 'Onnistui', cancel: 'Peruuta', confirm: 'Vahvista', yes: 'Kyllä', no: 'Ei' },
    subscription: { title: 'LiquiMixer Tilaus', per_year: '/ vuosi', pay_button: 'Maksa ja aktivoi' },
    terms: { title: 'Käyttöehdot', section3_text: 'Tilauksen hinta sisältää ALV:n. Maksu on kertamaksu 365 päivälle GP webpay -maksuyhdyskäytävän kautta.', section4_text: 'Digitaalisen sisällön luonteen ja palvelun välittömän aktivoinnin vuoksi kuluttaja suostuu luopumaan peruutusoikeudestaan. Maksun jälkeen käyttäjä luopuu oikeudesta tilauksen palautukseen, koska palautuksen hallinnolliset kustannukset ylittävät itse tilausmaksun.' }
  },
  'ru': {
    meta: { name: 'Russian', nativeName: 'Русский', currency: 'RUB', currencySymbol: '₽' },
    nav: { menu: 'Меню', login: 'Войти', home: 'Главная' },
    auth: { login_title: 'Войти', profile_title: 'Мой аккаунт', logout: 'Выйти', my_recipes: 'Мои рецепты', favorite_products: 'Избранные продукты', login_button: 'Войти', register_button: 'Зарегистрироваться' },
    intro: { subtitle: 'КАЛЬКУЛЯТОР ЖИДКОСТИ', warning_title: 'Соблюдайте правила безопасности при смешивании', prep_title: 'Подготовьте перед смешиванием:', disclaimer_title: 'Отказ от ответственности', start_button: 'НАЧАТЬ СМЕШИВАНИЕ', app_description: 'Калькулятор для безопасного смешивания жидкости с точными расчетами соотношения PG/VG, ароматизаторов и никотина.' },
    mode_select: { title: 'Что вы хотите приготовить?', liquid_title: 'Жидкость', back: '◀ НАЗАД' },
    form: { amount_label: 'Сколько жидкости я хочу смешать?', flavor_label: 'Ароматизатор', mix_button: 'СМЕШАТЬ!', back: '◀ НАЗАД' },
    results: { title: 'Ваш рецепт', save: 'СОХРАНИТЬ', edit: '◀ РЕДАКТИРОВАТЬ' },
    recipes: { title: 'Мои рецепты', back: '◀ НАЗАД' },
    products: { title: 'Избранные продукты', back: '◀ НАЗАД' },
    common: { loading: 'Загрузка...', error: 'Ошибка', success: 'Успех', cancel: 'Отмена', confirm: 'Подтвердить', yes: 'Да', no: 'Нет' },
    subscription: { title: 'Подписка LiquiMixer', per_year: '/ год', pay_button: 'Оплатить и активировать' },
    terms: { title: 'Условия использования', section3_text: 'Цена подписки включает НДС. Оплата — единоразовый платеж на 365 дней через платежный шлюз GP webpay.', section4_text: 'В связи с характером цифрового контента и немедленной активацией сервиса, потребитель соглашается отказаться от права на отзыв. После оплаты пользователь отказывается от права на возврат средств за подписку, поскольку административные расходы на возврат превышают сумму подписки.' }
  },
  'uk': {
    meta: { name: 'Ukrainian', nativeName: 'Українська', currency: 'UAH', currencySymbol: '₴' },
    nav: { menu: 'Меню', login: 'Увійти', home: 'Головна' },
    auth: { login_title: 'Увійти', profile_title: 'Мій акаунт', logout: 'Вийти', my_recipes: 'Мої рецепти', favorite_products: 'Улюблені продукти', login_button: 'Увійти', register_button: 'Зареєструватися' },
    intro: { subtitle: 'КАЛЬКУЛЯТОР РІДИНИ', warning_title: 'Дотримуйтесь правил безпеки при змішуванні', prep_title: 'Підготуйте перед змішуванням:', disclaimer_title: 'Відмова від відповідальності', start_button: 'ПОЧАТИ ЗМІШУВАННЯ', app_description: 'Калькулятор для безпечного змішування рідини з точними розрахунками співвідношення PG/VG, ароматизаторів та нікотину.' },
    mode_select: { title: 'Що ви хочете приготувати?', liquid_title: 'Рідина', back: '◀ НАЗАД' },
    form: { amount_label: 'Скільки рідини я хочу змішати?', flavor_label: 'Ароматизатор', mix_button: 'ЗМІШАТИ!', back: '◀ НАЗАД' },
    results: { title: 'Ваш рецепт', save: 'ЗБЕРЕГТИ', edit: '◀ РЕДАГУВАТИ' },
    recipes: { title: 'Мої рецепти', back: '◀ НАЗАД' },
    products: { title: 'Улюблені продукти', back: '◀ НАЗАД' },
    common: { loading: 'Завантаження...', error: 'Помилка', success: 'Успіх', cancel: 'Скасувати', confirm: 'Підтвердити', yes: 'Так', no: 'Ні' },
    subscription: { title: 'Підписка LiquiMixer', per_year: '/ рік', pay_button: 'Оплатити та активувати' },
    terms: { title: 'Умови використання', section3_text: 'Ціна підписки включає ПДВ. Оплата — одноразовий платіж на 365 днів через платіжний шлюз GP webpay.', section4_text: 'Через характер цифрового контенту та негайну активацію сервісу, споживач погоджується відмовитися від права на відкликання. Після оплати користувач відмовляється від права на повернення коштів за підписку, оскільки адміністративні витрати на повернення перевищують суму підписки.' }
  },
  'tr': {
    meta: { name: 'Turkish', nativeName: 'Türkçe', currency: 'TRY', currencySymbol: '₺' },
    nav: { menu: 'Menü', login: 'Giriş Yap', home: 'Ana Sayfa' },
    auth: { login_title: 'Giriş Yap', profile_title: 'Hesabım', logout: 'Çıkış Yap', my_recipes: 'Tariflerim', favorite_products: 'Favori Ürünler', login_button: 'Giriş Yap', register_button: 'Kayıt Ol' },
    intro: { subtitle: 'E-SIVI HESAPLAYICI', warning_title: 'Karıştırırken güvenlik kurallarına dikkat edin', prep_title: 'Karıştırmadan önce hazırlayın:', disclaimer_title: 'Sorumluluk Reddi', start_button: 'KARIŞTIRMAYA BAŞLA', app_description: 'Doğru PG/VG oranı, aroma ve nikotin hesaplamaları ile güvenli e-sıvı karıştırma hesaplayıcısı.' },
    mode_select: { title: 'Ne hazırlamak istiyorsunuz?', liquid_title: 'eSıvı', back: '◀ GERİ' },
    form: { amount_label: 'Ne kadar sıvı karıştırmak istiyorum?', flavor_label: 'Aroma', mix_button: 'KARIŞTIR!', back: '◀ GERİ' },
    results: { title: 'Tarifiniz', save: 'KAYDET', edit: '◀ DÜZENLE' },
    recipes: { title: 'Tariflerim', back: '◀ GERİ' },
    products: { title: 'Favori Ürünler', back: '◀ GERİ' },
    common: { loading: 'Yükleniyor...', error: 'Hata', success: 'Başarılı', cancel: 'İptal', confirm: 'Onayla', yes: 'Evet', no: 'Hayır' },
    subscription: { title: 'LiquiMixer Abonelik', per_year: '/ yıl', pay_button: 'Öde ve Etkinleştir' },
    terms: { title: 'Şartlar ve Koşullar', section3_text: 'Abonelik fiyatı KDV dahildir. Ödeme, GP webpay ödeme ağ geçidi üzerinden 365 gün için tek seferlik ücrettir.', section4_text: 'Dijital içeriğin doğası ve hizmetin anında etkinleştirilmesi nedeniyle, tüketici cayma hakkından feragat etmeyi kabul eder. Ödeme sonrasında kullanıcı, iade idari maliyetleri abonelik ödemesinin kendisinden daha yüksek olduğu için abonelik iadesi hakkından feragat eder.' }
  },
  'hu': {
    meta: { name: 'Hungarian', nativeName: 'Magyar', currency: 'HUF', currencySymbol: 'Ft' },
    nav: { menu: 'Menü', login: 'Bejelentkezés', home: 'Főoldal' },
    auth: { login_title: 'Bejelentkezés', profile_title: 'Fiókom', logout: 'Kijelentkezés', my_recipes: 'Receptjeim', favorite_products: 'Kedvenc termékek', login_button: 'Bejelentkezés', register_button: 'Regisztráció' },
    intro: { subtitle: 'E-FOLYADÉK KALKULÁTOR', warning_title: 'Keveréskor koncentrálj a biztonsági irányelvek betartására', prep_title: 'Készítsd elő keverés előtt:', disclaimer_title: 'Felelősségkorlátozás', start_button: 'KEVERÉS INDÍTÁSA', app_description: 'Kalkulátor biztonságos e-folyadék keveréshez pontos PG/VG arány, íz és nikotin számításokkal.' },
    mode_select: { title: 'Mit szeretnél készíteni?', liquid_title: 'eFolyadék', back: '◀ VISSZA' },
    form: { amount_label: 'Mennyi folyadékot akarok keverni?', flavor_label: 'Íz', mix_button: 'KEVERÉS!', back: '◀ VISSZA' },
    results: { title: 'Recepted', save: 'MENTÉS', edit: '◀ SZERKESZTÉS' },
    recipes: { title: 'Receptjeim', back: '◀ VISSZA' },
    products: { title: 'Kedvenc termékek', back: '◀ VISSZA' },
    common: { loading: 'Betöltés...', error: 'Hiba', success: 'Siker', cancel: 'Mégse', confirm: 'Megerősítés', yes: 'Igen', no: 'Nem' },
    subscription: { title: 'LiquiMixer Előfizetés', per_year: '/ év', pay_button: 'Fizetés és aktiválás' },
    terms: { title: 'Felhasználási feltételek', section3_text: 'Az előfizetés ára tartalmazza az ÁFA-t. A fizetés egyszeri díj 365 napra a GP webpay fizetési átjárón keresztül.', section4_text: 'A digitális tartalom jellege és a szolgáltatás azonnali aktiválása miatt a fogyasztó beleegyezik az elállási jog lemondásába. Fizetés után a felhasználó lemond az előfizetés visszatérítésének jogáról, mivel a visszatérítés adminisztratív költségei meghaladják magát az előfizetési díjat.' }
  },
  'ja': {
    meta: { name: 'Japanese', nativeName: '日本語', currency: 'JPY', currencySymbol: '¥' },
    nav: { menu: 'メニュー', login: 'ログイン', home: 'ホーム' },
    auth: { login_title: 'ログイン', profile_title: 'マイアカウント', logout: 'ログアウト', my_recipes: 'マイレシピ', favorite_products: 'お気に入り製品', login_button: 'ログイン', register_button: '登録' },
    intro: { subtitle: 'Eリキッド計算機', warning_title: '混合時は安全ガイドラインに従ってください', prep_title: '混合前の準備:', disclaimer_title: '免責事項', start_button: '混合開始', app_description: '正確なPG/VG比率、フレーバー、ニコチン計算による安全なEリキッド混合計算機。' },
    mode_select: { title: '何を作りますか？', liquid_title: 'Eリキッド', back: '◀ 戻る' },
    form: { amount_label: 'どのくらいのリキッドを混合しますか？', flavor_label: 'フレーバー', mix_button: '混合！', back: '◀ 戻る' },
    results: { title: 'あなたのレシピ', save: '保存', edit: '◀ 編集' },
    recipes: { title: 'マイレシピ', back: '◀ 戻る' },
    products: { title: 'お気に入り製品', back: '◀ 戻る' },
    common: { loading: '読み込み中...', error: 'エラー', success: '成功', cancel: 'キャンセル', confirm: '確認', yes: 'はい', no: 'いいえ' },
    subscription: { title: 'LiquiMixer サブスクリプション', per_year: '/ 年', pay_button: '支払い・有効化' },
    terms: { title: '利用規約', section3_text: 'サブスクリプション価格には消費税が含まれます。支払いはGP webpay決済ゲートウェイを通じた365日間の一回払いです。', section4_text: 'デジタルコンテンツの性質とサービスの即時有効化のため、消費者は解約権を放棄することに同意します。支払い後、返金の管理コストがサブスクリプション支払い自体を超えるため、ユーザーはサブスクリプションの返金権を放棄します。' }
  },
  'ko': {
    meta: { name: 'Korean', nativeName: '한국어', currency: 'KRW', currencySymbol: '₩' },
    nav: { menu: '메뉴', login: '로그인', home: '홈' },
    auth: { login_title: '로그인', profile_title: '내 계정', logout: '로그아웃', my_recipes: '내 레시피', favorite_products: '즐겨찾기 제품', login_button: '로그인', register_button: '가입' },
    intro: { subtitle: 'E-리퀴드 계산기', warning_title: '혼합 시 안전 지침을 따르세요', prep_title: '혼합 전 준비:', disclaimer_title: '면책 조항', start_button: '혼합 시작', app_description: '정확한 PG/VG 비율, 향료 및 니코틴 계산으로 안전한 E-리퀴드 혼합 계산기.' },
    mode_select: { title: '무엇을 만들겠습니까?', liquid_title: 'E리퀴드', back: '◀ 뒤로' },
    form: { amount_label: '얼마나 많은 리퀴드를 혼합하시겠습니까?', flavor_label: '향료', mix_button: '혼합!', back: '◀ 뒤로' },
    results: { title: '레시피', save: '저장', edit: '◀ 편집' },
    recipes: { title: '내 레시피', back: '◀ 뒤로' },
    products: { title: '즐겨찾기 제품', back: '◀ 뒤로' },
    common: { loading: '로딩 중...', error: '오류', success: '성공', cancel: '취소', confirm: '확인', yes: '예', no: '아니오' },
    subscription: { title: 'LiquiMixer 구독', per_year: '/ 년', pay_button: '결제 및 활성화' },
    terms: { title: '이용약관', section3_text: '구독 가격에는 부가세가 포함됩니다. 결제는 GP webpay 결제 게이트웨이를 통한 365일 일회성 요금입니다.', section4_text: '디지털 콘텐츠의 특성과 서비스의 즉시 활성화로 인해 소비자는 철회권을 포기하는 데 동의합니다. 결제 후 환불 관리 비용이 구독 결제 자체를 초과하므로 사용자는 구독 환불 권리를 포기합니다.' }
  },
  'zh-CN': {
    meta: { name: 'Chinese Simplified', nativeName: '简体中文', currency: 'CNY', currencySymbol: '¥' },
    nav: { menu: '菜单', login: '登录', home: '首页' },
    auth: { login_title: '登录', profile_title: '我的账户', logout: '登出', my_recipes: '我的配方', favorite_products: '收藏产品', login_button: '登录', register_button: '注册' },
    intro: { subtitle: 'E烟油计算器', warning_title: '调配时请遵循安全准则', prep_title: '调配前准备：', disclaimer_title: '免责声明', start_button: '开始调配', app_description: '安全的E烟油调配计算器，精确计算PG/VG比例、香精和尼古丁。' },
    mode_select: { title: '您想制作什么？', liquid_title: 'E烟油', back: '◀ 返回' },
    form: { amount_label: '我要调配多少烟油？', flavor_label: '香精', mix_button: '调配！', back: '◀ 返回' },
    results: { title: '您的配方', save: '保存', edit: '◀ 编辑' },
    recipes: { title: '我的配方', back: '◀ 返回' },
    products: { title: '收藏产品', back: '◀ 返回' },
    common: { loading: '加载中...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', yes: '是', no: '否' },
    subscription: { title: 'LiquiMixer 订阅', per_year: '/ 年', pay_button: '支付并激活' },
    terms: { title: '条款和条件', section3_text: '订阅价格包含增值税。付款是通过GP webpay支付网关进行的365天一次性费用。', section4_text: '由于数字内容的性质和服务的立即激活，消费者同意放弃撤销权。付款后，用户放弃订阅退款权利，因为退款的行政成本超过订阅付款本身。' }
  },
  'zh-TW': {
    meta: { name: 'Chinese Traditional', nativeName: '繁體中文', currency: 'TWD', currencySymbol: 'NT$' },
    nav: { menu: '選單', login: '登入', home: '首頁' },
    auth: { login_title: '登入', profile_title: '我的帳戶', logout: '登出', my_recipes: '我的配方', favorite_products: '收藏產品', login_button: '登入', register_button: '註冊' },
    intro: { subtitle: 'E煙油計算器', warning_title: '調配時請遵循安全準則', prep_title: '調配前準備：', disclaimer_title: '免責聲明', start_button: '開始調配', app_description: '安全的E煙油調配計算器，精確計算PG/VG比例、香精和尼古丁。' },
    mode_select: { title: '您想製作什麼？', liquid_title: 'E煙油', back: '◀ 返回' },
    form: { amount_label: '我要調配多少煙油？', flavor_label: '香精', mix_button: '調配！', back: '◀ 返回' },
    results: { title: '您的配方', save: '儲存', edit: '◀ 編輯' },
    recipes: { title: '我的配方', back: '◀ 返回' },
    products: { title: '收藏產品', back: '◀ 返回' },
    common: { loading: '載入中...', error: '錯誤', success: '成功', cancel: '取消', confirm: '確認', yes: '是', no: '否' },
    subscription: { title: 'LiquiMixer 訂閱', per_year: '/ 年', pay_button: '支付並啟用' },
    terms: { title: '條款和條件', section3_text: '訂閱價格包含增值稅。付款是通過GP webpay支付網關進行的365天一次性費用。', section4_text: '由於數位內容的性質和服務的立即啟用，消費者同意放棄撤銷權。付款後，用戶放棄訂閱退款權利，因為退款的行政成本超過訂閱付款本身。' }
  },
  'el': {
    meta: { name: 'Greek', nativeName: 'Ελληνικά', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Μενού', login: 'Σύνδεση', home: 'Αρχική' },
    auth: { login_title: 'Σύνδεση', profile_title: 'Ο Λογαριασμός μου', logout: 'Αποσύνδεση', my_recipes: 'Οι Συνταγές μου', favorite_products: 'Αγαπημένα Προϊόντα', login_button: 'Σύνδεση', register_button: 'Εγγραφή' },
    intro: { subtitle: 'ΥΠΟΛΟΓΙΣΤΗΣ E-ΥΓΡΟΥ', warning_title: 'Εστιάστε στην τήρηση των οδηγιών ασφαλείας κατά την ανάμειξη', prep_title: 'Προετοιμάστε πριν την ανάμειξη:', disclaimer_title: 'Αποποίηση Ευθύνης', start_button: 'ΕΝΑΡΞΗ ΑΝΑΜΕΙΞΗΣ', app_description: 'Υπολογιστής για ασφαλή ανάμειξη e-υγρού με ακριβείς υπολογισμούς αναλογίας PG/VG, γεύσης και νικοτίνης.' },
    mode_select: { title: 'Τι θέλετε να ετοιμάσετε;', liquid_title: 'eΥγρό', back: '◀ ΠΙΣΩ' },
    form: { amount_label: 'Πόσο υγρό θέλω να αναμείξω;', flavor_label: 'Γεύση', mix_button: 'ΑΝΑΜΕΙΞΗ!', back: '◀ ΠΙΣΩ' },
    results: { title: 'Η Συνταγή σας', save: 'ΑΠΟΘΗΚΕΥΣΗ', edit: '◀ ΕΠΕΞΕΡΓΑΣΙΑ' },
    recipes: { title: 'Οι Συνταγές μου', back: '◀ ΠΙΣΩ' },
    products: { title: 'Αγαπημένα Προϊόντα', back: '◀ ΠΙΣΩ' },
    common: { loading: 'Φόρτωση...', error: 'Σφάλμα', success: 'Επιτυχία', cancel: 'Ακύρωση', confirm: 'Επιβεβαίωση', yes: 'Ναι', no: 'Όχι' },
    subscription: { title: 'Συνδρομή LiquiMixer', per_year: '/ έτος', pay_button: 'Πληρωμή και Ενεργοποίηση' },
    terms: { title: 'Όροι και Προϋποθέσεις', section3_text: 'Η τιμή συνδρομής περιλαμβάνει ΦΠΑ. Η πληρωμή είναι εφάπαξ χρέωση για 365 ημέρες μέσω της πύλης πληρωμών GP webpay.', section4_text: 'Λόγω της φύσης του ψηφιακού περιεχομένου και της άμεσης ενεργοποίησης της υπηρεσίας, ο καταναλωτής συμφωνεί να παραιτηθεί από το δικαίωμα υπαναχώρησης. Μετά την πληρωμή, ο χρήστης παραιτείται από το δικαίωμα επιστροφής χρημάτων για τη συνδρομή, καθώς τα διοικητικά έξοδα επιστροφής υπερβαίνουν την ίδια την πληρωμή συνδρομής.' }
  },
  'ar-SA': {
    meta: { name: 'Arabic', nativeName: 'العربية', currency: 'SAR', currencySymbol: 'ر.س' },
    nav: { menu: 'القائمة', login: 'تسجيل الدخول', home: 'الرئيسية' },
    auth: { login_title: 'تسجيل الدخول', profile_title: 'حسابي', logout: 'تسجيل الخروج', my_recipes: 'وصفاتي', favorite_products: 'المنتجات المفضلة', login_button: 'تسجيل الدخول', register_button: 'التسجيل' },
    intro: { subtitle: 'حاسبة السائل الإلكتروني', warning_title: 'ركز على اتباع إرشادات السلامة عند الخلط', prep_title: 'حضّر قبل الخلط:', disclaimer_title: 'إخلاء المسؤولية', start_button: 'ابدأ الخلط', app_description: 'حاسبة لخلط آمن للسائل الإلكتروني مع حسابات دقيقة لنسبة PG/VG والنكهة والنيكوتين.' },
    mode_select: { title: 'ماذا تريد أن تحضّر؟', liquid_title: 'سائل إلكتروني', back: '◀ رجوع' },
    form: { amount_label: 'كم كمية السائل التي أريد خلطها؟', flavor_label: 'نكهة', mix_button: 'اخلط!', back: '◀ رجوع' },
    results: { title: 'وصفتك', save: 'حفظ', edit: '◀ تعديل' },
    recipes: { title: 'وصفاتي', back: '◀ رجوع' },
    products: { title: 'المنتجات المفضلة', back: '◀ رجوع' },
    common: { loading: 'جاري التحميل...', error: 'خطأ', success: 'نجاح', cancel: 'إلغاء', confirm: 'تأكيد', yes: 'نعم', no: 'لا' },
    subscription: { title: 'اشتراك LiquiMixer', per_year: '/ سنة', pay_button: 'ادفع وفعّل' },
    terms: { title: 'الشروط والأحكام', section3_text: 'يشمل سعر الاشتراك ضريبة القيمة المضافة. الدفع هو رسم لمرة واحدة لمدة 365 يومًا عبر بوابة الدفع GP webpay.', section4_text: 'نظرًا لطبيعة المحتوى الرقمي والتفعيل الفوري للخدمة، يوافق المستهلك على التنازل عن حق الانسحاب. بعد الدفع، يتنازل المستخدم عن حق استرداد الاشتراك، حيث أن التكاليف الإدارية للاسترداد تتجاوز مبلغ الاشتراك نفسه.' }
  },
  'et': {
    meta: { name: 'Estonian', nativeName: 'Eesti', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menüü', login: 'Logi sisse', home: 'Avaleht' },
    auth: { login_title: 'Logi sisse', profile_title: 'Minu konto', logout: 'Logi välja', my_recipes: 'Minu retseptid', favorite_products: 'Lemmiktooted', login_button: 'Logi sisse', register_button: 'Registreeri' },
    intro: { subtitle: 'E-VEDELIKU KALKULAATOR', warning_title: 'Keskendu ohutusreeglite järgimisele segamisel', prep_title: 'Valmista ette enne segamist:', disclaimer_title: 'Vastutuse välistamine', start_button: 'ALUSTA SEGAMIST', app_description: 'Kalkulaator ohutuks e-vedeliku segamiseks täpsete PG/VG suhte, maitse- ja nikotiiniarvutustega.' },
    mode_select: { title: 'Mida soovid valmistada?', liquid_title: 'eVedelik', back: '◀ TAGASI' },
    form: { amount_label: 'Kui palju vedelikku tahan segada?', flavor_label: 'Maitse', mix_button: 'SEGA!', back: '◀ TAGASI' },
    results: { title: 'Sinu retsept', save: 'SALVESTA', edit: '◀ MUUDA' },
    recipes: { title: 'Minu retseptid', back: '◀ TAGASI' },
    products: { title: 'Lemmiktooted', back: '◀ TAGASI' },
    common: { loading: 'Laadimine...', error: 'Viga', success: 'Õnnestus', cancel: 'Tühista', confirm: 'Kinnita', yes: 'Jah', no: 'Ei' },
    subscription: { title: 'LiquiMixer Tellimus', per_year: '/ aasta', pay_button: 'Maksa ja aktiveeri' },
    terms: { title: 'Tingimused', section3_text: 'Tellimuse hind sisaldab käibemaksu. Makse on ühekordne tasu 365 päeva eest GP webpay maksevärava kaudu.', section4_text: 'Digitaalse sisu olemuse ja teenuse kohese aktiveerimise tõttu nõustub tarbija loobuma taganemisõigusest. Pärast makset loobub kasutaja tellimuse tagasimakse õigusest, kuna tagasimakse halduskulud ületavad tellimuse makse enda.' }
  },
  'lv': {
    meta: { name: 'Latvian', nativeName: 'Latviešu', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izvēlne', login: 'Pieslēgties', home: 'Sākums' },
    auth: { login_title: 'Pieslēgties', profile_title: 'Mans konts', logout: 'Atslēgties', my_recipes: 'Manas receptes', favorite_products: 'Iecienītākie produkti', login_button: 'Pieslēgties', register_button: 'Reģistrēties' },
    intro: { subtitle: 'E-ŠĶIDRUMA KALKULATORS', warning_title: 'Koncentrējieties uz drošības noteikumu ievērošanu sajaukšanas laikā', prep_title: 'Sagatavojiet pirms sajaukšanas:', disclaimer_title: 'Atbildības atruna', start_button: 'SĀKT SAJAUKŠANU', app_description: 'Kalkulators drošai e-šķidruma sajaukšanai ar precīziem PG/VG attiecības, garšvielas un nikotīna aprēķiniem.' },
    mode_select: { title: 'Ko vēlaties sagatavot?', liquid_title: 'eŠķidrums', back: '◀ ATPAKAĻ' },
    form: { amount_label: 'Cik daudz šķidruma gribu sajaukt?', flavor_label: 'Garša', mix_button: 'SAJAUKT!', back: '◀ ATPAKAĻ' },
    results: { title: 'Jūsu recepte', save: 'SAGLABĀT', edit: '◀ REDIĢĒT' },
    recipes: { title: 'Manas receptes', back: '◀ ATPAKAĻ' },
    products: { title: 'Iecienītākie produkti', back: '◀ ATPAKAĻ' },
    common: { loading: 'Ielādē...', error: 'Kļūda', success: 'Veiksmīgi', cancel: 'Atcelt', confirm: 'Apstiprināt', yes: 'Jā', no: 'Nē' },
    subscription: { title: 'LiquiMixer Abonements', per_year: '/ gads', pay_button: 'Maksāt un aktivizēt' },
    terms: { title: 'Noteikumi', section3_text: 'Abonementa cena ietver PVN. Maksājums ir vienreizēja maksa par 365 dienām caur GP webpay maksājumu vārteju.', section4_text: 'Digitālā satura rakstura un tūlītējās pakalpojuma aktivizēšanas dēļ patērētājs piekrīt atteikties no atteikuma tiesībām. Pēc maksājuma lietotājs atsakās no abonementa atmaksas tiesībām, jo atmaksas administratīvās izmaksas pārsniedz pašu abonementa maksājumu.' }
  },
  'ro': {
    meta: { name: 'Romanian', nativeName: 'Română', currency: 'RON', currencySymbol: 'lei' },
    nav: { menu: 'Meniu', login: 'Autentificare', home: 'Acasă' },
    auth: { login_title: 'Autentificare', profile_title: 'Contul meu', logout: 'Deconectare', my_recipes: 'Rețetele mele', favorite_products: 'Produse favorite', login_button: 'Autentificare', register_button: 'Înregistrare' },
    intro: { subtitle: 'CALCULATOR E-LICHID', warning_title: 'Concentrează-te pe respectarea ghidurilor de siguranță la amestecare', prep_title: 'Pregătește înainte de amestecare:', disclaimer_title: 'Declinarea responsabilității', start_button: 'ÎNCEPE AMESTECAREA', app_description: 'Calculator pentru amestecarea sigură a e-lichidului cu calcule precise ale raportului PG/VG, aromă și nicotină.' },
    mode_select: { title: 'Ce vrei să prepari?', liquid_title: 'eLichid', back: '◀ ÎNAPOI' },
    form: { amount_label: 'Câtă lichidă vreau să amestec?', flavor_label: 'Aromă', mix_button: 'AMESTECĂ!', back: '◀ ÎNAPOI' },
    results: { title: 'Rețeta ta', save: 'SALVEAZĂ', edit: '◀ EDITEAZĂ' },
    recipes: { title: 'Rețetele mele', back: '◀ ÎNAPOI' },
    products: { title: 'Produse favorite', back: '◀ ÎNAPOI' },
    common: { loading: 'Se încarcă...', error: 'Eroare', success: 'Succes', cancel: 'Anulează', confirm: 'Confirmă', yes: 'Da', no: 'Nu' },
    subscription: { title: 'Abonament LiquiMixer', per_year: '/ an', pay_button: 'Plătește și activează' },
    terms: { title: 'Termeni și condiții', section3_text: 'Prețul abonamentului include TVA. Plata este o taxă unică pentru 365 de zile prin gateway-ul de plată GP webpay.', section4_text: 'Datorită naturii conținutului digital și a activării imediate a serviciului, consumatorul este de acord să renunțe la dreptul de retragere. După plată, utilizatorul renunță la dreptul de rambursare a abonamentului, deoarece costurile administrative ale rambursării depășesc plata abonamentului în sine.' }
  },
  'hr': {
    meta: { name: 'Croatian', nativeName: 'Hrvatski', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izbornik', login: 'Prijava', home: 'Početna' },
    auth: { login_title: 'Prijava', profile_title: 'Moj račun', logout: 'Odjava', my_recipes: 'Moji recepti', favorite_products: 'Omiljeni proizvodi', login_button: 'Prijava', register_button: 'Registracija' },
    intro: { subtitle: 'KALKULATOR E-TEKUĆINE', warning_title: 'Fokusirajte se na praćenje sigurnosnih smjernica pri miješanju', prep_title: 'Pripremite prije miješanja:', disclaimer_title: 'Odricanje odgovornosti', start_button: 'ZAPOČNI MIJEŠANJE', app_description: 'Kalkulator za sigurno miješanje e-tekućine s preciznim izračunima omjera PG/VG, arome i nikotina.' },
    mode_select: { title: 'Što želite pripremiti?', liquid_title: 'eTekućina', back: '◀ NATRAG' },
    form: { amount_label: 'Koliko tekućine želim izmiješati?', flavor_label: 'Aroma', mix_button: 'MIJEŠAJ!', back: '◀ NATRAG' },
    results: { title: 'Vaš recept', save: 'SPREMI', edit: '◀ UREDI' },
    recipes: { title: 'Moji recepti', back: '◀ NATRAG' },
    products: { title: 'Omiljeni proizvodi', back: '◀ NATRAG' },
    common: { loading: 'Učitavanje...', error: 'Greška', success: 'Uspjeh', cancel: 'Odustani', confirm: 'Potvrdi', yes: 'Da', no: 'Ne' },
    subscription: { title: 'LiquiMixer Pretplata', per_year: '/ godinu', pay_button: 'Plati i aktiviraj' },
    terms: { title: 'Uvjeti korištenja', section3_text: 'Cijena pretplate uključuje PDV. Plaćanje je jednokratna naknada za 365 dana putem GP webpay platne kapije.', section4_text: 'Zbog prirode digitalnog sadržaja i trenutne aktivacije usluge, potrošač se slaže da se odriče prava na odustanak. Nakon plaćanja, korisnik se odriče prava na povrat pretplate, jer administrativni troškovi povrata premašuju samu uplatu pretplate.' }
  },
  'bg': {
    meta: { name: 'Bulgarian', nativeName: 'Български', currency: 'BGN', currencySymbol: 'лв' },
    nav: { menu: 'Меню', login: 'Вход', home: 'Начало' },
    auth: { login_title: 'Вход', profile_title: 'Моят акаунт', logout: 'Изход', my_recipes: 'Моите рецепти', favorite_products: 'Любими продукти', login_button: 'Вход', register_button: 'Регистрация' },
    intro: { subtitle: 'Е-ТЕЧНОСТ КАЛКУЛАТОР', warning_title: 'Фокусирайте се върху спазването на правилата за безопасност при смесване', prep_title: 'Подгответе преди смесване:', disclaimer_title: 'Отказ от отговорност', start_button: 'ЗАПОЧНЕТЕ СМЕСВАНЕ', app_description: 'Калкулатор за безопасно смесване на е-течност с точни изчисления на съотношение PG/VG, вкус и никотин.' },
    mode_select: { title: 'Какво искате да приготвите?', liquid_title: 'еТечност', back: '◀ НАЗАД' },
    form: { amount_label: 'Колко течност искам да смеся?', flavor_label: 'Вкус', mix_button: 'СМЕСВАНЕ!', back: '◀ НАЗАД' },
    results: { title: 'Вашата рецепта', save: 'ЗАПАЗИ', edit: '◀ РЕДАКТИРАНЕ' },
    recipes: { title: 'Моите рецепти', back: '◀ НАЗАД' },
    products: { title: 'Любими продукти', back: '◀ НАЗАД' },
    common: { loading: 'Зареждане...', error: 'Грешка', success: 'Успех', cancel: 'Отказ', confirm: 'Потвърди', yes: 'Да', no: 'Не' },
    subscription: { title: 'LiquiMixer Абонамент', per_year: '/ година', pay_button: 'Плати и активирай' },
    terms: { title: 'Условия за ползване', section3_text: 'Цената на абонамента включва ДДС. Плащането е еднократна такса за 365 дни през платежния портал GP webpay.', section4_text: 'Поради естеството на цифровото съдържание и незабавното активиране на услугата, потребителят се съгласява да се откаже от правото на отказ. След плащане потребителят се отказва от правото на възстановяване на абонамента, тъй като административните разходи за възстановяване надвишават самото плащане за абонамент.' }
  },
  'sr': {
    meta: { name: 'Serbian', nativeName: 'Српски', currency: 'RSD', currencySymbol: 'дин' },
    nav: { menu: 'Мени', login: 'Пријава', home: 'Почетна' },
    auth: { login_title: 'Пријава', profile_title: 'Мој налог', logout: 'Одјава', my_recipes: 'Моји рецепти', favorite_products: 'Омиљени производи', login_button: 'Пријава', register_button: 'Регистрација' },
    intro: { subtitle: 'Е-ТЕЧНОСТ КАЛКУЛАТОР', warning_title: 'Фокусирајте се на праћење безбедносних смерница при мешању', prep_title: 'Припремите пре мешања:', disclaimer_title: 'Одрицање одговорности', start_button: 'ЗАПОЧНИТЕ МЕШАЊЕ', app_description: 'Калкулатор за безбедно мешање е-течности са прецизним израчунавањима односа PG/VG, укуса и никотина.' },
    mode_select: { title: 'Шта желите да припремите?', liquid_title: 'еТечност', back: '◀ НАЗАД' },
    form: { amount_label: 'Колико течности желим да измешам?', flavor_label: 'Укус', mix_button: 'МЕШАЊЕ!', back: '◀ НАЗАД' },
    results: { title: 'Ваш рецепт', save: 'САЧУВАЈ', edit: '◀ УРЕДИ' },
    recipes: { title: 'Моји рецепти', back: '◀ НАЗАД' },
    products: { title: 'Омиљени производи', back: '◀ НАЗАД' },
    common: { loading: 'Учитавање...', error: 'Грешка', success: 'Успех', cancel: 'Откажи', confirm: 'Потврди', yes: 'Да', no: 'Не' },
    subscription: { title: 'LiquiMixer Претплата', per_year: '/ годину', pay_button: 'Плати и активирај' },
    terms: { title: 'Услови коришћења', section3_text: 'Цена претплате укључује ПДВ. Плаћање је једнократна накнада за 365 дана преко GP webpay платног портала.', section4_text: 'Због природе дигиталног садржаја и тренутне активације услуге, потрошач се слаже да се одрекне права на одустајање. Након плаћања, корисник се одриче права на поврат претплате, јер административни трошкови поврата премашују саму уплату претплате.' }
  }
};

// Read English template
const enPath = path.join(localesDir, 'en.json');
const enTemplate = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Deep merge function
function deepMerge(target, source) {
  const result = JSON.parse(JSON.stringify(target));
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Process each language
Object.entries(translations).forEach(([code, trans]) => {
  const filePath = path.join(localesDir, `${code}.json`);
  
  // Start with English template
  let locale = JSON.parse(JSON.stringify(enTemplate));
  
  // Apply code to meta
  locale.meta.code = code;
  
  // Merge translations
  locale = deepMerge(locale, trans);
  
  // Write file
  fs.writeFileSync(filePath, JSON.stringify(locale, null, 2), 'utf8');
  console.log(`Created/Updated: ${code}.json`);
});

console.log('\nDone! Updated all locale files.');

