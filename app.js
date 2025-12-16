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
    { min: 0, max: 0, color: '#00cc66', text: 'Bez nikotinu - vhodné pro nekuřáky nebo postupné odvykání.' },
    { min: 1, max: 3, color: '#00aaff', text: 'Velmi slabý nikotin - pro příležitostné vapery a finální fáze odvykání.' },
    { min: 4, max: 6, color: '#0088dd', text: 'Slabý nikotin - pro lehké kuřáky (do 10 cigaret denně).' },
    { min: 7, max: 11, color: '#00cc88', text: 'Střední nikotin - pro středně silné kuřáky (10-20 cigaret denně).' },
    { min: 12, max: 20, color: '#ffaa00', text: 'Pro silné kuřáky, silné cigarety, bez předchozí zkušenosti hrozí nevolnost.' },
    { min: 21, max: 35, color: '#ff6600', text: 'Vysoký nikotin - pouze pro velmi silné kuřáky nebo pod-systémy. Nikotinová sůl doporučena.' },
    { min: 36, max: 45, color: '#ff0044', text: 'Extrémně silný - pouze pro pod-systémy s nikotinovou solí. Nebezpečí předávkování!' }
];

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
                    // Zavřít login modal
                    hideLoginModal();
                    
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
        
        // Mount Clerk UserButton or UserProfile
        if (clerkLoaded && window.Clerk) {
            const profileDiv = document.getElementById('clerk-user-profile');
            if (profileDiv) {
                // SECURITY: Escapovat uživatelská data proti XSS
                const safeEmail = escapeHtml(window.Clerk.user?.emailAddresses[0]?.emailAddress || '');
                const safeName = escapeHtml(window.Clerk.user?.fullName || '');
                
                // Získat dostupné jazyky pro výběr
                const availableLocales = window.i18n?.getAvailableLocales() || [];
                const currentLocale = window.i18n?.getLocale() || 'cs';
                
                // Vytvořit options pro select
                let languageOptions = '';
                if (availableLocales.length > 0) {
                    availableLocales.forEach(locale => {
                        const selected = locale.code === currentLocale ? 'selected' : '';
                        languageOptions += `<option value="${escapeHtml(locale.code)}" ${selected}>${escapeHtml(locale.native_name)}</option>`;
                    });
                } else {
                    // Fallback pokud nejsou načtené lokalizace
                    languageOptions = `
                        <option value="cs" ${currentLocale === 'cs' ? 'selected' : ''}>Čeština</option>
                        <option value="en" ${currentLocale === 'en' ? 'selected' : ''}>English</option>
                        <option value="de" ${currentLocale === 'de' ? 'selected' : ''}>Deutsch</option>
                        <option value="sk" ${currentLocale === 'sk' ? 'selected' : ''}>Slovenčina</option>
                        <option value="pl" ${currentLocale === 'pl' ? 'selected' : ''}>Polski</option>
                    `;
                }
                
                profileDiv.innerHTML = `
                    <div class="user-info">
                        <p class="user-email">${safeEmail}</p>
                        <p class="user-name">${safeName}</p>
                    </div>
                    <div class="user-settings">
                        <div class="setting-row">
                            <label class="setting-label" for="userLanguageSelect">
                                <span class="setting-icon">🌐</span>
                                <span data-i18n="settings.language">Jazyk</span>
                            </label>
                            <select id="userLanguageSelect" class="neon-select language-select" onchange="handleLanguageChange(this.value)">
                                ${languageOptions}
                            </select>
                        </div>
                    </div>
                    <div class="user-profile-buttons">
                        <button class="neon-button" onclick="showMyRecipes()">Mé recepty</button>
                        <button class="neon-button" onclick="showFavoriteProducts()">Oblíbené produkty</button>
                        <button class="neon-button logout-btn" onclick="handleSignOut()">Odhlásit se</button>
                    </div>
                `;
                
                // Aplikovat překlady na nově přidané elementy
                if (window.i18n?.applyTranslations) {
                    window.i18n.applyTranslations();
                }
            }
        }
    }
}

// Zpracovat změnu jazyka
async function handleLanguageChange(locale) {
    if (!locale) return;
    
    // Změnit jazyk v i18n modulu (uloží do localStorage)
    if (window.i18n?.setLocale) {
        await window.i18n.setLocale(locale);
    }
    
    // Uložit do databáze pokud je uživatel přihlášen
    if (window.Clerk?.user?.id && window.LiquiMixerDB?.saveUserLocale) {
        try {
            await window.LiquiMixerDB.saveUserLocale(window.Clerk.user.id, locale);
            console.log('User locale saved to database:', locale);
        } catch (err) {
            console.error('Error saving locale to database:', err);
        }
    }
    
    // Aktualizovat UI
    showUserProfileModal();
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
    if (!clerkLoaded || !window.Clerk || !window.Clerk.user) {
        alert('Pro uložení receptu se prosím přihlaste.');
        showLoginModal();
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
        alert('Nemáte žádné oblíbené produkty. Nejprve je přidejte v sekci Oblíbené produkty.');
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
        alert('Pro uložení receptu se prosím přihlaste.');
        return false;
    }
    
    const name = document.getElementById('recipeName').value;
    const description = document.getElementById('recipeDescription').value;
    const rating = parseInt(document.getElementById('recipeRating').value) || 0;
    
    // Kontrola, zda jde o úpravu nebo nový recept
    const isEditing = !!window.editingRecipeId;
    
    // Pro nový recept potřebujeme data receptu
    if (!isEditing && !currentRecipeData) {
        alert('Chyba: Není co uložit. Prosím vytvořte recept.');
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
                alert(`Recept byl úspěšně upraven!${productInfo}`);
                // Obnovit detail receptu
                await viewRecipeDetail(window.editingRecipeId);
            } else {
                const successMessage = `Recept byl úspěšně uložen!\n\n` +
                    `📋 ID receptu: ${saved.id}${productInfo}\n` +
                    `🔗 Odkaz pro sdílení:\n${saved.share_url || SHARE_DOMAIN + '/?recipe=' + saved.share_id}`;
                alert(successMessage);
            }
            
            hideSaveRecipeModal();
        } else {
            alert('Chyba při ukládání receptu. Zkuste to prosím znovu.');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Chyba při ukládání receptu.');
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
        alert('Pro zobrazení receptů se prosím přihlaste.');
        return;
    }
    
    const container = document.getElementById('recipesListContainer');
    container.innerHTML = '<p class="no-recipes-text">Načítám recepty...</p>';
    
    // Reset vyhledávacích filtrů
    resetRecipeFilters();
    
    showPage('my-recipes');
    
    try {
        const recipes = await window.LiquiMixerDB.getRecipes(window.Clerk.user.id);
        allUserRecipes = recipes || []; // Uložit pro filtrování
        
        renderRecipesList(allUserRecipes);
    } catch (error) {
        console.error('Chyba při načítání receptů:', error);
        container.innerHTML = '<p class="no-recipes-text" style="color: var(--neon-pink);">Chyba při načítání receptů.</p>';
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
        container.innerHTML = '<p class="no-recipes-text">Zatím nemáte žádné uložené recepty.</p>';
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
            alert('Recept nenalezen.');
            return;
        }
        
        currentViewingRecipe = recipe;
        
        // Načíst propojené produkty
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(window.Clerk.user.id, recipeId);
        
        displayRecipeDetail(recipe, 'recipeDetailTitle', 'recipeDetailContent', linkedProducts);
        showPage('recipe-detail');
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        alert('Chyba při načítání receptu.');
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
    const date = new Date(recipe.created_at).toLocaleDateString('cs-CZ');
    const data = recipe.recipe_data || {};
    
    // SECURITY: Escapování popisku
    const safeDescription = escapeHtml(recipe.description);
    
    let ingredientsHtml = '';
    if (data.ingredients && Array.isArray(data.ingredients)) {
        ingredientsHtml = `
            <h4 class="recipe-ingredients-title">Složky</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Složka</th>
                        <th>Objem (ml)</th>
                        <th>Procento</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.ingredients.map(ing => `
                        <tr>
                            <td>${escapeHtml(ing.name)}</td>
                            <td>${parseFloat(ing.volume || 0).toFixed(2)}</td>
                            <td>${parseFloat(ing.percent || 0).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
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
                <h4 class="recipe-ingredients-title">Použité produkty</h4>
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
                <div class="recipe-info-label">Celkový objem</div>
                <div class="recipe-info-value">${safeTotal} ml</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">Poměr VG/PG</div>
                <div class="recipe-info-value">${safeVg}:${safePg}</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">Nikotin</div>
                <div class="recipe-info-value">${safeNicotine} mg/ml</div>
            </div>
        </div>
        
        ${ingredientsHtml}
        ${linkedProductsHtml}
        
        <div class="recipe-meta-info">
            <p class="recipe-date">Vytvořeno: ${date}</p>
        </div>
    `;
}

// Upravit uložený recept
async function editSavedRecipe() {
    if (!currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert('Pro úpravu receptu se prosím přihlaste.');
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
    if (!currentViewingRecipe || !currentViewingRecipe.share_id) {
        alert('Tento recept nelze sdílet.');
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
        alert('Odkaz byl zkopírován do schránky!\n\n' + url);
    }).catch(() => {
        prompt('Zkopírujte tento odkaz:', url);
    });
}

// Sdílet oblíbený produkt
function shareProduct() {
    if (!currentViewingProduct || !currentViewingProduct.share_id) {
        alert('Tento produkt nelze sdílet.');
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
        alert('Pro smazání receptu se prosím přihlaste.');
        return;
    }
    
    const recipeName = currentViewingRecipe.name || 'Tento recept';
    
    if (!confirm(`Opravdu chcete smazat recept "${recipeName}"?\n\nTato akce je nevratná.`)) {
        return;
    }
    
    try {
        const success = await window.LiquiMixerDB.deleteRecipe(
            window.Clerk.user.id, 
            currentViewingRecipe.id
        );
        
        if (success) {
            alert('Recept byl smazán.');
            currentViewingRecipe = null;
            showMyRecipes();
        } else {
            alert('Chyba při mazání receptu.');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Chyba při mazání receptu.');
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
    
    // Uložit shareId pro pozdější načtení po přihlášení
    window.pendingSharedRecipeId = shareId;
    
    // Počkat na inicializaci Supabase a Clerk
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
    }
    
    // Počkat na Clerk
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Zkontrolovat přihlášení
    if (!window.Clerk || !window.Clerk.user) {
        // Zobrazit stránku s výzvou k přihlášení
        showSharedRecipeLoginPrompt();
        return true;
    }
    
    // Uživatel je přihlášen, načíst recept
    return await loadSharedRecipeContent(shareId);
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
            contentEl.innerHTML = '<p class="no-recipes-text">Recept nebyl nalezen nebo byl smazán.</p>';
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
    
    if (!window.Clerk || !window.Clerk.user) {
        alert('Pro zobrazení produktů se prosím přihlaste.');
        return;
    }
    
    const container = document.getElementById('productsListContainer');
    container.innerHTML = '<p class="no-products-text">Načítám produkty...</p>';
    
    // Reset vyhledávacích filtrů
    resetProductFilters();
    
    showPage('favorite-products');
    
    try {
        const products = await window.LiquiMixerDB.getProducts(window.Clerk.user.id);
        allUserProducts = products || []; // Uložit pro filtrování
        
        renderProductsList(allUserProducts);
    } catch (error) {
        console.error('Chyba při načítání produktů:', error);
        container.innerHTML = '<p class="no-products-text" style="color: var(--neon-pink);">Chyba při načítání produktů.</p>';
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
        container.innerHTML = '<p class="no-products-text">Zatím nemáte žádné oblíbené produkty.</p>';
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
            alert('Produkt nenalezen.');
            return;
        }
        
        currentViewingProduct = product;
        displayProductDetail(product);
        showPage('product-detail');
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Chyba při načítání produktu.');
    }
}

// Zobrazit detail produktu v UI
function displayProductDetail(product) {
    const titleEl = document.getElementById('productDetailTitle');
    const contentEl = document.getElementById('productDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const date = new Date(product.created_at).toLocaleDateString('cs-CZ');
    const typeLabel = productTypeLabels[product.product_type] || 'Příchuť';
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
                        Otevřít odkaz na produkt
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
            <p class="product-date">Přidáno: ${date}</p>
        </div>
    `;
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
    if (!currentViewingProduct) return;
    
    document.getElementById('productFormTitle').textContent = 'Upravit produkt';
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
    
    selectedProductRating = currentViewingProduct.rating || 0;
    updateProductStarDisplay(selectedProductRating);
    initProductStarRating();
    
    showPage('product-form');
}

// Smazat produkt
async function deleteProduct() {
    if (!currentViewingProduct) return;
    
    if (!confirm('Opravdu chcete smazat tento produkt?')) return;
    
    try {
        const success = await window.LiquiMixerDB.deleteProduct(window.Clerk.user.id, currentViewingProduct.id);
        
        if (success) {
            alert('Produkt byl smazán.');
            currentViewingProduct = null;
            showFavoriteProducts();
        } else {
            alert('Chyba při mazání produktu.');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Chyba při mazání produktu.');
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
    
    if (!window.Clerk || !window.Clerk.user) {
        alert('Pro uložení produktu se prosím přihlaste.');
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
        alert('Název produktu je povinný.');
        return false;
    }
    
    if (!productType) {
        alert('Vyberte typ produktu.');
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
            alert(editingId ? 'Produkt byl aktualizován!' : 'Produkt byl uložen!');
            showFavoriteProducts();
        } else {
            alert('Chyba při ukládání produktu.');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Chyba při ukládání produktu.');
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
        alert('Povolené formáty: JPEG, PNG, WebP, GIF');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('Maximální velikost obrázku je 5MB.');
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
        alert('Váš prohlížeč nepodporuje přístup ke kameře.');
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

function updateRatioDisplay() {
    const vg = parseInt(vgPgRatioSlider.value);
    const pg = 100 - vg;
    
    document.getElementById('vgValue').textContent = vg;
    document.getElementById('pgValue').textContent = pg;
    
    // Find matching description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('ratioDescription');
        descEl.textContent = desc.text;
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
                reasons.push(`nikotinová báze (${nicVgPercent}/${nicPgPercent})`);
            }
            if (flavorVolume > 0) {
                reasons.push(`příchuť (${flavorPercent}%, VG/PG ${flavorVgPercent}/${flavorPgPercent})`);
            }
            warningEl.textContent = `Poměr omezen na ${effectiveMinVg}–${effectiveMaxVg}% VG kvůli: ${reasons.join(', ')}.`;
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
        descEl.textContent = desc.text;
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
        text = `Slabá až žádná chuť (doporučeno ${flavor.min}–${flavor.max}%)`;
        trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > flavor.max) {
        color = '#ff0044';
        text = `Výrazná nebo přeslazená chuť (doporučeno ${flavor.min}–${flavor.max}%)`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        text = `Ideální chuť (${flavor.min}–${flavor.max}%) - ${flavor.note}`;
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
    // =========================================
    const DROPS_PER_ML = 20;
    const ingredients = [];

    if (nicotineVolume > 0) {
        const nicotineName = nicotineType === 'salt' ? 'Nikotinová sůl' : 'Nikotin booster';
        const nicotineRatioValue = document.getElementById('nicotineRatio').value;
        ingredients.push({
            name: `${nicotineName} (${baseNicotine} mg/ml, VG/PG ${nicotineRatioValue})`,
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    if (flavorVolume > 0) {
        const flavor = flavorDatabase[flavorType];
        const flavorRatioValue = document.getElementById('flavorRatio').value;
        ingredients.push({
            name: `${flavor.name} příchuť (VG/PG ${flavorRatioValue})`,
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    // Add carrier liquids (no drops for these - measured in ml)
    if (purePgNeeded > 0.01) {
        ingredients.push({
            name: 'Propylenglykol (PG) - nosná látka',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }

    if (pureVgNeeded > 0.01) {
        ingredients.push({
            name: 'Rostlinný glycerin (VG) - nosná látka',
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

    // Display results
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, actualTotal, actualVg, actualPg);
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg) {
    document.getElementById('resultTotal').textContent = `${total} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${nicotine} mg/ml`;

    // Uložit data receptu pro možnost pozdějšího uložení
    storeCurrentRecipe({
        totalAmount: total,
        vgPercent: vg,
        pgPercent: pg,
        nicotine: nicotine,
        ingredients: ingredients.map(ing => ({
            name: ing.name,
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

        row.innerHTML = `
            <td class="ingredient-name">${ing.name}</td>
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
        <td class="ingredient-name">CELKEM</td>
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
            <li>Nejprve přidejte nikotin (pokud používáte) - pracujte v rukavicích!</li>
            <li>Poté přidejte příchutě</li>
            <li>Nakonec doplňte PG a VG nosné látky</li>
            <li>Důkladně protřepejte a nechte zrát 1-2 týdny</li>
            <li>Skutečný poměr VG/PG ve směsi: ${actualVgPercent}% / ${actualPgPercent}%</li>
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
            descEl.textContent = desc.text;
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
            descEl.textContent = desc.text;
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
            warningEl.textContent = `Poměr omezen na ${diluteLimits.min}–${diluteLimits.max}% VG kvůli poměru v nikotinové bázi.`;
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
            warningEl.textContent = `Cílová síla nemůže být vyšší než zdrojová (${baseStrength} mg/ml).`;
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
    
    // Build results
    const nicotineName = nicotineType === 'salt' ? 'Nikotinová sůl' : 'Nikotin booster';
    const ingredients = [];
    
    ingredients.push({
        name: `${nicotineName} (${baseStrength} mg/ml, VG/PG ${sourceVg}/${sourcePg})`,
        volume: nicotineVolume,
        percent: (nicotineVolume / totalAmount) * 100
    });
    
    if (purePgNeeded > 0.01) {
        ingredients.push({
            name: 'Propylenglykol (PG)',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100
        });
    }
    
    if (pureVgNeeded > 0.01) {
        ingredients.push({
            name: 'Rostlinný glycerin (VG)',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100
        });
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
        row.innerHTML = `
            <td class="ingredient-name">${ing.name}</td>
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
        <td class="ingredient-name">CELKEM</td>
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
        descEl.textContent = desc.text;
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
        descEl.textContent = desc.text;
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
                reasons.push(`nikotinová báze (${nicVgPercent}/${nicPgPercent})`);
            }
            if (flavorVolume > 0) {
                reasons.push(`příchuť (${flavorVolume} ml, VG/PG ${flavorVgPercent}/${flavorPgPercent})`);
            }
            warningEl.textContent = `Poměr omezen na ${svVgPgLimits.min}–${svVgPgLimits.max}% VG kvůli: ${reasons.join(', ')}.`;
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
            name: `Příchuť (již v lahvičce, VG/PG ${svFlavorRatio})`,
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }
    
    if (nicotineVolume > 0) {
        const nicotineName = nicotineType === 'salt' ? 'Nikotinová sůl' : 'Nikotin booster';
        const nicotineRatioValue = document.getElementById('svNicotineRatio').value;
        ingredients.push({
            name: `${nicotineName} (${baseNicotine} mg/ml, VG/PG ${nicotineRatioValue})`,
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }
    
    if (purePgNeeded > 0.01) {
        ingredients.push({
            name: 'Propylenglykol (PG) - nosná látka',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    if (pureVgNeeded > 0.01) {
        ingredients.push({
            name: 'Rostlinný glycerin (VG) - nosná látka',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;
    
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg);
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

function updateProFlavorType() {
    const type = document.getElementById('proFlavorType').value;
    const strengthContainer = document.getElementById('proFlavorStrengthContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
    } else {
        strengthContainer.classList.remove('hidden');
        const flavor = flavorDatabase[type];
        document.getElementById('proFlavorStrength').value = flavor.ideal;
        updateProFlavorDisplay();
    }
    
    updateProVgPgLimits();
}

function adjustProFlavor(change) {
    const slider = document.getElementById('proFlavorStrength');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(30, newValue));
    slider.value = newValue;
    updateProFlavorDisplay();
}

function updateProFlavorDisplay() {
    const value = parseInt(document.getElementById('proFlavorStrength').value);
    const type = document.getElementById('proFlavorType').value;
    const flavor = flavorDatabase[type];
    const displayEl = document.getElementById('proFlavorValue');
    const displayContainer = displayEl.parentElement;
    const trackEl = document.getElementById('proFlavorTrack');

    displayEl.textContent = value;

    let color;
    if (value < flavor.min) {
        color = '#ffaa00';
        trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > flavor.max) {
        color = '#ff0044';
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #00aaff)`;
    }

    // Set color on container so unit has same color as number
    displayEl.style.color = 'inherit';
    displayContainer.style.color = color;

    updateProVgPgLimits();
}

function adjustProFlavorRatio(change) {
    const slider = document.getElementById('proFlavorRatioSlider');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateProFlavorRatioDisplay();
}

function updateProFlavorRatioDisplay() {
    const slider = document.getElementById('proFlavorRatioSlider');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    document.getElementById('proFlavorVgValue').textContent = vg;
    document.getElementById('proFlavorPgValue').textContent = pg;
    
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const trackEl = document.getElementById('proFlavorTrackRatio');
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
    }
    
    updateProVgPgLimits();
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
    const flavorType = document.getElementById('proFlavorType').value;
    const flavorPercent = flavorType !== 'none' ? parseFloat(document.getElementById('proFlavorStrength').value) : 0;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    const flavorVolume = (flavorPercent / 100) * totalAmount;
    
    // Get VG/PG from sliders (using Number() to properly handle 0 as valid value)
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;

    const flavorSliderValue = flavorType !== 'none' ? document.getElementById('proFlavorRatioSlider').value : '0';
    const flavorVgPercent = flavorSliderValue !== '' ? Number(flavorSliderValue) : 0;
    const flavorPgPercent = 100 - flavorVgPercent;
    
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);
    
    const flavorVgVolume = flavorVolume * (flavorVgPercent / 100);
    const flavorPgVolume = flavorVolume * (flavorPgPercent / 100);
    
    const fixedPgVolume = nicotinePgVolume + flavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + flavorVgVolume;
    
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
                reasons.push(`nikotinová báze (${nicVgPercent}/${nicPgPercent})`);
            }
            if (flavorVolume > 0) {
                reasons.push(`příchuť (${flavorPercent}%, VG/PG ${flavorVgPercent}/${flavorPgPercent})`);
            }
            warningEl.textContent = `Poměr omezen na ${proVgPgLimits.min}–${proVgPgLimits.max}% VG kvůli: ${reasons.join(', ')}.`;
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
    const flavorType = document.getElementById('proFlavorType').value;
    const flavorPercent = flavorType !== 'none' ? parseFloat(document.getElementById('proFlavorStrength').value) : 0;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    const flavorVolume = (flavorPercent / 100) * totalAmount;
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;
    
    // Get VG/PG ratios from sliders (using Number() to properly handle 0 as valid value)
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;

    const flavorSliderValue = flavorType !== 'none' ? document.getElementById('proFlavorRatioSlider').value : '0';
    const flavorVgPercent = flavorSliderValue !== '' ? Number(flavorSliderValue) : 0;
    const flavorPgPercent = 100 - flavorVgPercent;
    
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    }
    
    const flavorVgContent = flavorVolume * (flavorVgPercent / 100);
    const flavorPgContent = flavorVolume * (flavorPgPercent / 100);
    
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
    
    if (nicotineVolume > 0) {
        const nicotineName = nicotineType === 'salt' ? 'Nikotinová sůl' : 'Nikotin booster';
        ingredients.push({
            name: `${nicotineName} (${baseNicotine} mg/ml, VG/PG ${nicVgPercent}/${nicPgPercent})`,
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }
    
    if (flavorVolume > 0) {
        const flavor = flavorDatabase[flavorType];
        ingredients.push({
            name: `${flavor.name} příchuť (VG/PG ${flavorVgPercent}/${flavorPgPercent})`,
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }
    
    if (purePgNeeded > 0.01) {
        ingredients.push({
            name: 'Propylenglykol (PG) - nosná látka',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    if (pureVgNeeded > 0.01) {
        ingredients.push({
            name: 'Rostlinný glycerin (VG) - nosná látka',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100,
            drops: null,
            showDrops: false
        });
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;
    
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg);
    showPage('results');
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
window.handleLanguageChange = handleLanguageChange;
window.showPage = showPage;
window.goHome = goHome;
window.goBack = goBack;
window.calculateMixture = calculateMixture;
window.storeCurrentRecipe = storeCurrentRecipe;
window.showSaveRecipeModal = showSaveRecipeModal;
window.hideSaveRecipeModal = hideSaveRecipeModal;
window.saveRecipe = saveRecipe;
window.showMyRecipes = showMyRecipes;
window.viewRecipeDetail = viewRecipeDetail;
window.editSavedRecipe = editSavedRecipe;
window.deleteRecipe = deleteRecipe;
window.shareRecipe = shareRecipe;
window.shareProduct = shareProduct;
window.addProductRow = addProductRow;
window.removeProductRow = removeProductRow;
window.filterProductOptions = filterProductOptions;
window.onProductSelected = onProductSelected;
window.showFavoriteProducts = showFavoriteProducts;
window.showAddProductForm = showAddProductForm;
window.cancelProductForm = cancelProductForm;
window.saveProduct = saveProduct;
window.viewProductDetail = viewProductDetail;
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
