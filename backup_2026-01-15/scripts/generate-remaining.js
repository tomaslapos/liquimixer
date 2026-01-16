const fs = require('fs');
const path = require('path');

// Template - English
const enTemplate = require('../locales/en.json');

// Translations for remaining languages
const remainingTranslations = {
  'zh-CN': {
    meta: { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', currency: 'CNY', currencySymbol: '¥' },
    nav: { menu: '菜单', login: '登录', home: '首页' },
    auth: { login_title: '登录', login_subtitle: '登录以访问您保存的配方和产品', profile_title: '我的账户', logout: '退出', my_recipes: '我的配方', favorite_products: '收藏产品', language_label: '应用语言', login_required_title: '需要登录', login_required_text: '请登录或注册以访问此功能。', premium_access_title: '获取高级功能', premium_access_text: '登录或注册以解锁LiquiMixer的所有高级功能！', login_button: '登录', register_button: '注册', pro_required_title: 'PRO功能', pro_required_text: '此功能仅供PRO订阅者使用。', subscribe_button: '订阅PRO' },
    intro: { subtitle: '电子烟油计算器', warning_title: '混合时请注意安全指南', start_button: '开始混合', disclaimer_title: '免责声明', app_description: '安全电子烟油混合计算器，精确计算PG/VG比例、香精和尼古丁。不要每次都从头开始——保存您喜欢的配方和产品，或与朋友分享。支持31种语言的离线应用。' },
    mode_select: { title: '您想准备什么？', liquid_title: '电子烟油', liquid_desc: '包含香精、尼古丁和基础液的完整电子烟油', dilute_title: '尼古丁基础液稀释', dilute_desc: '将浓尼古丁基础液稀释到所需浓度', back: '◀ 返回' },
    form: { config_title: '混合配置', tab_liquid: '烟油', tab_shakevape: 'Shake & Vape', tab_liquidpro: '烟油PRO', amount_label: '我想混合多少烟油？', nicotine_none: '无尼古丁', nicotine_booster: '尼古丁助推器', nicotine_salt: '尼古丁盐', flavor_label: '香精', flavor_none: '无（无香精）', back: '◀ 返回', mix_button: '混合！' },
    results: { title: '您的配方', total_volume: '总容量：', ratio: 'VG/PG比例：', nicotine: '尼古丁强度：', edit: '◀ 编辑', save: '保存' },
    recipes: { title: '我的配方', search_label: '🔍 搜索', no_recipes: '您还没有保存的配方。', back: '◀ 返回' },
    products: { title: '收藏产品', add_new: '+ 添加新品', back: '◀ 返回' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '加载中...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', yes: '是', no: '否' },
    subscription: { title: 'LiquiMixer订阅', per_year: '/ 年', pay_button: '支付并激活', success: '订阅已激活！' },
    terms: { title: '使用条款', close: '关闭' },
    invoice: { title: '发票' }
  },
  'zh-TW': {
    meta: { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', currency: 'TWD', currencySymbol: 'NT$' },
    nav: { menu: '選單', login: '登入', home: '首頁' },
    auth: { login_title: '登入', login_subtitle: '登入以存取您儲存的配方和產品', profile_title: '我的帳戶', logout: '登出', my_recipes: '我的配方', favorite_products: '收藏產品', language_label: '應用程式語言', login_required_title: '需要登入', login_required_text: '請登入或註冊以存取此功能。', premium_access_title: '取得進階功能', premium_access_text: '登入或註冊以解鎖LiquiMixer的所有進階功能！', login_button: '登入', register_button: '註冊', pro_required_title: 'PRO功能', pro_required_text: '此功能僅供PRO訂閱者使用。', subscribe_button: '訂閱PRO' },
    intro: { subtitle: '電子菸油計算器', warning_title: '混合時請注意安全指南', start_button: '開始混合', disclaimer_title: '免責聲明', app_description: '安全電子菸油混合計算器，精確計算PG/VG比例、香精和尼古丁。不要每次都從頭開始——儲存您喜歡的配方和產品，或與朋友分享。支援31種語言的離線應用程式。' },
    mode_select: { title: '您想準備什麼？', liquid_title: '電子菸油', liquid_desc: '包含香精、尼古丁和基礎液的完整電子菸油', dilute_title: '尼古丁基礎液稀釋', dilute_desc: '將濃尼古丁基礎液稀釋到所需濃度', back: '◀ 返回' },
    form: { config_title: '混合配置', tab_liquid: '菸油', tab_shakevape: 'Shake & Vape', tab_liquidpro: '菸油PRO', amount_label: '我想混合多少菸油？', nicotine_none: '無尼古丁', nicotine_booster: '尼古丁助推器', nicotine_salt: '尼古丁鹽', flavor_label: '香精', flavor_none: '無（無香精）', back: '◀ 返回', mix_button: '混合！' },
    results: { title: '您的配方', total_volume: '總容量：', ratio: 'VG/PG比例：', nicotine: '尼古丁強度：', edit: '◀ 編輯', save: '儲存' },
    recipes: { title: '我的配方', search_label: '🔍 搜尋', no_recipes: '您還沒有儲存的配方。', back: '◀ 返回' },
    products: { title: '收藏產品', add_new: '+ 新增產品', back: '◀ 返回' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: '載入中...', error: '錯誤', success: '成功', cancel: '取消', confirm: '確認', yes: '是', no: '否' },
    subscription: { title: 'LiquiMixer訂閱', per_year: '/ 年', pay_button: '付款並啟用', success: '訂閱已啟用！' },
    terms: { title: '使用條款', close: '關閉' },
    invoice: { title: '發票' }
  },
  'el': {
    meta: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Μενού', login: 'Σύνδεση', home: 'Αρχική' },
    auth: { login_title: 'Σύνδεση', login_subtitle: 'Συνδεθείτε για πρόσβαση στις αποθηκευμένες συνταγές και προϊόντα', profile_title: 'Ο Λογαριασμός μου', logout: 'Αποσύνδεση', my_recipes: 'Οι Συνταγές μου', favorite_products: 'Αγαπημένα Προϊόντα', language_label: 'Γλώσσα εφαρμογής', login_required_title: 'Απαιτείται Σύνδεση', login_required_text: 'Παρακαλώ συνδεθείτε ή εγγραφείτε για πρόσβαση σε αυτή τη λειτουργία.', premium_access_title: 'Αποκτήστε πρόσβαση σε premium λειτουργίες', premium_access_text: 'Συνδεθείτε ή εγγραφείτε για να ξεκλειδώσετε όλες τις premium λειτουργίες του LiquiMixer!', login_button: 'Σύνδεση', register_button: 'Εγγραφή', pro_required_title: 'Λειτουργία PRO', pro_required_text: 'Αυτή η λειτουργία είναι διαθέσιμη μόνο για συνδρομητές PRO.', subscribe_button: 'Εγγραφή στο PRO' },
    intro: { subtitle: 'ΥΠΟΛΟΓΙΣΤΗΣ E-ΥΓΡΩΝ', warning_title: 'Εστιάστε στην τήρηση των οδηγιών ασφαλείας κατά την ανάμειξη', start_button: 'ΕΝΑΡΞΗ ΑΝΑΜΕΙΞΗΣ', disclaimer_title: 'Αποποίηση ευθυνών', app_description: 'Υπολογιστής για ασφαλή ανάμειξη e-υγρών με ακριβή υπολογισμό αναλογίας PG/VG, γεύσης και νικοτίνης. Μην ξεκινάτε από την αρχή κάθε φορά — αποθηκεύστε τις αγαπημένες σας συνταγές και προϊόντα ή μοιραστείτε τα με φίλους. Λειτουργεί επίσης ως offline εφαρμογή σε 31 γλώσσες.' },
    mode_select: { title: 'Τι θέλετε να προετοιμάσετε;', liquid_title: 'eΥγρό', liquid_desc: 'Πλήρες e-υγρό με γεύση, νικοτίνη και υγρό φορέα', dilute_title: 'Αραίωση βάσης νικοτίνης', dilute_desc: 'Αραιώστε ισχυρή βάση νικοτίνης στην επιθυμητή συγκέντρωση', back: '◀ ΠΙΣΩ' },
    form: { config_title: 'Ρύθμιση Μείγματος', tab_liquid: 'Υγρό', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Υγρό PRO', amount_label: 'Πόσο υγρό θέλω να αναμείξω;', nicotine_none: 'Χωρίς νικοτίνη', nicotine_booster: 'Ενισχυτικό νικοτίνης', nicotine_salt: 'Άλας νικοτίνης', flavor_label: 'Γεύση', flavor_none: 'Καμία (χωρίς γεύση)', back: '◀ ΠΙΣΩ', mix_button: 'ΑΝΑΜΕΙΞΗ!' },
    results: { title: 'Η Συνταγή σας', total_volume: 'Συνολικός όγκος:', ratio: 'Αναλογία VG/PG:', nicotine: 'Ένταση νικοτίνης:', edit: '◀ ΕΠΕΞΕΡΓΑΣΙΑ', save: 'ΑΠΟΘΗΚΕΥΣΗ' },
    recipes: { title: 'Οι Συνταγές μου', search_label: '🔍 Αναζήτηση', no_recipes: 'Δεν έχετε αποθηκευμένες συνταγές ακόμα.', back: '◀ ΠΙΣΩ' },
    products: { title: 'Αγαπημένα Προϊόντα', add_new: '+ ΠΡΟΣΘΗΚΗ ΝΕΟΥ', back: '◀ ΠΙΣΩ' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Φόρτωση...', error: 'Σφάλμα', success: 'Επιτυχία', cancel: 'Ακύρωση', confirm: 'Επιβεβαίωση', yes: 'Ναι', no: 'Όχι' },
    subscription: { title: 'Συνδρομή LiquiMixer', per_year: '/ έτος', pay_button: 'Πληρωμή και Ενεργοποίηση', success: 'Η συνδρομή ενεργοποιήθηκε!' },
    terms: { title: 'Όροι και Προϋποθέσεις', close: 'Κλείσιμο' },
    invoice: { title: 'Τιμολόγιο' }
  },
  'ar-SA': {
    meta: { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', currency: 'SAR', currencySymbol: 'ر.س' },
    nav: { menu: 'القائمة', login: 'تسجيل الدخول', home: 'الرئيسية' },
    auth: { login_title: 'تسجيل الدخول', login_subtitle: 'سجل الدخول للوصول إلى وصفاتك ومنتجاتك المحفوظة', profile_title: 'حسابي', logout: 'تسجيل الخروج', my_recipes: 'وصفاتي', favorite_products: 'المنتجات المفضلة', language_label: 'لغة التطبيق', login_required_title: 'تسجيل الدخول مطلوب', login_required_text: 'يرجى تسجيل الدخول أو التسجيل للوصول إلى هذه الميزة.', premium_access_title: 'احصل على الميزات المميزة', premium_access_text: 'سجل الدخول أو سجل لفتح جميع ميزات LiquiMixer المميزة!', login_button: 'تسجيل الدخول', register_button: 'تسجيل', pro_required_title: 'ميزة PRO', pro_required_text: 'هذه الميزة متاحة فقط لمشتركي PRO.', subscribe_button: 'اشترك في PRO' },
    intro: { subtitle: 'حاسبة السائل الإلكتروني', warning_title: 'ركز على اتباع إرشادات السلامة عند الخلط', start_button: 'ابدأ الخلط', disclaimer_title: 'إخلاء المسؤولية', app_description: 'حاسبة لخلط السائل الإلكتروني الآمن مع حسابات دقيقة لنسبة PG/VG والنكهة والنيكوتين. لا تبدأ من الصفر في كل مرة — احفظ وصفاتك ومنتجاتك المفضلة أو شاركها مع الأصدقاء. يعمل أيضًا كتطبيق غير متصل بالإنترنت بـ 31 لغة.' },
    mode_select: { title: 'ماذا تريد أن تحضر؟', liquid_title: 'سائل إلكتروني', liquid_desc: 'سائل إلكتروني كامل مع نكهة ونيكوتين وسائل حامل', dilute_title: 'تخفيف قاعدة النيكوتين', dilute_desc: 'تخفيف قاعدة النيكوتين القوية إلى التركيز المطلوب', back: '◀ رجوع' },
    form: { config_title: 'تكوين الخلط', tab_liquid: 'سائل', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'سائل PRO', amount_label: 'كم من السائل أريد خلطه؟', nicotine_none: 'بدون نيكوتين', nicotine_booster: 'معزز نيكوتين', nicotine_salt: 'ملح نيكوتين', flavor_label: 'نكهة', flavor_none: 'لا شيء (بدون نكهة)', back: '◀ رجوع', mix_button: 'اخلط!' },
    results: { title: 'وصفتك', total_volume: 'الحجم الكلي:', ratio: 'نسبة VG/PG:', nicotine: 'قوة النيكوتين:', edit: '◀ تعديل', save: 'حفظ' },
    recipes: { title: 'وصفاتي', search_label: '🔍 بحث', no_recipes: 'ليس لديك وصفات محفوظة بعد.', back: '◀ رجوع' },
    products: { title: 'المنتجات المفضلة', add_new: '+ إضافة جديد', back: '◀ رجوع' },
    common: { ml: 'مل', mg_ml: 'مجم/مل', percent: '%', close: '✕', loading: 'جاري التحميل...', error: 'خطأ', success: 'نجاح', cancel: 'إلغاء', confirm: 'تأكيد', yes: 'نعم', no: 'لا' },
    subscription: { title: 'اشتراك LiquiMixer', per_year: '/ سنة', pay_button: 'ادفع وفعّل', success: 'تم تفعيل الاشتراك!' },
    terms: { title: 'الشروط والأحكام', close: 'إغلاق' },
    invoice: { title: 'فاتورة' }
  },
  'et': {
    meta: { code: 'et', name: 'Estonian', nativeName: 'Eesti', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Menüü', login: 'Logi sisse', home: 'Avaleht' },
    auth: { login_title: 'Logi sisse', login_subtitle: 'Logi sisse, et pääseda ligi salvestatud retseptidele ja toodetele', profile_title: 'Minu konto', logout: 'Logi välja', my_recipes: 'Minu retseptid', favorite_products: 'Lemmiktooted', language_label: 'Rakenduse keel', login_required_title: 'Sisselogimine nõutav', login_required_text: 'Sellele funktsioonile juurdepääsuks palun logi sisse või registreeru.', login_button: 'Logi sisse', register_button: 'Registreeru' },
    intro: { subtitle: 'E-VEDELIKU KALKULAATOR', start_button: 'ALUSTA SEGAMIST', disclaimer_title: 'Lahtiütlus', app_description: 'Kalkulaator ohutuks e-vedeliku segamiseks täpse PG/VG suhte, maitse- ja nikotiiniarvutustega. Ära alusta iga kord nullist — salvesta lemmikrentseptid ja tooted või jaga neid sõpradega. Töötab ka võrguühenduseta rakendusena 31 keeles.' },
    mode_select: { title: 'Mida soovid valmistada?', liquid_title: 'eVedelik', liquid_desc: 'Täielik e-vedelik maitse, nikotiini ja kandjavedelikuga', dilute_title: 'Nikotiinibaasi lahjendus', dilute_desc: 'Lahjenda tugev nikotiinibaas soovitud kontsentratsioonile', back: '◀ TAGASI' },
    form: { config_title: 'Segu seadistus', tab_liquid: 'Vedelik', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Vedelik PRO', nicotine_none: 'Nikotiinita', nicotine_booster: 'Nikotiini võimendi', nicotine_salt: 'Nikotiinisool', flavor_label: 'Maitse', flavor_none: 'Puudub (maitseta)', back: '◀ TAGASI', mix_button: 'SEGA!' },
    results: { title: 'Sinu retsept', total_volume: 'Kogumaht:', ratio: 'VG/PG suhe:', nicotine: 'Nikotiini tugevus:', edit: '◀ MUUDA', save: 'SALVESTA' },
    recipes: { title: 'Minu retseptid', search_label: '🔍 Otsi', no_recipes: 'Sul pole veel salvestatud retsepte.', back: '◀ TAGASI' },
    products: { title: 'Lemmiktooted', add_new: '+ LISA UUS', back: '◀ TAGASI' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Laadimine...', error: 'Viga', success: 'Õnnestus', cancel: 'Tühista', confirm: 'Kinnita', yes: 'Jah', no: 'Ei' },
    subscription: { title: 'LiquiMixeri tellimus', per_year: '/ aastas', pay_button: 'Maksa ja aktiveeri', success: 'Tellimus aktiveeritud!' },
    terms: { title: 'Tingimused', close: 'Sulge' },
    invoice: { title: 'Arve' }
  },
  'lv': {
    meta: { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izvēlne', login: 'Pieslēgties', home: 'Sākums' },
    auth: { login_title: 'Pieslēgties', login_subtitle: 'Piesakieties, lai piekļūtu saglabātajām receptēm un produktiem', profile_title: 'Mans konts', logout: 'Iziet', my_recipes: 'Manas receptes', favorite_products: 'Iecienītie produkti', language_label: 'Lietotnes valoda', login_required_title: 'Nepieciešama pieslēgšanās', login_required_text: 'Lūdzu, piesakieties vai reģistrējieties, lai piekļūtu šai funkcijai.', login_button: 'Pieslēgties', register_button: 'Reģistrēties' },
    intro: { subtitle: 'E-ŠĶIDRUMA KALKULATORS', start_button: 'SĀKT MAISĪŠANU', disclaimer_title: 'Atruna', app_description: 'Kalkulators drošai e-šķidruma maisīšanai ar precīzu PG/VG attiecību, garšas un nikotīna aprēķiniem. Nesāciet katru reizi no nulles — saglabājiet iecienītās receptes un produktus vai dalieties ar draugiem. Darbojas arī kā bezsaistes lietotne 31 valodā.' },
    mode_select: { title: 'Ko vēlaties sagatavot?', liquid_title: 'eŠķidrums', liquid_desc: 'Pilnīgs e-šķidrums ar garšu, nikotīnu un nesējšķidrumu', dilute_title: 'Nikotīna bāzes atšķaidīšana', dilute_desc: 'Atšķaidiet spēcīgu nikotīna bāzi līdz vēlamajai koncentrācijai', back: '◀ ATPAKAĻ' },
    form: { config_title: 'Maisījuma konfigurācija', tab_liquid: 'Šķidrums', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Šķidrums PRO', nicotine_none: 'Bez nikotīna', nicotine_booster: 'Nikotīna pastiprinātājs', nicotine_salt: 'Nikotīna sāls', flavor_label: 'Garša', flavor_none: 'Nav (bez garšas)', back: '◀ ATPAKAĻ', mix_button: 'MAISĪT!' },
    results: { title: 'Jūsu recepte', total_volume: 'Kopējais tilpums:', ratio: 'VG/PG attiecība:', nicotine: 'Nikotīna stiprums:', edit: '◀ REDIĢĒT', save: 'SAGLABĀT' },
    recipes: { title: 'Manas receptes', search_label: '🔍 Meklēt', no_recipes: 'Jums vēl nav saglabātu recepšu.', back: '◀ ATPAKAĻ' },
    products: { title: 'Iecienītie produkti', add_new: '+ PIEVIENOT JAUNU', back: '◀ ATPAKAĻ' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Ielādē...', error: 'Kļūda', success: 'Veiksmīgi', cancel: 'Atcelt', confirm: 'Apstiprināt', yes: 'Jā', no: 'Nē' },
    subscription: { title: 'LiquiMixer abonements', per_year: '/ gadā', pay_button: 'Maksāt un aktivizēt', success: 'Abonements aktivizēts!' },
    terms: { title: 'Noteikumi', close: 'Aizvērt' },
    invoice: { title: 'Rēķins' }
  },
  'lt': {
    meta: { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Meniu', login: 'Prisijungti', home: 'Pradžia' },
    auth: { login_title: 'Prisijungti', login_subtitle: 'Prisijunkite, kad pasiektumėte išsaugotus receptus ir produktus', profile_title: 'Mano paskyra', logout: 'Atsijungti', my_recipes: 'Mano receptai', favorite_products: 'Mėgstami produktai', language_label: 'Programėlės kalba', login_required_title: 'Reikalingas prisijungimas', login_required_text: 'Norėdami pasiekti šią funkciją, prisijunkite arba užsiregistruokite.', login_button: 'Prisijungti', register_button: 'Registruotis' },
    intro: { subtitle: 'E-SKYSČIO SKAIČIUOKLĖ', start_button: 'PRADĖTI MAIŠYMĄ', disclaimer_title: 'Atsakomybės atsisakymas', app_description: 'Skaičiuoklė saugiam e-skysčio maišymui su tiksliu PG/VG santykio, skonio ir nikotino skaičiavimu. Nepradėkite kaskart iš naujo — išsaugokite mėgstamus receptus ir produktus arba pasidalinkite su draugais. Taip pat veikia kaip neprisijungusi programa 31 kalba.' },
    mode_select: { title: 'Ką norite paruošti?', liquid_title: 'eSkystis', liquid_desc: 'Pilnas e-skystis su skoniu, nikotinu ir nešikliu', dilute_title: 'Nikotino bazės skiedimas', dilute_desc: 'Praskieskite stiprią nikotino bazę iki norimos koncentracijos', back: '◀ ATGAL' },
    form: { config_title: 'Mišinio konfigūracija', tab_liquid: 'Skystis', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Skystis PRO', nicotine_none: 'Be nikotino', nicotine_booster: 'Nikotino stipriklis', nicotine_salt: 'Nikotino druska', flavor_label: 'Skonis', flavor_none: 'Nėra (be skonio)', back: '◀ ATGAL', mix_button: 'MAIŠYTI!' },
    results: { title: 'Jūsų receptas', total_volume: 'Bendras tūris:', ratio: 'VG/PG santykis:', nicotine: 'Nikotino stiprumas:', edit: '◀ REDAGUOTI', save: 'IŠSAUGOTI' },
    recipes: { title: 'Mano receptai', search_label: '🔍 Ieškoti', no_recipes: 'Dar neturite išsaugotų receptų.', back: '◀ ATGAL' },
    products: { title: 'Mėgstami produktai', add_new: '+ PRIDĖTI NAUJĄ', back: '◀ ATGAL' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Kraunama...', error: 'Klaida', success: 'Sėkminga', cancel: 'Atšaukti', confirm: 'Patvirtinti', yes: 'Taip', no: 'Ne' },
    subscription: { title: 'LiquiMixer prenumerata', per_year: '/ metus', pay_button: 'Mokėti ir aktyvuoti', success: 'Prenumerata aktyvuota!' },
    terms: { title: 'Sąlygos', close: 'Uždaryti' },
    invoice: { title: 'Sąskaita' }
  },
  'ro': {
    meta: { code: 'ro', name: 'Romanian', nativeName: 'Română', currency: 'RON', currencySymbol: 'lei' },
    nav: { menu: 'Meniu', login: 'Conectare', home: 'Acasă' },
    auth: { login_title: 'Conectare', login_subtitle: 'Conectați-vă pentru a accesa rețetele și produsele salvate', profile_title: 'Contul meu', logout: 'Deconectare', my_recipes: 'Rețetele mele', favorite_products: 'Produse favorite', language_label: 'Limba aplicației', login_required_title: 'Conectare necesară', login_required_text: 'Vă rugăm să vă conectați sau să vă înregistrați pentru a accesa această funcție.', login_button: 'Conectare', register_button: 'Înregistrare' },
    intro: { subtitle: 'CALCULATOR E-LICHID', start_button: 'ÎNCEPE AMESTECAREA', disclaimer_title: 'Declinare de responsabilitate', app_description: 'Calculator pentru amestecarea sigură a e-lichidului cu calcule precise ale raportului PG/VG, aromei și nicotinei. Nu începeți de la zero de fiecare dată — salvați rețetele și produsele preferate sau împărtășiți-le cu prietenii. Funcționează și ca aplicație offline în 31 de limbi.' },
    mode_select: { title: 'Ce doriți să pregătiți?', liquid_title: 'eLichid', liquid_desc: 'E-lichid complet cu aromă, nicotină și lichid purtător', dilute_title: 'Diluarea bazei de nicotină', dilute_desc: 'Diluați baza de nicotină puternică la concentrația dorită', back: '◀ ÎNAPOI' },
    form: { config_title: 'Configurare amestec', tab_liquid: 'Lichid', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Lichid PRO', nicotine_none: 'Fără nicotină', nicotine_booster: 'Booster de nicotină', nicotine_salt: 'Sare de nicotină', flavor_label: 'Aromă', flavor_none: 'Niciuna (fără aromă)', back: '◀ ÎNAPOI', mix_button: 'AMESTECĂ!' },
    results: { title: 'Rețeta ta', total_volume: 'Volum total:', ratio: 'Raport VG/PG:', nicotine: 'Putere nicotină:', edit: '◀ EDITARE', save: 'SALVARE' },
    recipes: { title: 'Rețetele mele', search_label: '🔍 Căutare', no_recipes: 'Nu aveți încă rețete salvate.', back: '◀ ÎNAPOI' },
    products: { title: 'Produse favorite', add_new: '+ ADAUGĂ NOU', back: '◀ ÎNAPOI' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Se încarcă...', error: 'Eroare', success: 'Succes', cancel: 'Anulare', confirm: 'Confirmare', yes: 'Da', no: 'Nu' },
    subscription: { title: 'Abonament LiquiMixer', per_year: '/ an', pay_button: 'Plătește și activează', success: 'Abonament activat!' },
    terms: { title: 'Termeni și condiții', close: 'Închide' },
    invoice: { title: 'Factură' }
  },
  'hr': {
    meta: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', currency: 'EUR', currencySymbol: '€' },
    nav: { menu: 'Izbornik', login: 'Prijava', home: 'Početna' },
    auth: { login_title: 'Prijava', login_subtitle: 'Prijavite se za pristup spremljenim receptima i proizvodima', profile_title: 'Moj račun', logout: 'Odjava', my_recipes: 'Moji recepti', favorite_products: 'Omiljeni proizvodi', language_label: 'Jezik aplikacije', login_required_title: 'Potrebna prijava', login_required_text: 'Molimo prijavite se ili registrirajte za pristup ovoj značajki.', login_button: 'Prijava', register_button: 'Registracija' },
    intro: { subtitle: 'E-TEKUĆINA KALKULATOR', start_button: 'POČNI MIJEŠANJE', disclaimer_title: 'Odricanje odgovornosti', app_description: 'Kalkulator za sigurno miješanje e-tekućine s preciznim izračunom PG/VG omjera, okusa i nikotina. Ne počinjte svaki put ispočetka — spremite omiljene recepte i proizvode ili ih podijelite s prijateljima. Radi i kao izvanmrežna aplikacija na 31 jeziku.' },
    mode_select: { title: 'Što želite pripremiti?', liquid_title: 'eTekućina', liquid_desc: 'Potpuna e-tekućina s okusom, nikotinom i tekućinom nosačem', dilute_title: 'Razrjeđivanje nikotinske baze', dilute_desc: 'Razrijedite jaku nikotinsku bazu do željene koncentracije', back: '◀ NATRAG' },
    form: { config_title: 'Konfiguracija mješavine', tab_liquid: 'Tekućina', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Tekućina PRO', nicotine_none: 'Bez nikotina', nicotine_booster: 'Nikotinski pojačivač', nicotine_salt: 'Nikotinska sol', flavor_label: 'Okus', flavor_none: 'Nema (bez okusa)', back: '◀ NATRAG', mix_button: 'MIJEŠAJ!' },
    results: { title: 'Vaš recept', total_volume: 'Ukupni volumen:', ratio: 'VG/PG omjer:', nicotine: 'Jačina nikotina:', edit: '◀ UREDI', save: 'SPREMI' },
    recipes: { title: 'Moji recepti', search_label: '🔍 Pretraži', no_recipes: 'Još nemate spremljenih recepata.', back: '◀ NATRAG' },
    products: { title: 'Omiljeni proizvodi', add_new: '+ DODAJ NOVI', back: '◀ NATRAG' },
    common: { ml: 'ml', mg_ml: 'mg/ml', percent: '%', close: '✕', loading: 'Učitavanje...', error: 'Greška', success: 'Uspjeh', cancel: 'Odustani', confirm: 'Potvrdi', yes: 'Da', no: 'Ne' },
    subscription: { title: 'LiquiMixer pretplata', per_year: '/ godišnje', pay_button: 'Plati i aktiviraj', success: 'Pretplata aktivirana!' },
    terms: { title: 'Uvjeti korištenja', close: 'Zatvori' },
    invoice: { title: 'Račun' }
  },
  'bg': {
    meta: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', currency: 'BGN', currencySymbol: 'лв' },
    nav: { menu: 'Меню', login: 'Вход', home: 'Начало' },
    auth: { login_title: 'Вход', login_subtitle: 'Влезте, за да получите достъп до запазените рецепти и продукти', profile_title: 'Моят акаунт', logout: 'Изход', my_recipes: 'Моите рецепти', favorite_products: 'Любими продукти', language_label: 'Език на приложението', login_required_title: 'Изисква се вход', login_required_text: 'Моля, влезте или се регистрирайте за достъп до тази функция.', login_button: 'Вход', register_button: 'Регистрация' },
    intro: { subtitle: 'КАЛКУЛАТОР ЗА Е-ТЕЧНОСТ', start_button: 'ЗАПОЧНИ СМЕСВАНЕ', disclaimer_title: 'Отказ от отговорност', app_description: 'Калкулатор за безопасно смесване на е-течност с точно изчисление на съотношението PG/VG, вкуса и никотина. Не започвайте от нулата всеки път — запазете любимите си рецепти и продукти или ги споделете с приятели. Работи и като офлайн приложение на 31 езика.' },
    mode_select: { title: 'Какво искате да приготвите?', liquid_title: 'еТечност', liquid_desc: 'Пълна е-течност с вкус, никотин и носеща течност', dilute_title: 'Разреждане на никотинова база', dilute_desc: 'Разредете силна никотинова база до желаната концентрация', back: '◀ НАЗАД' },
    form: { config_title: 'Конфигурация на сместа', tab_liquid: 'Течност', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Течност PRO', nicotine_none: 'Без никотин', nicotine_booster: 'Никотинов бустер', nicotine_salt: 'Никотинова сол', flavor_label: 'Вкус', flavor_none: 'Няма (без вкус)', back: '◀ НАЗАД', mix_button: 'СМЕСИ!' },
    results: { title: 'Вашата рецепта', total_volume: 'Общ обем:', ratio: 'Съотношение VG/PG:', nicotine: 'Сила на никотин:', edit: '◀ РЕДАКТИРАЙ', save: 'ЗАПАЗИ' },
    recipes: { title: 'Моите рецепти', search_label: '🔍 Търсене', no_recipes: 'Все още нямате запазени рецепти.', back: '◀ НАЗАД' },
    products: { title: 'Любими продукти', add_new: '+ ДОБАВИ НОВ', back: '◀ НАЗАД' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Зареждане...', error: 'Грешка', success: 'Успех', cancel: 'Отказ', confirm: 'Потвърди', yes: 'Да', no: 'Не' },
    subscription: { title: 'Абонамент LiquiMixer', per_year: '/ годишно', pay_button: 'Плати и активирай', success: 'Абонаментът е активиран!' },
    terms: { title: 'Правила и условия', close: 'Затвори' },
    invoice: { title: 'Фактура' }
  },
  'sr': {
    meta: { code: 'sr', name: 'Serbian', nativeName: 'Српски', currency: 'RSD', currencySymbol: 'дин' },
    nav: { menu: 'Мени', login: 'Пријава', home: 'Почетна' },
    auth: { login_title: 'Пријава', login_subtitle: 'Пријавите се за приступ сачуваним рецептима и производима', profile_title: 'Мој налог', logout: 'Одјава', my_recipes: 'Моји рецепти', favorite_products: 'Омиљени производи', language_label: 'Језик апликације', login_required_title: 'Потребна пријава', login_required_text: 'Молимо пријавите се или региструјте за приступ овој функцији.', login_button: 'Пријава', register_button: 'Регистрација' },
    intro: { subtitle: 'КАЛКУЛАТОР Е-ТЕЧНОСТИ', start_button: 'ПОЧНИ МЕШАЊЕ', disclaimer_title: 'Одрицање одговорности', app_description: 'Калкулатор за безбедно мешање е-течности са прецизним прорачуном ПГ/ВГ односа, укуса и никотина. Не почињите сваки пут испочетка — сачувајте омиљене рецепте и производе или их поделите са пријатељима. Ради и као офлајн апликација на 31 језику.' },
    mode_select: { title: 'Шта желите да припремите?', liquid_title: 'еТечност', liquid_desc: 'Комплетна е-течност са укусом, никотином и течношћу носачем', dilute_title: 'Разблаживање никотинске базе', dilute_desc: 'Разблажите јаку никотинску базу до жељене концентрације', back: '◀ НАЗАД' },
    form: { config_title: 'Конфигурација мешавине', tab_liquid: 'Течност', tab_shakevape: 'Shake & Vape', tab_liquidpro: 'Течност ПРО', nicotine_none: 'Без никотина', nicotine_booster: 'Никотински појачивач', nicotine_salt: 'Никотинска со', flavor_label: 'Укус', flavor_none: 'Нема (без укуса)', back: '◀ НАЗАД', mix_button: 'МЕШАЈ!' },
    results: { title: 'Ваш рецепт', total_volume: 'Укупна запремина:', ratio: 'ВГ/ПГ однос:', nicotine: 'Јачина никотина:', edit: '◀ УРЕДИ', save: 'САЧУВАЈ' },
    recipes: { title: 'Моји рецепти', search_label: '🔍 Претрага', no_recipes: 'Још немате сачуваних рецепата.', back: '◀ НАЗАД' },
    products: { title: 'Омиљени производи', add_new: '+ ДОДАЈ НОВИ', back: '◀ НАЗАД' },
    common: { ml: 'мл', mg_ml: 'мг/мл', percent: '%', close: '✕', loading: 'Учитавање...', error: 'Грешка', success: 'Успех', cancel: 'Откажи', confirm: 'Потврди', yes: 'Да', no: 'Не' },
    subscription: { title: 'Претплата LiquiMixer', per_year: '/ годишње', pay_button: 'Плати и активирај', success: 'Претплата активирана!' },
    terms: { title: 'Услови коришћења', close: 'Затвори' },
    invoice: { title: 'Рачун' }
  }
};

// Function to deep merge objects
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Generate locale files
const localesDir = path.join(__dirname, '..', 'locales');

Object.entries(remainingTranslations).forEach(([code, partialTranslation]) => {
  // Merge with English template to get all keys
  const fullTranslation = deepMerge(enTemplate, partialTranslation);
  
  const filePath = path.join(localesDir, `${code}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fullTranslation, null, 2), 'utf8');
  console.log(`Created: ${code}.json`);
});

console.log('\nDone! Created remaining locale files.');

