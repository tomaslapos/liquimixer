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

// =========================================
// NOTIFICATIONS
// Toast notifikace pro uživatele
// =========================================

function showNotification(message, type = 'info') {
    // Odstranit existující notifikaci
    const existing = document.querySelector('.toast-notification');
    if (existing) {
        existing.remove();
    }
    
    // Vytvořit novou notifikaci
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Přidat do stránky
    document.body.appendChild(notification);
    
    // Animace zobrazení
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Automaticky skrýt po 5 sekundách
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
// steepingDays = doporučená doba zrání ve dnech
const flavorDatabase = {
    none: { 
        name: 'Žádná (bez příchutě)', 
        min: 0, max: 0, ideal: 0, steepingDays: 0,
        note: 'Čistá báze PG/VG + nikotin'
    },
    fruit: { 
        name: 'Ovoce (jahoda, jablko)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        note: 'Optimum: 10%, zrání 3–7 dní'
    },
    citrus: { 
        name: 'Citrónové (citron, limeta)', 
        min: 6, max: 10, ideal: 8, steepingDays: 7,
        note: 'Silné kyseliny, méně stačí'
    },
    berry: { 
        name: 'Bobulové (borůvka, malina)', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        note: 'Vyvážené, dobře fungují s 50/50 PG/VG'
    },
    tropical: { 
        name: 'Tropické (ananas, mango)', 
        min: 12, max: 18, ideal: 15, steepingDays: 10,
        note: 'Sladké, potřebují vyšší % pro hloubku'
    },
    tobacco: { 
        name: 'Tabákové (klasický, kubánský)', 
        min: 10, max: 15, ideal: 12, steepingDays: 14,
        note: 'Dlouhý steeping: 1–4 týdny pro rozvinutí'
    },
    menthol: { 
        name: 'Mentol / Mátové', 
        min: 4, max: 8, ideal: 6, steepingDays: 7,
        note: 'Velmi koncentrované, při 10% chladí až pálí'
    },
    candy: { 
        name: 'Sladkosti (cukroví, karamel)', 
        min: 12, max: 20, ideal: 16, steepingDays: 10,
        note: 'Sladké tlumí škrábání, vyšší % nutné'
    },
    dessert: { 
        name: 'Dezerty (koláč, pudink)', 
        min: 15, max: 22, ideal: 18, steepingDays: 21,
        note: 'Komplexní: 2–4 týdny zrání, riziko přechucení'
    },
    bakery: { 
        name: 'Zákusky (tyčinka, donut)', 
        min: 18, max: 25, ideal: 20, steepingDays: 21,
        note: 'Doporučujeme vyzkoušet na 15%'
    },
    biscuit: { 
        name: 'Piškotové (vanilka, máslo)', 
        min: 10, max: 15, ideal: 12, steepingDays: 10,
        note: 'Univerzální, funguje s vysokým VG'
    },
    drink: { 
        name: 'Nápojové (kola, čaj)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        note: 'Jemné, méně intenzivní'
    },
    tobaccosweet: { 
        name: 'Tabák + sladké (custard tobacco)', 
        min: 15, max: 20, ideal: 17, steepingDays: 28,
        note: 'Nejsložitější: 3–6 týdnů zrání'
    },
    nuts: { 
        name: 'Oříškové (arašíd, lískový)', 
        min: 12, max: 18, ideal: 15, steepingDays: 14,
        note: 'Dobře tlumí nikotin'
    },
    spice: { 
        name: 'Kořeněné (skořice, perník)', 
        min: 5, max: 10, ideal: 7, steepingDays: 14,
        note: 'Silné: při 12% dominují nad vším'
    }
};

// Helper funkce pro výpočet doporučeného data zrání
function calculateMaturityDate(mixedDate, flavorType) {
    const flavor = flavorDatabase[flavorType] || flavorDatabase.fruit;
    const steepingDays = flavor.steepingDays || 7;
    const maturityDate = new Date(mixedDate);
    maturityDate.setDate(maturityDate.getDate() + steepingDays);
    return maturityDate;
}

// Pro Liquid PRO s více příchutěmi - najde nejdelší dobu zrání
function calculateMaxMaturityDate(mixedDate, flavorTypes) {
    if (!flavorTypes || flavorTypes.length === 0) {
        return calculateMaturityDate(mixedDate, 'fruit');
    }
    let maxSteepingDays = 0;
    for (const type of flavorTypes) {
        const flavor = flavorDatabase[type] || flavorDatabase.fruit;
        const days = flavor.steepingDays || 7;
        if (days > maxSteepingDays) {
            maxSteepingDays = days;
        }
    }
    const maturityDate = new Date(mixedDate);
    maturityDate.setDate(maturityDate.getDate() + maxSteepingDays);
    return maturityDate;
}

// Export pro použití v jiných modulech
window.flavorDatabase = flavorDatabase;
window.calculateMaturityDate = calculateMaturityDate;
window.calculateMaxMaturityDate = calculateMaxMaturityDate;

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
    
    // Zpracovat návrat z platební brány
    handlePaymentReturn();
});

// Zpracování návratu z platební brány GP WebPay
function handlePaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
        // Úspěšná platba - zobrazit notifikaci a vyčistit URL
        console.log('Payment successful, refreshing subscription status...');
        
        // Vyčistit URL parametry
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Počkat na Clerk, načíst uživatelský jazyk, pak zobrazit notifikaci
        let clerkCheckAttempts = 0;
        const maxClerkCheckAttempts = 20; // Max 10 sekund čekání
        
        const checkClerkAndShowNotification = async () => {
            clerkCheckAttempts++;
            
            if (window.Clerk?.user) {
                console.log('User is signed in after payment, loading user locale...');
                // Vyčistit uložené clerk_id - už ho nepotřebujeme
                localStorage.removeItem('liquimixer_pending_payment_clerk_id');
                
                // DŮLEŽITÉ: Načíst jazyk uživatele z databáze PŘED zobrazením notifikace
                try {
                    if (window.i18n?.loadUserLocale) {
                        await window.i18n.loadUserLocale(window.Clerk.user.id);
                        console.log('User locale loaded:', window.i18n.getLocale());
                    }
                } catch (e) {
                    console.warn('Failed to load user locale:', e);
                }
                
                // Teď zobrazit notifikaci ve správném jazyce
                const showSuccessMessage = () => {
                    const translatedMessage = window.i18n?.t?.('subscription.payment_success');
                    if (translatedMessage && translatedMessage !== 'subscription.payment_success') {
                        showNotification(translatedMessage, 'success');
                    } else {
                        setTimeout(showSuccessMessage, 300);
                    }
                };
                showSuccessMessage();
                
                // Zkontrolovat stav předplatného
                checkSubscriptionStatus();
                
            } else if (clerkCheckAttempts < maxClerkCheckAttempts) {
                setTimeout(checkClerkAndShowNotification, 500);
            } else {
                console.log('User is not signed in after payment redirect - session may have expired');
                // Vyčistit uložené clerk_id
                localStorage.removeItem('liquimixer_pending_payment_clerk_id');
                
                // Uživatel není přihlášen - platba ale proběhla úspěšně
                // Zobrazíme informativní notifikaci a login modal
                const showLoginPrompt = () => {
                    const translatedMessage = window.i18n?.t?.('subscription.payment_success_login_required');
                    if (translatedMessage && translatedMessage !== 'subscription.payment_success_login_required') {
                        showNotification(translatedMessage, 'info');
                    } else if (window.i18n) {
                        showNotification('Payment successful! Please log in to access your subscription.', 'info');
                    } else {
                        setTimeout(showLoginPrompt, 300);
                        return;
                    }
                    // Zobrazit login modal
                    if (typeof showLoginModal === 'function') {
                        setTimeout(() => showLoginModal('signIn'), 500);
                    }
                };
                showLoginPrompt();
            }
        };
        checkClerkAndShowNotification();
        
    } else if (paymentStatus === 'failed') {
        // Neúspěšná platba
        const prcode = urlParams.get('prcode');
        const srcode = urlParams.get('srcode');
        
        console.error('Payment failed:', { prcode, srcode });
        
        // Vyčistit URL parametry
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Zobrazit chybovou notifikaci po načtení překladů
        const showFailMessage = () => {
            const translatedMessage = window.i18n?.t?.('subscription.payment_failed');
            if (translatedMessage && translatedMessage !== 'subscription.payment_failed') {
                showNotification(translatedMessage, 'error');
                // Zobrazit subscription modal pro opakování platby
                if (window.Clerk?.user) {
                    showSubscriptionModal();
                }
            } else {
                setTimeout(showFailMessage, 300);
            }
        };
        setTimeout(showFailMessage, 1000);
    }
}

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
    
    // Překreslit výsledky výpočtu pokud existují
    refreshResultsTable();
    
    // Překreslit detail receptu pokud je zobrazen
    refreshRecipeDetail();
    
    // Překreslit detail produktu pokud je zobrazen (pro sekci "Použito v receptech")
    refreshProductDetail();
    
    // Aktualizovat stav předplatného v profilu (pokud je zobrazen)
    if (subscriptionData) {
        updateSubscriptionStatusUI(subscriptionData);
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
            
            // Save user to database if signed in
            if (window.Clerk.user && window.LiquiMixerDB) {
                await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                // Načíst uložený jazyk uživatele z databáze
                if (window.i18n?.loadUserLocale) {
                    await window.i18n.loadUserLocale(window.Clerk.user.id);
                }
                // KONTROLA PŘEDPLATNÉHO IHNED - před aktualizací UI!
                await checkSubscriptionStatus();
                // Teprve po kontrole předplatného aktualizovat UI
                updateAuthUI();
                // Zkontrolovat pending sdílený recept (až po ověření předplatného)
                await checkPendingSharedRecipe();
            } else {
                // Nepřihlášený uživatel - aktualizovat UI
                updateAuthUI();
            }
            
            // Listen for auth changes (OAuth callback, sign in/out)
            window.Clerk.addListener(async (event) => {
                console.log('Clerk auth event:', event);

                // Zpracovat přihlášení uživatele
                if (window.Clerk.user) {
                    console.log('User signed in:', window.Clerk.user.id);
                    
                    // Save user to database on sign in
                    if (window.LiquiMixerDB) {
                        await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                    }
                    
                    // Načíst uložený jazyk uživatele z databáze
                    if (window.i18n?.loadUserLocale) {
                        await window.i18n.loadUserLocale(window.Clerk.user.id);
                    }
                    
                    // NEJPRVE zavřít login modal a aktualizovat UI
                    hideLoginModal();
                    updateAuthUI();
                    
                    // Zkontrolovat zda uživatel přišel ze subscription modalu
                    // Pokud ano, zobrazit subscription modal (teď už jako přihlášený - Stav B)
                    const fromSubscription = localStorage.getItem('liquimixer_from_subscription') === 'true';
                    if (fromSubscription) {
                        localStorage.removeItem('liquimixer_from_subscription');
                        console.log('User came from subscription modal - showing payment step (State B)...');
                        // Krátká pauza pro stabilizaci UI a Clerk session
                        await new Promise(r => setTimeout(r, 500));
                        showSubscriptionModal();
                        return; // Nepokračovat dál - uživatel musí zaplatit
                    }
                    
                    // Kontrola předplatného (pouze pokud nepřišel ze subscription flow)
                    await checkSubscriptionStatus();
                    
                    // Zkontrolovat pending sdílený recept (až po ověření předplatného)
                    await checkPendingSharedRecipe();
                }
                
                // Pokud se uživatel odhlásil, aktualizovat UI
                if (!window.Clerk.user) {
                    updateAuthUI();
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
            t('auth.user_default', 'Uživatel')
        );
        loginBtn.innerHTML = `<span class="nav-icon">👤</span><span class="nav-text">${userName}</span>`;
        loginBtn.onclick = showUserProfileModal;
        loginBtn.classList.add('logged-in');
    } else {
        // User is signed out
        console.log('User signed out');
        const loginText = t('nav.login', 'Přihlášení');
        loginBtn.innerHTML = `<span class="nav-icon">👤</span><span class="nav-text" data-i18n="nav.login">${loginText}</span>`;
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

// Zobrazit Auth Choice modal (výběr mezi přihlášením a registrací)
// Handler pro přihlášení z loginRequiredModal
function handleLoginFromRequired() {
    hideLoginRequiredModal();
    setTimeout(() => {
        showLoginModal();
    }, 50);
}

// Handler pro registraci z loginRequiredModal - přesměruje na subscriptionModal
function handleRegisterFromRequired() {
    hideLoginRequiredModal();
    setTimeout(() => {
        showSubscriptionModal();
    }, 50);
}

async function showLoginModal(mode = 'signIn') {
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
    
    // Pokud Clerk má neúplnou session (client exists ale user ne), vyčistit ji
    if (window.Clerk && window.Clerk.client && !window.Clerk.user) {
        try {
            const signUpStatus = window.Clerk.client.signUp?.status;
            const signInStatus = window.Clerk.client.signIn?.status;
            
            // Pokud existuje aktivní sign-up nebo sign-in flow, zrušit ho
            if (signUpStatus && signUpStatus !== 'complete') {
                console.log('Clearing incomplete sign-up session:', signUpStatus);
                await window.Clerk.signOut();
            } else if (signInStatus && signInStatus !== 'complete') {
                console.log('Clearing incomplete sign-in session:', signInStatus);
                await window.Clerk.signOut();
            }
        } catch (e) {
            console.log('Error clearing Clerk session:', e);
        }
    }
    
    // Show login modal
    if (loginModal) {
        loginModal.classList.remove('hidden');
        
        // Aktualizovat titulek podle mode
        const modalTitle = loginModal.querySelector('.menu-title');
        const modalSubtitle = loginModal.querySelector('.login-subtitle');
        if (modalTitle && modalSubtitle) {
            if (mode === 'signUp') {
                // Změnit data-i18n atribut a text
                modalTitle.setAttribute('data-i18n', 'auth.register_title');
                modalSubtitle.setAttribute('data-i18n', 'auth.register_subtitle');
                modalTitle.textContent = t('auth.register_title', 'Registrace');
                modalSubtitle.textContent = t('auth.register_subtitle', 'Vytvořte si účet pro přístup ke všem funkcím');
            } else {
                // Změnit data-i18n atribut a text
                modalTitle.setAttribute('data-i18n', 'auth.login_title');
                modalSubtitle.setAttribute('data-i18n', 'auth.login_subtitle');
                modalTitle.textContent = t('auth.login_title', 'Přihlášení');
                modalSubtitle.textContent = t('auth.login_subtitle', 'Přihlaste se pro přístup k uloženým receptům a produktům');
            }
        }
        
        // Mount Clerk SignIn/SignUp component
        if (clerkLoaded && window.Clerk) {
            const signInDiv = document.getElementById('clerk-sign-in');
            if (signInDiv) {
                signInDiv.innerHTML = '';
                // Získat aktuální jazyk pro lokalizaci Clerk
                const currentLang = window.i18n?.currentLanguage || 'cs';
                
                // Česká lokalizace pro Clerk (struktura dle Clerk dokumentace)
                const czechLocalization = {
                    formButtonPrimary: 'Pokračovat',
                    formFieldLabel__emailAddress: 'E-mailová adresa',
                    formFieldLabel__emailAddress_username: 'E-mail nebo uživatelské jméno',
                    formFieldLabel__username: 'Uživatelské jméno',
                    formFieldLabel__password: 'Heslo',
                    formFieldLabel__firstName: 'Jméno',
                    formFieldLabel__lastName: 'Příjmení',
                    formFieldInputPlaceholder__emailAddress: 'Zadejte e-mail',
                    formFieldInputPlaceholder__emailAddress_username: 'Zadejte e-mail nebo uživatelské jméno',
                    formFieldInputPlaceholder__password: 'Zadejte heslo',
                    formFieldInputPlaceholder__firstName: 'Zadejte jméno',
                    formFieldInputPlaceholder__lastName: 'Zadejte příjmení',
                    formFieldHintText__optional: 'Volitelné',
                    dividerText: 'nebo',
                    socialButtonsBlockButton: 'Pokračovat přes {{provider|titleize}}',
                    socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
                    signIn: {
                        start: {
                            title: 'Přihlášení',
                            subtitle: 'pro přístup do {{applicationName}}',
                            actionText: 'Nemáte účet?',
                            actionLink: 'Zaregistrovat se'
                        },
                        password: {
                            title: 'Zadejte heslo',
                            subtitle: 'pro pokračování do {{applicationName}}',
                            actionLink: 'Použít jinou metodu'
                        },
                        emailCode: {
                            title: 'Ověřte e-mail',
                            subtitle: 'pro pokračování do {{applicationName}}',
                            formTitle: 'Ověřovací kód',
                            formSubtitle: 'Zadejte ověřovací kód zaslaný na váš e-mail',
                            resendButton: 'Znovu odeslat kód'
                        }
                    },
                    signUp: {
                        start: {
                            title: 'Registrace',
                            subtitle: 'pro přístup do {{applicationName}}',
                            actionText: 'Máte již účet?',
                            actionLink: 'Přihlásit se'
                        }
                    },
                    footerActionLink__signIn: 'Přihlásit se',
                    footerActionLink__signUp: 'Zaregistrovat se',
                    footerActionLink__useAnotherMethod: 'Použít jinou metodu',
                    footerPageLink__help: 'Nápověda',
                    footerPageLink__privacy: 'Ochrana soukromí',
                    footerPageLink__terms: 'Podmínky'
                };
                
                // Další jazyky
                const localizations = {
                    cs: czechLocalization,
                    sk: {
                        formButtonPrimary: 'Pokračovať',
                        dividerText: 'alebo',
                        formFieldLabel__emailAddress: 'E-mailová adresa',
                        formFieldLabel__emailAddress_username: 'E-mail alebo užívateľské meno',
                        formFieldLabel__password: 'Heslo'
                    },
                    de: {
                        formButtonPrimary: 'Fortfahren',
                        dividerText: 'oder'
                    },
                    pl: {
                        formButtonPrimary: 'Kontynuuj',
                        dividerText: 'lub'
                    }
                };
                
                const clerkOptions = {
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
                                background: 'linear-gradient(135deg, #ff00ff 0%, #aa00ff 100%)',
                                border: 'none',
                                color: '#ffffff',
                                fontFamily: 'Orbitron, sans-serif',
                                fontWeight: '600',
                                fontSize: '16px',
                                padding: '14px 24px',
                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                            },
                            'formButtonPrimary:hover': {
                                background: 'linear-gradient(135deg, #ff33ff 0%, #cc33ff 100%)',
                                boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)'
                            },
                            footerActionLink: {
                                color: '#00ffff'
                            }
                        }
                    },
                    localization: localizations[currentLang] || czechLocalization,
                    // Zabránit automatickému přesměrování na Clerk doménu
                    routing: 'virtual'
                };
                
                // Mount SignIn nebo SignUp podle mode
                if (mode === 'signUp') {
                    // Pro registraci použít mountSignUp
                    window.Clerk.mountSignUp(signInDiv, clerkOptions);
                    signInDiv._clerkMode = 'signUp';
                    
                    // Zachytit klik na "Sign in" link v Clerk SignUp
                    // (přesměrovat na náš login modal místo externí Clerk stránky)
                    const signUpObserver = new MutationObserver((mutations) => {
                        const signInSelectors = [
                            'a[href*="sign-in"]',
                            '.cl-footerActionLink',
                            '[data-localization-key*="signIn"]',
                            '.cl-footer a',
                            '.cl-footerAction a',
                            '.cl-footerAction button',
                            '.cl-footerActionText ~ a',
                            '.cl-footerActionText ~ button'
                        ];
                        
                        signInSelectors.forEach(selector => {
                            const elements = signInDiv.querySelectorAll(selector);
                            elements.forEach(link => {
                                // Zachytit pouze "Sign in" linky, ne ostatní
                                const linkText = link.textContent?.toLowerCase() || '';
                                const linkHref = link.href?.toLowerCase() || '';
                                if ((linkText.includes('sign in') || linkText.includes('přihlásit') || linkHref.includes('sign-in')) 
                                    && !link.dataset.interceptedSignIn) {
                                    link.dataset.interceptedSignIn = 'true';
                                    link.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.stopImmediatePropagation();
                                        hideLoginModal();
                                        setTimeout(() => {
                                            showLoginModal('signIn');
                                        }, 150);
                                        return false;
                                    }, true);
                                }
                            });
                        });
                    });
                    
                    signUpObserver.observe(signInDiv, { childList: true, subtree: true });
                    signInDiv._clerkObserver = signUpObserver;
                } else {
                    // Pro přihlášení použít mountSignIn
                    window.Clerk.mountSignIn(signInDiv, clerkOptions);
                    signInDiv._clerkMode = 'signIn';
                    
                    // Zachytit klik na "Sign up" link v Clerku pomocí MutationObserver
                    // (přesměrovat na subscription modal)
                    const observer = new MutationObserver((mutations) => {
                        const signUpSelectors = [
                            'a[href*="sign-up"]',
                            '.cl-footerActionLink',
                            '[data-localization-key*="signUp"]',
                            '.cl-footer a',
                            '.cl-footerAction a',
                            '.cl-footerAction button',
                            '.cl-footerActionText ~ a',
                            '.cl-footerActionText ~ button'
                        ];
                        
                        signUpSelectors.forEach(selector => {
                            const elements = signInDiv.querySelectorAll(selector);
                            elements.forEach(link => {
                                // Zachytit pouze "Sign up" linky, ne ostatní
                                const linkText = link.textContent?.toLowerCase() || '';
                                const linkHref = link.href?.toLowerCase() || '';
                                if ((linkText.includes('sign up') || linkText.includes('zaregistrovat') || linkHref.includes('sign-up')) 
                                    && !link.dataset.intercepted) {
                                    link.dataset.intercepted = 'true';
                                    link.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.stopImmediatePropagation();
                                        hideLoginModal();
                                        setTimeout(() => {
                                            showSubscriptionModal();
                                        }, 150);
                                        return false;
                                    }, true);
                                }
                            });
                        });
                    });
                    
                    observer.observe(signInDiv, { childList: true, subtree: true });
                    signInDiv._clerkObserver = observer;
                }
            }
        }
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        // Cleanup observer a unmount Clerk component
        const signInDiv = document.getElementById('clerk-sign-in');
        if (signInDiv && signInDiv._clerkObserver) {
            signInDiv._clerkObserver.disconnect();
            signInDiv._clerkObserver = null;
        }
        if (clerkLoaded && window.Clerk && signInDiv) {
            // Unmount podle toho co bylo mountnuté
            if (signInDiv._clerkMode === 'signUp') {
                window.Clerk.unmountSignUp(signInDiv);
            } else {
                window.Clerk.unmountSignIn(signInDiv);
            }
            signInDiv._clerkMode = null;
        }
    }
    // Odstranit speciální třídu pro přihlášení ze sdíleného receptu
    document.body.classList.remove('login-for-shared-recipe');
}

// Zavřít modal tlačítkem X
function handleLoginModalClose() {
    // Vyčistit pending payment flag pokud uživatel ruší registraci
    localStorage.removeItem('liquimixer_pending_payment');
    localStorage.removeItem('liquimixer_terms_accepted');
    localStorage.removeItem('liquimixer_terms_accepted_at');
    hideLoginModal();
}

// Zavřít modal kliknutím na pozadí
function handleLoginModalBackdropClick(event) {
    if (event.target.id === 'loginModal') {
        // Vyčistit pending payment flag pokud uživatel ruší registraci
        localStorage.removeItem('liquimixer_pending_payment');
        localStorage.removeItem('liquimixer_terms_accepted');
        localStorage.removeItem('liquimixer_terms_accepted_at');
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
        // Aplikovat překlady globálně
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
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
        
        // Zajistit správné scroll pozice - modal nahoře
        modal.scrollTop = 0;
        window.scrollTo(0, 0);
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
    // Kontrola skutečného stavu předplatného z checkSubscriptionStatus()
    // subscriptionData je nastavena při přihlášení uživatele
    return subscriptionData?.valid === true;
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
let currentViewingRecipe = null;
let selectedRating = 0;

// Uložit aktuální recept do paměti pro pozdější uložení
function storeCurrentRecipe(data) {
    currentRecipeData = data;
}

// Zobrazit modal pro uložení receptu
async function showSaveRecipeModal() {
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.remove('hidden');
        initStarRating();
        
        // Resetovat nadpis a tlačítko na "nový recept" (mohl být změněn úpravou)
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('save_recipe.title', 'Uložit recept');
        }
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            const spanElement = submitBtn.querySelector('span[data-i18n]');
            if (spanElement) {
                spanElement.textContent = t('save_recipe.save_button', 'Uložit recept');
            } else {
                submitBtn.textContent = t('save_recipe.save_button', 'Uložit recept');
            }
        }
        
        // Inicializovat připomínku jako zaškrtnutou s dnešním datem
        initReminderFieldsEnabled();
        
        // Aplikovat překlady na modal
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
        
        // Načíst oblíbené produkty pro výběr
        await loadProductsForRecipe();
    }
}

// Vrátit se zpět do kalkulátoru (podle typu formuláře)
function goBackToCalculator() {
    const recipeData = currentRecipeData || {};
    const formType = recipeData.formType || 'liquid';
    
    // Mapovat formType na tab name
    let tabName = 'liquid';
    if (formType === 'snv' || formType === 'shakevape') {
        tabName = 'shakevape';
    } else if (formType === 'pro' || formType === 'liquidpro') {
        tabName = 'liquidpro';
    }
    
    // Povolit programovou změnu záložky
    window.allowTabSwitch = true;
    
    // Přepnout na správnou záložku a zobrazit formulář
    switchFormTab(tabName);
    showPage('form');
    
    // Vizuálně označit záložky jako disabled v režimu editace
    updateFormTabsState();
}

// Zobrazit modal "Uložit jako nový"
async function showSaveAsNewModal() {
    if (!requireSubscription()) return;
    
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    // Reset editingRecipeId - ukládáme jako nový
    window.editingRecipeId = null;
    
    // Vyčistit název a popis (nový recept)
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeDescription').value = '';
    document.getElementById('recipeRating').value = '0';
    selectedRating = 0;
    updateStarDisplay(0);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Předvyplnit produkty z editovaného receptu
    if (window.editingRecipeFromDetail) {
        try {
            const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
                window.Clerk.user.id, 
                window.editingRecipeFromDetail.id
            );
            for (const product of linkedProducts) {
                addProductRowWithValue(product.id, product.name);
            }
        } catch (error) {
            console.error('Error loading linked products:', error);
        }
    }
    
    // Nastavit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = t('save_recipe.save_as_new', 'Uložit jako nový');
    }
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_as_new', 'Uložit jako nový');
        }
    }
    
    initReminderFieldsEnabled();
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    modal.classList.remove('hidden');
}

// Zobrazit modal "Uložit změny"
async function showSaveChangesModal() {
    if (!requireSubscription()) return;
    
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    let editingRecipe = window.editingRecipeFromDetail;
    
    // Diagnostika
    console.log('[showSaveChangesModal] editingRecipeFromDetail:', editingRecipe);
    console.log('[showSaveChangesModal] currentViewingRecipe:', currentViewingRecipe);
    
    // Fallback - pokud editingRecipeFromDetail není k dispozici, zkusit currentViewingRecipe
    if (!editingRecipe && currentViewingRecipe) {
        console.log('[showSaveChangesModal] Using currentViewingRecipe as fallback');
        editingRecipe = currentViewingRecipe;
        window.editingRecipeFromDetail = editingRecipe;
    }
    
    if (!editingRecipe) {
        // Pokud není editovaný recept, použít normální uložení
        console.warn('[showSaveChangesModal] No editing recipe found, falling back to showSaveRecipeModal');
        showSaveRecipeModal();
        return;
    }
    
    // Nastavit ID pro úpravu
    window.editingRecipeId = editingRecipe.id;
    
    // Předvyplnit údaje z editovaného receptu
    console.log('[showSaveChangesModal] Prefilling form with:', {
        name: editingRecipe.name,
        description: editingRecipe.description,
        rating: editingRecipe.rating
    });
    
    document.getElementById('recipeName').value = editingRecipe.name || '';
    document.getElementById('recipeDescription').value = editingRecipe.description || '';
    document.getElementById('recipeRating').value = editingRecipe.rating || '0';
    selectedRating = parseInt(editingRecipe.rating) || 0;
    updateStarDisplay(selectedRating);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Předvyplnit propojené produkty
    try {
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
            window.Clerk.user.id, 
            editingRecipe.id
        );
        for (const product of linkedProducts) {
            addProductRowWithValue(product.id, product.name);
        }
    } catch (error) {
        console.error('Error loading linked products:', error);
    }
    
    // Nastavit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = t('save_recipe.save_changes', 'Uložit změny');
    }
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_changes', 'Uložit změny');
        }
    }
    
    // Skrýt pole pro připomínku při úpravě (už existuje)
    const reminderSection = document.querySelector('.reminder-checkbox-container');
    if (reminderSection) {
        reminderSection.style.display = 'none';
    }
    
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    modal.classList.remove('hidden');
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
        // Získat ID aktuálně přihlášeného uživatele
        const currentUserId = window.Clerk?.user?.id;
        console.log('[loadProductsForRecipe] Loading products for clerk_id:', currentUserId);
        
        if (!currentUserId) {
            console.warn('[loadProductsForRecipe] No user logged in!');
            availableProductsForRecipe = [];
            return;
        }
        
        const products = await window.LiquiMixerDB.getProducts(currentUserId);
        console.log('[loadProductsForRecipe] Loaded products count:', products?.length || 0);
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
        'nicotine_booster': '⚗',
        'nicotine_salt': '🧪'
    };
    
    // Vytvořit options pro select
    let optionsHtml = `<option value="">${t('save_recipe.select_product', '-- Vyberte produkt --')}</option>`;
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}">${escapeHtml(product.name)}</option>`;
    });
    
    const searchPlaceholder = t('save_recipe.search_product', 'Hledat produkt...');
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="${searchPlaceholder}" oninput="filterProductOptions(this, '${rowId}')">
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
        window.editingRecipeFromDetail = null;
        
        // Obnovit původní nadpis a tlačítko
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('save_recipe.title', 'Uložit recept');
        }
        
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            const spanElement = submitBtn.querySelector('span[data-i18n]');
            if (spanElement) {
                spanElement.textContent = t('save_recipe.save_button', 'Uložit recept');
            } else {
                submitBtn.textContent = t('save_recipe.save_button', 'Uložit recept');
            }
        }
        
        // Obnovit sekci připomínek
        const reminderSection = document.querySelector('.reminder-checkbox-container');
        if (reminderSection) {
            reminderSection.style.display = '';
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
            
            // Pokud ukládáme sdílený recept, zkopírovat produkty
            let copiedProductIds = [];
            // Použít UUID receptu (ne share_id) pro načtení produktů
            const sharedRecipeUUID = window.pendingSharedRecipeUUID || (window.currentSharedRecipe ? window.currentSharedRecipe.id : null);
            console.log('[saveRecipe] pendingSharedRecipeUUID:', sharedRecipeUUID, 'isEditing:', isEditing);
            
            if (!isEditing && sharedRecipeUUID) {
                try {
                    // Načíst produkty které zůstaly v DOM (uživatel je neodstranil)
                    const sharedProductInputs = document.querySelectorAll('input[name="sharedProducts"]');
                    const sharedProductIdsFromDOM = Array.from(sharedProductInputs).map(input => input.value);
                    console.log('[saveRecipe] Shared products from DOM:', sharedProductIdsFromDOM);
                    
                    // Zkopírovat pouze produkty které zůstaly v DOM
                    if (sharedProductIdsFromDOM && sharedProductIdsFromDOM.length > 0) {
                        for (const productId of sharedProductIdsFromDOM) {
                            if (!productId) {
                                console.warn('[saveRecipe] Product missing ID');
                                continue;
                            }
                            
                            console.log('[saveRecipe] Copying product:', productId);
                            const copied = await window.LiquiMixerDB.copyProductToUser(productId, window.Clerk.user.id);
                            if (copied && copied.id) {
                                console.log('[saveRecipe] Copied product new ID:', copied.id);
                                copiedProductIds.push(copied.id);
                            } else {
                                console.warn('[saveRecipe] Failed to copy product:', productId);
                            }
                        }
                    }
                    
                    // Vyčistit pending ID
                    window.pendingSharedRecipeUUID = null;
                    window.pendingSharedRecipeId = null;
                } catch (err) {
                    console.error('Error copying products from shared recipe:', err);
                }
            }
            
            // Spojit zkopírované produkty s ručně vybranými
            const allProductIds = [...selectedProductIds, ...copiedProductIds];
            console.log('[saveRecipe] All product IDs to link:', allProductIds);
            
            // Aktualizovat propojené produkty (pokud jsou nějaké)
            if (allProductIds.length > 0) {
                const linkResult = await window.LiquiMixerDB.linkProductsToRecipe(
                    window.Clerk.user.id, 
                    recipeId, 
                    allProductIds
                );
                console.log('[saveRecipe] Link products result:', linkResult);
            }
            
            // Uložit připomínku zrání (pouze pro nové recepty)
            let reminderInfo = '';
            if (!isEditing) {
                const reminderData = getReminderDataFromForm();
                if (reminderData) {
                    // Vyžádat povolení notifikací pokud ještě nebylo uděleno
                    if ('Notification' in window && Notification.permission === 'default') {
                        const permissionGranted = await requestNotificationPermissionWithPrompt();
                        if (permissionGranted && window.fcm && window.fcm.getToken) {
                            await window.fcm.getToken();
                        }
                    }
                    
                    // Uložit připomínku
                    reminderData.recipe_id = recipeId;
                    reminderData.recipe_name = name;
                    const reminderSaved = await window.LiquiMixerDB.saveReminder(
                        window.Clerk.user.id,
                        reminderData
                    );
                    if (reminderSaved) {
                        const remindDate = new Date(reminderData.remind_at).toLocaleDateString();
                        reminderInfo = `\n🔔 ${t('reminder.reminder_set', 'Připomínka nastavena na')} ${remindDate}`;
                    }
                }
            }
            
            // Zobrazit zprávu
            let productInfo = '';
            if (allProductIds.length > 0) {
                productInfo = `\n📦 ${t('save_recipe.products_linked', 'Propojené produkty')}: ${allProductIds.length}`;
                if (copiedProductIds.length > 0) {
                    productInfo += ` (${t('shared_recipe.products_copied', 'zkopírováno')}: ${copiedProductIds.length})`;
                }
            }
            
            if (isEditing) {
                alert(t('save_recipe.updated', 'Recept byl úspěšně upraven!') + productInfo);
                // Obnovit detail receptu
                await viewRecipeDetail(window.editingRecipeId);
            } else {
                // Pokud ukládáme sdílený recept, přejít na detail nově uloženého
                const wasSharedRecipe = copiedProductIds.length > 0 || window.currentSharedRecipe;
                
                if (wasSharedRecipe && saved.id) {
                    // Vyčistit sdílený recept z paměti
                    window.currentSharedRecipe = null;
                    
                    // Zobrazit krátkou notifikaci a přejít na detail
                    showNotification(t('save_recipe.success', 'Recept byl úspěšně uložen!') + productInfo, 'success');
                    hideSaveRecipeModal();
                    resetReminderFields();
                    
                    // Přejít na detail nově uloženého receptu
                    await viewRecipeDetail(saved.id);
                    return false;
                }
                
                const shareUrl = saved.share_url || SHARE_DOMAIN + '/?recipe=' + saved.share_id;
                const successMessage = t('save_recipe.success', 'Recept byl úspěšně uložen!') + '\n\n' +
                    t('save_recipe.share_link', 'Odkaz pro sdílení:') + '\n' + shareUrl + productInfo + reminderInfo;
                alert(successMessage);
            }
            
            hideSaveRecipeModal();
            resetReminderFields();
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
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const container = document.getElementById('recipesListContainer');
    container.innerHTML = `<p class="no-recipes-text">${t('recipes.loading', 'Načítám recepty...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetRecipeFilters();
    
    showPage('my-recipes');
    
    try {
        const recipes = await window.LiquiMixerDB.getRecipes(window.Clerk.user.id);
        allUserRecipes = recipes || []; // Uložit pro filtrování
        
        renderRecipesList(allUserRecipes);
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
    
    let filtered = allUserRecipes.filter(recipe => {
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
                resultsInfo.textContent = `Nalezeno ${filtered.length} z ${allUserRecipes.length} receptů.`;
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
                    <span>⚖️ ${safeVg}:${safePg}</span>
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
        
        currentViewingRecipe = recipe;
        window.currentViewingRecipe = recipe; // Export pro připomínky
        
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
// isShared = true znamená, že jde o sdílený recept jiného uživatele
function displayRecipeDetail(recipe, titleId, contentId, linkedProducts = [], isShared = false) {
    const titleEl = document.getElementById(titleId);
    const contentEl = document.getElementById(contentId);
    
    // SECURITY: Použít textContent místo innerHTML pro název
    titleEl.textContent = recipe.name;
    
    const rating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    // Použít aktuální locale pro formátování data
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(recipe.created_at).toLocaleDateString(currentLocale);
    const data = recipe.recipe_data || {};
    
    // SECURITY: Escapování popisku
    const safeDescription = escapeHtml(recipe.description);
    
    let ingredientsHtml = '';
    if (data.ingredients && Array.isArray(data.ingredients)) {
        ingredientsHtml = `
            <h4 class="recipe-ingredients-title">${t('recipe_detail.ingredients_title', 'Složky')}</h4>
            <div class="results-table-container">
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
                                <td class="ingredient-value">${parseFloat(ing.volume || 0).toFixed(2)}</td>
                                <td class="ingredient-percent">${parseFloat(ing.percent || 0).toFixed(1)}%</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Propojené produkty
    let linkedProductsHtml = '';
    if (linkedProducts && linkedProducts.length > 0) {
        const typeIcons = {
            'vg': '💧',
            'pg': '💧',
            'flavor': '🍓',
            'nicotine_booster': '⚗',
            'nicotine_salt': '🧪'
        };
        
        // Pro sdílené recepty použít viewSharedProductDetail (read-only)
        const productClickHandler = isShared ? 'viewSharedProductDetail' : 'viewProductDetail';
        
        linkedProductsHtml = `
            <div class="recipe-linked-products">
                <h4 class="recipe-ingredients-title">${t('recipe_detail.linked_products', 'Použité produkty')}</h4>
                <div class="linked-products-list">
                    ${linkedProducts.map(product => {
                        const icon = typeIcons[product.product_type] || '📦';
                        const productRating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
                        const productStars = '★'.repeat(productRating) + '☆'.repeat(5 - productRating);
                        return `
                            <div class="linked-product-item" onclick="${productClickHandler}('${escapeHtml(product.id)}')">
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
            <div class="recipe-info-item total-volume-highlight">
                <div class="recipe-info-label volume-label">${t('recipe_detail.total_volume', 'Celkový objem')}</div>
                <div class="recipe-info-value volume-value">${safeTotal} ml</div>
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
        
        <!-- Sekce připomínek zrání - pouze pro vlastní recepty -->
        ${contentId === 'recipeDetailContent' ? `
        <div class="reminders-section">
            <h4 class="reminders-title">${t('recipe_detail.reminders_title', 'Připomínky zrání')}</h4>
            <div class="reminders-list" id="remindersList-${escapeHtml(recipe.id)}">
                <div class="no-reminders">${t('recipe_detail.no_reminders', 'Žádné připomínky. Klikněte na tlačítko níže pro přidání.')}</div>
            </div>
            <button type="button" class="add-reminder-btn" onclick="showAddReminderModal('${escapeHtml(recipe.id)}')">
                + ${t('recipe_detail.add_reminder', 'Přidat nové míchání')}
            </button>
        </div>
        ` : ''}
    `;
    
    // Načíst připomínky pro vlastní recepty
    if (contentId === 'recipeDetailContent' && recipe.id) {
        setTimeout(() => loadRecipeReminders(recipe.id), 100);
    }
}

// Upravit uložený recept - otevře kalkulátor s předvyplněnými hodnotami
async function editSavedRecipe() {
    if (!currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_edit', 'Pro úpravu receptu se prosím přihlaste.'));
        return;
    }
    
    // Uložit ID editovaného receptu pro pozdější použití
    window.editingRecipeFromDetail = currentViewingRecipe;
    
    const recipeData = currentViewingRecipe.recipe_data || {};
    
    // Určit typ formuláře
    const formType = recipeData.formType || 'liquid';
    
    // Povolit programovou změnu záložky
    window.allowTabSwitch = true;
    
    // Předvyplnit formulář podle typu a přepnout záložku
    if (formType === 'shakevape' || formType === 'snv') {
        prefillSnvForm(recipeData);
        switchFormTab('shakevape');
    } else if (formType === 'liquidpro' || formType === 'pro') {
        prefillProForm(recipeData);
        switchFormTab('liquidpro');
    } else {
        prefillLiquidForm(recipeData);
        switchFormTab('liquid');
    }
    
    // Zobrazit stránku formuláře
    showPage('form');
    
    // Označit záložky jako disabled (kromě aktuální)
    updateFormTabsState();
}

// Předvyplnit Liquid formulář
function prefillLiquidForm(data) {
    if (data.totalAmount) {
        document.getElementById('totalAmount').value = data.totalAmount;
    }
    if (data.vgPercent !== undefined) {
        document.getElementById('vgPgRatio').value = data.vgPercent;
        updateRatioDisplay();
    }
    if (data.nicotine !== undefined && data.nicotine > 0) {
        document.getElementById('nicotineType').value = 'booster';
        document.getElementById('targetNicotine').value = data.nicotine;
        updateNicotineType();
    }
    if (data.flavorType && data.flavorType !== 'none') {
        document.getElementById('flavorType').value = data.flavorType;
        // Najít procento příchutě z ingredients
        const flavorIng = (data.ingredients || []).find(ing => ing.ingredientKey === 'flavor');
        if (flavorIng) {
            document.getElementById('flavorStrength').value = flavorIng.percent || 10;
        }
        updateFlavorType();
    }
    updateVgPgRatioLimits();
}

// Předvyplnit Shake & Vape formulář
function prefillSnvForm(data) {
    if (data.totalAmount) {
        const el = document.getElementById('svTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    if (data.vgPercent !== undefined) {
        const el = document.getElementById('svVgPgRatio');
        if (el) {
            el.value = data.vgPercent;
            updateSvRatioDisplay();
        }
    }
    if (data.nicotine !== undefined && data.nicotine > 0) {
        const typeEl = document.getElementById('svNicotineType');
        if (typeEl) typeEl.value = 'freebase';
        const nicEl = document.getElementById('svTargetNicotine');
        if (nicEl) nicEl.value = data.nicotine;
        updateSvNicotineType();
    }
    // Aroma objem (Shake & Vape má objem příchutě, ne procento)
    const aromaIng = (data.ingredients || []).find(ing => ing.ingredientKey === 'flavor');
    if (aromaIng && aromaIng.volume) {
        const el = document.getElementById('svFlavorVolume');
        if (el) el.value = aromaIng.volume || 12;
    }
    // Aktualizovat limity
    updateSvVgPgLimits();
}

// Předvyplnit Liquid PRO formulář
function prefillProForm(data) {
    if (data.totalAmount) {
        const el = document.getElementById('proTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    if (data.vgPercent !== undefined) {
        const el = document.getElementById('proVgPgRatio');
        if (el) {
            el.value = data.vgPercent;
            updateProRatioDisplay();
        }
    }
    if (data.nicotine !== undefined && data.nicotine > 0) {
        const typeEl = document.getElementById('proNicotineType');
        if (typeEl) typeEl.value = 'freebase';
        const nicEl = document.getElementById('proTargetNicotine');
        if (nicEl) nicEl.value = data.nicotine;
        updateProNicotineType();
    }
    // Příchutě - předvyplnit více příchutí
    if (data.flavors && data.flavors.length > 0) {
        resetAndPrefillProFlavors(data.flavors);
    }
    // Aktualizovat limity
    updateProVgPgLimits();
}

// Resetovat a předvyplnit příchutě PRO formuláře
function resetAndPrefillProFlavors(flavors) {
    if (!flavors || flavors.length === 0) return;
    
    // 1. Resetovat stav - proFlavorCount je globální proměnná
    proFlavorCount = 1;
    const container = document.getElementById('proAdditionalFlavorsContainer');
    if (container) container.innerHTML = '';
    
    // 2. Zobrazit tlačítko přidat (skryje se pokud bude max)
    const addBtn = document.getElementById('proAddFlavorGroup');
    if (addBtn) addBtn.classList.remove('hidden');
    
    // 3. Předvyplnit příchutě
    flavors.forEach((flavor, idx) => {
        const flavorIndex = idx + 1; // příchutě jsou indexovány od 1
        
        if (flavorIndex > 1) {
            // Přidat nový řádek pro příchutě 2-4
            addProFlavor();
        }
        
        // Nastavit hodnoty
        const typeEl = document.getElementById(`proFlavorType${flavorIndex}`);
        const strengthEl = document.getElementById(`proFlavorStrength${flavorIndex}`);
        const ratioEl = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
        
        if (typeEl) typeEl.value = flavor.type || 'fruit';
        if (strengthEl) strengthEl.value = flavor.percent || 10;
        if (ratioEl) ratioEl.value = flavor.vgRatio || 0;
        
        // Aktualizovat UI (zobrazit slider, aktualizovat hodnoty)
        updateProFlavorType(flavorIndex);
    });
    
    // 4. Aktualizovat celkové procento
    updateProTotalFlavorPercent();
}

// Zobrazit formulář pro úpravu receptu
async function showEditRecipeForm() {
    // Použít existující modal pro uložení, ale v režimu úpravy
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    // Označit jako režim úpravy
    window.editingRecipeId = currentViewingRecipe.id;
    
    // Naplnit formulář existujícími daty
    document.getElementById('recipeName').value = currentViewingRecipe.name || '';
    document.getElementById('recipeDescription').value = currentViewingRecipe.description || '';
    document.getElementById('recipeRating').value = currentViewingRecipe.rating || '0';
    
    // Aktualizovat zobrazení hvězdiček
    selectedRating = parseInt(currentViewingRecipe.rating) || 0;
    updateStarDisplay(selectedRating);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Načíst propojené produkty a předvybrat je
    try {
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
            window.Clerk.user.id, 
            currentViewingRecipe.id
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
        modalTitle.textContent = t('save_recipe.edit_title', 'Upravit recept');
    }
    
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_changes', 'Uložit změny');
        } else {
            submitBtn.textContent = t('save_recipe.save_changes', 'Uložit změny');
        }
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
        'nicotine_booster': '⚗',
        'nicotine_salt': '🧪'
    };
    
    // Vytvořit options pro select s předvybranou hodnotou
    let optionsHtml = `<option value="">${t('save_recipe.select_product', '-- Vyberte produkt --')}</option>`;
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        const selected = product.id === productId ? 'selected' : '';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}" ${selected}>${escapeHtml(product.name)}</option>`;
    });
    
    const searchPlaceholder = t('save_recipe.search_product', 'Hledat produkt...');
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="${searchPlaceholder}" value="${escapeHtml(productName || '')}" oninput="filterProductOptions(this, '${rowId}')">
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
    if (!currentViewingRecipe || !currentViewingRecipe.share_id) {
        alert(t('share.cannot_share_recipe', 'Tento recept nelze sdílet.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    // SECURITY: Vždy kontrolovat, že URL začíná oficiální doménou
    let shareUrl = currentViewingRecipe.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?recipe=${currentViewingRecipe.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(currentViewingRecipe.name),
            text: `Podívej se na můj recept: ${escapeHtml(currentViewingRecipe.name)}`,
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
    if (!currentViewingProduct || !currentViewingProduct.share_id) {
        alert(t('share.cannot_share_product', 'Tento produkt nelze sdílet.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    let shareUrl = currentViewingProduct.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?product=${currentViewingProduct.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(currentViewingProduct.name),
            text: `Podívej se na můj oblíbený produkt: ${escapeHtml(currentViewingProduct.name)}`,
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
    if (!currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required', 'Pro smazání receptu se prosím přihlaste.'));
        return;
    }
    
    const recipeName = currentViewingRecipe.name || 'Tento recept';
    
    if (!confirm(t('recipe_detail.delete_confirm', 'Opravdu chcete smazat tento recept?'))) {
        return;
    }
    
    try {
        const success = await window.LiquiMixerDB.deleteRecipe(
            window.Clerk.user.id, 
            currentViewingRecipe.id
        );
        
        if (success) {
            alert(t('recipe_detail.delete_success', 'Recept byl smazán.'));
            currentViewingRecipe = null;
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
    
    // Uložit shareId pro pozdější načtení
    window.pendingSharedRecipeId = shareId;
    
    // Počkat na inicializaci Supabase
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
    }
    
    // Počkat na Clerk a Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Načíst recept z databáze pro zjištění typu
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (!recipe) {
            showNotification(t('recipes.not_found', 'Recept nebyl nalezen.'), 'error');
            showPage('intro');
            return false;
        }
        
        // Uložit recept pro pozdější použití
        window.pendingSharedRecipe = recipe;
        window.pendingSharedRecipeUUID = recipe.id;
        
        // Zkontrolovat typ receptu
        const formType = recipe.recipe_data?.formType || 'liquid';
        
        // Liquid PRO vyžaduje přihlášení
        if (formType === 'liquidpro' && (!window.Clerk || !window.Clerk.user)) {
            showSharedRecipeLoginPrompt();
            return true;
        }
        
        // Pro všechny typy receptů zobrazit disclaimer
        showSharedRecipeDisclaimer(shareId);
        return true;
        
    } catch (error) {
        console.error('Error loading shared recipe:', error);
        showNotification(t('recipes.load_error', 'Chyba při načítání receptu.'), 'error');
        showPage('intro');
        return false;
    }
}

// Zobrazit disclaimer pro sdílený recept
function showSharedRecipeDisclaimer(shareId) {
    // Uložit shareId pro pozdější načtení
    window.pendingSharedRecipeId = shareId;
    
    // Aplikovat překlady
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    showPage('shared-recipe-disclaimer');
}

// Potvrdit disclaimer a zobrazit sdílený recept
async function confirmAndShowSharedRecipe() {
    const shareId = window.pendingSharedRecipeId;
    if (!shareId) {
        showPage('intro');
        return;
    }
    
    await loadSharedRecipeContent(shareId);
}

// Zobrazit výzvu k přihlášení pro sdílený recept (pouze pro Liquid PRO)
function showSharedRecipeLoginPrompt() {
    const contentEl = document.getElementById('sharedRecipeContent');
    const titleEl = document.getElementById('sharedRecipeTitle');
    
    titleEl.textContent = t('recipe_detail.shared_title', 'Sdílený recept');
    contentEl.innerHTML = `
        <div class="login-prompt">
            <div class="login-prompt-icon">🔒</div>
            <h3 class="login-prompt-title">${t('shared_recipe.pro_login_title', 'Pro zobrazení receptu se přihlaste')}</h3>
            <p class="login-prompt-text">${t('shared_recipe.pro_login_text', 'Recepty vytvářené v režimu Liquid PRO jsou dostupné jenom pro přihlášené uživatele.')}</p>
            <button class="neon-button" onclick="window.handleSharedRecipeLogin()">${t('shared_recipe.login_button', 'PŘIHLÁSIT SE')}</button>
        </div>
    `;
    
    showPage('shared-recipe');
}

// Přihlášení pro sdílený recept - robustní handler
async function handleSharedRecipeLogin() {
    console.log('handleSharedRecipeLogin called');
    try {
        console.log('showLoginModal: clerkLoaded=', clerkLoaded, 'Clerk=', !!window.Clerk);
        console.log('body classes before:', document.body.className);
        
        // Odstranit subscription-required třídu, aby loginModal nebyl CSS skrytý
        document.body.classList.remove('subscription-required');
        
        // Přidat speciální třídu pro přihlášení ze sdíleného receptu
        // Tato třída přebije CSS pravidla která skrývají loginModal
        document.body.classList.add('login-for-shared-recipe');
        
        console.log('body classes after:', document.body.className);
        
        // Reset inline stylů pro jistotu
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            console.log('loginModal found, removing hidden class');
            loginModal.style.cssText = ''; // Vymazat všechny inline styly
            loginModal.classList.remove('hidden');
        }
        
        await showLoginModal();
        console.log('showLoginModal completed');
    } catch (e) {
        console.error('Error in handleSharedRecipeLogin:', e);
        // Fallback - přímo zobrazit modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            document.body.classList.remove('subscription-required');
            document.body.classList.add('login-for-shared-recipe');
            loginModal.style.cssText = '';
            loginModal.classList.remove('hidden');
        }
    }
}

// Legacy alias pro zpětnou kompatibilitu
function showLoginForSharedRecipe() {
    handleSharedRecipeLogin();
}

// Načíst obsah sdíleného receptu (po přihlášení)
async function loadSharedRecipeContent(shareId) {
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (recipe) {
            // Uložit sdílený recept pro pozdější použití (např. uložení k sobě)
            window.currentSharedRecipe = recipe;
            
            // Načíst propojené produkty (bez ověření vlastníka)
            let linkedProducts = [];
            try {
                linkedProducts = await window.LiquiMixerDB.getLinkedProductsByRecipeId(recipe.id);
            } catch (err) {
                console.error('Error loading linked products for shared recipe:', err);
            }
            
            // Zobrazit detail receptu s propojenými produkty
            // Použít speciální režim pro sdílené recepty (isShared = true)
            displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent', linkedProducts, true);
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
        // Nezmazat pendingSharedRecipeId - bude potřeba po disclaimeru
        // Zobrazit disclaimer stránku místo přímého načtení
        showSharedRecipeDisclaimer(shareId);
    }
}

// Uložit sdílený recept k sobě
async function saveSharedRecipe() {
    // Kontrola přihlášení A předplatného - zobrazí modál pokud chybí
    if (!requireSubscription()) {
        return; // requireSubscription() již zobrazí loginRequiredModal nebo subscriptionModal
    }
    
    // Zkontrolovat, že máme načtený sdílený recept
    const recipe = window.currentSharedRecipe;
    if (!recipe || !recipe.recipe_data) {
        showNotification(t('recipes.nothing_to_save', 'Není co uložit.'), 'error');
        return;
    }
    
    // Nastavit data pro uložení
    currentRecipeData = recipe.recipe_data;
    
    // Zobrazit modal pro uložení receptu
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.remove('hidden');
        initStarRating();
        
        // Předvyplnit formulář hodnotami ze sdíleného receptu
        const nameInput = document.getElementById('recipeName');
        const descInput = document.getElementById('recipeDescription');
        const ratingInput = document.getElementById('recipeRating');
        
        if (nameInput) nameInput.value = recipe.name || '';
        if (descInput) descInput.value = recipe.description || '';
        if (ratingInput) ratingInput.value = recipe.rating || 0;
        
        // Nastavit hvězdičkové hodnocení
        selectedRating = parseInt(recipe.rating) || 0;
        updateStarDisplay(selectedRating);
        
        // Nastavit nadpis a tlačítko
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('shared_recipe.save_to_my_recipes', 'Uložit k sobě');
        }
        
        // Inicializovat připomínku
        initReminderFieldsEnabled();
        
        // Aplikovat překlady
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
        
        // Načíst produkty uživatele pro případné přidání dalších
        await loadProductsForRecipe();
        
        // Načíst a zobrazit produkty ze sdíleného receptu
        try {
            const sharedProducts = await window.LiquiMixerDB.getLinkedProductsByRecipeId(recipe.id);
            if (sharedProducts && sharedProducts.length > 0) {
                for (const product of sharedProducts) {
                    // Přidat řádek s produktem ze sdíleného receptu (označený jako sdílený)
                    addSharedProductRow(product.id, product.name, product.product_type);
                }
            }
        } catch (err) {
            console.error('Error loading shared recipe products:', err);
        }
        
        // Uložit UUID původního receptu pro zkopírování produktů po uložení
        window.pendingSharedRecipeUUID = recipe.id;
    }
}

// Přidat řádek se sdíleným produktem (s tlačítkem pro odstranění)
function addSharedProductRow(productId, productName, productType) {
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `shared-product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚗️',
        'nicotine_salt': '🧪'
    };
    const icon = typeIcons[productType] || '📦';
    
    const row = document.createElement('div');
    row.id = rowId;
    row.className = 'product-select-row shared-product-row';
    row.innerHTML = `
        <div class="shared-product-display">
            <span class="shared-product-icon">${icon}</span>
            <span class="shared-product-name">${escapeHtml(productName)}</span>
            <span class="shared-product-badge">${t('shared_recipe.from_shared', 'ze sdíleného')}</span>
        </div>
        <input type="hidden" name="sharedProducts" value="${escapeHtml(productId)}">
        <button type="button" class="reminder-btn delete" onclick="removeSharedProductRow('${rowId}')" title="${t('common.remove', 'Odstranit')}">${reminderDeleteIcon}</button>
    `;
    listContainer.appendChild(row);
}

// Odstranit sdílený produkt z řádku (nepřevzít do svého receptu)
function removeSharedProductRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// ============================================
// OBLÍBENÉ PRODUKTY
// ============================================

let currentViewingProduct = null;
let selectedProductRating = 0;
let allUserProducts = []; // Všechny načtené produkty pro filtrování
let searchRatingFilter = 0; // Aktuální filtr hodnocení produktů

// Stav pro filtrování receptů
let allUserRecipes = []; // Všechny načtené recepty pro filtrování
let recipeSearchRatingFilter = 0; // Aktuální filtr hodnocení receptů

// Zobrazit seznam oblíbených produktů
async function showFavoriteProducts() {
    hideUserProfileModal();
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const container = document.getElementById('productsListContainer');
    container.innerHTML = `<p class="no-products-text">${t('products.loading', 'Načítám produkty...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetProductFilters();
    
    showPage('favorite-products');
    
    try {
        const products = await window.LiquiMixerDB.getProducts(window.Clerk.user.id);
        allUserProducts = products || []; // Uložit pro filtrování
        
        renderProductsList(allUserProducts);
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
    
    let filtered = allUserProducts.filter(product => {
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
                resultsInfo.textContent = `Nalezeno ${filtered.length} z ${allUserProducts.length} produktů.`;
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
        
        currentViewingProduct = product;
        
        // Načíst recepty, ve kterých je produkt použitý
        let linkedRecipes = [];
        try {
            linkedRecipes = await window.LiquiMixerDB.getRecipesByProductId(window.Clerk.user.id, productId);
        } catch (err) {
            console.error('Error loading linked recipes:', err);
        }
        
        displayProductDetail(product, linkedRecipes);
        showPage('product-detail');
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert(t('products.load_error', 'Chyba při načítání produktu.'));
    }
}

// Zobrazit detail produktu v UI
function displayProductDetail(product, linkedRecipes = []) {
    const titleEl = document.getElementById('productDetailTitle');
    const contentEl = document.getElementById('productDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    // Použít aktuální locale pro formátování data
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(product.created_at).toLocaleDateString(currentLocale);
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
    
    // Seznam receptů, ve kterých je produkt použitý
    let recipesHtml = '';
    if (linkedRecipes && linkedRecipes.length > 0) {
        const recipeItems = linkedRecipes.map(recipe => {
            const recipeRating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
            const recipeStars = '★'.repeat(recipeRating) + '☆'.repeat(5 - recipeRating);
            return `
                <div class="linked-recipe-item" onclick="viewRecipeDetail('${escapeHtml(recipe.id)}')">
                    <span class="linked-recipe-name">${escapeHtml(recipe.name)}</span>
                    <span class="linked-recipe-rating">${recipeStars}</span>
                </div>
            `;
        }).join('');
        
        recipesHtml = `
            <div class="product-linked-recipes">
                <h4 class="product-section-title">${t('product_detail.used_in_recipes', 'Použito v receptech')}</h4>
                <div class="linked-recipes-list">
                    ${recipeItems}
                </div>
            </div>
        `;
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
        ${recipesHtml}
        <div class="product-meta-info">
            <p class="product-date">${t('product_detail.added', 'Přidáno')}: ${date}</p>
        </div>
    `;
}

// Zobrazit detail sdíleného produktu (read-only)
async function viewSharedProductDetail(productId) {
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return;
    }
    
    try {
        // Načíst produkt bez ověření vlastníka
        const product = await window.LiquiMixerDB.getProductByIdPublic(productId);
        
        if (!product) {
            showNotification(t('products.not_found', 'Produkt nenalezen.'), 'error');
            return;
        }
        
        // Uložit produkt pro případné zkopírování
        window.currentSharedProduct = product;
        
        // Zobrazit detail
        displaySharedProductDetail(product);
        showPage('shared-product-detail');
        
    } catch (error) {
        console.error('Error loading shared product:', error);
        showNotification(t('products.load_error', 'Chyba při načítání produktu.'), 'error');
    }
}

// Zobrazit detail sdíleného produktu v UI (read-only)
function displaySharedProductDetail(product) {
    const titleEl = document.getElementById('sharedProductDetailTitle');
    const contentEl = document.getElementById('sharedProductDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(product.created_at).toLocaleDateString(currentLocale);
    const typeLabel = getProductTypeLabel(product.product_type);
    const typeIcon = productTypeIcons[product.product_type] || '🍓';
    
    const safeDescription = escapeHtml(product.description);
    
    let imageHtml = '';
    if (product.image_url) {
        imageHtml = `<div class="product-detail-image"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}"></div>`;
    }
    
    let urlHtml = '';
    if (product.product_url) {
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

// Zkopírovat sdílený produkt do účtu aktuálního uživatele
async function copySharedProductToUser() {
    // Kontrola přihlášení A předplatného
    if (!requireSubscription()) {
        return;
    }
    
    const product = window.currentSharedProduct;
    if (!product) {
        showNotification(t('products.not_found', 'Produkt nenalezen.'), 'error');
        return;
    }
    
    try {
        const copied = await window.LiquiMixerDB.copyProductToUser(product.id, window.Clerk.user.id);
        
        if (copied) {
            showNotification(t('shared_recipe.product_saved', 'Produkt byl uložen do vašich oblíbených!'), 'success');
            // Přejít na detail nového produktu
            currentViewingProduct = copied;
            displayProductDetail(copied);
            showPage('product-detail');
        } else {
            showNotification(t('products.save_error', 'Chyba při ukládání produktu.'), 'error');
        }
    } catch (error) {
        console.error('Error copying product:', error);
        showNotification(t('products.save_error', 'Chyba při ukládání produktu.'), 'error');
    }
}

// Zpět ze sdíleného produktu
function goBackFromSharedProduct() {
    // Vrátit se na sdílený recept pokud existuje
    if (window.currentSharedRecipe) {
        showPage('shared-recipe');
    } else {
        showPage('intro');
    }
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
    'nicotine_booster': '⚗',
    'nicotine_salt': '🧪'
};

// Zobrazit formulář pro přidání produktu
function showAddProductForm() {
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    document.getElementById('productFormTitle').textContent = t('product_form.add_title', 'Přidat produkt');
    document.getElementById('editingProductId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productRating').value = '0';
    document.getElementById('productUrl').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    
    // Povolit výběr typu produktu při přidávání nového
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect) {
        productTypeSelect.disabled = false;
        productTypeSelect.title = '';
    }
    
    selectedProductRating = 0;
    updateProductStarDisplay(0);
    initProductStarRating();
    
    showPage('product-form');
}

// Upravit produkt
function editProduct() {
    if (!currentViewingProduct) return;
    
    document.getElementById('productFormTitle').textContent = t('product_form.edit_title', 'Upravit produkt');
    document.getElementById('editingProductId').value = currentViewingProduct.id;
    document.getElementById('productName').value = currentViewingProduct.name || '';
    document.getElementById('productType').value = currentViewingProduct.product_type || 'flavor';
    document.getElementById('productDescription').value = currentViewingProduct.description || '';
    document.getElementById('productRating').value = currentViewingProduct.rating || '0';
    document.getElementById('productUrl').value = currentViewingProduct.product_url || '';
    document.getElementById('productImageUrl').value = currentViewingProduct.image_url || '';
    
    if (currentViewingProduct.image_url) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${escapeHtml(currentViewingProduct.image_url)}" alt="Preview">`;
    } else {
        document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    }
    
    // Zakázat změnu typu produktu při editaci
    // Typ produktu se nesmí měnit, aby zůstal konzistentní s product_code při sdílení
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect) {
        productTypeSelect.disabled = true;
        productTypeSelect.title = t('product_form.type_locked', 'Typ produktu nelze změnit po vytvoření');
    }
    
    selectedProductRating = currentViewingProduct.rating || 0;
    updateProductStarDisplay(selectedProductRating);
    initProductStarRating();
    
    showPage('product-form');
}

// Smazat produkt
async function deleteProduct() {
    if (!currentViewingProduct) return;
    
    if (!confirm(t('product_detail.delete_confirm', 'Opravdu chcete smazat tento produkt?'))) return;
    
    try {
        const success = await window.LiquiMixerDB.deleteProduct(window.Clerk.user.id, currentViewingProduct.id);
        
        if (success) {
            alert(t('products.deleted', 'Produkt byl smazán.'));
            currentViewingProduct = null;
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
    if (editingId && currentViewingProduct) {
        showPage('product-detail');
    } else {
        showFavoriteProducts();
    }
}

// Uložit produkt
async function saveProduct(event) {
    event.preventDefault();
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
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
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, actualTotal, actualVg, actualPg, {
        flavorType: flavorType
    });
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg, extraData = {}) {
    document.getElementById('resultTotal').textContent = `${total} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${nicotine} mg/ml`;
    
    // Přepnout tlačítka podle režimu (editace vs nový recept)
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    
    if (window.editingRecipeFromDetail) {
        // Režim editace existujícího receptu
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        // Nový recept
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }

    // Uložit data receptu pro možnost pozdějšího uložení
    // Ukládáme klíče a parametry pro dynamický překlad
    const recipeData = {
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
    };
    
    // Přidat extra data (flavorType pro základní recept, formType a flavors pro PRO)
    if (extraData.flavorType) {
        recipeData.flavorType = extraData.flavorType;
    }
    if (extraData.formType) {
        recipeData.formType = extraData.formType;
    }
    if (extraData.flavors) {
        recipeData.flavors = extraData.flavors;
    }
    
    storeCurrentRecipe(recipeData);

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

// Překreslit tabulku výsledků při změně jazyka
function refreshResultsTable() {
    const tbody = document.getElementById('resultsBody');
    if (!tbody || !currentRecipeData || !currentRecipeData.ingredients) return;
    
    tbody.innerHTML = '';
    let runningTotal = 0;
    
    currentRecipeData.ingredients.forEach(ing => {
        const row = document.createElement('tr');
        
        let dropsDisplay = '-';
        if (ing.drops && ing.volume <= 5) {
            dropsDisplay = String(ing.drops);
        }
        
        const ingredientName = getIngredientName(ing);
        
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName}</td>
            <td class="ingredient-value">${parseFloat(ing.volume || 0).toFixed(2)} ml</td>
            <td class="ingredient-drops">${dropsDisplay}</td>
            <td class="ingredient-percent">${parseFloat(ing.percent || 0).toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
        runningTotal += parseFloat(ing.volume || 0);
    });
    
    // Přidat řádek celkem
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)} ml</td>
        <td class="ingredient-drops">-</td>
        <td class="ingredient-percent">100%</td>
    `;
    tbody.appendChild(totalRow);
    
    // Aktualizovat poznámky
    const notesEl = document.querySelector('.results-notes ul');
    if (notesEl && currentRecipeData.actualVg !== undefined) {
        const total = currentRecipeData.totalAmount || 100;
        const actualVgPercent = (currentRecipeData.actualVg / total * 100).toFixed(1);
        const actualPgPercent = (currentRecipeData.actualPg / total * 100).toFixed(1);
        
        notesEl.innerHTML = `
            <li>${t('results.notes_1', 'Nejprve přidejte nikotin (pokud používáte)')} - ${t('results.dilute_notes_1', 'pracujte v rukavicích!')}</li>
            <li>${t('results.notes_2', 'Poté přidejte příchutě')}</li>
            <li>${t('results.notes_3', 'Nakonec doplňte PG a VG')}</li>
            <li>${t('results.notes_4', 'Důkladně protřepejte a nechte zrát 1-2 týdny')}</li>
            <li>${t('results.actual_ratio', 'Skutečný poměr VG/PG ve směsi')}: ${actualVgPercent}% / ${actualPgPercent}%</li>
        `;
    }
}

// Překreslit detail receptu při změně jazyka
function refreshRecipeDetail() {
    if (!window.currentViewingRecipe) return;
    
    const contentEl = document.getElementById('recipeDetailContent');
    if (!contentEl) return;
    
    // Znovu načíst propojené produkty a zobrazit detail
    if (window.Clerk && window.Clerk.user && window.LiquiMixerDB) {
        window.LiquiMixerDB.getLinkedProducts(window.Clerk.user.id, window.currentViewingRecipe.id)
            .then(linkedProducts => {
                displayRecipeDetail(window.currentViewingRecipe, 'recipeDetailTitle', 'recipeDetailContent', linkedProducts || []);
            })
            .catch(err => {
                console.error('Error refreshing recipe detail:', err);
                displayRecipeDetail(window.currentViewingRecipe, 'recipeDetailTitle', 'recipeDetailContent', []);
            });
    }
}

// Překreslit detail produktu při změně jazyka (pro sekci "Použito v receptech")
async function refreshProductDetail() {
    if (!currentViewingProduct) return;
    
    const productDetailPage = document.getElementById('product-detail');
    if (!productDetailPage || productDetailPage.classList.contains('hidden')) return;
    
    // Znovu načíst recepty a překreslit detail
    if (window.Clerk && window.Clerk.user && window.LiquiMixerDB) {
        try {
            const linkedRecipes = await window.LiquiMixerDB.getRecipesByProductId(
                window.Clerk.user.id, 
                currentViewingProduct.id
            );
            displayProductDetail(currentViewingProduct, linkedRecipes || []);
        } catch (err) {
            console.error('Error refreshing product detail:', err);
            displayProductDetail(currentViewingProduct, []);
        }
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
    // V režimu editace zamezit změně záložky (kromě programového volání z goBackToCalculator)
    if (window.editingRecipeFromDetail && currentFormTab !== tabName) {
        // Pokud je volání z onclick (uživatel klikl na záložku), ignorovat
        // Povolíme pouze pokud je explicitně nastaveno window.allowTabSwitch
        if (!window.allowTabSwitch) {
            console.log('Tab switch blocked - editing mode active');
            return;
        }
    }
    window.allowTabSwitch = false; // Reset flagu
    
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

// Aktualizovat stav záložek formuláře (disabled v režimu editace)
function updateFormTabsState() {
    const tabs = document.querySelectorAll('.form-tab');
    if (window.editingRecipeFromDetail) {
        // V režimu editace označit neaktivní záložky jako disabled
        tabs.forEach(tab => {
            if (tab.dataset.tab !== currentFormTab) {
                tab.classList.add('tab-disabled');
            } else {
                tab.classList.remove('tab-disabled');
            }
        });
    } else {
        // Normální režim - všechny záložky aktivní
        tabs.forEach(tab => {
            tab.classList.remove('tab-disabled');
        });
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
    // Shake & Vape nemá výběr typu příchutě - použijeme 'fruit' jako výchozí (7 dní zrání)
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'shakevape',
        flavorType: 'fruit'
    });
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
    
    // Inicializovat barvu posuvníku VG/PG pro novou příchuť
    updateProFlavorRatioDisplay(proFlavorCount);
    
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
    // PRO funkce vyžaduje přihlášení a předplatné
    if (!requireSubscription()) {
        return;
    }
    
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
    
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'liquidpro',
        flavors: flavorsData
    });
    showPage('results');
}

// =========================================
// SUBSCRIPTION / PŘEDPLATNÉ
// =========================================

// Globální stav předplatného
let subscriptionData = null;
let userLocation = null;

// Zkontrolovat stav předplatného
// Vrací: true = má platné předplatné, false = nemá nebo chyba
async function checkSubscriptionStatus() {
    // KLÍČOVÁ KONTROLA: Pouze pro přihlášené uživatele
    if (!window.Clerk?.user) {
        console.log('checkSubscriptionStatus: No user signed in, skipping');
        return false;
    }

    try {
        console.log('Checking subscription status for user:', window.Clerk.user.id);
        
        // Počkat na token - může trvat chvíli po přihlášení
        let token = null;
        let attempts = 0;
        while (!token && attempts < 3) {
            token = await getClerkToken();
            if (!token) {
                attempts++;
                console.log('Waiting for token, attempt:', attempts);
                await new Promise(r => setTimeout(r, 500));
            }
        }
        
        if (!token) {
            console.error('No auth token available after retries');
            // Bez tokenu nemůžeme ověřit - NEPOKAZOVAT modal, jen logovat
            // Uživatel zůstane přihlášen, ale nebude mít přístup k placeným funkcím
            return false;
        }
        
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                'x-clerk-token': token,
            },
            body: JSON.stringify({ action: 'check' })
        });

        if (!response.ok) {
            console.error('Subscription check failed:', response.status);
            // Při chybě serveru NEPOKAZOVAT modal automaticky
            // Uživatel může zkusit znovu nebo kontaktovat podporu
            return false;
        }

        const result = await response.json();
        console.log('Subscription status:', result);

        subscriptionData = result;

        if (!result.valid) {
            // Uživatel nemá platné předplatné - zobrazit platební modal
            console.log('No valid subscription, showing payment modal');
            showSubscriptionModal();
            return false;
        } else {
            // Aktualizovat UI v profilu
            updateSubscriptionStatusUI(result);
            return true;
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        // Při network erroru NEPOKAZOVAT modal automaticky
        // Může jít o dočasný problém se sítí
        return false;
    }
}

// Získat Supabase URL
function getSupabaseUrl() {
    return 'https://krwdfxnvhnxtkhtkbadi.supabase.co';
}

// Získat Supabase Anon Key (potřebný pro volání Edge Functions)
function getSupabaseAnonKey() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd2RmeG52aG54dGtodGtiYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzA1NDcsImV4cCI6MjA4MTA0NjU0N30.IKpOTRfPaOwyBSnIpqOK2utwIDnllLM3XcV9NH-tXrA';
}

// Získat Clerk JWT token pro Supabase
// DŮLEŽITÉ: Používá template 'supabase' pro kompatibilitu se Supabase Edge Functions
async function getClerkToken(maxRetries = 1, retryDelay = 500) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!window.Clerk?.session) {
            if (attempt < maxRetries - 1) {
                console.log(`No Clerk session yet, retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, retryDelay));
                continue;
            }
            return null;
        }
        try {
            // Nejdříve zkusit template pro Supabase (pokud existuje v Clerk dashboard)
            let token = null;
            try {
                token = await window.Clerk.session.getToken({ template: 'supabase' });
            } catch (templateError) {
                console.log('Supabase template not found, trying default token...');
            }
            
            // Fallback na standardní token pokud template není nakonfigurován
            if (!token) {
                token = await window.Clerk.session.getToken();
            }
            
            if (token) {
                return token;
            }
            if (attempt < maxRetries - 1) {
                console.log(`No token from session, retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, retryDelay));
            }
        } catch (error) {
            console.error('Error getting Clerk token:', error);
            if (attempt < maxRetries - 1) {
                await new Promise(r => setTimeout(r, retryDelay));
            } else {
                return null;
            }
        }
    }
    return null;
}

// Zobrazit modal předplatného
async function showSubscriptionModal() {
    console.log('showSubscriptionModal: Starting...');
    
    const modal = document.getElementById('subscriptionModal');
    if (!modal) {
        console.error('showSubscriptionModal: Modal not found!');
        return;
    }

    // KRITICKÉ: Unmount Clerk komponenty PŘED skrytím loginModal
    // Toto zabrání tomu, aby Clerk iframe zůstával viditelný
    const signInDiv = document.getElementById('clerk-sign-in');
    if (signInDiv && window.Clerk) {
        try {
            // Zkusit unmount obou variant (signUp i signIn)
            if (signInDiv._clerkMode === 'signUp') {
                window.Clerk.unmountSignUp(signInDiv);
            } else {
                window.Clerk.unmountSignIn(signInDiv);
            }
            signInDiv._clerkMode = null;
            console.log('showSubscriptionModal: Clerk component unmounted');
        } catch(e) {
            console.warn('showSubscriptionModal: Clerk unmount warning:', e.message);
        }
    }

    // NEJPRVE skrýt VŠECHNY ostatní modaly - zabránit překrývání
    const loginModal = document.getElementById('loginModal');
    const loginRequiredModal = document.getElementById('loginRequiredModal');
    const menuDropdown = document.getElementById('menuDropdown');
    
    if (loginModal) {
        loginModal.classList.add('hidden');
        loginModal.style.display = 'none'; // Force hide
    }
    if (loginRequiredModal) {
        loginRequiredModal.classList.add('hidden');
        loginRequiredModal.style.display = 'none';
    }
    if (menuDropdown) {
        menuDropdown.classList.add('hidden');
    }
    
    // ZABLOKOVAT INTERAKCI S APLIKACÍ - přidat třídu na body
    document.body.classList.add('subscription-required');
    
    // Zobrazit modal a ZAJISTIT černé neprůhledné pozadí (inline styl pro jistotu)
    modal.classList.remove('hidden');
    modal.style.background = '#000000';
    modal.style.backdropFilter = 'none';
    modal.style.webkitBackdropFilter = 'none';
    
    // Zajistit správné scroll pozice - modal nahoře
    modal.scrollTop = 0;
    window.scrollTo(0, 0);

    // Skrýt chybovou zprávu
    document.getElementById('subscriptionError')?.classList.add('hidden');
    
    // Získat elementy - s kontrolou existence
    let guestState = document.getElementById('guestState');
    let loggedInState = document.getElementById('loggedInState');
    let locationDetection = document.getElementById('locationDetection');
    
    // Kontrola: pokud elementy neexistují, počkat 100ms a zkusit znovu
    if (!guestState || !loggedInState) {
        console.warn('showSubscriptionModal: Elements not found, waiting for DOM...');
        await new Promise(r => setTimeout(r, 100));
        guestState = document.getElementById('guestState');
        loggedInState = document.getElementById('loggedInState');
        locationDetection = document.getElementById('locationDetection');
    }
    
    // Stále neexistují? Kritická chyba
    if (!guestState && !loggedInState) {
        console.error('showSubscriptionModal: Critical - neither guestState nor loggedInState found!');
        return;
    }
    
    // Zobrazit loader, skrýt oba stavy
    if (locationDetection) locationDetection.classList.remove('hidden');
    if (guestState) guestState.classList.add('hidden');
    if (loggedInState) loggedInState.classList.add('hidden');
    
    // Detekovat lokaci (s timeout pro případ selhání)
    try {
        const locationPromise = detectUserLocation();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location detection timeout')), 5000)
        );
        await Promise.race([locationPromise, timeoutPromise]);
    } catch (error) {
        console.warn('showSubscriptionModal: Location detection failed:', error.message);
        // Nastavit fallback cenu
        userLocation = { grossAmount: 59, currency: 'CZK', vatRate: 21 };
    }
    
    // Skrýt loader
    if (locationDetection) locationDetection.classList.add('hidden');
    
    // Zkontrolovat stav přihlášení
    const isLoggedIn = !!window.Clerk?.user;
    console.log('showSubscriptionModal: isLoggedIn =', isLoggedIn, 'email =', window.Clerk?.user?.primaryEmailAddress?.emailAddress);
    
    // VŽDY zobrazit správný stav podle přihlášení
    if (isLoggedIn && loggedInState) {
        // STAV B: Uživatel je přihlášen → zobrazit potvrzení a tlačítko Zaplatit
        loggedInState.classList.remove('hidden');
        if (guestState) guestState.classList.add('hidden');
        
        // Zobrazit email uživatele
        const emailEl = document.getElementById('loggedInUserEmail');
        if (emailEl) {
            const email = window.Clerk?.user?.primaryEmailAddress?.emailAddress || 
                          window.Clerk?.user?.emailAddresses?.[0]?.emailAddress || 
                          'uživatel';
            emailEl.textContent = email;
        }
        
        // Aktualizovat cenu pro přihlášeného uživatele
        if (userLocation) {
            const currencySymbols = { 'CZK': 'Kč', 'EUR': '€', 'USD': '$' };
            const priceAmountLoggedIn = document.getElementById('priceAmountLoggedIn');
            const priceCurrencyLoggedIn = document.getElementById('priceCurrencyLoggedIn');
            if (priceAmountLoggedIn) priceAmountLoggedIn.textContent = userLocation.grossAmount;
            if (priceCurrencyLoggedIn) priceCurrencyLoggedIn.textContent = currencySymbols[userLocation.currency] || userLocation.currency;
        }
        
        console.log('showSubscriptionModal: Showing State B (logged in)');
    } else if (guestState) {
        // STAV A: Uživatel není přihlášen → zobrazit cenu, features, OP a tlačítko Registrovat
        guestState.classList.remove('hidden');
        if (loggedInState) loggedInState.classList.add('hidden');
        
        // Reset checkbox a tlačítka
        const termsCheckbox = document.getElementById('termsCheckboxGuest');
        if (termsCheckbox) termsCheckbox.checked = false;
        updateGuestPayButton();
        
        console.log('showSubscriptionModal: Showing State A (guest)');
    } else if (loggedInState) {
        // FALLBACK: guestState neexistuje, ale loggedInState ano - použít loggedInState
        console.warn('showSubscriptionModal: guestState not found, using loggedInState as fallback');
        loggedInState.classList.remove('hidden');
    } else {
        // KRITICKÝ FALLBACK: Žádný stav neexistuje - zkusit najít znovu
        console.error('showSubscriptionModal: CRITICAL FALLBACK - trying to force visibility');
        const gs = document.getElementById('guestState');
        const ls = document.getElementById('loggedInState');
        if (gs) gs.classList.remove('hidden');
        else if (ls) ls.classList.remove('hidden');
    }
    
    // Aplikovat překlady na modal
    if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations();
    }
    
    console.log('showSubscriptionModal: Complete');
}

// Aktualizovat stav tlačítka "Registrovat a zaplatit" podle checkboxu OP
function updateGuestPayButton() {
    const termsCheckbox = document.getElementById('termsCheckboxGuest');
    const registerAndPayBtn = document.getElementById('registerAndPayBtn');
    if (registerAndPayBtn && termsCheckbox) {
        registerAndPayBtn.disabled = !termsCheckbox.checked;
    }
}

// Spustit registraci a pak platbu (pro nepřihlášené)
function startRegistrationAndPayment() {
    const termsCheckbox = document.getElementById('termsCheckboxGuest');
    if (!termsCheckbox?.checked) {
        return;
    }
    
    // Uložit flag, že uživatel přišel ze subscription modalu a souhlasil s OP
    localStorage.setItem('liquimixer_from_subscription', 'true');
    localStorage.setItem('liquimixer_terms_accepted', 'true');
    localStorage.setItem('liquimixer_terms_accepted_at', new Date().toISOString());
    
    // Zavřít subscription modal a otevřít Clerk registraci
    hideSubscriptionModal();
    setTimeout(() => {
        showLoginModal('signUp');
    }, 100);
}

// Přejít na přihlášení ze subscription modalu (pro uživatele, kteří už mají účet)
function goToLoginFromSubscription() {
    // Uložit flag, že uživatel přišel ze subscription modalu
    localStorage.setItem('liquimixer_from_subscription', 'true');
    hideSubscriptionModal();
    setTimeout(() => {
        showLoginModal('signIn');
    }, 100);
}

// Skrýt modal předplatného (pouze po úspěšné platbě!)
function hideSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // Odblokovat interakci s aplikací
    document.body.classList.remove('subscription-required');
    
    // Resetovat inline styly na loginModal a loginRequiredModal
    const loginModal = document.getElementById('loginModal');
    const loginRequiredModal = document.getElementById('loginRequiredModal');
    if (loginModal) loginModal.style.display = '';
    if (loginRequiredModal) loginRequiredModal.style.display = '';
}

// Handler pro zavření subscription modalu křížkem
function handleSubscriptionModalClose() {
    // Vyčistit flagy
    localStorage.removeItem('liquimixer_from_subscription');
    hideSubscriptionModal();
}

// Handler pro backdrop click
function handleSubscriptionModalBackdropClick(event) {
    // Povolit zavření kliknutím na pozadí
    if (event.target === event.currentTarget) { 
        handleSubscriptionModalClose();
    }
}

// Detekovat lokaci uživatele - prioritně z i18n, pak geolokace, pak fallback
async function detectUserLocation() {
    // Získat aktuální jazyk z i18n
    const currentLocale = window.i18n?.getLocale() || 'cs';
    
    // Cenové mapy - pouze CZK, EUR, USD
    const priceMap = {
        'CZK': { grossAmount: 59, currency: 'CZK', vatRate: 21 },
        'EUR': { grossAmount: 2.4, currency: 'EUR', vatRate: 20 },
        'USD': { grossAmount: 2.9, currency: 'USD', vatRate: 0 }
    };
    
    // Mapování jazyků na měny (pouze CZK, EUR, USD)
    // CZK: cs
    // USD: en, ko, ja, zh-CN, zh-TW, ar-SA
    // EUR: všechny ostatní
    const currencyByLocale = {
        'cs': 'CZK',
        'en': 'USD',
        'ko': 'USD',
        'ja': 'USD',
        'zh-CN': 'USD',
        'zh-TW': 'USD',
        'ar-SA': 'USD'
        // Všechny ostatní → EUR (default)
    };
    
    try {
        // Zkusit geolokaci pouze pokud je uživatel přihlášen
        if (window.Clerk?.user) {
            const clerkToken = await getClerkToken();
            const response = await fetch(`${getSupabaseUrl()}/functions/v1/geolocation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                    'x-clerk-token': clerkToken || '',
                },
                body: JSON.stringify({ 
                    action: 'detect',
                    data: { clerkId: window.Clerk?.user?.id }
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Geolocation API success:', result.location?.countryCode, result.location);
                userLocation = result.location;
                updatePricingUI(userLocation);
                return;
            } else {
                console.warn('Geolocation API failed:', response.status, await response.text().catch(() => ''));
            }
        }
        
        // Použít měnu podle aktuálního jazyka
        const currency = currencyByLocale[currentLocale] || 'EUR';
        // DŮLEŽITÉ: Fallback vždy na CZ - místo plnění je ČR (OSS režim)
        // Jazyk uživatele != země pro DPH. IP geolokace se použije až bude dostupná.
        console.log('Geolocation fallback: using CZ as default country (OSS regime)');
        userLocation = {
            countryCode: 'CZ', // VŽDY CZ - jazyk není indikátor země pro DPH
            ...priceMap[currency]
        };
        
        updatePricingUI(userLocation);

    } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback vždy na CZ - místo plnění je ČR (OSS režim)
        const currency = currencyByLocale[currentLocale] || 'EUR';
        console.log('Geolocation error fallback: using CZ as default country (OSS regime)');
        userLocation = {
            countryCode: 'CZ', // VŽDY CZ - jazyk není indikátor země pro DPH
            ...priceMap[currency]
        };
        updatePricingUI(userLocation);
    }
}

// Aktualizovat UI s cenami (nový layout - guestState/loggedInState)
function updatePricingUI(location) {
    const currencySymbols = {
        'CZK': 'Kč',
        'EUR': '€',
        'USD': '$'
    };
    const currencySymbol = currencySymbols[location.currency] || location.currency;

    // Aktualizovat cenu v guestState
    const priceAmount = document.getElementById('priceAmount');
    const priceCurrency = document.getElementById('priceCurrency');
    if (priceAmount) priceAmount.textContent = location.grossAmount;
    if (priceCurrency) priceCurrency.textContent = currencySymbol;

    // Aktualizovat cenu v loggedInState
    const priceAmountLoggedIn = document.getElementById('priceAmountLoggedIn');
    const priceCurrencyLoggedIn = document.getElementById('priceCurrencyLoggedIn');
    if (priceAmountLoggedIn) priceAmountLoggedIn.textContent = location.grossAmount;
    if (priceCurrencyLoggedIn) priceCurrencyLoggedIn.textContent = currencySymbol;

    // Aktualizovat DPH info
    const vatInfo = document.getElementById('pricingVatInfo');
    if (vatInfo) {
        if (location.vatRate > 0) {
            vatInfo.textContent = t('subscription.price_includes_vat', 'Cena je včetně DPH');
        } else {
            vatInfo.textContent = '';
        }
    }
}

// Spustit platbu (voláno z Stavu B - uživatel je přihlášen)
async function startPayment() {
    // Ověřit, že uživatel je přihlášen
    if (!window.Clerk || !window.Clerk.user) {
        console.error('User not logged in - cannot start payment');
        showSubscriptionError(t('subscription.error_not_logged_in', 'Pro dokončení platby se nejprve přihlaste.'));
        return;
    }

    const payBtn = document.getElementById('paySubscriptionBtn');
    if (payBtn) {
        payBtn.disabled = true;
        const spanEl = payBtn.querySelector('span');
        if (spanEl) spanEl.textContent = t('subscription.processing', 'Zpracování...');
    }

    try {
        // Pokračovat s platbou
        await processPayment();

    } catch (error) {
        console.error('Payment error:', error);
        showSubscriptionError(t('subscription.error_generic', 'Při zpracování platby došlo k chybě. Zkuste to prosím znovu.'));
        if (payBtn) {
            payBtn.disabled = false;
            const spanEl = payBtn.querySelector('span');
            if (spanEl) spanEl.textContent = t('subscription.pay_button_simple', 'Zaplatit');
        }
    }
}

// Zpracovat platbu (voláno když je uživatel již přihlášen)
async function processPayment() {
    const payBtn = document.getElementById('paySubscriptionBtn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.querySelector('span').textContent = t('subscription.processing', 'Zpracování platby...');
    }
    
    try {
        // DŮLEŽITÉ: Aktualizovat geolokaci před platbou (uživatel se mohl přestěhovat)
        console.log('Refreshing user location before payment...');
        try {
            await detectUserLocation();
            console.log('User location updated:', userLocation?.countryCode);
        } catch (locError) {
            console.warn('Location refresh failed, using cached location:', userLocation?.countryCode);
        }
        
        // Uživatel je již přihlášen (ověřeno v startPayment), získat token
        console.log('Getting Clerk session token...');
        
        // Krátké čekání pro jistotu (session by měla být již stabilní)
        let token = await getClerkToken(3, 500); // 3 pokusy × 500ms = max 1.5 sekundy
        
        if (!token) {
            throw new Error('Could not get authentication token. Please try again.');
        }
        
        console.log('Got Clerk token, creating subscription...');
        
        // 1. Vytvořit předplatné
        const subscriptionResponse = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                'x-clerk-token': token,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    planType: 'yearly',
                    // Jazyk uživatele z localStorage pro fakturu (priorita před lokalizací)
                    locale: localStorage.getItem('liquimixer_locale') || window.i18n?.currentLocale || 'cs',
                    // Země pro DPH účely (aktualizováno z geolokace výše)
                    country: userLocation?.countryCode || 'CZ'
                }
            })
        });

        if (!subscriptionResponse.ok) {
            const errorText = await subscriptionResponse.text();
            console.error('Subscription creation failed:', subscriptionResponse.status, errorText);
            throw new Error('Failed to create subscription');
        }

        const subResult = await subscriptionResponse.json();
        console.log('Subscription created:', subResult.subscription?.id);

        // 2. Vytvořit platbu v GP WebPay (použít stejný token)
        const paymentResponse = await fetch(`${getSupabaseUrl()}/functions/v1/gpwebpay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                'x-clerk-token': token,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    subscriptionId: subResult.subscription.id
                }
            })
        });

        if (!paymentResponse.ok) {
            const paymentErrorData = await paymentResponse.json().catch(() => ({}));
            console.error('Payment creation failed:', paymentResponse.status, JSON.stringify(paymentErrorData));
            throw new Error(`Failed to create payment: ${paymentErrorData.details || paymentErrorData.error || 'Unknown error'}`);
        }

        const payResult = await paymentResponse.json();
        console.log('Payment created, redirect URL:', payResult.redirectUrl);

        // 3. Přesměrovat na platební bránu
        if (payResult.redirectUrl) {
            // Uložit clerk_id před redirectem - pro případ, že session vyprší
            if (window.Clerk?.user?.id) {
                localStorage.setItem('liquimixer_pending_payment_clerk_id', window.Clerk.user.id);
            }
            window.location.href = payResult.redirectUrl;
        } else {
            throw new Error('No redirect URL');
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        showSubscriptionError(t('subscription.error_generic', 'Při zpracování platby došlo k chybě. Zkuste to prosím znovu.'));
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.querySelector('span').textContent = t('subscription.pay_button', 'Zaplatit a aktivovat');
        }
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
        const expiresDate = new Date(data.expiresAt).toLocaleDateString(
            window.i18n?.currentLocale === 'cs' ? 'cs-CZ' : 
            window.i18n?.currentLocale === 'sk' ? 'sk-SK' : 'en-GB'
        );

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

// ============================================
// PŘIPOMÍNKY ZRÁNÍ - UI FUNKCE
// ============================================

// Toggle zobrazení polí pro připomínku
function toggleReminderFields() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.classList.remove('hidden');
            initReminderDates();
        } else {
            fields.classList.add('hidden');
        }
    }
}

// Inicializace datumů pro připomínku
function initReminderDates() {
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    if (!mixDateInput || !reminderDateInput) return;
    const today = new Date();
    const todayStr = formatDateForInput(today);
    mixDateInput.value = todayStr;
    updateReminderDate();
}

// Formátovat datum pro input type="date"
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inicializovat date picker pro všechny date inputy
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"].date-picker-input');
    dateInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.addEventListener('click', function(e) {
            if (typeof this.showPicker === 'function') {
                try { this.showPicker(); } catch (err) { this.focus(); }
            }
        });
    });
}

// Inicializovat date pickery při načtení stránky
document.addEventListener('DOMContentLoaded', initDatePickers);

// Aktualizovat datum připomínky na základě data míchání a typu příchutě
function updateReminderDate() {
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    const infoText = document.getElementById('reminderInfoText');
    if (!mixDateInput || !reminderDateInput || !mixDateInput.value) return;

    const mixDate = new Date(mixDateInput.value);
    let maxSteepingDays = 7;

    if (currentRecipeData) {
        if (currentRecipeData.formType === 'liquidpro' && currentRecipeData.flavors) {
            for (const flavor of currentRecipeData.flavors) {
                if (flavor.type && flavor.type !== 'none') {
                    const flavorData = flavorDatabase[flavor.type];
                    if (flavorData && flavorData.steepingDays > maxSteepingDays) {
                        maxSteepingDays = flavorData.steepingDays;
                    }
                }
            }
        } else if (currentRecipeData.flavorType && currentRecipeData.flavorType !== 'none') {
            const flavorData = flavorDatabase[currentRecipeData.flavorType];
            if (flavorData && flavorData.steepingDays) {
                maxSteepingDays = flavorData.steepingDays;
            }
        }
    }

    const maturityDate = new Date(mixDate);
    maturityDate.setDate(maturityDate.getDate() + maxSteepingDays);
    reminderDateInput.value = formatDateForInput(maturityDate);

    if (infoText) {
        if (maxSteepingDays === 0) {
            infoText.textContent = t('save_recipe.reminder_no_steeping', 'Tato příchuť nevyžaduje zrání.');
        } else {
            const daysText = maxSteepingDays === 1 ? t('common.day', 'den') : 
                (maxSteepingDays >= 2 && maxSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            let text = t('save_recipe.reminder_calculated', `Doporučená doba zrání: ${maxSteepingDays} ${daysText}. Datum můžete upravit.`);
            text = text.replace('{days}', maxSteepingDays.toString()).replace('{daysUnit}', daysText);
            infoText.textContent = text;
        }
    }
}

// Reset polí pro připomínku
function resetReminderFields() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    if (checkbox) checkbox.checked = false;
    if (fields) fields.classList.add('hidden');
    if (mixDateInput) mixDateInput.value = '';
    if (reminderDateInput) reminderDateInput.value = '';
}

// Inicializovat připomínku jako zapnutou s dnešním datem
function initReminderFieldsEnabled() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    const mixDateInput = document.getElementById('mixDate');
    if (checkbox) checkbox.checked = true;
    if (fields) fields.classList.remove('hidden');
    if (mixDateInput) {
        mixDateInput.value = formatDateForInput(new Date());
        initDatePickerElement(mixDateInput);
    }
    const reminderDateInput = document.getElementById('reminderDate');
    if (reminderDateInput) initDatePickerElement(reminderDateInput);
    updateReminderDate();
}

// Inicializovat jeden date picker element
function initDatePickerElement(input) {
    if (!input) return input;
    input.removeAttribute('readonly');
    if (input.dataset.datePickerInit) return input;
    input.dataset.datePickerInit = 'true';
    input.addEventListener('click', function(e) {
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) { this.focus(); }
        }
    });
    return input;
}

// Získat data připomínky z formuláře
function getReminderDataFromForm() {
    const checkbox = document.getElementById('enableReminder');
    if (!checkbox || !checkbox.checked) return null;
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    if (!mixDateInput || !reminderDateInput || !mixDateInput.value || !reminderDateInput.value) return null;

    let flavorType = 'fruit';
    let flavorName = '';
    if (currentRecipeData) {
        if (currentRecipeData.formType === 'liquidpro' && currentRecipeData.flavors) {
            let maxSteeping = 0;
            for (const flavor of currentRecipeData.flavors) {
                if (flavor.type && flavor.type !== 'none') {
                    const flavorData = flavorDatabase[flavor.type];
                    if (flavorData && flavorData.steepingDays > maxSteeping) {
                        maxSteeping = flavorData.steepingDays;
                        flavorType = flavor.type;
                    }
                }
            }
            flavorName = currentRecipeData.flavors
                .filter(f => f.type && f.type !== 'none')
                .map(f => getFlavorName(f.type))
                .join(', ');
        } else if (currentRecipeData.flavorType && currentRecipeData.flavorType !== 'none') {
            flavorType = currentRecipeData.flavorType;
            flavorName = getFlavorName(flavorType);
        }
    }

    return {
        mixed_at: mixDateInput.value,
        remind_at: reminderDateInput.value,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague'
    };
}

// SVG ikony pro připomínky (neonově růžová)
const reminderEditIcon = '<svg class="reminder-icon" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const reminderDeleteIcon = '<svg class="reminder-icon" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

// Vyžádat povolení notifikací s přeloženým promptem
async function requestNotificationPermissionWithPrompt() {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission === 'denied') {
        alert(t('notification.denied', 'Notifikace byly zablokovány. Povolte je v nastavení prohlížeče.'));
        return false;
    }
    
    // Zobrazit přeložený confirm dialog
    const message = t('notification.permission_prompt', 
        'Chcete dostávat upozornění, když bude váš liquid vyzrálý?\n\nPo povolení vám pošleme připomínku v den, kdy bude liquid připraven.');
    
    const userWants = confirm(message);
    if (!userWants) {
        return false;
    }
    
    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Uložit všechny připomínky pro aktuální recept
let allRecipeReminders = [];

// Načíst a zobrazit připomínky pro recept
async function loadRecipeReminders(recipeId, showAll = false) {
    if (!window.Clerk || !window.Clerk.user) return;
    const listContainer = document.getElementById(`remindersList-${recipeId}`);
    if (!listContainer) return;

    try {
        const reminders = await window.LiquiMixerDB.getRecipeReminders(window.Clerk.user.id, recipeId);
        if (!reminders || reminders.length === 0) {
            listContainer.innerHTML = `<div class="no-reminders">${t('recipe_detail.no_reminders', 'Žádné připomínky. Klikněte na tlačítko níže pro přidání.')}</div>`;
            return;
        }

        // Seřadit podle data připomínky (od nejnovější po nejstarší - nejvyšší datum nahoře)
        reminders.sort((a, b) => new Date(b.remind_at) - new Date(a.remind_at));
        allRecipeReminders = reminders;

        const displayCount = showAll ? reminders.length : Math.min(3, reminders.length);
        const displayReminders = reminders.slice(0, displayCount);
        let html = displayReminders.map(reminder => renderReminderItem(reminder, recipeId)).join('');

        if (!showAll && reminders.length > 3) {
            html += `<button type="button" class="show-all-reminders-btn" onclick="loadRecipeReminders('${recipeId}', true)">${t('recipe_detail.show_all_reminders', 'Zobrazit všechny')} (${reminders.length})</button>`;
        } else if (showAll && reminders.length > 3) {
            html += `<button type="button" class="show-all-reminders-btn" onclick="loadRecipeReminders('${recipeId}', false)">${t('recipe_detail.show_less', 'Zobrazit méně')}</button>`;
        }

        listContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading reminders:', error);
        listContainer.innerHTML = `<div class="no-reminders">${t('recipe_detail.reminders_error', 'Chyba při načítání připomínek.')}</div>`;
    }
}

// Renderovat jednu položku připomínky
function renderReminderItem(reminder, recipeId) {
    const mixedDate = new Date(reminder.mixed_at).toLocaleDateString();
    const remindDate = new Date(reminder.remind_at).toLocaleDateString();
    const statusClass = reminder.status === 'sent' ? 'sent' : reminder.status === 'cancelled' ? 'cancelled' : '';

    let statusBadge = '';
    if (reminder.status === 'sent') {
        statusBadge = `<span class="reminder-status-badge sent">✓ ${t('reminder.sent', 'Odesláno')}</span>`;
    } else if (reminder.status === 'cancelled') {
        statusBadge = `<span class="reminder-status-badge cancelled">✕ ${t('reminder.cancelled', 'Zrušeno')}</span>`;
    }

    return `
        <div class="reminder-item ${statusClass}" data-reminder-id="${reminder.id}">
            <div class="reminder-dates">
                <div class="reminder-mixed-date">${t('reminder.mixed_on', 'Namícháno')}: ${mixedDate}</div>
                <div class="reminder-remind-date">${t('reminder.reminder_on', 'Připomínka')}: ${remindDate} ${statusBadge}</div>
            </div>
            ${reminder.status === 'pending' ? `
                <div class="reminder-actions">
                    <button type="button" class="reminder-btn edit" onclick="showEditReminderModal('${reminder.id}', '${recipeId}')">${reminderEditIcon}</button>
                    <button type="button" class="reminder-btn delete" onclick="deleteReminderConfirm('${reminder.id}', '${recipeId}')">${reminderDeleteIcon}</button>
                </div>
            ` : ''}
        </div>
    `;
}

// Aktuální recept pro přidání připomínky
let currentReminderRecipeId = null;
let currentReminderFlavorType = 'fruit';
let currentReminderFlavorName = '';
let currentReminderSteepingDays = 7;
let editingReminderId = null;

function showAddReminderModal(recipeId) {
    if (!window.currentViewingRecipe) return;
    currentReminderRecipeId = recipeId;
    editingReminderId = null;

    const recipe = window.currentViewingRecipe;
    const data = recipe.recipe_data || {};
    currentReminderSteepingDays = 7;
    currentReminderFlavorType = 'fruit';
    currentReminderFlavorName = '';

    if (data.formType === 'liquidpro' && data.flavors) {
        // Liquid PRO - více příchutí
        for (const flavor of data.flavors) {
            if (flavor.type && flavor.type !== 'none') {
                const flavorData = flavorDatabase[flavor.type];
                if (flavorData && flavorData.steepingDays > currentReminderSteepingDays) {
                    currentReminderSteepingDays = flavorData.steepingDays;
                    currentReminderFlavorType = flavor.type;
                }
            }
        }
        currentReminderFlavorName = data.flavors.filter(f => f.type && f.type !== 'none').map(f => getFlavorName(f.type)).join(', ');
    } else if (data.flavorType && data.flavorType !== 'none') {
        // Nový formát - flavorType přímo v datech
        currentReminderFlavorType = data.flavorType;
        currentReminderFlavorName = getFlavorName(currentReminderFlavorType);
        const flavorData = flavorDatabase[currentReminderFlavorType];
        if (flavorData && flavorData.steepingDays) currentReminderSteepingDays = flavorData.steepingDays;
    } else if (data.ingredients && Array.isArray(data.ingredients)) {
        // Starší formát - hledáme flavorType v ingredients
        for (const ing of data.ingredients) {
            if (ing.flavorType && ing.flavorType !== 'none') {
                const flavorData = flavorDatabase[ing.flavorType];
                if (flavorData && flavorData.steepingDays > currentReminderSteepingDays) {
                    currentReminderSteepingDays = flavorData.steepingDays;
                    currentReminderFlavorType = ing.flavorType;
                    currentReminderFlavorName = getFlavorName(ing.flavorType);
                }
            }
        }
    }

    const modal = document.getElementById('addReminderModal');
    if (!modal) { console.error('Add reminder modal not found'); return; }

    const titleEl = modal.querySelector('.menu-title');
    if (titleEl) titleEl.textContent = t('reminder.add_title', 'Přidat míchání');

    const mixDateInput = document.getElementById('reminderMixDate');
    if (mixDateInput) { mixDateInput.value = formatDateForInput(new Date()); initDatePickerElement(mixDateInput); }

    const remindDateInput = document.getElementById('reminderRemindDate');
    if (remindDateInput) initDatePickerElement(remindDateInput);

    updateReminderModalDate();
    modal.classList.remove('hidden');
}

function showEditReminderModal(reminderId, recipeId) {
    const reminder = allRecipeReminders.find(r => r.id === reminderId);
    if (!reminder) { console.error('Reminder not found:', reminderId); return; }

    currentReminderRecipeId = recipeId;
    editingReminderId = reminderId;

    const modal = document.getElementById('addReminderModal');
    if (!modal) return;

    const titleEl = modal.querySelector('.menu-title');
    if (titleEl) titleEl.textContent = t('reminder.edit_title', 'Upravit připomínku');

    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    if (mixDateInput) { mixDateInput.value = reminder.mixed_at; initDatePickerElement(mixDateInput); }
    if (remindDateInput) { remindDateInput.value = reminder.remind_at; initDatePickerElement(remindDateInput); }

    modal.classList.remove('hidden');
}

function hideAddReminderModal() {
    const modal = document.getElementById('addReminderModal');
    if (modal) modal.classList.add('hidden');
    currentReminderRecipeId = null;
    editingReminderId = null;
}

function updateReminderModalDate() {
    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    const infoText = document.getElementById('reminderModalInfo');
    if (!mixDateInput || !remindDateInput || !mixDateInput.value) return;

    const mixDate = new Date(mixDateInput.value);
    const maturityDate = new Date(mixDate);
    maturityDate.setDate(maturityDate.getDate() + currentReminderSteepingDays);
    remindDateInput.value = formatDateForInput(maturityDate);

    if (infoText) {
        const daysText = currentReminderSteepingDays === 1 ? t('common.day', 'den') : 
            (currentReminderSteepingDays >= 2 && currentReminderSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
        let text = t('save_recipe.reminder_calculated', `Doporučená doba zrání: ${currentReminderSteepingDays} ${daysText}. Datum můžete upravit.`);
        text = text.replace('{days}', currentReminderSteepingDays.toString()).replace('{daysUnit}', daysText);
        infoText.textContent = text;
    }
}

async function saveReminderFromModal(event) {
    if (event) event.preventDefault();
    if (!window.Clerk || !window.Clerk.user) return false;

    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    if (!mixDateInput || !remindDateInput || !mixDateInput.value || !remindDateInput.value) {
        alert(t('reminder.fill_dates', 'Vyplňte prosím obě data.'));
        return false;
    }

    const mixDate = mixDateInput.value;
    const remindDate = remindDateInput.value;

    if (isNaN(new Date(mixDate).getTime()) || isNaN(new Date(remindDate).getTime())) {
        alert(t('reminder.invalid_date', 'Neplatný formát data.'));
        return false;
    }

    try {
        if (editingReminderId) {
            const updated = await window.LiquiMixerDB.updateReminder(window.Clerk.user.id, editingReminderId, { mixed_at: mixDate, remind_at: remindDate });
            if (updated) { alert(t('reminder.updated', 'Připomínka byla upravena!')); }
            else { alert(t('reminder.update_error', 'Chyba při úpravě připomínky.')); return false; }
        } else {
            const recipe = window.currentViewingRecipe;
            await saveNewReminder(currentReminderRecipeId, mixDate, remindDate, currentReminderFlavorType, currentReminderFlavorName, recipe?.name || '');
        }
        hideAddReminderModal();
        if (currentReminderRecipeId) loadRecipeReminders(currentReminderRecipeId);
    } catch (error) {
        console.error('Error saving reminder:', error);
        alert(t('reminder.save_error', 'Chyba při ukládání připomínky.'));
    }

    return false;
}

async function saveNewReminder(recipeId, mixDate, remindDate, flavorType, flavorName, recipeName) {
    if (!window.Clerk || !window.Clerk.user) return false;
    const reminderData = {
        recipe_id: recipeId,
        mixed_at: mixDate,
        remind_at: remindDate,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        recipe_name: recipeName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague'
    };
    try {
        const saved = await window.LiquiMixerDB.saveReminder(window.Clerk.user.id, reminderData);
        if (saved) { alert(t('reminder.saved', 'Připomínka byla uložena!')); return true; }
        return false;
    } catch (error) {
        console.error('Error saving reminder:', error);
        return false;
    }
}

async function deleteReminderConfirm(reminderId, recipeId) {
    if (!window.Clerk || !window.Clerk.user) return;
    if (!confirm(t('reminder.delete_confirm', 'Opravdu chcete smazat tuto připomínku?'))) return;
    try {
        const deleted = await window.LiquiMixerDB.deleteReminder(window.Clerk.user.id, reminderId);
        if (deleted) { loadRecipeReminders(recipeId); }
        else { alert(t('reminder.delete_error', 'Chyba při mazání připomínky.')); }
    } catch (error) {
        console.error('Error deleting reminder:', error);
        alert(t('reminder.delete_error', 'Chyba při mazání připomínky.'));
    }
}

// Export funkcí pro připomínky
window.toggleReminderFields = toggleReminderFields;
window.updateReminderDate = updateReminderDate;
window.initReminderFieldsEnabled = initReminderFieldsEnabled;
window.loadRecipeReminders = loadRecipeReminders;
window.showAddReminderModal = showAddReminderModal;
window.showEditReminderModal = showEditReminderModal;
window.hideAddReminderModal = hideAddReminderModal;
window.updateReminderModalDate = updateReminderModalDate;
window.saveReminderFromModal = saveReminderFromModal;
window.deleteReminderConfirm = deleteReminderConfirm;

// =========================================
// EXPORT: Funkce pro globalni pristup z onclick
// =========================================
window.toggleMenu = toggleMenu;
window.handleLoginFromRequired = handleLoginFromRequired;
window.handleRegisterFromRequired = handleRegisterFromRequired;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.handleLoginModalClose = handleLoginModalClose;
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
window.showSaveAsNewModal = showSaveAsNewModal;
window.showSaveChangesModal = showSaveChangesModal;
window.goBackToCalculator = goBackToCalculator;
window.hideSaveRecipeModal = hideSaveRecipeModal;
window.saveRecipe = saveRecipe;
window.saveSharedRecipe = saveSharedRecipe;
window.confirmAndShowSharedRecipe = confirmAndShowSharedRecipe;
window.showMyRecipes = showMyRecipes;
window.signOut = signOut;
window.viewRecipeDetail = viewRecipeDetail;
window.editSavedRecipe = editSavedRecipe;
window.deleteRecipe = deleteRecipe;
window.shareRecipe = shareRecipe;
window.shareProduct = shareProduct;
window.showLoginForSharedRecipe = showLoginForSharedRecipe;
window.handleSharedRecipeLogin = handleSharedRecipeLogin;
window.removeSharedProductRow = removeSharedProductRow;
window.addProductRow = addProductRow;
window.removeProductRow = removeProductRow;
window.filterProductOptions = filterProductOptions;
window.onProductSelected = onProductSelected;
window.showFavoriteProducts = showFavoriteProducts;
window.showAddProductForm = showAddProductForm;
window.cancelProductForm = cancelProductForm;
window.saveProduct = saveProduct;
window.viewProductDetail = viewProductDetail;
window.viewSharedProductDetail = viewSharedProductDetail;
window.copySharedProductToUser = copySharedProductToUser;
window.goBackFromSharedProduct = goBackFromSharedProduct;
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
window.handleSubscriptionModalClose = handleSubscriptionModalClose;
window.handleSubscriptionModalBackdropClick = handleSubscriptionModalBackdropClick;
window.startPayment = startPayment;
window.processPayment = processPayment;
window.goToLoginFromSubscription = goToLoginFromSubscription;
window.startRegistrationAndPayment = startRegistrationAndPayment;
window.updateGuestPayButton = updateGuestPayButton;
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
// Form tabs
window.switchFormTab = switchFormTab;
window.updateFormTabsState = updateFormTabsState;
// Multi-flavor PRO
window.addProFlavor = addProFlavor;
window.removeProFlavor = removeProFlavor;
window.updateProFlavorType = updateProFlavorType;
window.adjustProFlavor = adjustProFlavor;
window.updateProFlavorStrength = updateProFlavorStrength;
window.adjustProFlavorRatio = adjustProFlavorRatio;
window.updateProFlavorRatioDisplay = updateProFlavorRatioDisplay;

