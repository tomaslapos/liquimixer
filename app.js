// =========================================
// LiquiMixer - E-liquid Calculator Logic
// Výpočet dle metodiky: http://www.todmuller.com/ejuice/ejuice.php
// =========================================

// =========================================
// SECURITY: HTML Sanitization
// Ochrana proti XSS útokům
// =========================================

// Escapování HTML entit - VŽDY použít pro uživatelský vstup
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Sanitizace URL - povoluje pouze bezpečné protokoly
function sanitizeUrl(url) {
    if (!url) return '';
    const safe = String(url).trim();
    // Povolit pouze http, https, mailto
    if (/^(https?:|mailto:)/i.test(safe)) {
        return encodeURI(safe);
    }
    return '';
}

// Validace UUID formátu (pro recipe ID)
function isValidUUID(str) {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Helper funkce pro překlady
function t(key, fallback = null) {
    if (window.i18n && window.i18n.t) {
        return window.i18n.t(key, fallback);
    }
    return fallback || key;
}

// Flavor database with recommended percentages (15 options)
// Data z tabulky příchutí pro e-liquid
const flavorDatabase = {
    none: { 
        name: 'Žádná (bez příchutě)', 
        min: 0, max: 0, ideal: 0,
        note: 'Čistá báze PG/VG + nikotin'
    },
    fruit: { 
        name: 'Ovoce (jahoda, jablko)', 
        min: 8, max: 12, ideal: 10,
        note: 'Optimum: 10%, zrání 3–7 dní'
    },
    citrus: { 
        name: 'Citrónové (citron, limeta)', 
        min: 6, max: 10, ideal: 8,
        note: 'Silné kyseliny, méně stačí'
    },
    berry: { 
        name: 'Bobulové (borůvka, malina)', 
        min: 10, max: 15, ideal: 12,
        note: 'Vyvážené, dobře fungují s 50/50 PG/VG'
    },
    tropical: { 
        name: 'Tropické (ananas, mango)', 
        min: 12, max: 18, ideal: 15,
        note: 'Sladké, potřebují vyšší % pro hloubku'
    },
    tobacco: { 
        name: 'Tabákové (klasický, kubánský)', 
        min: 10, max: 15, ideal: 12,
        note: 'Dlouhý steeping: 1–4 týdny pro rozvinutí'
    },
    menthol: { 
        name: 'Mentol / Mátové', 
        min: 4, max: 8, ideal: 6,
        note: 'Velmi koncentrované, při 10% chladí až pálí'
    },
    candy: { 
        name: 'Sladkosti (cukroví, karamel)', 
        min: 12, max: 20, ideal: 16,
        note: 'Sladké tlumí škrábání, vyšší % nutné'
    },
    dessert: { 
        name: 'Dezerty (koláč, pudink)', 
        min: 15, max: 22, ideal: 18,
        note: 'Komplexní: 2–4 týdny zrání, riziko přechucení'
    },
    bakery: { 
        name: 'Zákusky (tyčinka, donut)', 
        min: 18, max: 25, ideal: 20,
        note: 'Doporučujeme vyzkoušet na 15%'
    },
    biscuit: { 
        name: 'Piškotové (vanilka, máslo)', 
        min: 10, max: 15, ideal: 12,
        note: 'Univerzální, funguje s vysokým VG'
    },
    drink: { 
        name: 'Nápojové (kola, čaj)', 
        min: 8, max: 12, ideal: 10,
        note: 'Jemné, méně intenzivní'
    },
    tobaccosweet: { 
        name: 'Tabák + sladké (custard tobacco)', 
        min: 15, max: 20, ideal: 17,
        note: 'Nejsložitější: 3–6 týdnů zrání'
    },
    nuts: { 
        name: 'Oříškové (arašíd, lískový)', 
        min: 12, max: 18, ideal: 15,
        note: 'Dobře tlumí nikotin'
    },
    spice: { 
        name: 'Kořeněné (skořice, perník)', 
        min: 5, max: 10, ideal: 7,
        note: 'Silné: při 12% dominují nad vším'
    }
};

// VG/PG ratio descriptions with colors
// VG value = dým (vapor), PG value = chuť (flavor)
const ratioDescriptions = [
    { vgMin: 0, vgMax: 9, color: '#ffffff', text: 'Maximální pára, žádná chuť ani škrábání. Určeno pro zařízení s vysokým výkonem >80 W, jinak se ucpává cívka.' },
    { vgMin: 10, vgMax: 29, color: '#0044aa', text: 'Maximální pára, minimální chuť bez škrábání. Hustý liquid pro cloudové vapování. Určeno pro zařízení s vysokým výkonem >80 W, jinak se ucpává cívka.' },
    { vgMin: 30, vgMax: 34, color: '#0066dd', text: 'Výrazná pára, zeslabující nebo pokažená chuť. Stále hustý liquid.' },
    { vgMin: 35, vgMax: 40, color: '#00aaff', text: 'Znatelný nárůst páry, chuť zůstává nosná. Vyvážený liquid s důrazem na páru.' },
    { vgMin: 41, vgMax: 55, color: '#00cc66', text: 'Vyvážený poměr páry a chuti, vhodný pro většinu zařízení.' },
    { vgMin: 56, vgMax: 60, color: '#88cc00', text: 'Jemné škrábání, nosná chuť, slabší pára. Vhodné pro MTL zařízení.' },
    { vgMin: 61, vgMax: 70, color: '#ffaa00', text: 'Výraznější škrábání, výrazná chuť. Pro zkušenější vapery.' },
    { vgMin: 71, vgMax: 90, color: '#ff6600', text: 'Dráždění a škrábání krku pro suchý vzduch, výrazná chuť. Určeno jenom pro speciální zařízení DTL s vyšším odporem cívky.' },
    { vgMin: 91, vgMax: 100, color: '#ff0044', text: 'Dráždění a škrábání krku pro suchý vzduch, maximální chuť a nikotin. Žádná pára. Určeno jenom pro speciální zařízení DTL s vyšším odporem.' }
];

// Nicotine strength descriptions
const nicotineDescriptions = [
    { min: 0, max: 0, color: '#00cc66', key: 'nic_0', text: 'Bez nikotinu - vhodné pro nekuřáky nebo postupné odvykání.' },
    { min: 1, max: 3, color: '#00aaff', key: 'nic_1_3', text: 'Velmi slabý nikotin - pro příležitostné vapery a finální fáze odvykání.' },
    { min: 4, max: 6, color: '#0088dd', key: 'nic_4_6', text: 'Slabý nikotin - pro lehké kuřáky (do 10 cigaret denně).' },
    { min: 7, max: 11, color: '#00cc88', key: 'nic_7_11', text: 'Střední nikotin - pro středně silné kuřáky (10-20 cigaret denně).' },
    { min: 12, max: 20, color: '#ffaa00', key: 'nic_12_20', text: 'Pro silné kuřáky, silné cigarety, bez předchozí zkušenosti hrozí nevolnost.' },
    { min: 21, max: 35, color: '#ff6600', key: 'nic_21_35', text: 'Vysoký nikotin - pouze pro velmi silné kuřáky nebo pod-systémy. Nikotinová sůl doporučena.' },
    { min: 36, max: 45, color: '#ff0044', key: 'nic_36_45', text: 'Extrémně silný - pouze pro pod-systémy s nikotinovou solí. Nebezpečí předávkování!' }
];

// Získat přeložený popis nikotinu
function getNicotineDescriptionText(value) {
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        return t(`nicotine_descriptions.${desc.key}`, desc.text);
    }
    return '';
}

// DOM Elements
let vgPgRatioSlider, targetNicotineSlider, flavorStrengthSlider;
let nicotineTypeSelect, flavorTypeSelect;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
    updateAllDisplays();
    initSearchStarsHover();
    initRecipeSearchStarsHover();
    
    // Event listener pro kontaktní formulář (bezpečnější než inline onclick)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
});

// Aktualizovat dynamické texty při změně jazyka
window.addEventListener('localeChanged', () => {
    // Aktualizovat popisy u posuvníků (VG/PG, nikotin, příchuť)
    updateAllDisplays();
    
    // Aktualizovat varování o omezení VG/PG
    updateVgPgRatioLimits();
    
    // Aktualizovat Shake & Vape pokud je inicializován
    if (document.getElementById('svVgPgRatio')) {
        updateSvVgPgLimits();
        updateSvRatioDisplay();
        updateSvNicotineDisplay();
    }
    
    // Aktualizovat Liquid PRO pokud je inicializován
    if (document.getElementById('proVgPgRatio')) {
        updateProVgPgLimits();
        updateProRatioDisplay();
        updateProNicotineDisplay();
    }
    
    // Aktualizovat Dilute pokud je inicializován
    if (document.getElementById('diluteTargetRatio')) {
        updateDiluteRatioLimits();
        updateDiluteSourceRatioDisplay();
        updateDiluteTargetRatioDisplay();
    }
});

function initializeSliders() {
    vgPgRatioSlider = document.getElementById('vgPgRatio');
    targetNicotineSlider = document.getElementById('targetNicotine');
    flavorStrengthSlider = document.getElementById('flavorStrength');
    nicotineTypeSelect = document.getElementById('nicotineType');
    flavorTypeSelect = document.getElementById('flavorType');

    // Add event listeners
    vgPgRatioSlider.addEventListener('input', clampVgPgValue);
    targetNicotineSlider.addEventListener('input', updateNicotineDisplay);
    flavorStrengthSlider.addEventListener('input', updateFlavorDisplay);
    
    document.getElementById('nicotineBaseStrength').addEventListener('input', validateNicotineStrength);
    document.getElementById('totalAmount').addEventListener('input', updateVgPgRatioLimits);
    
    // Setup nicotine ratio toggle buttons
    setupNicotineRatioToggle();
    
    // Setup flavor ratio toggle buttons
    setupFlavorRatioToggle();
    setupSvFlavorRatioToggle();

    // Initialize Shake & Vape form listeners
    initShakeVapeListeners();
    
    // Initialize Liquid PRO form listeners
    initLiquidProListeners();
}

function initShakeVapeListeners() {
    const svTotalAmount = document.getElementById('svTotalAmount');
    const svFlavorVolume = document.getElementById('svFlavorVolume');
    const svTargetNicotine = document.getElementById('svTargetNicotine');
    const svNicotineBaseStrength = document.getElementById('svNicotineBaseStrength');
    
    if (svTotalAmount) {
        svTotalAmount.addEventListener('input', updateSvVgPgLimits);
    }
    if (svFlavorVolume) {
        svFlavorVolume.addEventListener('input', updateSvVgPgLimits);
    }
    if (svTargetNicotine) {
        svTargetNicotine.addEventListener('input', updateSvNicotineDisplay);
    }
    if (svNicotineBaseStrength) {
        svNicotineBaseStrength.addEventListener('input', updateSvVgPgLimits);
    }
}

function initLiquidProListeners() {
    const proTotalAmount = document.getElementById('proTotalAmount');
    const proTargetNicotine = document.getElementById('proTargetNicotine');
    const proFlavorStrength = document.getElementById('proFlavorStrength');
    const proNicotineBaseStrength = document.getElementById('proNicotineBaseStrength');
    
    if (proTotalAmount) {
        proTotalAmount.addEventListener('input', updateProVgPgLimits);
    }
    if (proTargetNicotine) {
        proTargetNicotine.addEventListener('input', updateProNicotineDisplay);
    }
    if (proFlavorStrength) {
        proFlavorStrength.addEventListener('input', updateProFlavorDisplay);
    }
    if (proNicotineBaseStrength) {
        proNicotineBaseStrength.addEventListener('input', updateProVgPgLimits);
    }
}

function setupNicotineRatioToggle() {
    const ratio5050Btn = document.getElementById('ratio5050');
    const ratio7030Btn = document.getElementById('ratio7030');
    const nicotineRatioInput = document.getElementById('nicotineRatio');

    if (ratio5050Btn && ratio7030Btn && nicotineRatioInput) {
        ratio5050Btn.addEventListener('click', () => {
            ratio5050Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            nicotineRatioInput.value = '50/50';
            updateVgPgRatioLimits();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            updateVgPgRatioLimits();
        });
    }
}

function setupFlavorRatioToggle() {
    const ratio0100Btn = document.getElementById('flavorRatio0100');
    const ratio8020Btn = document.getElementById('flavorRatio8020');
    const ratio7030Btn = document.getElementById('flavorRatio7030');
    const flavorRatioInput = document.getElementById('flavorRatio');

    if (ratio0100Btn && ratio8020Btn && ratio7030Btn && flavorRatioInput) {
        ratio0100Btn.addEventListener('click', () => {
            ratio0100Btn.classList.add('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '0/100';
            updateVgPgRatioLimits();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            updateVgPgRatioLimits();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            updateVgPgRatioLimits();
        });
    }
}

function setupSvFlavorRatioToggle() {
    const ratio0100Btn = document.getElementById('svFlavorRatio0100');
    const ratio8020Btn = document.getElementById('svFlavorRatio8020');
    const ratio7030Btn = document.getElementById('svFlavorRatio7030');
    const flavorRatioInput = document.getElementById('svFlavorRatio');

    if (ratio0100Btn && ratio8020Btn && ratio7030Btn && flavorRatioInput) {
        ratio0100Btn.addEventListener('click', () => {
            ratio0100Btn.classList.add('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '0/100';
            updateSvVgPgLimits();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            updateSvVgPgLimits();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            updateSvVgPgLimits();
        });
    }
}

// Force HTTPS redirect
if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https://' + location.hostname + location.pathname + location.search);
}

// Clerk Authentication
let clerkLoaded = false;

// Initialize Clerk when loaded
window.addEventListener('load', async function() {
    try {
        // Initialize database
        if (window.LiquiMixerDB) {
            window.LiquiMixerDB.init();
        }
        
        if (window.Clerk) {
            await window.Clerk.load();
            clerkLoaded = true;
            
            // Okamžitá aktualizace UI
            updateAuthUI();
            
            // Save user to database if signed in
            if (window.Clerk.user && window.LiquiMixerDB) {
                await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                // Zkontrolovat pending sdílený recept po přihlášení
                await checkPendingSharedRecipe();
                // Načíst uložený jazyk uživatele z databáze
                if (window.i18n?.loadUserLocale) {
                    await window.i18n.loadUserLocale(window.Clerk.user.id);
                }
                // KONTROLA PŘEDPLATNÉHO PŘI KAŽDÉM PŘIHLÁŠENÍ
                await checkSubscriptionStatus();
            }
            
            // Listen for auth changes (OAuth callback, sign in/out)
            window.Clerk.addListener(async (event) => {
                console.log('Clerk auth event:', event);

                // Vždy aktualizovat UI při změně autentizace
                updateAuthUI();

                // Save user to database on sign in
                if (window.Clerk.user && window.LiquiMixerDB) {
                    await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                    // Zkontrolovat pending sdílený recept
                    await checkPendingSharedRecipe();
                    // Načíst uložený jazyk uživatele z databáze
                    if (window.i18n?.loadUserLocale) {
                        await window.i18n.loadUserLocale(window.Clerk.user.id);
                    }
                    // Zavřít login modal
                    hideLoginModal();

                    // KONTROLA PŘEDPLATNÉHO PŘI KAŽDÉM PŘIHLÁŠENÍ
                    await checkSubscriptionStatus();

                    // Force UI refresh pro OAuth přihlášení
                    setTimeout(() => {
                        updateAuthUI();
                    }, 100);
                }
            });
            
            // Kontrola OAuth callback v URL
            if (window.location.hash.includes('__clerk') || 
                window.location.search.includes('__clerk')) {
                // Po OAuth přihlášení počkej a aktualizuj UI
                setTimeout(() => {
                    updateAuthUI();
                    // Vyčistit URL od Clerk parametrů
                    if (window.history.replaceState) {
                        const cleanUrl = window.location.origin + window.location.pathname;
                        window.history.replaceState({}, '', cleanUrl);
                    }
                }, 500);
            }
        }
    } catch (error) {
        console.log('Clerk not configured yet:', error.message);
    }
});

// Update UI based on auth state
function updateAuthUI() {
    console.log('updateAuthUI called, clerkLoaded:', clerkLoaded, 'Clerk.user:', window.Clerk?.user?.id);
    
    if (!clerkLoaded || !window.Clerk) {
        console.log('Clerk not ready yet');
        return;
    }
    
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) {
        console.log('Login button not found in DOM');
        return;
    }
    
    if (window.Clerk.user) {
        // User is signed in
        console.log('User signed in:', window.Clerk.user.id);
        // SECURITY: Escapovat uživatelské jméno proti XSS
        const userName = escapeHtml(
            window.Clerk.user.firstName || 
            window.Clerk.user.username ||
            window.Clerk.user.emailAddresses?.[0]?.emailAddress || 
            'Uživatel'
        );
        loginBtn.innerHTML = `<span class="nav-icon">👤</span><span class="nav-text">${userName}</span>`;
        loginBtn.onclick = showUserProfileModal;
        loginBtn.classList.add('logged-in');
    } else {
        // User is signed out
        console.log('User signed out');
        loginBtn.innerHTML = '<span class="nav-icon">👤</span><span class="nav-text">Přihlášení</span>';
        loginBtn.onclick = showLoginModal;
        loginBtn.classList.remove('logged-in');
    }
}

// Menu and Login functions
function toggleMenu() {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close modals if open
    if (loginModal && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        userProfileModal.classList.add('hidden');
    }
    
    // Toggle menu
    if (menuDropdown) {
        menuDropdown.classList.toggle('hidden');
    }
}

function showLoginModal() {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close other modals
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        menuDropdown.classList.add('hidden');
    }
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        userProfileModal.classList.add('hidden');
    }
    
    // Show login modal
    if (loginModal) {
        loginModal.classList.remove('hidden');
        
        // Mount Clerk SignIn component
        if (clerkLoaded && window.Clerk) {
            const signInDiv = document.getElementById('clerk-sign-in');
            if (signInDiv) {
                signInDiv.innerHTML = '';
                window.Clerk.mountSignIn(signInDiv, {
                    appearance: {
                        variables: {
                            colorPrimary: '#ff00ff',
                            colorBackground: '#0a0a15',
                            colorText: '#ffffff',
                            colorTextSecondary: 'rgba(255,255,255,0.7)',
                            colorInputBackground: 'rgba(0,0,0,0.5)',
                            colorInputText: '#ffffff',
                            borderRadius: '8px'
                        },
                        elements: {
                            rootBox: {
                                width: '100%'
                            },
                            card: {
                                background: 'transparent',
                                boxShadow: 'none',
                                border: 'none'
                            },
                            headerTitle: {
                                display: 'none'
                            },
                            headerSubtitle: {
                                display: 'none'
                            },
                            formButtonPrimary: {
                                background: 'transparent',
                                border: '2px solid #ff00ff',
                                color: '#ff00ff',
                                fontFamily: 'Orbitron, sans-serif'
                            },
                            formButtonPrimary__hover: {
                                background: 'rgba(255,0,255,0.2)'
                            },
                            footerActionLink: {
                                color: '#00ffff'
                            }
                        }
                    }
                });
            }
        }
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        // Unmount Clerk component
        if (clerkLoaded && window.Clerk) {
            window.Clerk.unmountSignIn(document.getElementById('clerk-sign-in'));
        }
    }
}

// Zavřít modal kliknutím na pozadí
function handleLoginModalBackdropClick(event) {
    if (event.target.id === 'loginModal') {
        hideLoginModal();
    }
}

function handleProfileModalBackdropClick(event) {
    if (event.target.id === 'userProfileModal') {
        hideUserProfileModal();
    }
}

// ============================================
// LOGIN REQUIRED MODAL (pro nepřihlášené)
// ============================================

function showLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        // Přeložit texty v modálu (kromě cen - ty se nastaví podle jazyka)
        modal.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Přeskočit cenové elementy - ty se nastaví podle jazyka
            if (key.includes('promo_price')) return;
            
            if (typeof t === 'function') {
                el.textContent = t(key, el.textContent);
            }
        });
        
        // Aktualizovat zobrazení ceny podle aktuálního jazyka (MUSÍ být po překladu)
        updatePriceDisplay();
        
        modal.classList.remove('hidden');
    }
}

// Aktualizace zobrazení ceny podle jazyka
function updatePriceDisplay() {
    // Získat aktuální jazyk z i18n modulu
    let currentLocale = 'cs'; // default
    if (typeof window.i18n !== 'undefined' && typeof window.i18n.getLocale === 'function') {
        currentLocale = window.i18n.getLocale();
    }
    
    const priceCzElements = document.querySelectorAll('.price-cz');
    const priceEuElements = document.querySelectorAll('.price-eu');
    const priceUsdElements = document.querySelectorAll('.price-usd');
    
    // USD země: en, ja, ko, zh-CN, zh-TW, ar-SA
    const usdLocales = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW', 'ar-SA'];
    
    // Skrýt všechny ceny
    priceCzElements.forEach(el => el.classList.add('hidden'));
    priceEuElements.forEach(el => el.classList.add('hidden'));
    priceUsdElements.forEach(el => el.classList.add('hidden'));
    
    if (currentLocale === 'cs') {
        // Pro češtinu zobrazit CZK cenu
        priceCzElements.forEach(el => el.classList.remove('hidden'));
    } else if (usdLocales.includes(currentLocale)) {
        // Pro USD země zobrazit USD cenu
        priceUsdElements.forEach(el => el.classList.remove('hidden'));
    } else {
        // Pro ostatní jazyky (EUR země) zobrazit EUR cenu
        priceEuElements.forEach(el => el.classList.remove('hidden'));
    }
}

function hideLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleLoginRequiredModalBackdropClick(event) {
    if (event.target.id === 'loginRequiredModal') {
        hideLoginRequiredModal();
    }
}

// Kontrola, zda je uživatel přihlášen
function isUserLoggedIn() {
    return clerkLoaded && window.Clerk?.user;
}

// Kontrola, zda má uživatel aktivní předplatné
function hasActiveSubscription() {
    // TODO: Implementovat kontrolu předplatného z databáze
    // Pro teď vracíme true pro všechny přihlášené uživatele
    return isUserLoggedIn();
}

// Požadovat přihlášení pro přístup k funkci
function requireLogin(callback) {
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return false;
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
    return true;
}

// Požadovat předplatné pro přístup k PRO funkcím
function requireSubscription(callback) {
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return false;
    }
    if (!hasActiveSubscription()) {
        showSubscriptionModal();
        return false;
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
    return true;
}

function showUserProfileModal() {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close other modals
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        menuDropdown.classList.add('hidden');
    }
    if (loginModal && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
    
    // Show user profile modal
    if (userProfileModal) {
        userProfileModal.classList.remove('hidden');
        
        // Aplikovat překlady na modal (pro případ, že se jazyk změnil)
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
        // Zobrazit informace o uživateli
        if (clerkLoaded && window.Clerk?.user) {
            const profileInfoDiv = document.getElementById('userProfileInfo');
            if (profileInfoDiv) {
                // SECURITY: Escapovat uživatelská data proti XSS
                const user = window.Clerk.user;
                const safeEmail = escapeHtml(user.emailAddresses?.[0]?.emailAddress || '');
                const safeName = escapeHtml(user.fullName || user.firstName || '');
                const avatarUrl = user.imageUrl;
                
                // Vytvořit avatar - buď obrázek nebo placeholder s iniciálami
                let avatarHtml;
                if (avatarUrl) {
                    avatarHtml = `<img src="${escapeHtml(avatarUrl)}" alt="Avatar" class="profile-avatar">`;
                } else {
                    const initials = safeName ? safeName.charAt(0).toUpperCase() : '👤';
                    avatarHtml = `<div class="profile-avatar-placeholder">${initials}</div>`;
                }
                
                profileInfoDiv.innerHTML = `
                    ${avatarHtml}
                    <div class="profile-details">
                        <div class="profile-name">${safeName || t('auth.user', 'Uživatel')}</div>
                        <div class="profile-email">${safeEmail}</div>
                    </div>
                `;
            }
        }
        
        // Vytvořit výběr jazyka
        if (window.i18n?.createLanguageSelector) {
            window.i18n.createLanguageSelector('profileLanguageSelector');
        }
        
        // Aplikovat překlady na nově přidané elementy
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    }
}

// Funkce pro odhlášení
async function signOut() {
    if (clerkLoaded && window.Clerk) {
        await window.Clerk.signOut();
        hideUserProfileModal();
        updateAuthUI();
        showPage('intro');
    }
}

function hideUserProfileModal() {
    const userProfileModal = document.getElementById('userProfileModal');
    if (userProfileModal) {
        userProfileModal.classList.add('hidden');
    }
}

async function handleSignOut() {
    if (clerkLoaded && window.Clerk) {
        await window.Clerk.signOut();
        hideUserProfileModal();
        updateAuthUI();
    }
}

function showRegisterInfo() {
    // Clerk handles registration in the SignIn component
    showLoginModal();
}

// Rate limiter pro kontaktní formulář (client-side)
const contactRateLimiter = {
    lastSubmit: 0,
    minInterval: 30000, // 30 sekund mezi odesláními
    
    canSubmit() {
        const now = Date.now();
        if (now - this.lastSubmit < this.minInterval) {
            return false;
        }
        this.lastSubmit = now;
        return true;
    }
};

// Zobrazit stav kontaktního formuláře
function showContactStatus(message, isError = false) {
    const statusEl = document.getElementById('contactStatus');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'contact-status ' + (isError ? 'error' : 'success');
    statusEl.style.display = 'block';
    
    // Automaticky skrýt po 5 sekundách
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

// Nastavit loading stav tlačítka
function setContactLoading(isLoading) {
    const btn = document.getElementById('contactSubmitBtn');
    const text = document.getElementById('contactSubmitText');
    const loader = document.getElementById('contactSubmitLoader');
    
    if (btn && text && loader) {
        btn.disabled = isLoading;
        text.style.display = isLoading ? 'none' : 'inline';
        loader.classList.toggle('hidden', !isLoading);
    }
}

// Hlavní handler kontaktního formuláře
async function handleContact(event) {
    event.preventDefault();
    
    // Honeypot kontrola (anti-spam)
    const honeypot = document.getElementById('contactHoneypot');
    if (honeypot && honeypot.value) {
        console.warn('Spam detected (honeypot)');
        showContactStatus('Děkujeme za zprávu!', false); // Fake success pro boty
        return false;
    }
    
    // Rate limiting
    if (!contactRateLimiter.canSubmit()) {
        showContactStatus('Počkejte prosím 30 sekund před dalším odesláním.', true);
        return false;
    }
    
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // Validace
    if (!email || !subject || !message) {
        showContactStatus('Vyplňte prosím všechna pole.', true);
        return false;
    }
    
    // Email validace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showContactStatus('Zadejte platnou e-mailovou adresu.', true);
        return false;
    }
    
    // Délka validace
    if (subject.length < 3 || subject.length > 200) {
        showContactStatus('Předmět musí mít 3-200 znaků.', true);
        return false;
    }
    
    if (message.length < 10 || message.length > 5000) {
        showContactStatus('Zpráva musí mít 10-5000 znaků.', true);
        return false;
    }
    
    setContactLoading(true);
    
    try {
        // Uložit do databáze
        const client = window.supabaseClient;
        if (!client) {
            throw new Error('Database not available');
        }
        
        const { error } = await client
            .from('contact_messages')
            .insert({
                email: email,
                subject: subject,
                message: message,
                clerk_id: window.Clerk?.user?.id || null,
                user_agent: navigator.userAgent.substring(0, 500)
            });
        
        if (error) {
            console.error('Contact form error:', error);
            throw error;
        }
        
        // Úspěch
        showContactStatus('Děkujeme! Vaše zpráva byla odeslána.', false);
        
        // Vymazat formulář
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactSubject').value = '';
        document.getElementById('contactMessage').value = '';
        
    } catch (err) {
        console.error('Error sending contact message:', err);
        showContactStatus('Omlouváme se, zprávu se nepodařilo odeslat. Zkuste to prosím později.', true);
    } finally {
        setContactLoading(false);
    }
    
    return false;
}

// ============================================
// RECIPE SAVING AND SHARING FUNCTIONS
// ============================================

let currentRecipeData = null;
window.currentViewingRecipe = null; // Exportováno pro i18n přerenderování
let selectedRating = 0;

// Uložit aktuální recept do paměti pro pozdější uložení
function storeCurrentRecipe(data) {
    currentRecipeData = data;
}

// Zobrazit modal pro uložení receptu
async function showSaveRecipeModal() {
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.remove('hidden');
        initStarRating();
        
        // Načíst oblíbené produkty pro výběr
        loadProductsForRecipe();
    }
}

// Produkty pro výběr v receptu
let availableProductsForRecipe = [];
let selectedProductRows = 0;

// Načíst produkty pro výběr v receptu
async function loadProductsForRecipe() {
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    // Reset
    listContainer.innerHTML = '';
    selectedProductRows = 0;
    
    try {
        const products = await window.LiquiMixerDB.getProducts(window.Clerk.user.id);
        availableProductsForRecipe = products || [];
    } catch (error) {
        console.error('Error loading products for recipe:', error);
        availableProductsForRecipe = [];
    }
}

// Přidat řádek pro výběr produktu
function addProductRow() {
    if (availableProductsForRecipe.length === 0) {
        alert(t('save_recipe.no_products', 'Nemáte žádné oblíbené produkty. Nejprve je přidejte v sekci Oblíbené produkty.'));
        return;
    }
    
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚡',
        'nicotine_salt': '🧂'
    };
    
    // Vytvořit options pro select
    let optionsHtml = '<option value="">-- Vyberte produkt --</option>';
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}">${escapeHtml(product.name)}</option>`;
    });
    
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="Hledat produkt..." oninput="filterProductOptions(this, '${rowId}')">
                <select class="product-select" name="linkedProducts" onchange="onProductSelected(this)">
                    ${optionsHtml}
                </select>
            </div>
            <button type="button" class="remove-product-btn" onclick="removeProductRow('${rowId}')" title="Odebrat">✕</button>
        </div>
    `;
    
    listContainer.insertAdjacentHTML('beforeend', rowHtml);
    
    // Focus na vyhledávací pole
    const row = document.getElementById(rowId);
    if (row) {
        const searchInput = row.querySelector('.product-search-input');
        if (searchInput) searchInput.focus();
    }
}

// Filtrovat produkty podle vyhledávání
function filterProductOptions(searchInput, rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const select = row.querySelector('.product-select');
    if (!select) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === '') {
            option.style.display = '';
            return;
        }
        
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Když je vybrán produkt
function onProductSelected(selectElement) {
    const row = selectElement.closest('.product-select-row');
    if (!row) return;
    
    const searchInput = row.querySelector('.product-search-input');
    if (searchInput && selectElement.value) {
        // Zobrazit vybraný název místo vyhledávání
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        searchInput.value = selectedOption.textContent;
    }
}

// Odebrat řádek produktu
function removeProductRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// Skrýt modal pro uložení receptu
function hideSaveRecipeModal() {
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.add('hidden');
        // Reset form
        document.getElementById('recipeName').value = '';
        document.getElementById('recipeDescription').value = '';
        document.getElementById('recipeRating').value = '0';
        selectedRating = 0;
        updateStarDisplay(0);
        
        // Reset produktů
        const listContainer = document.getElementById('selectedProductsList');
        if (listContainer) {
            listContainer.innerHTML = '';
        }
        selectedProductRows = 0;
        availableProductsForRecipe = [];
        
        // Reset režimu úpravy
        window.editingRecipeId = null;
        
        // Obnovit původní nadpis a tlačítko
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = 'Uložit recept';
        }
        
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Uložit recept';
        }
    }
}

// Inicializace hvězdičkového hodnocení
function initStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            document.getElementById('recipeRating').value = selectedRating;
            updateStarDisplay(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateStarDisplay(rating) {
    highlightStars(rating);
}

// Uložit recept
async function saveRecipe(event) {
    event.preventDefault();
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_recipe', 'Pro uložení receptu se prosím přihlaste.'));
        return false;
    }
    
    const name = document.getElementById('recipeName').value;
    const description = document.getElementById('recipeDescription').value;
    const rating = parseInt(document.getElementById('recipeRating').value) || 0;
    
    // Kontrola, zda jde o úpravu nebo nový recept
    const isEditing = !!window.editingRecipeId;
    
    // Pro nový recept potřebujeme data receptu
    if (!isEditing && !currentRecipeData) {
        alert(t('recipes.nothing_to_save', 'Chyba: Není co uložit. Prosím vytvořte recept.'));
        return false;
    }
    
    const recipeData = {
        name: name,
        description: description,
        rating: rating
    };
    
    // Přidat data receptu pouze při vytváření nového
    if (!isEditing) {
        recipeData.data = currentRecipeData;
    }
    
    try {
        let saved;
        
        if (isEditing) {
            // Aktualizace existujícího receptu
            saved = await window.LiquiMixerDB.updateRecipe(
                window.Clerk.user.id, 
                window.editingRecipeId, 
                recipeData
            );
        } else {
            // Vytvoření nového receptu
            saved = await window.LiquiMixerDB.saveRecipe(window.Clerk.user.id, recipeData);
        }
        
        if (saved) {
            // Uložit propojené produkty
            const selectedProductIds = getSelectedProductIds();
            const recipeId = isEditing ? window.editingRecipeId : saved.id;
            
            // Aktualizovat propojené produkty (vždy - i prázdný seznam smaže staré)
            await window.LiquiMixerDB.linkProductsToRecipe(
                window.Clerk.user.id, 
                recipeId, 
                selectedProductIds
            );
            
            // Zobrazit zprávu
            const productInfo = selectedProductIds.length > 0 
                ? `\n📦 Propojené produkty: ${selectedProductIds.length}` 
                : '';
            
            if (isEditing) {
                alert(t('save_recipe.updated', 'Recept byl úspěšně upraven!') + productInfo);
                // Obnovit detail receptu
                await viewRecipeDetail(window.editingRecipeId);
            } else {
                const shareUrl = saved.share_url || SHARE_DOMAIN + '/?recipe=' + saved.share_id;
                const successMessage = t('save_recipe.success', 'Recept byl úspěšně uložen!') + '\n\n' +
                    t('save_recipe.share_link', 'Odkaz pro sdílení:') + '\n' + shareUrl + productInfo;
                alert(successMessage);
            }
            
            hideSaveRecipeModal();
        } else {
            alert(t('recipes.save_error', 'Chyba při ukládání receptu.'));
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert(t('recipes.save_error', 'Chyba při ukládání receptu.'));
    }
    
    return false;
}

// Získat vybrané produkty z select elementů
function getSelectedProductIds() {
    const selects = document.querySelectorAll('select[name="linkedProducts"]');
    const ids = [];
    selects.forEach(select => {
        if (select.value && select.value !== '') {
            ids.push(select.value);
        }
    });
    // Odstranit duplicity
    return [...new Set(ids)];
}

// Zobrazit mé recepty
async function showMyRecipes() {
    hideUserProfileModal();
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_recipes', 'Pro zobrazení receptů se prosím přihlaste.'));
        return;
    }
    
    const container = document.getElementById('recipesListContainer');
    container.innerHTML = `<p class="no-recipes-text">${t('recipes.loading', 'Načítám recepty...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetRecipeFilters();
    
    showPage('my-recipes');
    
    try {
        const recipes = await window.LiquiMixerDB.getRecipes(window.Clerk.user.id);
        window.allUserRecipes = recipes || []; // Uložit pro filtrování
        
        renderRecipesList(window.allUserRecipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        container.innerHTML = `<p class="no-recipes-text" style="color: var(--neon-pink);">${t('recipes.load_error', 'Chyba při načítání receptů.')}</p>`;
    }
}

// Reset filtrů vyhledávání receptů
function resetRecipeFilters() {
    const textInput = document.getElementById('recipeSearchText');
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    
    if (textInput) textInput.value = '';
    recipeSearchRatingFilter = 0;
    updateRecipeSearchStarsDisplay(0);
    if (resultsInfo) resultsInfo.textContent = '';
}

// Nastavit filtr hodnocení receptů
function setRecipeSearchRating(rating) {
    // Pokud klikneme na stejné hodnocení, zrušíme filtr
    if (recipeSearchRatingFilter === rating) {
        recipeSearchRatingFilter = 0;
    } else {
        recipeSearchRatingFilter = rating;
    }
    updateRecipeSearchStarsDisplay(recipeSearchRatingFilter);
    filterRecipes();
}

// Zrušit filtr hodnocení receptů
function clearRecipeSearchRating() {
    recipeSearchRatingFilter = 0;
    updateRecipeSearchStarsDisplay(0);
    filterRecipes();
}

// Aktualizovat zobrazení hvězdiček ve vyhledávání receptů
function updateRecipeSearchStarsDisplay(rating) {
    const stars = document.querySelectorAll('#recipeSearchStars .search-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Inicializovat hover efekt pro hvězdičky vyhledávání receptů
function initRecipeSearchStarsHover() {
    const starsContainer = document.getElementById('recipeSearchStars');
    if (!starsContainer) return;
    
    const stars = starsContainer.querySelectorAll('.search-star');
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Filtrovat recepty
function filterRecipes() {
    const searchText = (document.getElementById('recipeSearchText')?.value || '').toLowerCase().trim();
    
    let filtered = window.allUserRecipes.filter(recipe => {
        // Textový filtr (název a popis)
        if (searchText) {
            const name = (recipe.name || '').toLowerCase();
            const description = (recipe.description || '').toLowerCase();
            if (!name.includes(searchText) && !description.includes(searchText)) {
                return false;
            }
        }
        
        // Filtr hodnocení (min. hodnocení)
        if (recipeSearchRatingFilter > 0) {
            const recipeRating = parseInt(recipe.rating) || 0;
            if (recipeRating < recipeSearchRatingFilter) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zobrazit info o výsledcích
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    if (resultsInfo) {
        if (searchText || recipeSearchRatingFilter > 0) {
            if (filtered.length === 0) {
                resultsInfo.textContent = 'Žádné recepty neodpovídají filtrům.';
                resultsInfo.className = 'search-results-info no-results';
            } else {
                resultsInfo.textContent = `Nalezeno ${filtered.length} z ${window.allUserRecipes.length} receptů.`;
                resultsInfo.className = 'search-results-info has-results';
            }
        } else {
            resultsInfo.textContent = '';
            resultsInfo.className = 'search-results-info';
        }
    }
    
    renderRecipesList(filtered);
}

// Vykreslit seznam receptů
function renderRecipesList(recipes) {
    const container = document.getElementById('recipesListContainer');

    if (!recipes || recipes.length === 0) {
        container.innerHTML = `<p class="no-recipes-text">${t('recipes.no_recipes', 'Zatím nemáte žádné uložené recepty.')}</p>`;
        return;
    }
    
    let html = '<div class="recipes-list">';
    
    recipes.forEach(recipe => {
        // Validace ID před použitím
        if (!isValidUUID(recipe.id)) return;
        
        const rating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const date = new Date(recipe.created_at).toLocaleDateString('cs-CZ');
        const data = recipe.recipe_data || {};
        
        // SECURITY: Escapování všech uživatelských dat
        const safeName = escapeHtml(recipe.name);
        const safeDescription = escapeHtml(recipe.description);
        const safeTotal = escapeHtml(data.totalAmount || '?');
        const safeVg = escapeHtml(data.vgPercent || '?');
        const safePg = escapeHtml(data.pgPercent || '?');
        
        html += `
            <div class="recipe-card rating-${rating}" onclick="viewRecipeDetail('${recipe.id}')">
                <div class="recipe-card-header">
                    <h3 class="recipe-card-title">${safeName}</h3>
                    <span class="recipe-card-rating">${stars}</span>
                </div>
                ${safeDescription ? `<p class="recipe-card-description">${safeDescription}</p>` : ''}
                <div class="recipe-card-meta">
                    <span>📅 ${date}</span>
                    <span>💧 ${safeTotal} ml</span>
                    <span>⚗️ ${safeVg}:${safePg}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Zobrazit detail receptu
async function viewRecipeDetail(recipeId) {
    if (!window.Clerk || !window.Clerk.user) return;
    
    // SECURITY: Validace UUID formátu
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return;
    }
    
    try {
        const recipe = await window.LiquiMixerDB.getRecipeById(window.Clerk.user.id, recipeId);
        
        if (!recipe) {
            alert(t('recipes.not_found', 'Recept nenalezen.'));
            return;
        }
        
        window.currentViewingRecipe = recipe;
        
        // Načíst propojené produkty
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(window.Clerk.user.id, recipeId);
        
        displayRecipeDetail(recipe, 'recipeDetailTitle', 'recipeDetailContent', linkedProducts);
        showPage('recipe-detail');
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        alert(t('recipes.load_error', 'Chyba při načítání receptu.'));
    }
}

// Zobrazit detail receptu (sdílené funkce)
function displayRecipeDetail(recipe, titleId, contentId, linkedProducts = []) {
    const titleEl = document.getElementById(titleId);
    const contentEl = document.getElementById(contentId);
    
    // SECURITY: Použít textContent místo innerHTML pro název
    titleEl.textContent = recipe.name;
    
    const rating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    // Získat správný locale pro formátování data
    const localeCode = t('meta.code', 'cs');
    let dateLocale;
    if (localeCode === 'en') {
        dateLocale = 'en-GB';
    } else if (localeCode.includes('-')) {
        // Již obsahuje region (např. ar-SA, zh-CN)
        dateLocale = localeCode;
    } else {
        // Pouze jazyk (např. cs, de) - přidat region
        dateLocale = localeCode + '-' + localeCode.toUpperCase();
    }
    
    let date;
    try {
        date = new Date(recipe.created_at).toLocaleDateString(dateLocale);
    } catch (e) {
        // Fallback na výchozí formát pokud locale není podporovaný
        date = new Date(recipe.created_at).toLocaleDateString();
    }
    
    const data = recipe.recipe_data || {};
    
    // SECURITY: Escapování popisku
    const safeDescription = escapeHtml(recipe.description);
    
    let ingredientsHtml = '';
    if (data.ingredients && Array.isArray(data.ingredients)) {
        ingredientsHtml = `
            <h4 class="recipe-ingredients-title">${t('recipe_detail.ingredients_title', 'Složky')}</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>${t('recipe_detail.table_component', 'Složka')}</th>
                        <th>${t('recipe_detail.table_volume', 'Objem (ml)')}</th>
                        <th>${t('recipe_detail.table_percent', 'Procento')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.ingredients.map(ing => {
                        // Dynamicky přeložit název ingredience
                        const ingredientName = escapeHtml(getIngredientName(ing));
                        return `
                        <tr>
                            <td class="ingredient-name">${ingredientName}</td>
                            <td class="ingredient-value">${parseFloat(ing.volume || 0).toFixed(2)} ml</td>
                            <td class="ingredient-percent">${parseFloat(ing.percent || 0).toFixed(1)}%</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Propojené produkty
    let linkedProductsHtml = '';
    if (linkedProducts && linkedProducts.length > 0) {
        const typeIcons = {
            'vg': '💧',
            'pg': '💧',
            'flavor': '🍓',
            'nicotine_booster': '⚡',
            'nicotine_salt': '🧂'
        };
        
        linkedProductsHtml = `
            <div class="recipe-linked-products">
                <h4 class="recipe-ingredients-title">${t('recipe_detail.linked_products', 'Použité produkty')}</h4>
                <div class="linked-products-list">
                    ${linkedProducts.map(product => {
                        const icon = typeIcons[product.product_type] || '📦';
                        const productRating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
                        const productStars = '★'.repeat(productRating) + '☆'.repeat(5 - productRating);
                        return `
                            <div class="linked-product-item" onclick="viewProductDetail('${escapeHtml(product.id)}')">
                                <span class="linked-product-icon">${icon}</span>
                                <span class="linked-product-name">${escapeHtml(product.name)}</span>
                                <span class="linked-product-rating">${productStars}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // SECURITY: Escapování všech hodnot z databáze
    const safeTotal = escapeHtml(data.totalAmount || '?');
    const safeVg = escapeHtml(data.vgPercent || '?');
    const safePg = escapeHtml(data.pgPercent || '?');
    const safeNicotine = escapeHtml(data.nicotine || '0');
    
    contentEl.innerHTML = `
        <div class="recipe-detail-header">
            <div class="recipe-detail-rating">${stars}</div>
            ${safeDescription ? `<p class="recipe-detail-description">${safeDescription}</p>` : ''}
        </div>
        
        <div class="recipe-detail-info">
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('recipe_detail.total_volume', 'Celkový objem')}</div>
                <div class="recipe-info-value">${safeTotal} ml</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('recipe_detail.ratio', 'Poměr VG/PG')}</div>
                <div class="recipe-info-value">${safeVg}:${safePg}</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('recipe_detail.nicotine', 'Nikotin')}</div>
                <div class="recipe-info-value">${safeNicotine} mg/ml</div>
            </div>
        </div>
        
        ${ingredientsHtml}
        ${linkedProductsHtml}
        
        <div class="recipe-meta-info">
            <p class="recipe-date">${t('recipe_detail.created', 'Vytvořeno')}: ${date}</p>
        </div>
    `;
}

// Upravit uložený recept
async function editSavedRecipe() {
    if (!window.currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_edit', 'Pro úpravu receptu se prosím přihlaste.'));
        return;
    }
    
    // Zobrazit modal pro úpravu
    const modal = document.getElementById('editRecipeModal');
    if (!modal) {
        // Modal neexistuje, použít saveRecipeModal s úpravami
        showEditRecipeForm();
        return;
    }
    
    modal.classList.remove('hidden');
    await loadEditRecipeForm();
}

// Zobrazit formulář pro úpravu receptu
async function showEditRecipeForm() {
    // Použít existující modal pro uložení, ale v režimu úpravy
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    // Označit jako režim úpravy
    window.editingRecipeId = window.currentViewingRecipe.id;
    
    // Naplnit formulář existujícími daty
    document.getElementById('recipeName').value = window.currentViewingRecipe.name || '';
    document.getElementById('recipeDescription').value = window.currentViewingRecipe.description || '';
    document.getElementById('recipeRating').value = window.currentViewingRecipe.rating || '0';
    
    // Aktualizovat zobrazení hvězdiček
    selectedRating = parseInt(window.currentViewingRecipe.rating) || 0;
    updateStarDisplay(selectedRating);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Načíst propojené produkty a předvybrat je
    try {
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
            window.Clerk.user.id, 
            window.currentViewingRecipe.id
        );
        
        // Přidat řádky pro každý propojený produkt
        for (const product of linkedProducts) {
            addProductRowWithValue(product.id, product.name);
        }
    } catch (error) {
        console.error('Error loading linked products:', error);
    }
    
    // Změnit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = 'Upravit recept';
    }
    
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Uložit změny';
    }
    
    modal.classList.remove('hidden');
}

// Přidat řádek produktu s předvybranou hodnotou
function addProductRowWithValue(productId, productName) {
    if (availableProductsForRecipe.length === 0) return;
    
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚡',
        'nicotine_salt': '🧂'
    };
    
    // Vytvořit options pro select s předvybranou hodnotou
    let optionsHtml = '<option value="">-- Vyberte produkt --</option>';
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        const selected = product.id === productId ? 'selected' : '';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}" ${selected}>${escapeHtml(product.name)}</option>`;
    });
    
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="Hledat produkt..." value="${escapeHtml(productName || '')}" oninput="filterProductOptions(this, '${rowId}')">
                <select class="product-select" name="linkedProducts" onchange="onProductSelected(this)">
                    ${optionsHtml}
                </select>
            </div>
            <button type="button" class="remove-product-btn" onclick="removeProductRow('${rowId}')" title="Odebrat">✕</button>
        </div>
    `;
    
    listContainer.insertAdjacentHTML('beforeend', rowHtml);
}

// Oficiální doména pro sdílení receptů
const SHARE_DOMAIN = 'https://www.liquimixer.com';

// Sdílet recept
function shareRecipe() {
    if (!window.currentViewingRecipe || !window.currentViewingRecipe.share_id) {
        alert(t('share.cannot_share_recipe', 'Tento recept nelze sdílet.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    // SECURITY: Vždy kontrolovat, že URL začíná oficiální doménou
    let shareUrl = window.currentViewingRecipe.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?recipe=${window.currentViewingRecipe.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(window.currentViewingRecipe.name),
            text: `Podívej se na můj recept: ${escapeHtml(window.currentViewingRecipe.name)}`,
            url: shareUrl
        }).catch(err => {
            // Fallback na kopírování
            copyShareLink(shareUrl);
        });
    } else {
        copyShareLink(shareUrl);
    }
}

function copyShareLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert(t('recipes.share_copied', 'Odkaz byl zkopírován do schránky!') + '\n\n' + url);
    }).catch(() => {
        prompt('Zkopírujte tento odkaz:', url);
    });
}

// Sdílet oblíbený produkt
function shareProduct() {
    if (!window.currentViewingProduct || !window.currentViewingProduct.share_id) {
        alert(t('share.cannot_share_product', 'Tento produkt nelze sdílet.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    let shareUrl = window.currentViewingProduct.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?product=${window.currentViewingProduct.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(window.currentViewingProduct.name),
            text: `Podívej se na můj oblíbený produkt: ${escapeHtml(window.currentViewingProduct.name)}`,
            url: shareUrl
        }).catch(err => {
            // Fallback na kopírování
            copyShareLink(shareUrl);
        });
    } else {
        copyShareLink(shareUrl);
    }
}

// Smazat recept
async function deleteRecipe() {
    if (!window.currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required', 'Pro smazání receptu se prosím přihlaste.'));
        return;
    }
    
    const recipeName = window.currentViewingRecipe.name || 'Tento recept';
    
    if (!confirm(t('recipe_detail.delete_confirm', 'Opravdu chcete smazat tento recept?'))) {
        return;
    }
    
    try {
        const success = await window.LiquiMixerDB.deleteRecipe(
            window.Clerk.user.id, 
            window.currentViewingRecipe.id
        );
        
        if (success) {
            alert(t('recipe_detail.delete_success', 'Recept byl smazán.'));
            window.currentViewingRecipe = null;
            showMyRecipes();
        } else {
            alert(t('recipe_detail.delete_error', 'Chyba při mazání receptu.'));
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert(t('recipe_detail.delete_error', 'Chyba při mazání receptu.'));
    }
}

// Validace share_id formátu (12 znaků alfanumerických)
function isValidShareId(shareId) {
    if (!shareId || typeof shareId !== 'string') return false;
    return /^[A-Za-z0-9]{12}$/.test(shareId);
}

// Načíst sdílený recept z URL
async function loadSharedRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('recipe');
    
    // SECURITY: Validace share_id formátu
    if (!shareId || !isValidShareId(shareId)) return false;
    
    // Uložit shareId pro pozdější načtení po přihlášení (pro Liquid PRO recepty)
    window.pendingSharedRecipeId = shareId;
    
    // Počkat na inicializaci Supabase a Clerk
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
    }
    
    // Počkat na Clerk
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Nejprve načíst recept z databáze, abychom zjistili jeho typ
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (!recipe) {
            // Recept neexistuje
            const contentEl = document.getElementById('sharedRecipeContent');
            const titleEl = document.getElementById('sharedRecipeTitle');
            titleEl.textContent = t('share.shared_recipe', 'Sdílený recept');
            contentEl.innerHTML = `<p class="no-recipes-text">${t('recipe_detail.not_found', 'Recept nebyl nalezen nebo byl smazán.')}</p>`;
            showPage('shared-recipe');
            return true;
        }
        
        // Zjistit typ formuláře z uložených dat
        const formType = recipe.recipe_data?.formType || 'liquid';
        
        // Liquid PRO recepty vyžadují přihlášení
        if (formType === 'liquidpro') {
            if (!window.Clerk || !window.Clerk.user) {
                // Zobrazit stránku s výzvou k přihlášení
                showSharedRecipeLoginPrompt();
                return true;
            }
        }
        
        // Zobrazit recept (Liquid a Shake and Vape jsou veřejné, Liquid PRO pouze pro přihlášené)
        displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent');
        showPage('shared-recipe');
        window.pendingSharedRecipeId = null; // Vymazat pending ID
        return true;
        
    } catch (error) {
        console.error('Error loading shared recipe:', error);
        return false;
    }
}

// Zobrazit výzvu k přihlášení pro sdílený recept
function showSharedRecipeLoginPrompt() {
    const contentEl = document.getElementById('sharedRecipeContent');
    const titleEl = document.getElementById('sharedRecipeTitle');
    
    titleEl.textContent = 'Sdílený recept';
    contentEl.innerHTML = `
        <div class="login-prompt">
            <div class="login-prompt-icon">🔒</div>
            <h3 class="login-prompt-title">Pro zobrazení receptu se přihlaste</h3>
            <p class="login-prompt-text">Tento recept je dostupný pouze pro přihlášené uživatele.</p>
            <button class="neon-button" onclick="showLoginForSharedRecipe()">Přihlásit se</button>
        </div>
    `;
    
    showPage('shared-recipe');
}

// Přihlášení pro sdílený recept
function showLoginForSharedRecipe() {
    showLoginModal();
}

// Načíst obsah sdíleného receptu (po přihlášení)
async function loadSharedRecipeContent(shareId) {
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (recipe) {
            displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent');
            showPage('shared-recipe');
            return true;
        } else {
            const contentEl = document.getElementById('sharedRecipeContent');
            contentEl.innerHTML = `<p class="no-recipes-text">${t('recipe_detail.not_found', 'Recept nebyl nalezen nebo byl smazán.')}</p>`;
            showPage('shared-recipe');
            return true;
        }
    } catch (error) {
        console.error('Error loading shared recipe:', error);
    }
    
    return false;
}

// Zkontrolovat pending sdílený recept po přihlášení
async function checkPendingSharedRecipe() {
    if (window.pendingSharedRecipeId && window.Clerk && window.Clerk.user) {
        const shareId = window.pendingSharedRecipeId;
        window.pendingSharedRecipeId = null;
        await loadSharedRecipeContent(shareId);
    }
}

// ============================================
// OBLÍBENÉ PRODUKTY
// ============================================

window.currentViewingProduct = null; // Exportováno pro i18n přerenderování
let selectedProductRating = 0;
window.allUserProducts = []; // Exportováno pro i18n přerenderování
let searchRatingFilter = 0; // Aktuální filtr hodnocení produktů

// Stav pro filtrování receptů
window.allUserRecipes = []; // Exportováno pro i18n přerenderování
let recipeSearchRatingFilter = 0; // Aktuální filtr hodnocení receptů

// Zobrazit seznam oblíbených produktů
async function showFavoriteProducts() {
    hideUserProfileModal();
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_products', 'Pro zobrazení produktů se prosím přihlaste.'));
        return;
    }
    
    const container = document.getElementById('productsListContainer');
    container.innerHTML = `<p class="no-products-text">${t('products.loading', 'Načítám produkty...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetProductFilters();
    
    showPage('favorite-products');
    
    try {
        const products = await window.LiquiMixerDB.getProducts(window.Clerk.user.id);
        window.allUserProducts = products || []; // Uložit pro filtrování
        
        renderProductsList(window.allUserProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `<p class="no-products-text" style="color: var(--neon-pink);">${t('products.load_error', 'Chyba při načítání produktů.')}</p>`;
    }
}

// Reset filtrů vyhledávání
function resetProductFilters() {
    const textInput = document.getElementById('productSearchText');
    const typeSelect = document.getElementById('productSearchType');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    if (textInput) textInput.value = '';
    if (typeSelect) typeSelect.value = '';
    searchRatingFilter = 0;
    updateSearchStarsDisplay(0);
    if (resultsInfo) resultsInfo.textContent = '';
}

// Nastavit filtr hodnocení
function setSearchRating(rating) {
    // Pokud klikneme na stejné hodnocení, zrušíme filtr
    if (searchRatingFilter === rating) {
        searchRatingFilter = 0;
    } else {
        searchRatingFilter = rating;
    }
    updateSearchStarsDisplay(searchRatingFilter);
    filterProducts();
}

// Zrušit filtr hodnocení
function clearSearchRating() {
    searchRatingFilter = 0;
    updateSearchStarsDisplay(0);
    filterProducts();
}

// Aktualizovat zobrazení hvězdiček ve vyhledávání
function updateSearchStarsDisplay(rating) {
    const stars = document.querySelectorAll('#searchStars .search-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Inicializovat hover efekt pro hvězdičky vyhledávání
function initSearchStarsHover() {
    const starsContainer = document.getElementById('searchStars');
    if (!starsContainer) return;
    
    const stars = starsContainer.querySelectorAll('.search-star');
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Filtrovat produkty
function filterProducts() {
    const searchText = (document.getElementById('productSearchText')?.value || '').toLowerCase().trim();
    const searchType = document.getElementById('productSearchType')?.value || '';
    
    let filtered = window.allUserProducts.filter(product => {
        // Textový filtr (název a popis)
        if (searchText) {
            const name = (product.name || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            if (!name.includes(searchText) && !description.includes(searchText)) {
                return false;
            }
        }
        
        // Filtr typu
        if (searchType && product.product_type !== searchType) {
            return false;
        }
        
        // Filtr hodnocení (min. hodnocení)
        if (searchRatingFilter > 0) {
            const productRating = parseInt(product.rating) || 0;
            if (productRating < searchRatingFilter) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zobrazit info o výsledcích
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        if (searchText || searchType || searchRatingFilter > 0) {
            if (filtered.length === 0) {
                resultsInfo.textContent = 'Žádné produkty neodpovídají filtrům.';
                resultsInfo.className = 'search-results-info no-results';
            } else {
                resultsInfo.textContent = `Nalezeno ${filtered.length} z ${window.allUserProducts.length} produktů.`;
                resultsInfo.className = 'search-results-info has-results';
            }
        } else {
            resultsInfo.textContent = '';
            resultsInfo.className = 'search-results-info';
        }
    }
    
    renderProductsList(filtered);
}

// Vykreslit seznam produktů
function renderProductsList(products) {
    const container = document.getElementById('productsListContainer');

    if (!products || products.length === 0) {
        container.innerHTML = `<p class="no-products-text">${t('products.no_products', 'Zatím nemáte žádné oblíbené produkty.')}</p>`;
        return;
    }
    
    let html = '<div class="products-list">';
    
    products.forEach(product => {
        if (!isValidUUID(product.id)) return;
        
        const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const date = new Date(product.created_at).toLocaleDateString('cs-CZ');
        
        const safeName = escapeHtml(product.name);
        const safeDescription = escapeHtml(product.description);
        const typeLabel = productTypeLabels[product.product_type] || 'Příchuť';
        const typeIcon = productTypeIcons[product.product_type] || '🍓';
        
        html += `
            <div class="product-card rating-${rating}" onclick="viewProductDetail('${product.id}')">
                ${product.image_url ? `<div class="product-card-image"><img src="${escapeHtml(product.image_url)}" alt="${safeName}"></div>` : ''}
                <div class="product-card-content">
                    <div class="product-card-header">
                        <h3 class="product-card-title">${safeName}</h3>
                        <span class="product-card-rating">${stars}</span>
                    </div>
                    <div class="product-card-type">
                        <span class="product-type-badge">${typeIcon} ${escapeHtml(typeLabel)}</span>
                    </div>
                    ${safeDescription ? `<p class="product-card-description">${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}</p>` : ''}
                    <div class="product-card-meta">
                        <span>📅 ${date}</span>
                        ${product.product_url ? '<span>🔗 Odkaz</span>' : ''}
                    </div>
                    </div>
                </div>
            `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Zobrazit detail produktu
async function viewProductDetail(productId) {
    if (!window.Clerk || !window.Clerk.user) return;
    
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return;
    }
    
    try {
        const product = await window.LiquiMixerDB.getProductById(window.Clerk.user.id, productId);
        
        if (!product) {
            alert(t('products.not_found', 'Produkt nenalezen.'));
            return;
        }
        
        window.currentViewingProduct = product;
        displayProductDetail(product);
        showPage('product-detail');
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert(t('products.load_error', 'Chyba při načítání produktu.'));
    }
}

// Zobrazit detail produktu v UI
function displayProductDetail(product) {
    const titleEl = document.getElementById('productDetailTitle');
    const contentEl = document.getElementById('productDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    // Získat správný locale pro formátování data
    const localeCode = t('meta.code', 'cs');
    let dateLocale;
    if (localeCode === 'en') {
        dateLocale = 'en-GB';
    } else if (localeCode.includes('-')) {
        dateLocale = localeCode;
    } else {
        dateLocale = localeCode + '-' + localeCode.toUpperCase();
    }
    
    let date;
    try {
        date = new Date(product.created_at).toLocaleDateString(dateLocale);
    } catch (e) {
        date = new Date(product.created_at).toLocaleDateString();
    }
    
    const typeLabel = getProductTypeLabel(product.product_type);
    const typeIcon = productTypeIcons[product.product_type] || '🍓';
    
    const safeDescription = escapeHtml(product.description);
    
    let imageHtml = '';
    if (product.image_url) {
        imageHtml = `<div class="product-detail-image"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}"></div>`;
    }
    
    let urlHtml = '';
    if (product.product_url) {
        // Použít sanitizeUrl pro bezpečnou URL
        const cleanUrl = sanitizeUrl(product.product_url);
        if (cleanUrl) {
            urlHtml = `
                <div class="product-detail-url">
                    <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="neon-button secondary">
                        ${t('product_detail.open_link', 'Otevřít odkaz na produkt')}
                    </a>
                </div>
            `;
        }
    }
    
    contentEl.innerHTML = `
        ${imageHtml}
        <div class="product-detail-header">
            <div class="product-detail-type">
                <span class="product-type-badge large">${typeIcon} ${escapeHtml(typeLabel)}</span>
            </div>
            <div class="product-detail-rating">${stars}</div>
            ${safeDescription ? `<p class="product-detail-description">${safeDescription}</p>` : ''}
        </div>
        ${urlHtml}
        <div class="product-meta-info">
            <p class="product-date">${t('product_detail.added', 'Přidáno')}: ${date}</p>
        </div>
    `;
}

// Získat přeložený typ produktu
function getProductTypeLabel(type) {
    const typeKeys = {
        'vg': 'products.type_vg',
        'pg': 'products.type_pg',
        'flavor': 'products.type_flavor',
        'nicotine_booster': 'products.type_nicotine_booster',
        'nicotine_salt': 'products.type_nicotine_salt'
    };
    const key = typeKeys[type] || 'products.type_flavor';
    return t(key, productTypeLabels[type] || 'Příchuť');
}

// Mapování typů produktů na názvy
const productTypeLabels = {
    'vg': 'VG (Glycerin)',
    'pg': 'PG (Propylenglykol)',
    'flavor': 'Příchuť',
    'nicotine_booster': 'Nikotin booster',
    'nicotine_salt': 'Nikotinová sůl'
};

// Mapování typů produktů na ikony
const productTypeIcons = {
    'vg': '💧',
    'pg': '💧',
    'flavor': '🍓',
    'nicotine_booster': '⚡',
    'nicotine_salt': '🧂'
};

// Zobrazit formulář pro přidání produktu
function showAddProductForm() {
    document.getElementById('productFormTitle').textContent = 'Přidat produkt';
    document.getElementById('editingProductId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productRating').value = '0';
    document.getElementById('productUrl').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    
    selectedProductRating = 0;
    updateProductStarDisplay(0);
    initProductStarRating();
    
    showPage('product-form');
}

// Upravit produkt
function editProduct() {
    if (!window.currentViewingProduct) return;
    
    document.getElementById('productFormTitle').textContent = 'Upravit produkt';
    document.getElementById('editingProductId').value = window.currentViewingProduct.id;
    document.getElementById('productName').value = window.currentViewingProduct.name || '';
    document.getElementById('productType').value = window.currentViewingProduct.product_type || 'flavor';
    document.getElementById('productDescription').value = window.currentViewingProduct.description || '';
    document.getElementById('productRating').value = window.currentViewingProduct.rating || '0';
    document.getElementById('productUrl').value = window.currentViewingProduct.product_url || '';
    document.getElementById('productImageUrl').value = window.currentViewingProduct.image_url || '';
    
    if (window.currentViewingProduct.image_url) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${escapeHtml(window.currentViewingProduct.image_url)}" alt="Preview">`;
    } else {
        document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    }
    
    selectedProductRating = window.currentViewingProduct.rating || 0;
    updateProductStarDisplay(selectedProductRating);
    initProductStarRating();
    
    showPage('product-form');
}

// Smazat produkt
async function deleteProduct() {
    if (!window.currentViewingProduct) return;
    
    if (!confirm(t('product_detail.delete_confirm', 'Opravdu chcete smazat tento produkt?'))) return;
    
    try {
        const success = await window.LiquiMixerDB.deleteProduct(window.Clerk.user.id, window.currentViewingProduct.id);
        
        if (success) {
            alert(t('products.deleted', 'Produkt byl smazán.'));
            window.currentViewingProduct = null;
            showFavoriteProducts();
        } else {
            alert(t('products.delete_error', 'Chyba při mazání produktu.'));
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert(t('products.delete_error', 'Chyba při mazání produktu.'));
    }
}

// Zrušit formulář produktu
function cancelProductForm() {
    const editingId = document.getElementById('editingProductId').value;
    if (editingId && window.currentViewingProduct) {
        showPage('product-detail');
    } else {
        showFavoriteProducts();
    }
}

// Uložit produkt
async function saveProduct(event) {
    event.preventDefault();
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_product', 'Pro uložení produktu se prosím přihlaste.'));
        return false;
    }
    
    const name = document.getElementById('productName').value.trim();
    const productType = document.getElementById('productType').value;
    const description = document.getElementById('productDescription').value.trim();
    const rating = parseInt(document.getElementById('productRating').value) || 0;
    const productUrl = document.getElementById('productUrl').value.trim();
    const imageUrl = document.getElementById('productImageUrl').value;
    const editingId = document.getElementById('editingProductId').value;
    
    if (!name) {
        alert(t('product_form.name_required', 'Název produktu je povinný.'));
        return false;
    }
    
    if (!productType) {
        alert(t('product_form.type_required', 'Vyberte typ produktu.'));
        return false;
    }
    
    const productData = {
        name: name,
        product_type: productType,
        description: description,
        rating: rating,
        product_url: productUrl,
        image_url: imageUrl
    };
    
    try {
        let saved;
        
        if (editingId) {
            saved = await window.LiquiMixerDB.updateProduct(window.Clerk.user.id, editingId, productData);
        } else {
            saved = await window.LiquiMixerDB.saveProduct(window.Clerk.user.id, productData);
        }
        
        if (saved) {
            alert(editingId ? t('product_form.updated', 'Produkt byl aktualizován!') : t('product_form.success', 'Produkt byl uložen!'));
            showFavoriteProducts();
        } else {
            alert(t('product_form.error', 'Chyba při ukládání produktu.'));
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert(t('product_form.error', 'Chyba při ukládání produktu.'));
    }
    
    return false;
}

// Inicializace hvězdičkového hodnocení pro produkty
function initProductStarRating() {
    const stars = document.querySelectorAll('#productStarRating .star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedProductRating = parseInt(this.dataset.rating);
            document.getElementById('productRating').value = selectedProductRating;
            updateProductStarDisplay(selectedProductRating);
        });
        
        star.addEventListener('mouseover', function() {
            highlightProductStars(parseInt(this.dataset.rating));
        });
        
        star.addEventListener('mouseout', function() {
            updateProductStarDisplay(selectedProductRating);
        });
    });
}

function highlightProductStars(rating) {
    const stars = document.querySelectorAll('#productStarRating .star');
    stars.forEach((star, index) => {
        star.textContent = index < rating ? '★' : '☆';
        star.classList.toggle('active', index < rating);
    });
}

function updateProductStarDisplay(rating) {
    highlightProductStars(rating);
}

// Náhled obrázku produktu
function previewProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validace
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        alert(t('product_form.image_format', 'Povolené formáty: JPEG, PNG, WebP, GIF'));
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert(t('product_form.image_size', 'Maximální velikost obrázku je 5MB.'));
        return;
    }
    
    // Náhled
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        // Uložit jako base64 (pro jednoduchost - v produkci použít Supabase Storage)
        document.getElementById('productImageUrl').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Vyfotit produkt (pouze mobilní)
function captureProductPhoto() {
    // Zkontrolovat podporu kamery
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t('product_form.camera_error', 'Váš prohlížeč nepodporuje přístup ke kameře.'));
        return;
    }
    
    // Použít input s capture atributem
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = previewProductImage;
    input.click();
}

// Inicializace při načtení stránky
window.addEventListener('load', async function() {
    // Zkusit načíst sdílený recept
    const isSharedRecipe = await loadSharedRecipe();
    if (isSharedRecipe) return;
});

// Close menus when clicking outside
document.addEventListener('click', function(event) {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    const menuBtn = document.querySelector('.menu-btn');
    const loginBtn = document.querySelector('.login-btn');
    
    // Check if click is outside menu dropdown
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        if (!menuDropdown.contains(event.target) && !menuBtn.contains(event.target)) {
            menuDropdown.classList.add('hidden');
        }
    }
    
    // Check if click is outside login modal
    if (loginModal && !loginModal.classList.contains('hidden')) {
        if (!loginModal.contains(event.target) && !loginBtn.contains(event.target)) {
            hideLoginModal();
        }
    }
    
    // Check if click is outside user profile modal
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        if (!userProfileModal.contains(event.target) && !loginBtn.contains(event.target)) {
            hideUserProfileModal();
        }
    }
});

function togglePrepDetail(button) {
    const accordion = button.parentElement;
    const detail = accordion.querySelector('.prep-detail');
    const isActive = button.classList.contains('active');
    
    // Close all other accordions
    document.querySelectorAll('.prep-item-btn.active').forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
            btn.parentElement.querySelector('.prep-detail').classList.remove('open');
        }
    });
    
    // Toggle current accordion
    if (isActive) {
        button.classList.remove('active');
        detail.classList.remove('open');
    } else {
        button.classList.add('active');
        detail.classList.add('open');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);

    // Initialize dilute form sliders when shown
    if (pageId === 'dilute-form') {
        updateDiluteSourceRatioDisplay();
        updateDiluteTargetRatioDisplay();
    }
    
    // Animovat texty tlačítek na stránce mode-select
    if (pageId === 'mode-select' && typeof window.animateModeButtons === 'function') {
        setTimeout(window.animateModeButtons, 50);
    }
    
    // Zobrazit/skrýt tlačítko Domů
    updateHomeButtonVisibility(pageId);
}

// Aktualizovat viditelnost tlačítka Domů
function updateHomeButtonVisibility(pageId) {
    const homeBtn = document.getElementById('homeButton');
    if (!homeBtn) return;
    
    // Stránky kde se NEZOBRAZUJE tlačítko Domů (úvodní stránka a formuláře)
    const hideOnPages = ['intro', 'form', 'dilute-form', 'product-form'];
    
    if (hideOnPages.includes(pageId)) {
        homeBtn.classList.remove('visible');
    } else {
        homeBtn.classList.add('visible');
    }
}

// Přejít na úvodní stránku
function goHome() {
    showPage('intro');
}

// Navigace zpět v historii
function goBack() {
    if (pageHistory.length > 1) {
        pageHistory.pop(); // Odstranit aktuální stránku
        const previousPage = pageHistory.pop(); // Získat předchozí stránku
        showPage(previousPage);
    } else {
        showPage('intro');
    }
}

// =========================================
// VG/PG Ratio Functions
// =========================================

function adjustRatio(change) {
    const slider = document.getElementById('vgPgRatio');
    let currentValue = parseInt(slider.value);
    
    // Round to nearest 5
    let newValue;
    if (change > 0) {
        // Moving right (more VG) - round up to next 5
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        // Moving left (less VG) - round down to previous 5
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    // Clamp to allowed limits
    newValue = Math.max(vgPgLimits.min, Math.min(vgPgLimits.max, newValue));
    slider.value = newValue;
    updateRatioDisplay();
}

// Získat přeložený popis poměru VG/PG
function getRatioDescriptionText(vg) {
    if (vg >= 0 && vg <= 9) return t('ratio_descriptions.vg_0_9', ratioDescriptions[0].text);
    if (vg >= 10 && vg <= 29) return t('ratio_descriptions.vg_10_29', ratioDescriptions[1].text);
    if (vg >= 30 && vg <= 34) return t('ratio_descriptions.vg_30_34', ratioDescriptions[2].text);
    if (vg >= 35 && vg <= 40) return t('ratio_descriptions.vg_35_40', ratioDescriptions[3].text);
    if (vg >= 41 && vg <= 55) return t('ratio_descriptions.vg_41_55', ratioDescriptions[4].text);
    if (vg >= 56 && vg <= 60) return t('ratio_descriptions.vg_56_60', ratioDescriptions[5].text);
    if (vg >= 61 && vg <= 70) return t('ratio_descriptions.vg_61_70', ratioDescriptions[6].text);
    if (vg >= 71 && vg <= 90) return t('ratio_descriptions.vg_71_90', ratioDescriptions[7].text);
    if (vg >= 91 && vg <= 100) return t('ratio_descriptions.vg_91_100', ratioDescriptions[8].text);
    return '';
}

function updateRatioDisplay() {
    const vg = parseInt(vgPgRatioSlider.value);
    const pg = 100 - vg;
    
    document.getElementById('vgValue').textContent = vg;
    document.getElementById('pgValue').textContent = pg;
    
    // Find matching description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('ratioDescription');
        descEl.textContent = getRatioDescriptionText(vg);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        document.getElementById('sliderTrack').style.background = 
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

// Store current VG/PG limits
let vgPgLimits = { min: 0, max: 100 };

// Calculate and update VG/PG slider limits based on nicotine and flavor settings
function updateVgPgRatioLimits() {
    const slider = document.getElementById('vgPgRatio');
    const warningEl = document.getElementById('ratioLimitWarning');
    const disabledLeft = document.getElementById('sliderDisabledLeft');
    const disabledRight = document.getElementById('sliderDisabledRight');
    
    // Get current settings
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 100;
    const nicotineType = nicotineTypeSelect.value;
    const targetNicotine = parseFloat(targetNicotineSlider.value) || 0;
    const baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength').value) || 0;
    const flavorType = flavorTypeSelect.value;
    const flavorPercent = flavorType !== 'none' ? parseFloat(flavorStrengthSlider.value) : 0;
    
    // Calculate nicotine volume
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }

    // Calculate flavor volume
    const flavorVolume = (flavorPercent / 100) * totalAmount;

    // Get nicotine VG/PG ratio
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('nicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }

    // Get flavor VG/PG ratio
    let flavorVgPercent = 0;
    let flavorPgPercent = 100;
    if (flavorType !== 'none') {
        const flavorRatio = document.getElementById('flavorRatio').value;
        if (flavorRatio === '0/100') {
            flavorVgPercent = 0;
            flavorPgPercent = 100;
        } else if (flavorRatio === '80/20') {
            flavorVgPercent = 80;
            flavorPgPercent = 20;
        } else if (flavorRatio === '70/30') {
            flavorVgPercent = 70;
            flavorPgPercent = 30;
        }
    }

    // Calculate VG and PG from nicotine
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);

    // Calculate VG and PG from flavor
    const flavorVgVolume = flavorVolume * (flavorVgPercent / 100);
    const flavorPgVolume = flavorVolume * (flavorPgPercent / 100);

    // Total fixed VG and PG
    const fixedPgVolume = nicotinePgVolume + flavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + flavorVgVolume;
    
    // Calculate percentage limits
    // Minimum VG% = (fixed VG / total) * 100
    // Maximum VG% = 100 - (fixed PG / total) * 100
    const minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
    const maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);
    
    // Ensure valid range
    const effectiveMinVg = Math.max(0, minVgPercent);
    const effectiveMaxVg = Math.min(100, maxVgPercent);
    
    // Store limits for use in other functions
    vgPgLimits.min = effectiveMinVg;
    vgPgLimits.max = effectiveMaxVg;
    
    // Slider always stays 0-100, we handle limits visually and in code
    slider.min = 0;
    slider.max = 100;
    
    // Update disabled zones visually
    // HTML slider: left = min value (0), right = max value (100)
    // Slider value = VG%, so left side = 0% VG, right side = 100% VG
    const limitValueLeft = document.getElementById('limitValueLeft');
    const limitValueRight = document.getElementById('limitValueRight');
    
    if (disabledLeft) {
        // Left disabled zone: values 0 to effectiveMinVg-1
        const leftWidth = effectiveMinVg;
        disabledLeft.style.width = leftWidth + '%';
        
        // Show limit value above the red line (min VG allowed)
        if (limitValueLeft) {
            if (leftWidth > 0) {
                limitValueLeft.textContent = effectiveMinVg + '%';
                limitValueLeft.style.display = 'block';
            } else {
                limitValueLeft.style.display = 'none';
            }
        }
    }
    if (disabledRight) {
        // Right disabled zone: values effectiveMaxVg+1 to 100
        const rightWidth = 100 - effectiveMaxVg;
        disabledRight.style.width = rightWidth + '%';
        
        // Show limit value above the red line (max VG allowed)
        if (limitValueRight) {
            if (rightWidth > 0) {
                limitValueRight.textContent = effectiveMaxVg + '%';
                limitValueRight.style.display = 'block';
            } else {
                limitValueRight.style.display = 'none';
            }
        }
    }
    
    // Adjust current value if outside new limits
    let currentValue = parseInt(slider.value);
    
    if (currentValue < effectiveMinVg) {
        slider.value = effectiveMinVg;
    } else if (currentValue > effectiveMaxVg) {
        slider.value = effectiveMaxVg;
    }
    
    // Show/hide warning
    if (warningEl) {
        if (effectiveMinVg > 0 || effectiveMaxVg < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (flavorVolume > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_percent', 'příchuť ({percent}%, VG/PG {vg}/{pg})')
                    .replace('{percent}', flavorPercent)
                    .replace('{vg}', flavorVgPercent)
                    .replace('{pg}', flavorPgPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', effectiveMinVg)
                .replace('{max}', effectiveMaxVg)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    // Update display
    updateRatioDisplay();
}

// Clamp slider value to allowed range
function clampVgPgValue() {
    const slider = document.getElementById('vgPgRatio');
    let value = parseInt(slider.value);
    
    if (value < vgPgLimits.min) {
        slider.value = vgPgLimits.min;
    } else if (value > vgPgLimits.max) {
        slider.value = vgPgLimits.max;
    }
    
    updateRatioDisplay();
}

// =========================================
// Nicotine Functions
// =========================================

function getNicotineMaxValue() {
    const type = nicotineTypeSelect.value;
    if (type === 'freebase') return 200;
    if (type === 'salt') return 72;
    return 200;
}

function getNicotineTypeName() {
    const type = nicotineTypeSelect.value;
    if (type === 'freebase') return 'Nikotin booster';
    if (type === 'salt') return 'Nikotinová sůl';
    return '';
}

function showNicotineWarning(message) {
    const warning = document.getElementById('nicotineWarning');
    if (warning) {
        warning.textContent = message;
        warning.classList.remove('hidden');
        // Auto-hide after 3 seconds
        setTimeout(() => {
            warning.classList.add('hidden');
        }, 3000);
    }
}

function hideNicotineWarning() {
    const warning = document.getElementById('nicotineWarning');
    if (warning) {
        warning.classList.add('hidden');
    }
}

function validateNicotineStrength() {
    const baseStrengthInput = document.getElementById('nicotineBaseStrength');
    const maxValue = getNicotineMaxValue();
    const currentValue = parseInt(baseStrengthInput.value) || 0;
    
    if (currentValue > maxValue) {
        const typeName = getNicotineTypeName();
        showNicotineWarning(`Maximální hodnota pro ${typeName} je ${maxValue} mg/ml. Hodnota byla upravena.`);
        baseStrengthInput.value = maxValue;
    } else {
        hideNicotineWarning();
    }
    
    updateMaxTargetNicotine();
}

function updateNicotineType() {
    const type = nicotineTypeSelect.value;
    const strengthContainer = document.getElementById('nicotineStrengthContainer');
    const ratioContainer = document.getElementById('nicotineRatioContainer');
    const targetGroup = document.getElementById('targetNicotineGroup');
    const baseStrengthInput = document.getElementById('nicotineBaseStrength');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        targetGroup.classList.add('hidden');
        targetNicotineSlider.value = 0;
        hideNicotineWarning();
        updateNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        targetGroup.classList.remove('hidden');
        
        // Set max value based on nicotine type
        const maxValue = getNicotineMaxValue();
        baseStrengthInput.max = maxValue;
        
        // Validate current value
        validateNicotineStrength();
        
        updateMaxTargetNicotine();
    }
    
    // Update VG/PG ratio limits
    updateVgPgRatioLimits();
}

function updateMaxTargetNicotine() {
    const baseStrength = parseInt(document.getElementById('nicotineBaseStrength').value) || 0;
    const maxTarget = Math.min(45, baseStrength);
    
    targetNicotineSlider.max = maxTarget;
    if (parseInt(targetNicotineSlider.value) > maxTarget) {
        targetNicotineSlider.value = maxTarget;
    }
    updateNicotineDisplay();
}

function adjustTargetNicotine(change) {
    let newValue = parseInt(targetNicotineSlider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(targetNicotineSlider.max), newValue));
    targetNicotineSlider.value = newValue;
    updateNicotineDisplay();
}

function updateNicotineDisplay() {
    const value = parseInt(targetNicotineSlider.value);
    const displayEl = document.getElementById('targetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const descEl = document.getElementById('nicotineDescription');
    const trackEl = document.getElementById('nicotineTrack');
    
    displayEl.textContent = value;
    
    // Find matching description
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        descEl.textContent = getNicotineDescriptionText(value);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }
    
    // Update VG/PG ratio limits when nicotine changes
    updateVgPgRatioLimits();
}

// =========================================
// Flavor Functions
// =========================================

function updateFlavorType() {
    const type = flavorTypeSelect.value;
    const strengthContainer = document.getElementById('flavorStrengthContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
    } else {
        strengthContainer.classList.remove('hidden');
        const flavor = flavorDatabase[type];
        flavorStrengthSlider.value = flavor.ideal;
        updateFlavorDisplay();
    }
    
    // Update VG/PG ratio limits when flavor changes
    updateVgPgRatioLimits();
}

function adjustFlavor(change) {
    let newValue = parseInt(flavorStrengthSlider.value) + change;
    newValue = Math.max(0, Math.min(30, newValue));
    flavorStrengthSlider.value = newValue;
    updateFlavorDisplay();
}

// Získat přeloženou poznámku pro typ příchutě
function getFlavorNote(type) {
    const noteKey = `flavor_descriptions.note_${type}`;
    const fallbackNotes = {
        none: 'Čistá báze PG/VG + nikotin',
        fruit: 'Optimum: 10%, zrání 3–7 dní',
        citrus: 'Silné kyseliny, méně stačí',
        berry: 'Vyvážené, dobře fungují s 50/50 PG/VG',
        tropical: 'Sladké, potřebují vyšší % pro hloubku',
        tobacco: 'Dlouhý steeping: 1–4 týdny pro rozvinutí',
        menthol: 'Intenzivní, dobře se kombinuje s ovocem',
        candy: 'Sladký profil vyžaduje přesné dávkování',
        dessert: 'Komplexní, steeping 2–3 týdny',
        bakery: 'Máslové tóny, vyzrálost za 2 týdny',
        biscuit: 'Jemné, funguje při nižším %',
        drink: 'Osvěžující, rychlé zrání',
        tobaccosweet: 'Kombinace vyžaduje 2+ týdny steepingu',
        nuts: 'Krémové, vyžaduje 1–2 týdny zrání',
        spice: 'Kořeněné, opatrně s koncentrací'
    };
    return t(noteKey, fallbackNotes[type] || '');
}

// Získat přeložený název příchutě
function getFlavorName(type) {
    const flavorKey = `form.flavor_${type}`;
    const flavor = flavorDatabase[type];
    return t(flavorKey, flavor ? flavor.name : type);
}

// Získat přeložený název ingredience z klíče a parametrů
function getIngredientName(ingredient) {
    // Pokud ingredience má starý formát (pouze name), vrať name
    if (ingredient.name && !ingredient.ingredientKey) {
        return ingredient.name;
    }
    
    const key = ingredient.ingredientKey;
    const params = ingredient.params || {};
    
    switch (key) {
        case 'nicotine_booster':
            const boosterName = t('ingredients.nicotine_booster', 'Nikotin booster');
            return `${boosterName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
        case 'nicotine_salt':
            const saltName = t('ingredients.nicotine_salt', 'Nikotinová sůl');
            return `${saltName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
        case 'flavor':
            const flavorName = getFlavorName(ingredient.flavorType || 'fruit');
            return `${flavorName} (VG/PG ${params.vgpg})`;
        case 'shakevape_flavor':
            // Shake & Vape - příchuť již v lahvičce
            const svFlavorLabel = t('ingredients.flavor', 'Příchuť');
            const inBottleLabel = t('shakevape.in_bottle', 'již v lahvičce');
            return `${svFlavorLabel} (${inBottleLabel}, VG/PG ${params.vgpg})`;
        case 'vg':
            return t('ingredients.vg', 'VG (Glycerin)');
        case 'pg':
            return t('ingredients.pg', 'PG (Propylenglykol)');
        case 'nicotine_base':
            const baseName = t('ingredients.nicotine_base', 'Nikotinová báze');
            if (params.strength && params.vgpg) {
                return `${baseName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
            }
            return baseName;
        default:
            return ingredient.name || key;
    }
}

function updateFlavorDisplay() {
    const value = parseInt(flavorStrengthSlider.value);
    const type = flavorTypeSelect.value;
    const flavor = flavorDatabase[type];
    const descEl = document.getElementById('flavorDescription');
    const displayEl = document.getElementById('flavorValue');
    const displayContainer = displayEl.parentElement;
    const trackEl = document.getElementById('flavorTrack');
    
    displayEl.textContent = value;
    
    let color, text;
    if (value < flavor.min) {
        color = '#ffaa00';
        text = t('flavor_descriptions.weak', 'Slabá až žádná chuť (doporučeno {min}–{max}%)')
            .replace('{min}', flavor.min)
            .replace('{max}', flavor.max);
        trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > flavor.max) {
        color = '#ff0044';
        text = t('flavor_descriptions.strong', 'Výrazná nebo přeslazená chuť (doporučeno {min}–{max}%)')
            .replace('{min}', flavor.min)
            .replace('{max}', flavor.max);
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        const note = getFlavorNote(type);
        text = t('flavor_descriptions.ideal', 'Ideální chuť ({min}–{max}%) - {note}')
            .replace('{min}', flavor.min)
            .replace('{max}', flavor.max)
            .replace('{note}', note);
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #00aaff)`;
    }
    
    descEl.textContent = text;
    descEl.style.color = color;
    descEl.style.borderLeftColor = color;
    // Set color on container so unit has same color as number
    displayEl.style.color = 'inherit';
    displayContainer.style.color = color;
    
    // Update VG/PG ratio limits when flavor strength changes
    updateVgPgRatioLimits();
}

function updateAllDisplays() {
    updateRatioDisplay();
    updateNicotineDisplay();
    updateFlavorDisplay();
    updateNicotineType();
    updateFlavorType();
}

// =========================================
// Calculation Functions
// Based on: http://www.todmuller.com/ejuice/ejuice.php
// =========================================

function calculateMix() {
    // Get user inputs - always read fresh from DOM
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 100;
    const vgPercent = parseInt(document.getElementById('vgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('nicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('targetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength').value) || 0;
    const flavorType = document.getElementById('flavorType').value;
    const flavorPercent = flavorType !== 'none' ? parseFloat(document.getElementById('flavorStrength').value) : 0;

    // =========================================
    // CALCULATION FORMULA
    // Total = Nicotine + Flavor + PG + VG
    // All values in ml, must equal totalAmount
    // =========================================

    // 1. Calculate nicotine base volume needed
    // Formula: nicotine_ml = (target_nic * total_ml) / base_nic
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }

    // 2. Calculate flavor volume
    // Formula: flavor_ml = (flavor_percent / 100) * total_ml
    const flavorVolume = (flavorPercent / 100) * totalAmount;

    // 3. Calculate remaining volume for PG and VG (carrier liquids)
    // This is what's left after nicotine and flavor
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;

    // 4. Nicotine base composition (affects final PG/VG ratio)
    // Get VG/PG ratio from user selection
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        const nicotineRatio = document.getElementById('nicotineRatio').value;
        let nicVgPercent = 50;
        let nicPgPercent = 50;
        
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
        
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    }

    // 5. Flavor VG/PG content based on selected ratio
    let flavorVgContent = 0;
    let flavorPgContent = flavorVolume; // Default to 100% PG
    
    if (flavorType !== 'none' && flavorVolume > 0) {
        const flavorRatio = document.getElementById('flavorRatio').value;
        let flavorVgPercent = 0;
        let flavorPgPercent = 100;
        
        if (flavorRatio === '0/100') {
            flavorVgPercent = 0;
            flavorPgPercent = 100;
        } else if (flavorRatio === '80/20') {
            flavorVgPercent = 80;
            flavorPgPercent = 20;
        } else if (flavorRatio === '70/30') {
            flavorVgPercent = 70;
            flavorPgPercent = 30;
        }
        
        flavorVgContent = flavorVolume * (flavorVgPercent / 100);
        flavorPgContent = flavorVolume * (flavorPgPercent / 100);
    }

    // 6. Calculate pure PG and VG needed to achieve target ratio
    // Target VG in final mix = (vgPercent / 100) * totalAmount
    // Target PG in final mix = (pgPercent / 100) * totalAmount
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    // Subtract what's already coming from nicotine and flavor
    let pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;

    // Handle negative values (when nicotine/flavor exceeds target ratio)
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;

    // If remaining volume doesn't allow exact ratio, distribute proportionally
    const totalPureNeeded = pureVgNeeded + purePgNeeded;
    if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
        const ratio = remainingVolume / totalPureNeeded;
        pureVgNeeded *= ratio;
        purePgNeeded *= ratio;
    } else if (totalPureNeeded < remainingVolume) {
        // If we have extra room, add it proportionally
        const extra = remainingVolume - totalPureNeeded;
        if (vgPercent + pgPercent > 0) {
            pureVgNeeded += extra * (vgPercent / 100);
            purePgNeeded += extra * (pgPercent / 100);
        }
    }

    // =========================================
    // Build results
    // Drops calculation: 1 ml ≈ 20 drops (standard pipette)
    // Ukládáme klíče pro dynamický překlad ingrediencí
    // =========================================
    const DROPS_PER_ML = 20;
    const ingredients = [];

    if (nicotineVolume > 0) {
        const nicotineRatioValue = document.getElementById('nicotineRatio').value;
        ingredients.push({
            // Klíč pro překlad
            ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
            // Parametry pro zobrazení
            params: {
                strength: baseNicotine,
                vgpg: nicotineRatioValue
            },
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    if (flavorVolume > 0) {
        const flavorRatioValue = document.getElementById('flavorRatio').value;
        ingredients.push({
            ingredientKey: 'flavor',
            flavorType: flavorType,
            params: {
                vgpg: flavorRatioValue
            },
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    // Add carrier liquids (no drops for these - measured in ml)
    if (purePgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'pg',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }

    if (pureVgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'vg',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }

    // Calculate actual totals for verification
    const actualTotal = nicotineVolume + flavorVolume + purePgNeeded + pureVgNeeded;
    
    // Calculate actual VG/PG ratio in final mix
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;

    // Display results - pro formulář Liquid zobrazí výsledky i nepřihlášeným
    // Modál se zobrazí až při pokusu o uložení receptu
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, actualTotal, actualVg, actualPg, 'liquid');
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg, formType = 'liquid') {
    document.getElementById('resultTotal').textContent = `${total} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${nicotine} mg/ml`;

    // Uložit data receptu pro možnost pozdějšího uložení
    // Ukládáme klíče a parametry pro dynamický překlad
    storeCurrentRecipe({
        formType: formType, // 'liquid', 'shakevape', nebo 'liquidpro'
        totalAmount: total,
        vgPercent: vg,
        pgPercent: pg,
        nicotine: nicotine,
        ingredients: ingredients.map(ing => ({
            ingredientKey: ing.ingredientKey,
            flavorType: ing.flavorType,
            params: ing.params,
            volume: ing.volume,
            percent: ing.percent,
            drops: ing.drops
        })),
        actualVg: actualVg,
        actualPg: actualPg
    });

    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    let runningTotal = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');

        // Calculate drops display based on volume
        // Show drops only for nicotine/flavor AND if volume <= 5ml
        let dropsDisplay = '-';
        if (ing.showDrops && ing.volume <= 5) {
            const drops = Math.round(ing.volume * 20);
            dropsDisplay = String(drops);
        }

        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);

        row.innerHTML = `
            <td class="ingredient-name">${ingredientName}</td>
            <td class="ingredient-value">${ing.volume.toFixed(2)} ml</td>
            <td class="ingredient-drops">${dropsDisplay}</td>
            <td class="ingredient-percent">${ing.percent.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
        runningTotal += ing.volume;
    });

    // Add total row - should match user's requested total
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)} ml</td>
        <td class="ingredient-drops">-</td>
        <td class="ingredient-percent">100%</td>
    `;
    tbody.appendChild(totalRow);

    // Add actual ratio info
    const actualVgPercent = (actualVg / total * 100).toFixed(1);
    const actualPgPercent = (actualPg / total * 100).toFixed(1);
    
    // Update notes with actual ratio
    const notesEl = document.querySelector('.results-notes ul');
    if (notesEl) {
        notesEl.innerHTML = `
            <li>${t('results.notes_1', 'Nejprve přidejte nikotin (pokud používáte)')} - ${t('results.dilute_notes_1', 'pracujte v rukavicích!')}</li>
            <li>${t('results.notes_2', 'Poté přidejte příchutě')}</li>
            <li>${t('results.notes_3', 'Nakonec doplňte PG a VG')}</li>
            <li>${t('results.notes_4', 'Důkladně protřepejte a nechte zrát 1-2 týdny')}</li>
            <li>${t('results.actual_ratio', 'Skutečný poměr VG/PG ve směsi')}: ${actualVgPercent}% / ${actualPgPercent}%</li>
        `;
    }
}

// =========================================
// Utility Functions
// =========================================

function adjustColorBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// =========================================
// PWA Install Prompt
// =========================================

let deferredPrompt;

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

// Detect iOS device
function isIOSDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
}

// Check if app is already installed (standalone mode)
function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install prompt ONLY on mobile devices
    if (isMobileDevice()) {
        showInstallPrompt();
    }
});

// Show iOS install prompt on page load (iOS doesn't fire beforeinstallprompt)
window.addEventListener('load', () => {
    if (isIOSDevice() && !isStandalone() && !sessionStorage.getItem('iosInstallDismissed')) {
        // Small delay to not interrupt user immediately
        setTimeout(() => {
            showIOSInstallPrompt();
        }, 2000);
    }
});

function showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.classList.remove('hidden');
    }
}

function hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

function showIOSInstallPrompt() {
    const prompt = document.getElementById('iosInstallPrompt');
    if (prompt) {
        prompt.classList.remove('hidden');
    }
}

function hideIOSInstallPrompt() {
    const prompt = document.getElementById('iosInstallPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

// Setup install button listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    const iosDismissBtn = document.getElementById('iosDismissBtn');
    
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                // Clear the deferred prompt
                deferredPrompt = null;
                hideInstallPrompt();
            }
        });
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideInstallPrompt();
            // Remember dismissal for this session
            sessionStorage.setItem('installDismissed', 'true');
        });
    }
    
    // iOS dismiss button
    if (iosDismissBtn) {
        iosDismissBtn.addEventListener('click', () => {
            hideIOSInstallPrompt();
            // Remember dismissal for this session
            sessionStorage.setItem('iosInstallDismissed', 'true');
        });
    }
    
    // Check if already dismissed this session
    if (sessionStorage.getItem('installDismissed')) {
        hideInstallPrompt();
    }
});

// Handle successful install
window.addEventListener('appinstalled', () => {
    console.log('LiquiMixer installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
});

// =========================================
// Nicotine Dilution Calculator
// =========================================

let diluteLimits = { min: 0, max: 100 };

function updateDiluteAmountType() {
    const finalInput = document.getElementById('diluteFinalAmount');
    const sourceInput = document.getElementById('diluteSourceAmount');
    const amountType = document.querySelector('input[name="amountType"]:checked').value;
    
    if (amountType === 'final') {
        finalInput.disabled = false;
        sourceInput.disabled = true;
    } else {
        finalInput.disabled = true;
        sourceInput.disabled = false;
    }
    
    updateDiluteCalculation();
}

function updateDiluteNicotineType() {
    const type = document.getElementById('diluteNicotineType').value;
    const strengthInput = document.getElementById('diluteBaseStrength');
    
    if (type === 'freebase') {
        strengthInput.max = 200;
        if (parseInt(strengthInput.value) > 200) {
            strengthInput.value = 200;
        }
    } else {
        strengthInput.max = 72;
        if (parseInt(strengthInput.value) > 72) {
            strengthInput.value = 72;
        }
    }
    
    updateDiluteCalculation();
}

function adjustDiluteSourceRatio(change) {
    const slider = document.getElementById('diluteSourceRatio');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateDiluteSourceRatioDisplay();
}

function updateDiluteSourceRatioDisplay() {
    const slider = document.getElementById('diluteSourceRatio');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    const vgEl = document.getElementById('diluteSourceVg');
    const pgEl = document.getElementById('diluteSourcePg');
    
    vgEl.textContent = vg;
    pgEl.textContent = pg;
    
    // Update color description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('diluteSourceDescription');
        const trackEl = document.getElementById('diluteSourceTrack');
        if (descEl) {
            descEl.textContent = getRatioDescriptionText(vg);
            descEl.style.color = desc.color;
            descEl.style.borderLeftColor = desc.color;
        }
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
        // Update ratio display color
        vgEl.style.color = desc.color;
        pgEl.style.color = desc.color;
        vgEl.style.textShadow = `0 0 20px ${desc.color}`;
        pgEl.style.textShadow = `0 0 20px ${desc.color}`;
    }
    
    updateDiluteRatioLimits();
}

function adjustDiluteTargetRatio(change) {
    const slider = document.getElementById('diluteTargetRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(diluteLimits.min, Math.min(diluteLimits.max, newValue));
    slider.value = newValue;
    updateDiluteTargetRatioDisplay();
}

function updateDiluteTargetRatioDisplay() {
    const slider = document.getElementById('diluteTargetRatio');
    let vg = parseInt(slider.value);
    
    // Clamp to limits
    if (vg < diluteLimits.min) vg = diluteLimits.min;
    if (vg > diluteLimits.max) vg = diluteLimits.max;
    slider.value = vg;
    
    const pg = 100 - vg;
    
    const vgEl = document.getElementById('diluteTargetVg');
    const pgEl = document.getElementById('diluteTargetPg');
    
    vgEl.textContent = vg;
    pgEl.textContent = pg;
    
    // Update color description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('diluteTargetDescription');
        const trackEl = document.getElementById('diluteTargetTrack');
        if (descEl) {
            descEl.textContent = getRatioDescriptionText(vg);
            descEl.style.color = desc.color;
            descEl.style.borderLeftColor = desc.color;
        }
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
        // Update ratio display color
        vgEl.style.color = desc.color;
        pgEl.style.color = desc.color;
        vgEl.style.textShadow = `0 0 20px ${desc.color}`;
        pgEl.style.textShadow = `0 0 20px ${desc.color}`;
    }
}

function updateDiluteRatioLimits() {
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const sourceVg = parseInt(document.getElementById('diluteSourceRatio').value);
    const sourcePg = 100 - sourceVg;
    
    const disabledLeft = document.getElementById('diluteDisabledLeft');
    const disabledRight = document.getElementById('diluteDisabledRight');
    const warningEl = document.getElementById('diluteRatioWarning');
    
    // Calculate dilution ratio
    let dilutionRatio = 0;
    if (baseStrength > 0 && targetStrength > 0 && targetStrength <= baseStrength) {
        dilutionRatio = targetStrength / baseStrength; // fraction of nicotine base in final mix
    }
    
    // Calculate VG/PG contribution from nicotine base
    const nicVgPercent = dilutionRatio * sourceVg;
    const nicPgPercent = dilutionRatio * sourcePg;
    
    // Min VG = VG from nicotine only (no extra VG added)
    // Max VG = 100 - PG from nicotine (all remaining is VG)
    const minVg = Math.ceil(nicVgPercent);
    const maxVg = Math.floor(100 - nicPgPercent);
    
    diluteLimits.min = Math.max(0, minVg);
    diluteLimits.max = Math.min(100, maxVg);
    
    // Update disabled zones
    if (disabledLeft) {
        disabledLeft.style.width = diluteLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - diluteLimits.max) + '%';
    }
    
    // Show warning if limited
    if (warningEl) {
        if (diluteLimits.min > 0 || diluteLimits.max < 100) {
            const warningText = t('ratio_warning.limited_nicotine', 'Poměr omezen na {min}–{max}% VG kvůli poměru v nikotinové bázi.')
                .replace('{min}', diluteLimits.min)
                .replace('{max}', diluteLimits.max);
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    // Clamp current value
    const slider = document.getElementById('diluteTargetRatio');
    let currentValue = parseInt(slider.value);
    if (currentValue < diluteLimits.min) {
        slider.value = diluteLimits.min;
    } else if (currentValue > diluteLimits.max) {
        slider.value = diluteLimits.max;
    }
    
    updateDiluteTargetRatioDisplay();
}

function updateDiluteCalculation() {
    // Validate target strength
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const warningEl = document.getElementById('diluteTargetWarning');
    
    if (targetStrength > baseStrength && baseStrength > 0) {
        if (warningEl) {
            const warningText = t('dilute.target_too_high', 'Cílová síla nemůže být vyšší než zdrojová ({strength} mg/ml).')
                .replace('{strength}', baseStrength);
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        }
        document.getElementById('diluteTargetStrength').value = baseStrength;
    } else if (warningEl) {
        warningEl.classList.add('hidden');
    }
    
    updateDiluteRatioLimits();
}

function calculateDilution() {
    // Get inputs
    const amountType = document.querySelector('input[name="amountType"]:checked').value;
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const sourceVg = parseInt(document.getElementById('diluteSourceRatio').value);
    const sourcePg = 100 - sourceVg;
    const targetVg = parseInt(document.getElementById('diluteTargetRatio').value);
    const targetPg = 100 - targetVg;
    const nicotineType = document.getElementById('diluteNicotineType').value;
    
    let totalAmount, nicotineVolume;
    
    if (amountType === 'final') {
        // User specified final amount
        totalAmount = parseFloat(document.getElementById('diluteFinalAmount').value) || 100;
        // Calculate how much nicotine base needed
        if (baseStrength > 0 && targetStrength > 0) {
            nicotineVolume = (targetStrength * totalAmount) / baseStrength;
        } else {
            nicotineVolume = 0;
        }
    } else {
        // User specified source nicotine amount
        nicotineVolume = parseFloat(document.getElementById('diluteSourceAmount').value) || 30;
        // Calculate final total amount
        if (baseStrength > 0 && targetStrength > 0) {
            totalAmount = (nicotineVolume * baseStrength) / targetStrength;
        } else {
            totalAmount = nicotineVolume;
        }
    }
    
    // Calculate VG and PG from nicotine
    const nicVgVolume = nicotineVolume * (sourceVg / 100);
    const nicPgVolume = nicotineVolume * (sourcePg / 100);
    
    // Calculate target VG and PG volumes
    const targetVgVolume = (targetVg / 100) * totalAmount;
    const targetPgVolume = (targetPg / 100) * totalAmount;
    
    // Calculate pure VG and PG needed
    let pureVgNeeded = targetVgVolume - nicVgVolume;
    let purePgNeeded = targetPgVolume - nicPgVolume;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    // Build results - ukládáme klíče pro dynamický překlad
    const ingredients = [];

    ingredients.push({
        ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
        params: {
            strength: baseStrength,
            vgpg: `${sourceVg}/${sourcePg}`
        },
        volume: nicotineVolume,
        percent: (nicotineVolume / totalAmount) * 100
    });

    if (purePgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'pg',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100
        });
    }

    if (pureVgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'vg',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100
        });
    }

    // Kontrola přihlášení před zobrazením výsledků - Ředění nikotinové báze vyžaduje přihlášení
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    // Display results
    displayDiluteResults(totalAmount, targetVg, targetPg, targetStrength, ingredients);
    showPage('dilute-results');
}

function displayDiluteResults(total, vg, pg, nicotine, ingredients) {
    document.getElementById('diluteResultTotal').textContent = `${total.toFixed(1)} ml`;
    document.getElementById('diluteResultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('diluteResultNicotine').textContent = `${nicotine} mg/ml`;

    const tbody = document.getElementById('diluteResultsBody');
    tbody.innerHTML = '';

    let runningTotal = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName}</td>
            <td class="ingredient-value">${ing.volume.toFixed(2)} ml</td>
            <td class="ingredient-percent">${ing.percent.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
        runningTotal += ing.volume;
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)} ml</td>
        <td class="ingredient-percent">100%</td>
    `;
    tbody.appendChild(totalRow);
}

// =========================================
// Form Tab Switching
// =========================================

let currentFormTab = 'liquid';

function switchFormTab(tabName) {
    // Liquid PRO - modál se zobrazí až při kliknutí na MIXUJ, ne při přepnutí záložky
    
    currentFormTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update form content visibility
    document.querySelectorAll('.form-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetForm = document.getElementById(`form-${tabName}`);
    if (targetForm) {
        targetForm.classList.add('active');
    }
    
    // Initialize displays for the active form
    if (tabName === 'shakevape') {
        initShakeVapeForm();
    } else if (tabName === 'liquidpro') {
        initLiquidProForm();
    }
}

// =========================================
// Shake & Vape Functions
// =========================================

let svVgPgLimits = { min: 0, max: 100 };

function initShakeVapeForm() {
    setupSvNicotineRatioToggle();
    updateSvRatioDisplay();
    updateSvNicotineDisplay();
}

function setupSvNicotineRatioToggle() {
    const ratio5050Btn = document.getElementById('svRatio5050');
    const ratio7030Btn = document.getElementById('svRatio7030');
    const nicotineRatioInput = document.getElementById('svNicotineRatio');
    
    if (ratio5050Btn && ratio7030Btn && nicotineRatioInput) {
        ratio5050Btn.onclick = () => {
            ratio5050Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            nicotineRatioInput.value = '50/50';
            updateSvVgPgLimits();
        };
        
        ratio7030Btn.onclick = () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            updateSvVgPgLimits();
        };
    }
}

function updateSvNicotineType() {
    const type = document.getElementById('svNicotineType').value;
    const strengthContainer = document.getElementById('svNicotineStrengthContainer');
    const ratioContainer = document.getElementById('svNicotineRatioContainer');
    const targetGroup = document.getElementById('svTargetNicotineGroup');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        targetGroup.classList.add('hidden');
        document.getElementById('svTargetNicotine').value = 0;
        updateSvNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        targetGroup.classList.remove('hidden');
    }
    
    updateSvVgPgLimits();
}

function adjustSvTargetNicotine(change) {
    const slider = document.getElementById('svTargetNicotine');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(slider.max), newValue));
    slider.value = newValue;
    updateSvNicotineDisplay();
}

function updateSvNicotineDisplay() {
    const slider = document.getElementById('svTargetNicotine');
    const value = parseInt(slider.value);
    const displayEl = document.getElementById('svTargetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const descEl = document.getElementById('svNicotineDescription');
    const trackEl = document.getElementById('svNicotineTrack');
    
    displayEl.textContent = value;
    
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        descEl.textContent = getNicotineDescriptionText(value);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }
    
    updateSvVgPgLimits();
}

function adjustSvRatio(change) {
    const slider = document.getElementById('svVgPgRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(svVgPgLimits.min, Math.min(svVgPgLimits.max, newValue));
    slider.value = newValue;
    updateSvRatioDisplay();
}

function updateSvRatioDisplay() {
    const slider = document.getElementById('svVgPgRatio');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;

    document.getElementById('svVgValue').textContent = vg;
    document.getElementById('svPgValue').textContent = pg;

    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('svRatioDescription');
        descEl.textContent = getRatioDescriptionText(vg);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        document.getElementById('svSliderTrack').style.background =
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

function updateSvVgPgLimits() {
    const slider = document.getElementById('svVgPgRatio');
    const warningEl = document.getElementById('svRatioLimitWarning');
    const disabledLeft = document.getElementById('svSliderDisabledLeft');
    const disabledRight = document.getElementById('svSliderDisabledRight');
    
    const totalAmount = parseFloat(document.getElementById('svTotalAmount').value) || 60;
    const nicotineType = document.getElementById('svNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('svTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength').value) || 0;
    const flavorVolume = parseFloat(document.getElementById('svFlavorVolume').value) || 0;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('svNicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }
    
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);

    // Get flavor VG/PG ratio
    let flavorVgPercent = 0;
    let flavorPgPercent = 100;
    const svFlavorRatio = document.getElementById('svFlavorRatio').value;
    if (svFlavorRatio === '0/100') {
        flavorVgPercent = 0;
        flavorPgPercent = 100;
    } else if (svFlavorRatio === '80/20') {
        flavorVgPercent = 80;
        flavorPgPercent = 20;
    } else if (svFlavorRatio === '70/30') {
        flavorVgPercent = 70;
        flavorPgPercent = 30;
    }

    const flavorVgVolume = flavorVolume * (flavorVgPercent / 100);
    const flavorPgVolume = flavorVolume * (flavorPgPercent / 100);

    const fixedPgVolume = nicotinePgVolume + flavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + flavorVgVolume;

    const minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
    const maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);

    svVgPgLimits.min = Math.max(0, minVgPercent);
    svVgPgLimits.max = Math.min(100, maxVgPercent);
    
    if (disabledLeft) {
        disabledLeft.style.width = svVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - svVgPgLimits.max) + '%';
    }
    
    let currentValue = parseInt(slider.value);
    if (currentValue < svVgPgLimits.min) {
        slider.value = svVgPgLimits.min;
    } else if (currentValue > svVgPgLimits.max) {
        slider.value = svVgPgLimits.max;
    }
    
    if (warningEl) {
        if (svVgPgLimits.min > 0 || svVgPgLimits.max < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (flavorVolume > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_volume', 'příchuť ({volume} ml, VG/PG {vg}/{pg})')
                    .replace('{volume}', flavorVolume)
                    .replace('{vg}', flavorVgPercent)
                    .replace('{pg}', flavorPgPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', svVgPgLimits.min)
                .replace('{max}', svVgPgLimits.max)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    updateSvRatioDisplay();
}

function updateSvCalculation() {
    updateSvVgPgLimits();
}

function calculateShakeVape() {
    const totalAmount = parseFloat(document.getElementById('svTotalAmount').value) || 60;
    const vgPercent = parseInt(document.getElementById('svVgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('svNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('svTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength').value) || 0;
    const flavorVolume = parseFloat(document.getElementById('svFlavorVolume').value) || 0;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('svNicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }
    
    const nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    
    // Get flavor VG/PG ratio
    let flavorVgPercent = 0;
    let flavorPgPercent = 100;
    const svFlavorRatio = document.getElementById('svFlavorRatio').value;
    if (svFlavorRatio === '0/100') {
        flavorVgPercent = 0;
        flavorPgPercent = 100;
    } else if (svFlavorRatio === '80/20') {
        flavorVgPercent = 80;
        flavorPgPercent = 20;
    } else if (svFlavorRatio === '70/30') {
        flavorVgPercent = 70;
        flavorPgPercent = 30;
    }
    
    const flavorVgContent = flavorVolume * (flavorVgPercent / 100);
    const flavorPgContent = flavorVolume * (flavorPgPercent / 100);

    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;

    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    let pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    const totalPureNeeded = pureVgNeeded + purePgNeeded;
    if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
        const ratio = remainingVolume / totalPureNeeded;
        pureVgNeeded *= ratio;
        purePgNeeded *= ratio;
    } else if (totalPureNeeded < remainingVolume) {
        const extra = remainingVolume - totalPureNeeded;
        if (vgPercent + pgPercent > 0) {
            pureVgNeeded += extra * (vgPercent / 100);
            purePgNeeded += extra * (pgPercent / 100);
        }
    }
    
    const DROPS_PER_ML = 20;
    const ingredients = [];

    // Flavor first (already in bottle)
    if (flavorVolume > 0) {
        ingredients.push({
            ingredientKey: 'shakevape_flavor',
            params: {
                vgpg: svFlavorRatio
            },
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    if (nicotineVolume > 0) {
        const nicotineRatioValue = document.getElementById('svNicotineRatio').value;
        ingredients.push({
            ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
            params: {
                strength: baseNicotine,
                vgpg: nicotineRatioValue
            },
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }
    
    if (purePgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'pg',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    if (pureVgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'vg',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;
    
    // Display results - pro formulář Shake and Vape zobrazí výsledky i nepřihlášeným
    // Modál se zobrazí až při pokusu o uložení receptu
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, 'shakevape');
    showPage('results');
}

// =========================================
// Liquid PRO Functions
// =========================================

let proVgPgLimits = { min: 0, max: 100 };

function initLiquidProForm() {
    updateProVgPgLimits();
    updateProRatioDisplay();
    updateProNicotineDisplay();
    updateProNicRatioDisplay();
    updateProFlavorRatioDisplay();
}

function updateProNicotineType() {
    const type = document.getElementById('proNicotineType').value;
    const strengthContainer = document.getElementById('proNicotineStrengthContainer');
    const ratioContainer = document.getElementById('proNicotineRatioContainer');
    const targetGroup = document.getElementById('proTargetNicotineGroup');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        targetGroup.classList.add('hidden');
        document.getElementById('proTargetNicotine').value = 0;
        updateProNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        targetGroup.classList.remove('hidden');
    }
    
    updateProVgPgLimits();
}

function adjustProNicRatio(change) {
    const slider = document.getElementById('proNicotineRatioSlider');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateProNicRatioDisplay();
}

function updateProNicRatioDisplay() {
    const slider = document.getElementById('proNicotineRatioSlider');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    document.getElementById('proNicVgValue').textContent = vg;
    document.getElementById('proNicPgValue').textContent = pg;
    
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const trackEl = document.getElementById('proNicotineTrackRatio');
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
    }
    
    updateProVgPgLimits();
}

function adjustProTargetNicotine(change) {
    const slider = document.getElementById('proTargetNicotine');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(slider.max), newValue));
    slider.value = newValue;
    updateProNicotineDisplay();
}

function updateProNicotineDisplay() {
    const slider = document.getElementById('proTargetNicotine');
    const value = parseInt(slider.value);
    const displayEl = document.getElementById('proTargetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const trackEl = document.getElementById('proNicotineTrack');

    displayEl.textContent = value;

    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }

    updateProVgPgLimits();
}

// ============================================
// MULTI-FLAVOR PRO SYSTEM (až 4 příchutě)
// ============================================

// Stav pro multi-flavor
let proFlavorCount = 1;
const MAX_PRO_FLAVORS = 4;

// Aktualizovat typ příchutě pro daný index
function updateProFlavorType(flavorIndex = 1) {
    const type = document.getElementById(`proFlavorType${flavorIndex}`).value;
    const strengthContainer = document.getElementById(`proFlavorStrengthContainer${flavorIndex}`);
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
    } else {
        strengthContainer.classList.remove('hidden');
        const flavor = flavorDatabase[type];
        document.getElementById(`proFlavorStrength${flavorIndex}`).value = flavor.ideal;
        updateProFlavorDisplay(flavorIndex);
    }
    
    updateProTotalFlavorPercent();
    updateProVgPgLimits();
}

// Upravit sílu příchutě
function adjustProFlavor(flavorIndex, change) {
    const slider = document.getElementById(`proFlavorStrength${flavorIndex}`);
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(30, newValue));
    slider.value = newValue;
    updateProFlavorDisplay(flavorIndex);
    updateProTotalFlavorPercent();
}

// Aktualizovat sílu příchutě při změně slideru
function updateProFlavorStrength(flavorIndex) {
    updateProFlavorDisplay(flavorIndex);
    updateProTotalFlavorPercent();
}

// Zobrazení hodnoty příchutě
function updateProFlavorDisplay(flavorIndex = 1) {
    const slider = document.getElementById(`proFlavorStrength${flavorIndex}`);
    const type = document.getElementById(`proFlavorType${flavorIndex}`).value;
    
    if (!slider || type === 'none') return;
    
    const value = parseInt(slider.value);
    const flavor = flavorDatabase[type];
    const displayEl = document.getElementById(`proFlavorValue${flavorIndex}`);
    const displayContainer = displayEl?.parentElement;
    const trackEl = document.getElementById(`proFlavorTrack${flavorIndex}`);

    if (!displayEl) return;
    
    displayEl.textContent = value;

    let color;
    if (value < flavor.min) {
        color = '#ffaa00';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > flavor.max) {
        color = '#ff0044';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #00cc66, #00aaff)`;
    }

    displayEl.style.color = 'inherit';
    if (displayContainer) displayContainer.style.color = color;

    updateProVgPgLimits();
}

// Upravit VG/PG poměr příchutě
function adjustProFlavorRatio(flavorIndex, change) {
    const slider = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
    if (!slider) return;
    
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateProFlavorRatioDisplay(flavorIndex);
}

// Zobrazit VG/PG poměr příchutě
function updateProFlavorRatioDisplay(flavorIndex = 1) {
    const slider = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
    if (!slider) return;
    
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    const vgEl = document.getElementById(`proFlavorVgValue${flavorIndex}`);
    const pgEl = document.getElementById(`proFlavorPgValue${flavorIndex}`);
    
    if (vgEl) vgEl.textContent = vg;
    if (pgEl) pgEl.textContent = pg;
    
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const trackEl = document.getElementById(`proFlavorTrackRatio${flavorIndex}`);
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
    }
    
    updateProVgPgLimits();
}

// Přidat další příchuť (max 4)
function addProFlavor() {
    if (proFlavorCount >= MAX_PRO_FLAVORS) {
        return;
    }
    
    proFlavorCount++;
    const container = document.getElementById('proAdditionalFlavorsContainer');
    
    const flavorHtml = `
        <div class="form-group pro-flavor-group" id="proFlavorGroup${proFlavorCount}">
            <button type="button" class="remove-flavor-btn" onclick="removeProFlavor(${proFlavorCount})" title="${window.i18n?.t('form.remove_flavor') || 'Odebrat příchuť'}">×</button>
            <label class="form-label">
                <span data-i18n="form.flavor_label">${window.i18n?.t('form.flavor_label') || 'Příchuť'}</span>
                <span class="flavor-number"> ${proFlavorCount}</span>
            </label>
            <div class="flavor-container">
                <select id="proFlavorType${proFlavorCount}" class="neon-select pro-flavor-select" data-flavor-index="${proFlavorCount}" onchange="updateProFlavorType(${proFlavorCount})">
                    <option value="none" data-i18n="form.flavor_none">${window.i18n?.t('form.flavor_none') || 'Žádná (bez příchutě)'}</option>
                    <option value="fruit" data-i18n="form.flavor_fruit">${window.i18n?.t('form.flavor_fruit') || 'Ovoce'}</option>
                    <option value="citrus" data-i18n="form.flavor_citrus">${window.i18n?.t('form.flavor_citrus') || 'Citrónové'}</option>
                    <option value="berry" data-i18n="form.flavor_berry">${window.i18n?.t('form.flavor_berry') || 'Bobulové'}</option>
                    <option value="tropical" data-i18n="form.flavor_tropical">${window.i18n?.t('form.flavor_tropical') || 'Tropické'}</option>
                    <option value="tobacco" data-i18n="form.flavor_tobacco">${window.i18n?.t('form.flavor_tobacco') || 'Tabákové'}</option>
                    <option value="menthol" data-i18n="form.flavor_menthol">${window.i18n?.t('form.flavor_menthol') || 'Mentol'}</option>
                    <option value="candy" data-i18n="form.flavor_candy">${window.i18n?.t('form.flavor_candy') || 'Sladkosti'}</option>
                    <option value="dessert" data-i18n="form.flavor_dessert">${window.i18n?.t('form.flavor_dessert') || 'Dezerty'}</option>
                    <option value="bakery" data-i18n="form.flavor_bakery">${window.i18n?.t('form.flavor_bakery') || 'Zákusky'}</option>
                    <option value="biscuit" data-i18n="form.flavor_biscuit">${window.i18n?.t('form.flavor_biscuit') || 'Piškotové'}</option>
                    <option value="drink" data-i18n="form.flavor_drink">${window.i18n?.t('form.flavor_drink') || 'Nápojové'}</option>
                    <option value="tobaccosweet" data-i18n="form.flavor_tobaccosweet">${window.i18n?.t('form.flavor_tobaccosweet') || 'Tabák + sladké'}</option>
                    <option value="nuts" data-i18n="form.flavor_nuts">${window.i18n?.t('form.flavor_nuts') || 'Oříškové'}</option>
                    <option value="spice" data-i18n="form.flavor_spice">${window.i18n?.t('form.flavor_spice') || 'Kořeněné'}</option>
                </select>
                <div id="proFlavorStrengthContainer${proFlavorCount}" class="hidden">
                    <div class="slider-container small">
                        <button class="slider-btn small" onclick="adjustProFlavor(${proFlavorCount}, -1)">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="proFlavorStrength${proFlavorCount}" min="0" max="30" value="10" class="flavor-slider pro-flavor-slider" data-flavor-index="${proFlavorCount}" oninput="updateProFlavorStrength(${proFlavorCount})">
                            <div class="slider-track flavor-track" id="proFlavorTrack${proFlavorCount}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustProFlavor(${proFlavorCount}, 1)">▶</button>
                    </div>
                    <div class="flavor-display">
                        <span id="proFlavorValue${proFlavorCount}">10</span>%
                    </div>
                    <div class="form-group-sub">
                        <label class="form-label-small" data-i18n="form.flavor_ratio_label">${window.i18n?.t('form.flavor_ratio_label') || 'Poměr VG/PG v koncentrátu příchutě'}</label>
                        <div class="ratio-container compact">
                            <div class="ratio-labels">
                                <span class="ratio-label left" data-i18n="form.vg_label">${window.i18n?.t('form.vg_label') || 'Dým (VG)'}</span>
                                <span class="ratio-label right" data-i18n="form.pg_label">${window.i18n?.t('form.pg_label') || 'Chuť (PG)'}</span>
                            </div>
                            <div class="slider-container">
                                <button class="slider-btn small" onclick="adjustProFlavorRatio(${proFlavorCount}, -5)">◀</button>
                                <div class="slider-wrapper">
                                    <input type="range" id="proFlavorRatioSlider${proFlavorCount}" min="0" max="100" value="0" class="ratio-slider pro-flavor-ratio" data-flavor-index="${proFlavorCount}" oninput="updateProFlavorRatioDisplay(${proFlavorCount})">
                                    <div class="slider-track" id="proFlavorTrackRatio${proFlavorCount}"></div>
                                </div>
                                <button class="slider-btn small" onclick="adjustProFlavorRatio(${proFlavorCount}, 5)">▶</button>
                            </div>
                            <div class="ratio-display small">
                                <span id="proFlavorVgValue${proFlavorCount}">0</span>:<span id="proFlavorPgValue${proFlavorCount}">100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', flavorHtml);
    
    // Skrýt tlačítko "Přidat" pokud je max příchutí
    if (proFlavorCount >= MAX_PRO_FLAVORS) {
        document.getElementById('proAddFlavorGroup').classList.add('hidden');
    }
    
    // Aktualizovat hint
    updateProFlavorCountHint();
}

// Odebrat příchuť
function removeProFlavor(flavorIndex) {
    const flavorGroup = document.getElementById(`proFlavorGroup${flavorIndex}`);
    if (flavorGroup) {
        flavorGroup.remove();
    }
    
    proFlavorCount--;
    
    // Renumber remaining flavors
    renumberProFlavors();
    
    // Zobrazit tlačítko "Přidat" pokud je méně než max
    if (proFlavorCount < MAX_PRO_FLAVORS) {
        document.getElementById('proAddFlavorGroup').classList.remove('hidden');
    }
    
    updateProFlavorCountHint();
    updateProTotalFlavorPercent();
    updateProVgPgLimits();
}

// Přečíslovat příchutě po odebrání
function renumberProFlavors() {
    const container = document.getElementById('proAdditionalFlavorsContainer');
    const groups = container.querySelectorAll('.pro-flavor-group');
    
    groups.forEach((group, index) => {
        const newIndex = index + 2; // Začínáme od 2 (1 je vždy první příchuť)
        const oldId = group.id;
        const oldIndex = parseInt(oldId.replace('proFlavorGroup', ''));
        
        if (oldIndex !== newIndex) {
            // Aktualizovat ID skupiny
            group.id = `proFlavorGroup${newIndex}`;
            
            // Aktualizovat číslo příchutě v labelu
            const flavorNumber = group.querySelector('.flavor-number');
            if (flavorNumber) flavorNumber.textContent = ` ${newIndex}`;
            
            // Aktualizovat všechny ID a reference uvnitř
            updateFlavorElementIds(group, oldIndex, newIndex);
        }
    });
}

// Pomocná funkce pro aktualizaci ID elementů
function updateFlavorElementIds(container, oldIndex, newIndex) {
    const elementsToUpdate = [
        'proFlavorType', 'proFlavorStrengthContainer', 'proFlavorStrength',
        'proFlavorTrack', 'proFlavorValue', 'proFlavorRatioSlider',
        'proFlavorTrackRatio', 'proFlavorVgValue', 'proFlavorPgValue'
    ];
    
    elementsToUpdate.forEach(prefix => {
        const el = container.querySelector(`#${prefix}${oldIndex}`);
        if (el) {
            el.id = `${prefix}${newIndex}`;
            
            // Aktualizovat data-flavor-index
            if (el.dataset.flavorIndex) {
                el.dataset.flavorIndex = newIndex;
            }
            
            // Aktualizovat onchange/oninput
            if (el.hasAttribute('onchange')) {
                el.setAttribute('onchange', el.getAttribute('onchange').replace(oldIndex, newIndex));
            }
            if (el.hasAttribute('oninput')) {
                el.setAttribute('oninput', el.getAttribute('oninput').replace(oldIndex, newIndex));
            }
        }
    });
    
    // Aktualizovat onclick na tlačítkách
    container.querySelectorAll('button').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(oldIndex.toString())) {
            btn.setAttribute('onclick', onclick.replace(new RegExp(oldIndex, 'g'), newIndex));
        }
    });
}

// Aktualizovat hint o počtu příchutí
function updateProFlavorCountHint() {
    const hint = document.getElementById('proFlavorCountHint');
    if (hint) {
        const remaining = MAX_PRO_FLAVORS - proFlavorCount;
        if (remaining > 0) {
            hint.textContent = `(${window.i18n?.t('form.flavor_remaining', { count: remaining }) || `zbývá ${remaining}`})`;
        } else {
            hint.textContent = `(${window.i18n?.t('form.flavor_max_reached') || 'maximum dosaženo'})`;
        }
    }
}

// Vypočítat celkové procento příchutí
function updateProTotalFlavorPercent() {
    let total = 0;
    
    for (let i = 1; i <= MAX_PRO_FLAVORS; i++) {
        const typeEl = document.getElementById(`proFlavorType${i}`);
        const strengthEl = document.getElementById(`proFlavorStrength${i}`);
        
        if (typeEl && strengthEl && typeEl.value !== 'none') {
            total += parseInt(strengthEl.value) || 0;
        }
    }
    
    const totalEl = document.getElementById('proTotalFlavorPercent');
    const warningEl = document.getElementById('proFlavorTotalWarning');
    
    if (totalEl) {
        totalEl.textContent = total;
    }
    
    if (warningEl) {
        if (total > 30) {
            warningEl.classList.remove('hidden');
            warningEl.classList.add('error');
            warningEl.textContent = window.i18n?.t('form.flavor_total_error') || '(příliš mnoho příchutí!)';
        } else if (total > 25) {
            warningEl.classList.remove('hidden', 'error');
            warningEl.textContent = window.i18n?.t('form.flavor_total_warning') || '(doporučeno max 25%)';
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    return total;
}

// Získat všechny příchutě pro výpočet
function getProFlavorsData() {
    const flavors = [];
    
    for (let i = 1; i <= MAX_PRO_FLAVORS; i++) {
        const typeEl = document.getElementById(`proFlavorType${i}`);
        const strengthEl = document.getElementById(`proFlavorStrength${i}`);
        const ratioEl = document.getElementById(`proFlavorRatioSlider${i}`);
        
        if (typeEl && typeEl.value !== 'none') {
            flavors.push({
                index: i,
                type: typeEl.value,
                percent: parseInt(strengthEl?.value) || 10,
                vgRatio: parseInt(ratioEl?.value) || 0
            });
        }
    }
    
    return flavors;
}

function adjustProRatio(change) {
    const slider = document.getElementById('proVgPgRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(proVgPgLimits.min, Math.min(proVgPgLimits.max, newValue));
    slider.value = newValue;
    updateProRatioDisplay();
}

function updateProRatioDisplay() {
    const slider = document.getElementById('proVgPgRatio');
    let vg = parseInt(slider.value);
    
    // Clamp to limits
    if (vg < proVgPgLimits.min) {
        vg = proVgPgLimits.min;
        slider.value = vg;
    } else if (vg > proVgPgLimits.max) {
        vg = proVgPgLimits.max;
        slider.value = vg;
    }
    
    const pg = 100 - vg;

    document.getElementById('proVgValue').textContent = vg;
    document.getElementById('proPgValue').textContent = pg;

    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        document.getElementById('proSliderTrack').style.background =
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

function updateProVgPgLimits() {
    const slider = document.getElementById('proVgPgRatio');
    const warningEl = document.getElementById('proRatioLimitWarning');
    const disabledLeft = document.getElementById('proSliderDisabledLeft');
    const disabledRight = document.getElementById('proSliderDisabledRight');
    
    const totalAmount = parseFloat(document.getElementById('proTotalAmount').value) || 100;
    const nicotineType = document.getElementById('proNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('proTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength').value) || 0;
    
    // Získat data všech příchutí (multi-flavor support)
    const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
    const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    // Get VG/PG from nicotine slider
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;
    
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);
    
    // Spočítat VG/PG ze všech příchutí
    let totalFlavorVgVolume = 0;
    let totalFlavorPgVolume = 0;
    
    flavorsData.forEach(flavor => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        const flavorVg = flavor.vgRatio;
        const flavorPg = 100 - flavorVg;
        totalFlavorVgVolume += flavorVolume * (flavorVg / 100);
        totalFlavorPgVolume += flavorVolume * (flavorPg / 100);
    });
    
    const fixedPgVolume = nicotinePgVolume + totalFlavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + totalFlavorVgVolume;
    
    const minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
    const maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);
    
    proVgPgLimits.min = Math.max(0, minVgPercent);
    proVgPgLimits.max = Math.min(100, maxVgPercent);
    
    if (disabledLeft) {
        disabledLeft.style.width = proVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - proVgPgLimits.max) + '%';
    }
    
    let currentValue = parseInt(slider.value);
    if (currentValue < proVgPgLimits.min) {
        slider.value = proVgPgLimits.min;
    } else if (currentValue > proVgPgLimits.max) {
        slider.value = proVgPgLimits.max;
    }
    
    if (warningEl) {
        if (proVgPgLimits.min > 0 || proVgPgLimits.max < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (totalFlavorPercent > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_multi', 'příchutě (celkem {percent}%)')
                    .replace('{percent}', totalFlavorPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', proVgPgLimits.min)
                .replace('{max}', proVgPgLimits.max)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    updateProRatioDisplay();
}

function calculateProMix() {
    const totalAmount = parseFloat(document.getElementById('proTotalAmount').value) || 100;
    const vgPercent = parseInt(document.getElementById('proVgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('proNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('proTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength').value) || 0;
    
    // Získat data všech příchutí (multi-flavor support)
    const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
    const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
    const totalFlavorVolume = (totalFlavorPercent / 100) * totalAmount;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    const remainingVolume = totalAmount - nicotineVolume - totalFlavorVolume;
    
    // Get VG/PG ratios from nicotine slider
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;
    
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    }
    
    // Spočítat VG/PG obsah ze všech příchutí
    let totalFlavorVgContent = 0;
    let totalFlavorPgContent = 0;
    
    flavorsData.forEach(flavor => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        totalFlavorVgContent += flavorVolume * (flavor.vgRatio / 100);
        totalFlavorPgContent += flavorVolume * ((100 - flavor.vgRatio) / 100);
    });
    
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;
    
    let pureVgNeeded = targetVgTotal - nicotineVgContent - totalFlavorVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - totalFlavorPgContent;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    const totalPureNeeded = pureVgNeeded + purePgNeeded;
    if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
        const ratio = remainingVolume / totalPureNeeded;
        pureVgNeeded *= ratio;
        purePgNeeded *= ratio;
    } else if (totalPureNeeded < remainingVolume) {
        const extra = remainingVolume - totalPureNeeded;
        if (vgPercent + pgPercent > 0) {
            pureVgNeeded += extra * (vgPercent / 100);
            purePgNeeded += extra * (pgPercent / 100);
        }
    }
    
    const DROPS_PER_ML = 20;
    const ingredients = [];

    if (nicotineVolume > 0) {
        ingredients.push({
            ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
            params: {
                strength: baseNicotine,
                vgpg: `${nicVgPercent}/${nicPgPercent}`
            },
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    // Přidat všechny příchutě jako ingredience
    flavorsData.forEach((flavor, index) => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        const flavorVgPercent = flavor.vgRatio;
        const flavorPgPercent = 100 - flavorVgPercent;
        
        ingredients.push({
            ingredientKey: 'flavor',
            flavorType: flavor.type,
            flavorIndex: flavor.index,
            flavorNumber: index + 1,
            params: {
                vgpg: `${flavorVgPercent}/${flavorPgPercent}`
            },
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    });
    
    if (purePgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'pg',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    if (pureVgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'vg',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + totalFlavorVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + totalFlavorPgContent;
    
    // Uložit data příchutí pro recept
    window.lastProFlavorsData = flavorsData;
    
    // Kontrola přihlášení před zobrazením výsledků - Liquid PRO vyžaduje přihlášení
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, 'liquidpro');
    showPage('results');
}

// =========================================
// SUBSCRIPTION / PŘEDPLATNÉ
// =========================================

// Globální stav předplatného
let subscriptionData = null;
let userLocation = null;

// Zkontrolovat stav předplatného
async function checkSubscriptionStatus() {
    if (!window.Clerk?.user) return;

    try {
        console.log('Checking subscription status...');
        
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getClerkToken()}`,
            },
            body: JSON.stringify({ action: 'check' })
        });

        if (!response.ok) {
            console.error('Subscription check failed:', response.status);
            return;
        }

        const result = await response.json();
        console.log('Subscription status:', result);

        subscriptionData = result;

        if (!result.valid) {
            // Uživatel nemá platné předplatné - zobrazit platební modal
            console.log('No valid subscription, showing payment modal');
            showSubscriptionModal();
        } else {
            // Aktualizovat UI v profilu
            updateSubscriptionStatusUI(result);
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
    }
}

// Získat Supabase URL
function getSupabaseUrl() {
    return 'https://krwdfxnvhnxtkhtkbadi.supabase.co';
}

// Získat Clerk JWT token
async function getClerkToken() {
    if (!window.Clerk?.session) return null;
    try {
        const token = await window.Clerk.session.getToken();
        return token;
    } catch (error) {
        console.error('Error getting Clerk token:', error);
        return null;
    }
}

// Zobrazit modal předplatného
async function showSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    // Skrýt sekce, zobrazit loader
    document.getElementById('locationDetection').classList.remove('hidden');
    document.getElementById('pricingInfo').classList.add('hidden');
    document.getElementById('termsSection').classList.add('hidden');
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('subscriptionError').classList.add('hidden');

    // Detekovat lokaci
    await detectUserLocation();
}

// Skrýt modal předplatného
function hideSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handler pro backdrop click
function handleSubscriptionModalBackdropClick(event) {
    // Nepovolit zavření kliknutím na pozadí - uživatel musí zaplatit
    // if (event.target === event.currentTarget) { hideSubscriptionModal(); }
}

// Detekovat lokaci uživatele
async function detectUserLocation() {
    try {
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/geolocation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'detect',
                data: { clerkId: window.Clerk?.user?.id }
            })
        });

        if (!response.ok) {
            throw new Error('Geolocation failed');
        }

        const result = await response.json();
        userLocation = result.location;

        // Aktualizovat UI s cenami
        updatePricingUI(userLocation);

    } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback - Česko
        userLocation = {
            countryCode: 'CZ',
            currency: 'CZK',
            grossAmount: 59,
            vatRate: 21
        };
        updatePricingUI(userLocation);
    }
}

// Aktualizovat UI s cenami
function updatePricingUI(location) {
    document.getElementById('locationDetection').classList.add('hidden');
    document.getElementById('pricingInfo').classList.remove('hidden');
    document.getElementById('termsSection').classList.remove('hidden');
    document.getElementById('paymentSection').classList.remove('hidden');

    // Aktualizovat cenu
    document.getElementById('priceAmount').textContent = location.grossAmount;
    document.getElementById('priceCurrency').textContent = location.currency === 'CZK' ? 'Kč' : '€';

    // Aktualizovat DPH info
    const vatInfo = document.getElementById('pricingVatInfo');
    if (location.vatRate > 0) {
        vatInfo.textContent = t('subscription.price_includes_vat', 'Cena je včetně DPH');
    } else {
        vatInfo.textContent = '';
    }

    // Nastavit checkbox listener
    const termsCheckbox = document.getElementById('termsCheckbox');
    const payBtn = document.getElementById('paySubscriptionBtn');
    
    termsCheckbox.addEventListener('change', () => {
        payBtn.disabled = !termsCheckbox.checked;
    });
}

// Spustit platbu
async function startPayment() {
    const termsCheckbox = document.getElementById('termsCheckbox');
    if (!termsCheckbox.checked) {
        return;
    }

    const payBtn = document.getElementById('paySubscriptionBtn');
    payBtn.disabled = true;
    payBtn.querySelector('span').textContent = t('subscription.processing', 'Zpracování platby...');

    try {
        // 1. Uložit souhlas s OP
        await saveTermsAcceptance();

        // 2. Vytvořit předplatné
        const subscriptionResponse = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getClerkToken()}`,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    planType: 'yearly',
                    locale: window.i18n?.currentLocale || 'cs',
                    country: userLocation?.countryCode || 'CZ'
                }
            })
        });

        if (!subscriptionResponse.ok) {
            throw new Error('Failed to create subscription');
        }

        const subResult = await subscriptionResponse.json();

        // 3. Vytvořit platbu v Comgate
        const paymentResponse = await fetch(`${getSupabaseUrl()}/functions/v1/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getClerkToken()}`,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    subscriptionId: subResult.subscription.id
                }
            })
        });

        if (!paymentResponse.ok) {
            throw new Error('Failed to create payment');
        }

        const payResult = await paymentResponse.json();

        // 4. Přesměrovat na platební bránu
        if (payResult.redirectUrl) {
            window.location.href = payResult.redirectUrl;
        } else {
            throw new Error('No redirect URL');
        }

    } catch (error) {
        console.error('Payment error:', error);
        showSubscriptionError(t('subscription.error_generic', 'Při zpracování platby došlo k chybě. Zkuste to prosím znovu.'));
        payBtn.disabled = false;
        payBtn.querySelector('span').textContent = t('subscription.pay_button', 'Zaplatit a aktivovat');
    }
}

// Uložit souhlas s obchodními podmínkami
async function saveTermsAcceptance() {
    try {
        // Uložit do DB přes Edge Function nebo přímo
        console.log('Terms acceptance saved');
    } catch (error) {
        console.error('Error saving terms acceptance:', error);
    }
}

// Zobrazit chybu předplatného
function showSubscriptionError(message) {
    const errorDiv = document.getElementById('subscriptionError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Aktualizovat UI stavu předplatného v profilu
function updateSubscriptionStatusUI(data) {
    const container = document.getElementById('subscriptionStatus');
    if (!container) return;

    if (data.valid) {
        // Získat správný locale pro formátování data
        const localeCode = window.i18n?.getLocale?.() || 'en';
        let dateLocale;
        if (localeCode === 'en') {
            dateLocale = 'en-GB';
        } else if (localeCode.includes('-')) {
            dateLocale = localeCode;
        } else {
            dateLocale = localeCode + '-' + localeCode.toUpperCase();
        }
        
        let expiresDate;
        try {
            expiresDate = new Date(data.expiresAt).toLocaleDateString(dateLocale);
        } catch (e) {
            expiresDate = new Date(data.expiresAt).toLocaleDateString();
        }

        container.className = 'subscription-status-section subscription-status-active';
        container.innerHTML = `
            <div class="subscription-status-title">${t('subscription.status_active', 'Aktivní předplatné')}</div>
            <div class="subscription-expires">
                ${t('subscription.expires_at', 'Platné do:')} ${expiresDate}<br>
                ${t('subscription.days_left', 'Zbývá dní:')} ${data.daysLeft}
            </div>
            ${data.needsRenewal ? `
                <button class="neon-button subscription-renew-btn" onclick="renewSubscription()">
                    <span>${t('subscription.renew_button', 'Obnovit předplatné')}</span>
                    <div class="button-glow"></div>
                </button>
            ` : ''}
        `;
    } else {
        container.className = 'subscription-status-section subscription-status-none';
        container.innerHTML = `
            <div class="subscription-status-title">${t('subscription.status_none', 'Nemáte aktivní předplatné')}</div>
            <button class="neon-button subscription-renew-btn" onclick="showSubscriptionModal()">
                <span>${t('subscription.activate_button', 'Aktivovat předplatné')}</span>
                <div class="button-glow"></div>
            </button>
        `;
    }
}

// Obnovit předplatné
async function renewSubscription() {
    showSubscriptionModal();
}

// Zobrazit modal obchodních podmínek
function showTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Skrýt modal obchodních podmínek
function hideTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handler pro backdrop click - terms modal
function handleTermsModalBackdropClick(event) {
    if (event.target === event.currentTarget) {
        hideTermsModal();
    }
}

// =========================================
// EXPORT: Funkce pro globalni pristup z onclick
// =========================================
window.toggleMenu = toggleMenu;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.handleLoginModalBackdropClick = handleLoginModalBackdropClick;
window.handleProfileModalBackdropClick = handleProfileModalBackdropClick;
window.showUserProfileModal = showUserProfileModal;
window.hideUserProfileModal = hideUserProfileModal;
window.handleSignOut = handleSignOut;
// handleLanguageChange is handled by i18n.js via window.i18n.setLocale()
window.showPage = showPage;
window.goHome = goHome;
window.goBack = goBack;
window.calculateMixture = calculateMix;
window.storeCurrentRecipe = storeCurrentRecipe;
window.showSaveRecipeModal = showSaveRecipeModal;
window.hideSaveRecipeModal = hideSaveRecipeModal;
window.saveRecipe = saveRecipe;
window.showMyRecipes = showMyRecipes;
window.renderRecipesList = renderRecipesList; // Exportováno pro i18n přerenderování
window.signOut = signOut;
window.viewRecipeDetail = viewRecipeDetail;
window.displayRecipeDetail = displayRecipeDetail; // Exportováno pro i18n přerenderování
window.editSavedRecipe = editSavedRecipe;
window.deleteRecipe = deleteRecipe;
window.shareRecipe = shareRecipe;
window.shareProduct = shareProduct;
window.addProductRow = addProductRow;
window.removeProductRow = removeProductRow;
window.filterProductOptions = filterProductOptions;
window.onProductSelected = onProductSelected;
window.showFavoriteProducts = showFavoriteProducts;
window.renderProductsList = renderProductsList; // Exportováno pro i18n přerenderování
window.showAddProductForm = showAddProductForm;
window.cancelProductForm = cancelProductForm;
window.saveProduct = saveProduct;
window.viewProductDetail = viewProductDetail;
window.displayProductDetail = displayProductDetail; // Exportováno pro i18n přerenderování
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.filterRecipes = filterRecipes;
window.resetProductFilters = resetProductFilters;
window.resetRecipeFilters = resetRecipeFilters;
window.setSearchRating = setSearchRating;
window.clearSearchRating = clearSearchRating;
window.setRecipeSearchRating = setRecipeSearchRating;
window.clearRecipeSearchRating = clearRecipeSearchRating;
// Subscription
window.checkSubscriptionStatus = checkSubscriptionStatus;
window.showSubscriptionModal = showSubscriptionModal;
window.hideSubscriptionModal = hideSubscriptionModal;
window.handleSubscriptionModalBackdropClick = handleSubscriptionModalBackdropClick;
window.startPayment = startPayment;
window.renewSubscription = renewSubscription;
window.showTermsModal = showTermsModal;
window.hideTermsModal = hideTermsModal;
window.handleTermsModalBackdropClick = handleTermsModalBackdropClick;
// Login Required
window.showLoginRequiredModal = showLoginRequiredModal;
window.hideLoginRequiredModal = hideLoginRequiredModal;
window.handleLoginRequiredModalBackdropClick = handleLoginRequiredModalBackdropClick;
window.requireLogin = requireLogin;
window.requireSubscription = requireSubscription;
window.isUserLoggedIn = isUserLoggedIn;
// Multi-flavor PRO
window.addProFlavor = addProFlavor;
window.removeProFlavor = removeProFlavor;
window.updateProFlavorType = updateProFlavorType;
window.adjustProFlavor = adjustProFlavor;
window.updateProFlavorStrength = updateProFlavorStrength;
window.adjustProFlavorRatio = adjustProFlavorRatio;
window.updateProFlavorRatioDisplay = updateProFlavorRatioDisplay;
