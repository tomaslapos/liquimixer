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
// composition = složení příchutě pro přesný výpočet (pg, vg, alcohol, water, other v %)
const flavorDatabase = {
    // === LIQUID PŘÍCHUTĚ (isShishaOnly: false) ===
    none: { 
        name: 'Žádná (bez příchutě)', 
        min: 0, max: 0, ideal: 0, steepingDays: 0,
        shishaMin: 0, shishaMax: 0, shishaIdeal: 0, shishaSteepingDays: 0,
        isShishaOnly: false,
        note: 'Čistá báze PG/VG + nikotin',
        composition: { pg: 0, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    fruit: { 
        name: 'Ovoce (jahoda, jablko)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Optimum: 10%, zrání 3–7 dní',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    citrus: { 
        name: 'Citrónové (citron, limeta)', 
        min: 6, max: 10, ideal: 8, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Silné kyseliny, méně stačí',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    berry: { 
        name: 'Bobulové (borůvka, malina)', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Vyvážené, dobře fungují s 50/50 PG/VG',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    tropical: { 
        name: 'Tropické (ananas, mango)', 
        min: 12, max: 18, ideal: 15, steepingDays: 10,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké, potřebují vyšší % pro hloubku',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    tobacco: { 
        name: 'Tabákové (klasický, kubánský)', 
        min: 10, max: 15, ideal: 12, steepingDays: 14,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Dlouhý steeping: 1–4 týdny pro rozvinutí',
        composition: { pg: 85, vg: 0, alcohol: 5, water: 5, other: 5 }
    },
    menthol: { 
        name: 'Mentol / Mátové', 
        min: 4, max: 8, ideal: 6, steepingDays: 7,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 15, shishaSteepingDays: 1,
        isShishaOnly: false,
        note: 'Velmi koncentrované, při 10% chladí až pálí',
        composition: { pg: 35, vg: 5, alcohol: 50, water: 5, other: 5 }
    },
    candy: { 
        name: 'Sladkosti (cukroví, karamel)', 
        min: 12, max: 20, ideal: 16, steepingDays: 10,
        shishaMin: 18, shishaMax: 28, shishaIdeal: 22, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké tlumí škrábání, vyšší % nutné',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    dessert: { 
        name: 'Dezerty (koláč, pudink)', 
        min: 15, max: 22, ideal: 18, steepingDays: 21,
        shishaMin: 20, shishaMax: 30, shishaIdeal: 25, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Komplexní: 2–4 týdny zrání, riziko přechucení',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    bakery: { 
        name: 'Zákusky (tyčinka, donut)', 
        min: 18, max: 25, ideal: 20, steepingDays: 21,
        shishaMin: 22, shishaMax: 30, shishaIdeal: 26, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Doporučujeme vyzkoušet na 15%',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    biscuit: { 
        name: 'Piškotové (vanilka, máslo)', 
        min: 10, max: 15, ideal: 12, steepingDays: 10,
        shishaMin: 15, shishaMax: 22, shishaIdeal: 18, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Univerzální, funguje s vysokým VG',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    drink: { 
        name: 'Nápojové (kola, čaj)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Jemné, méně intenzivní',
        composition: { pg: 40, vg: 30, alcohol: 20, water: 5, other: 5 }
    },
    tobaccosweet: { 
        name: 'Tabák + sladké (custard tobacco)', 
        min: 15, max: 20, ideal: 17, steepingDays: 28,
        shishaMin: 20, shishaMax: 28, shishaIdeal: 24, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Nejsložitější: 3–6 týdnů zrání',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    nuts: { 
        name: 'Oříškové (arašíd, lískový)', 
        min: 12, max: 18, ideal: 15, steepingDays: 14,
        shishaMin: 18, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Dobře tlumí nikotin',
        composition: { pg: 75, vg: 5, alcohol: 10, water: 5, other: 5 }
    },
    spice: { 
        name: 'Kořeněné (skořice, perník)', 
        min: 5, max: 10, ideal: 7, steepingDays: 14,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 14, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Silné: při 12% dominují nad vším',
        composition: { pg: 70, vg: 5, alcohol: 15, water: 5, other: 5 }
    },
    // === SHISHA-SPECIFICKÉ PŘÍCHUTĚ (isShishaOnly: true) ===
    double_apple: { 
        name: 'Double Apple (klasika)', 
        min: 15, max: 25, ideal: 20, steepingDays: 3,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: true,
        note: 'Klasická shisha chuť, výrazná',
        composition: { pg: 60, vg: 10, alcohol: 20, water: 5, other: 5 }
    },
    grape: { 
        name: 'Grape / Hroznové', 
        min: 12, max: 18, ideal: 15, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké hrozny, univerzální',
        composition: { pg: 60, vg: 10, alcohol: 20, water: 5, other: 5 }
    },
    watermelon: { 
        name: 'Watermelon / Meloun', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Osvěžující letní chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    lemon_mint: { 
        name: 'Lemon Mint', 
        min: 8, max: 14, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 2,
        isShishaOnly: true,
        note: 'Osvěžující kombinace citrónu a máty',
        composition: { pg: 50, vg: 5, alcohol: 35, water: 5, other: 5 }
    },
    blueberry: { 
        name: 'Blueberry / Borůvka', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladká lesní chuť',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    peach: { 
        name: 'Peach / Broskev', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Jemná ovocná chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    mango: { 
        name: 'Mango', 
        min: 12, max: 18, ideal: 15, steepingDays: 10,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Exotická sladká chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    strawberry: { 
        name: 'Strawberry / Jahoda', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Klasická oblíbená chuť',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    mixed_fruit: { 
        name: 'Mixed Fruit / Ovocný mix', 
        min: 10, max: 16, ideal: 13, steepingDays: 7,
        shishaMin: 18, shishaMax: 28, shishaIdeal: 22, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Kombinace více ovocných chutí',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    cola: { 
        name: 'Cola', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Nápojová klasika',
        composition: { pg: 40, vg: 30, alcohol: 20, water: 5, other: 5 }
    },
    gum: { 
        name: 'Gum / Žvýkačka', 
        min: 12, max: 18, ideal: 15, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Sladká žvýkačková chuť',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    rose: { 
        name: 'Rose / Růže', 
        min: 8, max: 14, ideal: 10, steepingDays: 10,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 14, shishaSteepingDays: 4,
        isShishaOnly: true,
        note: 'Jemná květinová chuť, tradiční pro shisha',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    custom: { 
        name: 'Vlastní', 
        min: 5, max: 25, ideal: 10, steepingDays: 7,
        shishaMin: 10, shishaMax: 30, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Vlastní příchutě - nastavte dle výrobce',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    }
};

// Additive database pro Liquid PRO
// Aditiva jako chladiva, sladidla, zesilovače, terpeny
const additiveDatabase = {
    coolant: {
        nameKey: 'additive.coolant',
        defaultPercent: 1.5,
        minPercent: 0.2,
        maxPercent: 4,
        descriptionKey: 'additive.coolant_desc',
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    sweetener: {
        nameKey: 'additive.sweetener',
        defaultPercent: 0.5,
        minPercent: 0.2,
        maxPercent: 2,
        descriptionKey: 'additive.sweetener_desc',
        composition: { pg: 90, vg: 0, alcohol: 0, water: 10, other: 0 }
    },
    enhancer: {
        nameKey: 'additive.enhancer',
        defaultPercent: 1,
        minPercent: 0.5,
        maxPercent: 3,
        descriptionKey: 'additive.enhancer_desc',
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    terpene: {
        nameKey: 'additive.terpene',
        defaultPercent: 2,
        minPercent: 1,
        maxPercent: 5,
        descriptionKey: 'additive.terpene_desc',
        composition: { pg: 50, vg: 0, alcohol: 40, water: 0, other: 10 }
    }
};

// Sweetener database - sladidla pro shisha
const sweetenerDatabase = {
    sucralose: {
        name: 'Sukralóza',
        nameKey: 'shisha.sweetener_sucralose',
        defaultPercent: 3,
        minPercent: 1,
        maxPercent: 8,
        density: 1.5,
        composition: { pg: 90, vg: 0, alcohol: 0, water: 10, other: 0 }
    },
    ethyl_maltol: {
        name: 'Ethyl Maltol',
        nameKey: 'shisha.sweetener_ethyl_maltol',
        defaultPercent: 2,
        minPercent: 0.5,
        maxPercent: 5,
        density: 1.0,
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    stevia: {
        name: 'Stevia',
        nameKey: 'shisha.sweetener_stevia',
        defaultPercent: 2,
        minPercent: 0.5,
        maxPercent: 5,
        density: 1.0,
        composition: { pg: 80, vg: 0, alcohol: 0, water: 20, other: 0 }
    },
    honey: {
        name: 'Med',
        nameKey: 'shisha.sweetener_honey',
        defaultPercent: 5,
        minPercent: 2,
        maxPercent: 10,
        density: 1.42,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 20, other: 80 }
    },
    molasses: {
        name: 'Melasa',
        nameKey: 'shisha.sweetener_molasses',
        defaultPercent: 5,
        minPercent: 2,
        maxPercent: 10,
        density: 1.4,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 25, other: 75 }
    },
    agave: {
        name: 'Agáve',
        nameKey: 'shisha.sweetener_agave',
        defaultPercent: 4,
        minPercent: 2,
        maxPercent: 8,
        density: 1.35,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 25, other: 75 }
    }
};

// Densities for gram calculations (g/ml)
const ingredientDensities = {
    pg: 1.036,
    vg: 1.261,
    water: 1.000,
    alcohol: 0.789,
    other: 1.000  // approximation
};

// Calculate density of a composition
function calculateCompositionDensity(composition) {
    if (!composition) return 1.036; // default to PG
    return (
        (composition.pg / 100) * ingredientDensities.pg +
        (composition.vg / 100) * ingredientDensities.vg +
        (composition.alcohol / 100) * ingredientDensities.alcohol +
        (composition.water / 100) * ingredientDensities.water +
        (composition.other / 100) * ingredientDensities.other
    );
}

// Calculate nicotine density based on VG/PG ratio
function calculateNicotineDensity(vgPercent) {
    return (vgPercent / 100) * ingredientDensities.vg + ((100 - vgPercent) / 100) * ingredientDensities.pg;
}

// Calculate premixed base density based on VG/PG ratio
function calculatePremixedBaseDensity(vgPercent) {
    return (vgPercent / 100) * ingredientDensities.vg + ((100 - vgPercent) / 100) * ingredientDensities.pg;
}

// Convert ml to grams
function mlToGrams(volumeMl, density) {
    return (volumeMl * density).toFixed(2);
}

// Helper funkce pro získání shisha hodnot z flavorDatabase
// Vrací objekt s min, max, ideal, steepingDays pro shisha formulář
function getShishaFlavorData(flavorType) {
    const flavor = flavorDatabase[flavorType] || flavorDatabase.custom;
    return {
        name: flavor.name,
        min: flavor.shishaMin ?? flavor.min,
        max: flavor.shishaMax ?? flavor.max,
        ideal: flavor.shishaIdeal ?? flavor.ideal,
        steepingDays: flavor.shishaSteepingDays ?? flavor.steepingDays,
        composition: flavor.composition,
        isShishaOnly: flavor.isShishaOnly || false
    };
}

// Alias pro zpětnou kompatibilitu - shishaFlavorDatabase nyní používá flavorDatabase
const shishaFlavorDatabase = new Proxy({}, {
    get: function(target, prop) {
        if (prop === 'custom') {
            return getShishaFlavorData('custom');
        }
        const flavor = flavorDatabase[prop];
        if (flavor) {
            return getShishaFlavorData(prop);
        }
        return undefined;
    },
    has: function(target, prop) {
        return prop in flavorDatabase;
    }
});

// Export additive database
window.additiveDatabase = additiveDatabase;
window.shishaFlavorDatabase = shishaFlavorDatabase;
window.getShishaFlavorData = getShishaFlavorData;
window.sweetenerDatabase = sweetenerDatabase;
window.ingredientDensities = ingredientDensities;
window.calculateCompositionDensity = calculateCompositionDensity;
window.mlToGrams = mlToGrams;

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

// Shisha nicotine descriptions - max 10mg, přizpůsobeno pro shisha zvyklosti
const shishaNicotineDescriptions = [
    { min: 0, max: 0, color: '#00cc66', key: 'sh_nic_0', text: 'Bez nikotinu - tradiční shisha zkušenost bez nikotinu.' },
    { min: 1, max: 2, color: '#00aaff', key: 'sh_nic_1_2', text: 'Velmi lehký - jemný nádech nikotinu, vhodné pro začátečníky.' },
    { min: 3, max: 4, color: '#0088dd', key: 'sh_nic_3_4', text: 'Lehký - mírný nikotin pro příležitostné uživatele.' },
    { min: 5, max: 6, color: '#00cc88', key: 'sh_nic_5_6', text: 'Střední - vyvážená síla pro pravidelné uživatele.' },
    { min: 7, max: 8, color: '#ffaa00', key: 'sh_nic_7_8', text: 'Silnější - pro zkušené uživatele, může způsobit závratě.' },
    { min: 9, max: 10, color: '#ff6600', key: 'sh_nic_9_10', text: 'Silný - maximální doporučená síla pro shisha, pouze pro zkušené.' }
];

// Získat přeložený popis nikotinu
function getNicotineDescriptionText(value) {
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        return t(`nicotine_descriptions.${desc.key}`, desc.text);
    }
    return '';
}

// Získat přeložený popis nikotinu pro shisha
function getShishaNicotineDescriptionText(value) {
    const desc = shishaNicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        return t(`shisha_nicotine_descriptions.${desc.key}`, desc.text);
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
    
    // Inicializovat navigační historii pro tlačítka Zpět
    initHistoryNavigation();
    
    // Event listener pro kontaktní formulář (bezpečnější než inline onclick)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
    
    // Zpracovat návrat z platební brány
    handlePaymentReturn();
    
    // Listener pro zprávy od Service Workeru (upozornění na novou verzi)
    setupServiceWorkerListener();
});

// Nastavit listener pro zprávy od Service Workeru
function setupServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
                console.log('LiquiMixer: New version available:', event.data.version);
                showUpdateNotification();
            }
        });
        
        // Kontrola, zda je k dispozici nová verze Service Workeru
        navigator.serviceWorker.ready.then((registration) => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nový SW je nainstalovaný, ale starý ještě běží
                            showUpdateNotification();
                        }
                    });
                }
            });
        });
    }
}

// Zobrazit notifikaci o nové verzi aplikace
function showUpdateNotification() {
    // Zkontrolovat, zda už notifikace není zobrazena
    if (document.getElementById('updateNotification')) return;
    
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-notification-content">
            <span class="update-notification-icon">🔄</span>
            <div class="update-notification-text">
                <strong>${t('update.new_version_title', 'Nová verze aplikace')}</strong>
                <p>${t('update.new_version_text', 'Je k dispozici nová verze LiquiMixer. Klikněte pro aktualizaci.')}</p>
            </div>
        </div>
        <div class="update-notification-actions">
            <button class="update-btn-refresh" onclick="refreshApp()">${t('update.refresh', 'Aktualizovat')}</button>
            <button class="update-btn-dismiss" onclick="dismissUpdateNotification()">${t('update.dismiss', 'Později')}</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Animace vstupu
    setTimeout(() => {
        notification.classList.add('visible');
    }, 100);
}

// Zavřít notifikaci o aktualizaci
function dismissUpdateNotification() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }
}

// Obnovit aplikaci (hard refresh)
function refreshApp() {
    // Vymazat cache a znovu načíst stránku
    if ('caches' in window) {
        caches.keys().then((names) => {
            names.forEach(name => caches.delete(name));
        }).then(() => {
            window.location.reload(true);
        });
    } else {
        window.location.reload(true);
    }
}

// Export funkcí
window.refreshApp = refreshApp;
window.dismissUpdateNotification = dismissUpdateNotification;

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
    
    document.getElementById('nicotineBaseStrength').addEventListener('input', () => {
        validateNicotineStrength();
        autoRecalculateLiquidVgPgRatio();
    });
    document.getElementById('totalAmount').addEventListener('input', autoRecalculateLiquidVgPgRatio);
    
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
            autoRecalculateLiquidVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            autoRecalculateLiquidVgPgRatio();
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
            autoRecalculateLiquidVgPgRatio();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            autoRecalculateLiquidVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            autoRecalculateLiquidVgPgRatio();
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
            autoRecalculateSvVgPgRatio();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            autoRecalculateSvVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            autoRecalculateSvVgPgRatio();
        });
    }
}

// ============================================
// PREMIXED BASE FUNCTIONS
// ============================================

// Update base type (separate or premixed)
function updateBaseType(type) {
    const baseTypeInput = document.getElementById('baseType');
    const premixedContainer = document.getElementById('premixedRatioContainer');
    const separateBtn = document.getElementById('baseSeparate');
    const premixedBtn = document.getElementById('basePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
        const actualVg = calculateActualVgPgRatio('liquid');
        const slider = document.getElementById('vgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateRatioDisplay();
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    updateVgPgRatioLimits();
}

// Update premixed ratio
function updatePremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('premixedRatio');
    if (premixedRatioInput) premixedRatioInput.value = ratio;
    
    // Update button states
    const buttons = document.querySelectorAll('.premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
    const actualVg = calculateActualVgPgRatio('liquid');
    const slider = document.getElementById('vgPgRatio');
    if (slider) {
        slider.value = actualVg;
        updateRatioDisplay();
    }
    
    updateVgPgRatioLimits();
}

// Get premixed base VG percent
function getPremixedVgPercent() {
    const premixedRatio = document.getElementById('premixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode) - LIQUID form
function autoRecalculateLiquidVgPgRatio() {
    const baseType = document.getElementById('baseType')?.value || 'separate';
    if (baseType === 'premixed') {
        const actualVg = calculateActualVgPgRatio('liquid');
        const slider = document.getElementById('vgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateRatioDisplay();
        }
    }
    updateVgPgRatioLimits();
}

// ============================================
// LIQUID PRO PREMIXED BASE FUNCTIONS
// ============================================

// Calculate actual VG/PG ratio from all components (for premixed mode)
function calculateActualVgPgRatio(formType) {
    let totalAmount, nicotineType, targetNicotine, baseNicotine, nicVgPercent;
    let flavorVolume = 0, flavorVgPercent = 0;
    let premixedVgPercent = 50;
    
    if (formType === 'shisha') {
        // Shisha form
        totalAmount = parseFloat(document.getElementById('shTotalAmount')?.value) || 200;
        const nicToggle = document.getElementById('shNicotineToggle');
        nicotineType = (nicToggle && nicToggle.checked) ? 'freebase' : 'none';
        targetNicotine = parseFloat(document.getElementById('shTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('shNicotineBaseStrength')?.value) || 20;
        // Parsovat VG/PG poměr z hidden inputu (formát "50/50")
        const nicRatioInput = document.getElementById('shNicotineRatio');
        const nicRatioValue = nicRatioInput?.value || '50/50';
        nicVgPercent = parseInt(nicRatioValue.split('/')[0]) || 50;
        
        // Get flavors data
        const flavorsData = typeof getShishaFlavorsData === 'function' ? getShishaFlavorsData() : [];
        if (flavorsData.length > 0) {
            const totalFlavorVg = flavorsData.reduce((sum, f) => sum + (f.vgRatio * f.percent), 0);
            const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
            flavorVgPercent = totalFlavorPercent > 0 ? totalFlavorVg / totalFlavorPercent : 0;
            flavorVolume = (totalFlavorPercent / 100) * totalAmount;
        }
        
        // Get premixed ratio
        const premixedRatio = document.getElementById('shPremixedRatio')?.value || '80/20';
        if (premixedRatio === 'custom') {
            premixedVgPercent = parseInt(document.getElementById('shCustomPremixedVg')?.value) || 80;
        } else {
            premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 80;
        }
    } else if (formType === 'pro') {
        totalAmount = parseFloat(document.getElementById('proTotalAmount')?.value) || 100;
        nicotineType = document.getElementById('proNicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('proTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength')?.value) || 0;
        nicVgPercent = parseInt(document.getElementById('proNicotineRatioSlider')?.value) || 50;
        
        // Get flavors data
        const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
        flavorsData.forEach(flavor => {
            const vol = (flavor.percent / 100) * totalAmount;
            flavorVolume += vol;
            // Weighted average for VG
        });
        // Simplified: use average VG from all flavors
        if (flavorsData.length > 0) {
            const totalFlavorVg = flavorsData.reduce((sum, f) => sum + (f.vgRatio * f.percent), 0);
            const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
            flavorVgPercent = totalFlavorPercent > 0 ? totalFlavorVg / totalFlavorPercent : 0;
            flavorVolume = (totalFlavorPercent / 100) * totalAmount;
        }
        
        const premixedRatio = document.getElementById('proPremixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    } else if (formType === 'shakevape') {
        // Shake & Vape form
        totalAmount = parseFloat(document.getElementById('svTotalAmount')?.value) || 60;
        nicotineType = document.getElementById('svNicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('svTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength')?.value) || 0;
        const nicRatio = document.getElementById('svNicotineRatio')?.value || '50/50';
        nicVgPercent = nicRatio === '70/30' ? 70 : 50;
        
        // Flavor in S&V is by volume, not percent
        flavorVolume = parseFloat(document.getElementById('svFlavorVolume')?.value) || 0;
        const svFlavorRatio = document.getElementById('svFlavorRatio')?.value || '0/100';
        flavorVgPercent = svFlavorRatio === '80/20' ? 80 : (svFlavorRatio === '70/30' ? 70 : 0);
        
        const premixedRatio = document.getElementById('svPremixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    } else {
        // Standard Liquid form
        totalAmount = parseFloat(document.getElementById('totalAmount')?.value) || 100;
        nicotineType = document.getElementById('nicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('targetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength')?.value) || 0;
        const nicRatio = document.getElementById('nicotineRatio')?.value || '50/50';
        nicVgPercent = nicRatio === '70/30' ? 70 : 50;
        
        const flavorType = document.getElementById('flavorType')?.value || 'none';
        const flavorPercent = flavorType !== 'none' ? parseFloat(document.getElementById('flavorStrength')?.value) || 0 : 0;
        const flavorRatio = document.getElementById('flavorRatio')?.value || '0/100';
        flavorVgPercent = flavorRatio === '80/20' ? 80 : (flavorRatio === '70/30' ? 70 : 0);
        flavorVolume = (flavorPercent / 100) * totalAmount;
        
        const premixedRatio = document.getElementById('premixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    }
    
    // Calculate nicotine volume
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    // Remaining volume for carrier (premixed base)
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;
    
    // Calculate VG from each component
    const vgFromNicotine = nicotineVolume * (nicVgPercent / 100);
    const vgFromFlavor = flavorVolume * (flavorVgPercent / 100);
    const vgFromBase = remainingVolume * (premixedVgPercent / 100);
    
    // Total VG
    const totalVg = vgFromNicotine + vgFromFlavor + vgFromBase;
    const actualVgPercent = Math.round((totalVg / totalAmount) * 100);
    const clampedVg = Math.max(0, Math.min(100, actualVgPercent));
    
    // For shisha, return object with actualVg
    if (formType === 'shisha') {
        return { actualVg: clampedVg };
    }
    
    return clampedVg;
}

// Update PRO base type (separate or premixed)
function updateProBaseType(type) {
    const baseTypeInput = document.getElementById('proBaseType');
    const premixedContainer = document.getElementById('proPremixedRatioContainer');
    const separateBtn = document.getElementById('proBaseSeparate');
    const premixedBtn = document.getElementById('proBasePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
        const actualVg = calculateActualVgPgRatio('pro');
        const slider = document.getElementById('proVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateProRatioDisplay();
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    updateProVgPgLimits();
}

// Update PRO premixed ratio
function updateProPremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('proPremixedRatio');
    const customContainer = document.getElementById('proCustomPremixedContainer');
    
    // Update button states
    const buttons = document.querySelectorAll('.pro-premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // DŮLEŽITÉ: Nejprve nastavit hodnotu, pak počítat ratio
    if (ratio === 'custom') {
        if (customContainer) customContainer.classList.remove('hidden');
        // Get custom values
        const customVg = parseInt(document.getElementById('proCustomPremixedVg')?.value) || 65;
        if (premixedRatioInput) premixedRatioInput.value = `${customVg}/${100 - customVg}`;
    } else {
        if (customContainer) customContainer.classList.add('hidden');
        if (premixedRatioInput) premixedRatioInput.value = ratio;
    }
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr (po nastavení proPremixedRatio)
    setTimeout(() => {
        const actualVg = calculateActualVgPgRatio('pro');
        const slider = document.getElementById('proVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateProRatioDisplay();
        }
        updateProVgPgLimits();
    }, 0);
}

// Update PRO custom premixed PG (auto-calculate from VG)
function updateProCustomPremixedPg() {
    const vgInput = document.getElementById('proCustomPremixedVg');
    const pgInput = document.getElementById('proCustomPremixedPg');
    const premixedRatioInput = document.getElementById('proPremixedRatio');
    
    if (vgInput && pgInput) {
        let vgValue = parseInt(vgInput.value) || 0;
        if (vgValue > 100) vgValue = 100;
        if (vgValue < 0) vgValue = 0;
        vgInput.value = vgValue;
        pgInput.value = 100 - vgValue;
        
        if (premixedRatioInput) {
            premixedRatioInput.value = `${vgValue}/${100 - vgValue}`;
        }
    }
    
    updateProVgPgLimits();
}

// Get PRO premixed base VG percent
function getProPremixedVgPercent() {
    const premixedRatio = document.getElementById('proPremixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Export premixed base functions
window.updateBaseType = updateBaseType;
window.updatePremixedRatio = updatePremixedRatio;
window.getPremixedVgPercent = getPremixedVgPercent;
window.updateProBaseType = updateProBaseType;
window.updateProPremixedRatio = updateProPremixedRatio;
window.updateProCustomPremixedPg = updateProCustomPremixedPg;
window.getProPremixedVgPercent = getProPremixedVgPercent;

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
                    
                    // DETEKCE NOVÉHO UŽIVATELE: Pokud byl účet vytvořen v posledních 60 sekundách
                    // Toto zachytí OAuth registrace (Continue with Google) které obcházejí subscription modal
                    const userCreatedAt = new Date(window.Clerk.user.createdAt);
                    const now = new Date();
                    const secondsSinceCreation = (now - userCreatedAt) / 1000;
                    const isNewUser = secondsSinceCreation < 60; // Účet vytvořen před méně než 60s
                    
                    console.log('User created at:', userCreatedAt, 'seconds since creation:', secondsSinceCreation, 'isNewUser:', isNewUser);
                    
                    // Pro nové uživatele - zobrazit subscription modal (musí souhlasit s OP a zaplatit)
                    if (isNewUser) {
                        console.log('New user detected via OAuth - showing subscription modal for terms acceptance...');
                        await new Promise(r => setTimeout(r, 500));
                        showSubscriptionModal();
                        return; // Nepokračovat - uživatel musí souhlasit s OP a zaplatit
                    }
                    
                    // Zkontrolovat zda existující uživatel přišel ze subscription modalu
                    // Pokud ano, uložit souhlas s OP do DB a zobrazit platbu
                    const fromSubscription = localStorage.getItem('liquimixer_from_subscription') === 'true';
                    const termsAccepted = localStorage.getItem('liquimixer_terms_accepted') === 'true';
                    if (fromSubscription) {
                        localStorage.removeItem('liquimixer_from_subscription');
                        
                        // Pokud souhlasil s OP při registraci, uložit do DB
                        if (termsAccepted && window.LiquiMixerDB) {
                            localStorage.removeItem('liquimixer_terms_accepted');
                            localStorage.removeItem('liquimixer_terms_accepted_at');
                            console.log('Saving terms acceptance to database...');
                            await window.LiquiMixerDB.saveTermsAcceptance(window.Clerk.user.id);
                        }
                        
                        console.log('User came from subscription modal - showing payment step (State B)...');
                        // Krátká pauza pro stabilizaci UI a Clerk session
                        await new Promise(r => setTimeout(r, 500));
                        showSubscriptionModal();
                        return; // Nepokračovat dál - uživatel musí zaplatit
                    }
                    
                    // Kontrola předplatného pro existující uživatele (pouze pokud nepřišel ze subscription flow)
                    await checkSubscriptionStatus();
                    
                    // Zkontrolovat pending sdílený recept (až po ověření předplatného)
                    await checkPendingSharedRecipe();
                    
                    // Zkontrolovat vyzrálé liquidy a zobrazit in-app notifikaci
                    await checkMaturedReminders();
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
        // Zobrazit rozhodovací modal (Mám účet / Chci se registrovat) místo přímého Clerk SignIn
        loginBtn.onclick = showAuthChoiceModal;
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

// ============================================
// AUTH CHOICE MODAL - Rozhodovací modal
// Zobrazí se při kliknutí na "Přihlášení" pro nepřihlášené uživatele
// ============================================

// Zobrazit Auth Choice modal (výběr mezi přihlášením a registrací)
function showAuthChoiceModal() {
    const modal = document.getElementById('authChoiceModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Aplikovat překlady
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
    }
}

// Skrýt Auth Choice modal
function hideAuthChoiceModal() {
    const modal = document.getElementById('authChoiceModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Klik na pozadí zavře modal
function handleAuthChoiceModalBackdropClick(event) {
    if (event.target.id === 'authChoiceModal') {
        hideAuthChoiceModal();
    }
}

// Uživatel má účet → zobrazit Clerk SignIn
function handleHaveAccount() {
    hideAuthChoiceModal();
    setTimeout(() => {
        showLoginModal('signIn');
    }, 50);
}

// Uživatel se chce registrovat → zobrazit subscriptionModal (vidí cenu, souhlasí s OP)
function handleWantRegister() {
    hideAuthChoiceModal();
    setTimeout(() => {
        showSubscriptionModal();
    }, 50);
}

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
        
        // Reset blokování veřejného sdílení (mohlo být disabled ze saveSharedRecipe)
        const publicCheckbox = document.getElementById('recipeIsPublic');
        if (publicCheckbox) {
            publicCheckbox.disabled = false;
            publicCheckbox.checked = false;
            const publicToggle = publicCheckbox.closest('.public-recipe-toggle');
            if (publicToggle) {
                publicToggle.classList.remove('disabled');
                publicToggle.title = '';
            }
        }
        
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
    const isPublic = document.getElementById('recipeIsPublic')?.checked || false;
    
    // Kontrola, zda jde o úpravu nebo nový recept
    const isEditing = !!window.editingRecipeId;
    
    // Pro nový recept potřebujeme data receptu
    if (!isEditing && !currentRecipeData) {
        alert(t('recipes.nothing_to_save', 'Chyba: Není co uložit. Prosím vytvořte recept.'));
        return false;
    }
    
    // Určit form_type z currentRecipeData
    let formType = 'liquid';
    if (currentRecipeData) {
        formType = currentRecipeData.formType || currentRecipeData.form_type || 'liquid';
    }
    
    const recipeData = {
        name: name,
        description: description,
        rating: rating,
        is_public: isPublic,
        form_type: formType
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
        
        // Načíst vyzrálé připomínky pro filtr
        await loadMaturedRecipeIds();
        
        renderRecipesList(allUserRecipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        container.innerHTML = `<p class="no-recipes-text" style="color: var(--neon-pink);">${t('recipes.load_error', 'Chyba při načítání receptů.')}</p>`;
    }
}

// Načíst ID receptů s vyzrálými připomínkami
async function loadMaturedRecipeIds() {
    maturedRecipeIds.clear();
    
    if (!window.Clerk?.user || !window.LiquiMixerDB) return;
    
    try {
        const clerkId = window.Clerk.user.id;
        const reminders = await window.LiquiMixerDB.getUserReminders(clerkId);
        
        if (!reminders || reminders.length === 0) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Najít vyzrálé připomínky a uložit jejich recipe_id
        // Filtrovat spotřebované připomínky (consumed_at != null nebo stock_percent <= 0)
        reminders.forEach(r => {
            if (r.status !== 'pending' || !r.recipe_id) return;
            
            // Přeskočit spotřebované připomínky
            if (r.consumed_at != null) return;
            const stockPercent = r.stock_percent ?? 100;
            if (stockPercent <= 0) return;
            
            const remindDate = new Date(r.remind_at);
            remindDate.setHours(0, 0, 0, 0);
            if (remindDate <= today) {
                maturedRecipeIds.add(r.recipe_id);
            }
        });
        
        console.log('Loaded matured recipe IDs:', maturedRecipeIds.size);
    } catch (error) {
        console.error('Error loading matured recipe IDs:', error);
    }
}

// Reset filtrů vyhledávání receptů
function resetRecipeFilters() {
    const textInput = document.getElementById('recipeSearchText');
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    const maturedCheckbox = document.getElementById('recipeShowMatured');
    
    if (textInput) textInput.value = '';
    if (maturedCheckbox) maturedCheckbox.checked = false;
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
    const showMaturedOnly = document.getElementById('recipeShowMatured')?.checked || false;
    
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
        
        // Filtr vyzrálých - zobrazit pouze recepty s vyzrálou připomínkou
        if (showMaturedOnly) {
            if (!maturedRecipeIds.has(recipe.id)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zobrazit info o výsledcích
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    if (resultsInfo) {
        const hasFilters = searchText || recipeSearchRatingFilter > 0 || showMaturedOnly;
        if (hasFilters) {
            if (filtered.length === 0) {
                const noResultsText = showMaturedOnly 
                    ? t('recipes.no_matured', 'Žádné vyzrálé liquidy.')
                    : t('recipes.no_filter_results', 'Žádné recepty neodpovídají filtrům.');
                resultsInfo.textContent = noResultsText;
                resultsInfo.className = 'search-results-info no-results';
            } else {
                resultsInfo.textContent = `${t('recipes.found', 'Nalezeno')} ${filtered.length} ${t('recipes.of', 'z')} ${allUserRecipes.length} ${t('recipes.recipes_count', 'receptů')}.`;
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
        
        // Zkontrolovat zda je recept vyzrálý
        const isMatured = maturedRecipeIds.has(recipe.id);
        const maturedBadge = isMatured ? `<span class="recipe-matured-badge">${t('reminder.matured', 'Vyzrálo')}</span>` : '';
        
        // SECURITY: Escapování všech uživatelských dat
        const safeName = escapeHtml(recipe.name);
        const safeDescription = escapeHtml(recipe.description);
        const safeTotal = escapeHtml(data.totalAmount || '?');
        const safeVg = escapeHtml(data.vgPercent || '?');
        const safePg = escapeHtml(data.pgPercent || '?');
        
        html += `
            <div class="recipe-card rating-${rating}${isMatured ? ' matured' : ''}" onclick="viewRecipeDetail('${recipe.id}')">
                <div class="recipe-card-header">
                    <h3 class="recipe-card-title">${safeName}</h3>
                    ${maturedBadge}
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
                            <th>${t('recipe_detail.table_grams', 'Gramy')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.ingredients.map(ing => {
                            // Dynamicky přeložit název ingredience
                            const ingredientName = escapeHtml(getIngredientName(ing));
                            // Vypočítat gramy
                            const grams = calculateIngredientGrams(ing);
                            const percentInline = `<span class="ingredient-percent-inline">(${parseFloat(ing.percent || 0).toFixed(1)}%)</span>`;
                            return `
                            <tr>
                                <td class="ingredient-name">${ingredientName} ${percentInline}</td>
                                <td class="ingredient-value">${parseFloat(ing.volume || 0).toFixed(2)}</td>
                                <td class="ingredient-grams">${grams}</td>
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
    // Zaokrouhlit nikotin na 2 desetinná místa
    const nicotineValue = parseFloat(data.nicotine || 0);
    const safeNicotine = escapeHtml(nicotineValue.toFixed(2));
    
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
    
    // Base type
    if (data.baseType) {
        updateBaseType(data.baseType);
        if (data.baseType === 'premixed' && data.premixedRatio) {
            updatePremixedRatio(data.premixedRatio);
        }
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
    
    // Base type
    if (data.baseType) {
        updateProBaseType(data.baseType);
        if (data.baseType === 'premixed' && data.premixedRatio) {
            // Check if it's custom ratio
            const standardRatios = ['50/50', '60/40', '70/30', '80/20'];
            if (standardRatios.includes(data.premixedRatio)) {
                updateProPremixedRatio(data.premixedRatio);
            } else {
                updateProPremixedRatio('custom');
                const parts = data.premixedRatio.split('/');
                const vgEl = document.getElementById('proCustomPremixedVg');
                if (vgEl) vgEl.value = parseInt(parts[0]) || 65;
                updateProCustomPremixedPg();
            }
        }
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
    // Aditiva - předvyplnit
    if (data.additives && data.additives.length > 0) {
        resetAndPrefillProAdditives(data.additives);
    }
    // Aktualizovat limity
    updateProVgPgLimits();
}

// Resetovat a předvyplnit aditiva PRO formuláře
function resetAndPrefillProAdditives(additives) {
    if (!additives || additives.length === 0) return;
    
    // Reset
    proAdditiveCount = 0;
    const container = document.getElementById('proAdditivesContainer');
    if (container) container.innerHTML = '';
    
    const addBtn = document.getElementById('proAddAdditiveBtn');
    if (addBtn) addBtn.classList.remove('hidden');
    
    // Předvyplnit
    additives.forEach((additive) => {
        addProAdditive();
        
        const idx = proAdditiveCount;
        const typeEl = document.getElementById(`proAdditiveType${idx}`);
        const percentEl = document.getElementById(`proAdditivePercent${idx}`);
        
        if (typeEl) typeEl.value = additive.type;
        if (percentEl) percentEl.value = additive.percent;
        
        updateProAdditiveType(idx);
        
        // Custom composition
        if (additive.customComposition) {
            toggleAdditiveComposition(idx);
            const pgEl = document.getElementById(`proAdditiveCompPg${idx}`);
            const vgEl = document.getElementById(`proAdditiveCompVg${idx}`);
            const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${idx}`);
            
            if (pgEl) pgEl.value = additive.customComposition.pg;
            if (vgEl) vgEl.value = additive.customComposition.vg;
            if (alcoholEl) alcoholEl.value = additive.customComposition.alcohol;
            updateAdditiveCompositionOther(idx);
        }
    });
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

// Přihlášení pro sdílený recept - používá stejný modal jako "Uložit k sobě"
function handleSharedRecipeLogin() {
    console.log('handleSharedRecipeLogin called');
    // Použít showLoginRequiredModal - stejný jako tlačítko "Uložit k sobě" které funguje
    showLoginRequiredModal();
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
        
        // Blokovat "Sdílet do veřejné databáze" při ukládání ze sdílené databáze (prevence duplikátů)
        const publicCheckbox = document.getElementById('recipeIsPublic');
        const publicToggle = publicCheckbox?.closest('.public-recipe-toggle');
        if (publicCheckbox) {
            publicCheckbox.checked = false;
            publicCheckbox.disabled = true;
        }
        if (publicToggle) {
            publicToggle.classList.add('disabled');
            publicToggle.title = t('save_recipe.public_disabled_shared', 'Nelze sdílet recept zkopírovaný z veřejné databáze');
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
let maturedRecipeIds = new Set(); // ID receptů s vyzrálými připomínkami

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

// Aktuální stránka pro sledování navigace
let currentPageId = 'intro';

function showPage(pageId, pushToHistory = true) {
    // Nepushovat do historie pokud jsme už na stejné stránce
    if (pageId === currentPageId && pushToHistory) {
        return;
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
    
    // Přidat do browser historie (pokud není navigace zpět)
    if (pushToHistory) {
        history.pushState({ pageId: pageId }, '', '');
    }
    
    // Aktualizovat aktuální stránku
    currentPageId = pageId;

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

// Inicializovat historii při načtení stránky
function initHistoryNavigation() {
    // Nastavit počáteční stav historie
    history.replaceState({ pageId: 'intro' }, '', '');
    
    // Listener pro tlačítko zpět v prohlížeči
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.pageId) {
            // Navigovat na předchozí stránku bez přidání do historie
            showPage(event.state.pageId, false);
        } else {
            // Fallback na intro
            showPage('intro', false);
        }
    });
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

// Navigace zpět v historii pomocí Browser History API
function goBack() {
    // Použít nativní history.back() pro navigaci zpět
    if (history.length > 1) {
        history.back();
    } else {
        // Fallback na úvodní stránku pokud není historie
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
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
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
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

// =========================================
// Flavor Functions
// =========================================

function updateFlavorType(forceReset = false) {
    const type = flavorTypeSelect.value;
    const strengthContainer = document.getElementById('flavorStrengthContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
    } else {
        strengthContainer.classList.remove('hidden');
        // Nastavit ideal POUZE při forceReset (změna typu uživatelem)
        // Při volání z updateAllDisplays() (localeChanged event) nepřepisovat uživatelskou hodnotu
        if (forceReset) {
            const flavor = flavorDatabase[type];
            flavorStrengthSlider.value = flavor.ideal;
        }
        updateFlavorDisplay();
    }
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
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
        case 'vg_adjustment':
            return t('ingredients.vg_adjustment', 'VG (doladění)');
        case 'pg_adjustment':
            return t('ingredients.pg_adjustment', 'PG (doladění)');
        case 'premixedBase':
            const premixedName = t('ingredients.premixed_base', 'Předmíchaná báze');
            return `${premixedName} (VG/PG ${params.vgpg})`;
        case 'nicotine_base':
            const baseName = t('ingredients.nicotine_base', 'Nikotinová báze');
            if (params.strength && params.vgpg) {
                return `${baseName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
            }
            return baseName;
        case 'additive':
            const additiveType = ingredient.additiveType;
            if (additiveType && additiveDatabase[additiveType]) {
                return t(additiveDatabase[additiveType].nameKey, additiveType);
            }
            return t('ingredients.additive', 'Aditivum');
        case 'shortfill_liquid':
            return t('ingredients.shortfill_liquid', 'Shortfill liquid');
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
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

function updateAllDisplays() {
    updateRatioDisplay();
    updateNicotineDisplay();
    updateFlavorDisplay();
    updateNicotineType();
    updateFlavorType(false);  // BEZ přepsání uživatelské hodnoty
    
    // Inicializovat Shake & Vape nicotine visibility
    if (typeof updateSvNicotineType === 'function') {
        updateSvNicotineType();
    }
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
    
    // Get base type (separate or premixed)
    const baseType = document.getElementById('baseType')?.value || 'separate';
    const premixedRatio = document.getElementById('premixedRatio')?.value || '60/40';

    // =========================================
    // CALCULATION FORMULA
    // Total = Nicotine + Flavor + PG + VG (or Premixed Base)
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

    // 3. Calculate remaining volume for carrier liquids
    // This is what's left after nicotine and flavor
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;

    // 4. Nicotine base composition (affects final PG/VG ratio)
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    let nicVgPercent = 50;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        const nicotineRatio = document.getElementById('nicotineRatio').value;
        
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
        }
        
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * ((100 - nicVgPercent) / 100);
    }

    // 5. Flavor VG/PG content based on selected ratio
    let flavorVgContent = 0;
    let flavorPgContent = flavorVolume; // Default to 100% PG
    
    if (flavorType !== 'none' && flavorVolume > 0) {
        const flavorRatio = document.getElementById('flavorRatio').value;
        let flavorVgPercent = 0;
        
        if (flavorRatio === '0/100') {
            flavorVgPercent = 0;
        } else if (flavorRatio === '80/20') {
            flavorVgPercent = 80;
        } else if (flavorRatio === '70/30') {
            flavorVgPercent = 70;
        }
        
        flavorVgContent = flavorVolume * (flavorVgPercent / 100);
        flavorPgContent = flavorVolume * ((100 - flavorVgPercent) / 100);
    }

    // 6. Calculate carrier liquids needed
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    let pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 60;

    // Handle negative values
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;

    // Build results
    const ingredients = [];

    if (baseType === 'premixed') {
        // PREMIXED BASE MODE
        // Parse premixed ratio
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 50;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        // Předmíchaná báze vyplní celý zbývající objem
        premixedBaseVolume = remainingVolume;
        
        // VG a PG z předmíchané báze
        const premixedVgContent = premixedBaseVolume * (premixedVgPercent / 100);
        const premixedPgContent = premixedBaseVolume * (premixedPgPercent / 100);
        
        // Skutečný VG/PG poměr ze všech složek
        const actualVgFromAll = nicotineVgContent + flavorVgContent + premixedVgContent;
        const actualPgFromAll = nicotinePgContent + flavorPgContent + premixedPgContent;
        const actualVgPercent = (actualVgFromAll / totalAmount) * 100;
        
        // Pokud slider hodnota odpovídá skutečnému poměru (±1.5%), nepřidávat doladění
        const sliderMatchesActual = Math.abs(vgPercent - actualVgPercent) < 1.5;
        
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (!sliderMatchesActual) {
            // Uživatel změnil slider - potřeba doladění
            adjustmentVg = targetVgTotal - actualVgFromAll;
            adjustmentPg = targetPgTotal - actualPgFromAll;
            
            if (adjustmentVg < 0) adjustmentVg = 0;
            if (adjustmentPg < 0) adjustmentPg = 0;
            
            // Upravit předmíchanou bázi aby bylo místo na doladění
            const totalAdjustment = adjustmentVg + adjustmentPg;
            if (totalAdjustment > 0.1 && totalAdjustment < remainingVolume) {
                premixedBaseVolume = remainingVolume - totalAdjustment;
            }
        }
        
        // Přepočítat obsah předmíchané báze po úpravě
        const finalPremixedVgContent = premixedBaseVolume * (premixedVgPercent / 100);
        const finalPremixedPgContent = premixedBaseVolume * (premixedPgPercent / 100);
        
        // Add nicotine to ingredients
        if (nicotineVolume > 0) {
            const nicotineRatioValue = document.getElementById('nicotineRatio').value;
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: nicotineRatioValue
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }

        // Add flavor to ingredients
        if (flavorVolume > 0) {
            const flavorRatioValue = document.getElementById('flavorRatio').value;
            ingredients.push({
                ingredientKey: 'flavor',
                flavorType: flavorType,
                params: {
                    vgpg: flavorRatioValue
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            });
        }
        
        // Add premixed base
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Add adjustment VG if needed (only if user changed slider)
        if (!sliderMatchesActual && adjustmentVg > 0.01) {
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: adjustmentVg,
                percent: (adjustmentVg / totalAmount) * 100
            });
        }
        
        // Add adjustment PG if needed (only if user changed slider)
        if (!sliderMatchesActual && adjustmentPg > 0.01) {
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: adjustmentPg,
                percent: (adjustmentPg / totalAmount) * 100
            });
        }
        
        // Update pureVgNeeded and purePgNeeded for final calculation
        pureVgNeeded = sliderMatchesActual ? 0 : adjustmentVg;
        purePgNeeded = sliderMatchesActual ? 0 : adjustmentPg;
        
    } else {
        // SEPARATE PG/VG MODE (original logic)
        // Adjust if needed
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

        // Add nicotine to ingredients
        if (nicotineVolume > 0) {
            const nicotineRatioValue = document.getElementById('nicotineRatio').value;
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: nicotineRatioValue
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }

        // Add flavor to ingredients
        if (flavorVolume > 0) {
            const flavorRatioValue = document.getElementById('flavorRatio').value;
            ingredients.push({
                ingredientKey: 'flavor',
                flavorType: flavorType,
                params: {
                    vgpg: flavorRatioValue
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            });
        }

        // Add carrier liquids
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
    }

    // Calculate actual totals for verification
    const actualTotal = ingredients.reduce((sum, ing) => sum + ing.volume, 0);
    
    // Calculate actual VG/PG ratio in final mix
    let actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    let actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;
    
    if (baseType === 'premixed' && premixedBaseVolume > 0) {
        actualVg += premixedBaseVolume * (premixedVgPercent / 100);
        actualPg += premixedBaseVolume * ((100 - premixedVgPercent) / 100);
    }

    // Display results
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, actualTotal, actualVg, actualPg, {
        flavorType: flavorType,
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null
    });
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg, extraData = {}) {
    // Zaokrouhlit hodnoty na 2 desetinná místa
    const roundedTotal = typeof total === 'number' ? parseFloat(total.toFixed(2)) : total;
    const roundedNicotine = typeof nicotine === 'number' ? parseFloat(nicotine.toFixed(2)) : nicotine;
    
    document.getElementById('resultTotal').textContent = `${roundedTotal} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${roundedNicotine} mg/ml`;
    
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
            flavorIndex: ing.flavorIndex,
            flavorNumber: ing.flavorNumber,
            additiveType: ing.additiveType,
            customComposition: ing.customComposition,
            vgRatio: ing.vgRatio,
            params: ing.params,
            volume: ing.volume,
            percent: ing.percent
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
    if (extraData.additives) {
        recipeData.additives = extraData.additives;
    }
    if (extraData.baseType) {
        recipeData.baseType = extraData.baseType;
    }
    if (extraData.premixedRatio) {
        recipeData.premixedRatio = extraData.premixedRatio;
    }
    
    storeCurrentRecipe(recipeData);

    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    let runningTotal = 0;
    let totalGrams = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');

        // Calculate grams based on ingredient type
        const grams = calculateIngredientGrams(ing);
        totalGrams += parseFloat(grams);

        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);

        row.innerHTML = `
            <td class="ingredient-name">${ingredientName} <span class="ingredient-percent-inline">(${ing.percent.toFixed(1)}%)</span></td>
            <td class="ingredient-value">${ing.volume.toFixed(2)}</td>
            <td class="ingredient-grams">${grams}</td>
        `;
        tbody.appendChild(row);
        runningTotal += ing.volume;
    });

    // Add total row - should match user's requested total
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)}</td>
        <td class="ingredient-grams">${totalGrams.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);

    // Generate dynamic mixing notes
    generateMixingNotes(recipeData);
}

// Calculate grams for an ingredient based on its type and composition
function calculateIngredientGrams(ing) {
    let density = ingredientDensities.pg; // default
    
    if (ing.ingredientKey === 'vg') {
        density = ingredientDensities.vg;
    } else if (ing.ingredientKey === 'pg') {
        density = ingredientDensities.pg;
    } else if (ing.ingredientKey === 'nicotine') {
        // Nicotine density depends on VG/PG ratio
        const nicVgRatio = ing.vgRatio || 50;
        density = calculateNicotineDensity(nicVgRatio);
    } else if (ing.ingredientKey === 'flavor') {
        // Flavor density depends on composition
        const flavorType = ing.flavorType || 'fruit';
        const flavorData = flavorDatabase[flavorType];
        if (flavorData && flavorData.composition) {
            density = calculateCompositionDensity(flavorData.composition);
        }
    } else if (ing.ingredientKey === 'premixedBase') {
        // Premixed base density
        const baseVgRatio = ing.vgRatio || 50;
        density = calculatePremixedBaseDensity(baseVgRatio);
    } else if (ing.ingredientKey === 'additive') {
        // Additive density
        const additiveType = ing.additiveType;
        if (additiveType && additiveDatabase[additiveType]) {
            density = calculateCompositionDensity(additiveDatabase[additiveType].composition);
        }
    }
    
    return mlToGrams(ing.volume, density);
}

// Generate dynamic mixing notes based on recipe data
function generateMixingNotes(recipeData) {
    const notesEl = document.getElementById('mixingNotesList');
    if (!notesEl) return;
    
    const notes = [];
    
    // 1. Flavors first
    notes.push(t('results.notes_flavors_first', 'Nejprve přidejte příchutě.'));
    
    // 2. Nicotine if present
    if (recipeData.nicotine > 0) {
        notes.push(t('results.notes_nicotine', 'Poté přidejte nikotin (pracujte v rukavicích!).'));
    }
    
    // 3. Base type
    if (recipeData.baseType === 'premixed') {
        notes.push(t('results.notes_premixed', 'Doplňte předmíchanou bázi.'));
        // Check if adjustment needed
        const hasAdjustment = recipeData.ingredients && recipeData.ingredients.some(
            ing => (ing.ingredientKey === 'pg' || ing.ingredientKey === 'vg') && ing.volume > 0.1
        );
        if (hasAdjustment) {
            notes.push(t('results.notes_adjustment', 'Pokud je třeba, dolaďte čistým PG nebo VG.'));
        }
    } else {
        notes.push(t('results.notes_pg_vg', 'Nakonec doplňte PG a VG.'));
    }
    
    // 4. Shake
    notes.push(t('results.notes_shake', 'Důkladně protřepejte (2-3 minuty).'));
    
    // 5. Steeping based on flavor type
    const steepingDays = getMaxSteepingDaysFromRecipe(recipeData);
    if (steepingDays > 0) {
        const steepText = t('results.notes_steep', 'Nechte zrát {days} dní.').replace('{days}', steepingDays);
        notes.push(steepText);
    }
    
    // 6. Actual ratio info
    if (recipeData.actualVg !== undefined && recipeData.totalAmount) {
        const actualVgPercent = (recipeData.actualVg / recipeData.totalAmount * 100).toFixed(1);
        const actualPgPercent = (recipeData.actualPg / recipeData.totalAmount * 100).toFixed(1);
        notes.push(`${t('results.actual_ratio', 'Skutečný poměr VG/PG')}: ${actualVgPercent}% / ${actualPgPercent}%`);
    }
    
    // Render notes
    notesEl.innerHTML = notes.map(note => `<li>${note}</li>`).join('');
}

// Get max steeping days from recipe data
function getMaxSteepingDaysFromRecipe(recipeData) {
    let maxDays = 0;
    
    if (recipeData.formType === 'liquidpro' && recipeData.flavors) {
        for (const flavor of recipeData.flavors) {
            if (flavor.type && flavor.type !== 'none') {
                const flavorData = flavorDatabase[flavor.type];
                if (flavorData && flavorData.steepingDays > maxDays) {
                    maxDays = flavorData.steepingDays;
                }
            }
        }
    } else if (recipeData.flavorType && recipeData.flavorType !== 'none') {
        const flavorData = flavorDatabase[recipeData.flavorType];
        if (flavorData && flavorData.steepingDays) {
            maxDays = flavorData.steepingDays;
        }
    }
    
    return maxDays;
}

// Překreslit tabulku výsledků při změně jazyka
function refreshResultsTable() {
    const tbody = document.getElementById('resultsBody');
    if (!tbody || !currentRecipeData || !currentRecipeData.ingredients) return;
    
    tbody.innerHTML = '';
    let runningTotal = 0;
    let totalGrams = 0;
    
    currentRecipeData.ingredients.forEach(ing => {
        const row = document.createElement('tr');
        
        const grams = calculateIngredientGrams(ing);
        totalGrams += parseFloat(grams);
        
        const ingredientName = getIngredientName(ing);
        
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName} <span class="ingredient-percent-inline">(${parseFloat(ing.percent || 0).toFixed(1)}%)</span></td>
            <td class="ingredient-value">${parseFloat(ing.volume || 0).toFixed(2)}</td>
            <td class="ingredient-grams">${grams}</td>
        `;
        tbody.appendChild(row);
        runningTotal += parseFloat(ing.volume || 0);
    });
    
    // Přidat řádek celkem
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)}</td>
        <td class="ingredient-grams">${totalGrams.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);
    
    // Regenerovat dynamické poznámky
    generateMixingNotes(currentRecipeData);
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
    let runningTotalGrams = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);
        
        // Vypočítat gramy podle typu ingredience
        let density = ingredientDensities.pg; // default
        if (ing.ingredientKey === 'vg') {
            density = ingredientDensities.vg;
        } else if (ing.ingredientKey === 'pg') {
            density = ingredientDensities.pg;
        } else if (ing.ingredientKey === 'nicotine') {
            // Hustota nikotinu závisí na VG/PG poměru
            const nicVgRatio = ing.vgRatio || 50;
            density = calculateNicotineDensity(nicVgRatio);
        }
        
        const grams = ing.volume * density;
        runningTotalGrams += grams;
        
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName}</td>
            <td class="ingredient-value">${ing.volume.toFixed(2)} ml</td>
            <td class="ingredient-grams">${grams.toFixed(2)} g</td>
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
        <td class="ingredient-grams">${runningTotalGrams.toFixed(2)} g</td>
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
    } else if (tabName === 'shortfill') {
        calculateShortfill();
    } else if (tabName === 'shisha') {
        initShishaForm();
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
            autoRecalculateSvVgPgRatio();
        };
        
        ratio7030Btn.onclick = () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            autoRecalculateSvVgPgRatio();
        };
    }
}

// =========================================
// Shake & Vape Premixed Base Functions
// =========================================

// Update SV base type (separate or premixed)
function updateSvBaseType(type) {
    const baseTypeInput = document.getElementById('svBaseType');
    const premixedContainer = document.getElementById('svPremixedRatioContainer');
    const separateBtn = document.getElementById('svBaseSeparate');
    const premixedBtn = document.getElementById('svBasePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
        const actualVg = calculateActualVgPgRatio('shakevape');
        const slider = document.getElementById('svVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateSvRatioDisplay();
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    updateSvVgPgLimits();
}

// Update SV premixed ratio
function updateSvPremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('svPremixedRatio');
    if (premixedRatioInput) premixedRatioInput.value = ratio;
    
    // Update button states
    const buttons = document.querySelectorAll('.sv-premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
    setTimeout(() => {
        const actualVg = calculateActualVgPgRatio('shakevape');
        const slider = document.getElementById('svVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateSvRatioDisplay();
        }
    }, 0);
    
    updateSvVgPgLimits();
}

// Get SV premixed base VG percent
function getSvPremixedVgPercent() {
    const premixedRatio = document.getElementById('svPremixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode) - SHAKE & VAPE form
function autoRecalculateSvVgPgRatio() {
    const baseType = document.getElementById('svBaseType')?.value || 'separate';
    if (baseType === 'premixed') {
        const actualVg = calculateActualVgPgRatio('shakevape');
        const slider = document.getElementById('svVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateSvRatioDisplay();
        }
    }
    updateSvVgPgLimits();
}

// Export SV premixed base functions
window.updateSvBaseType = updateSvBaseType;
window.updateSvPremixedRatio = updateSvPremixedRatio;
window.autoRecalculateSvVgPgRatio = autoRecalculateSvVgPgRatio;

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
    
    autoRecalculateSvVgPgRatio();
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
    
    autoRecalculateSvVgPgRatio();
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
    
    // Get base type (separate or premixed)
    const baseType = document.getElementById('svBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('svPremixedRatio')?.value || '50/50';
    
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

    let pureVgNeeded = 0;
    let purePgNeeded = 0;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 50;
    
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
            vgRatio: nicVgPercent,
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

    if (baseType === 'premixed') {
        // PREMIXED BASE MODE
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 50;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        // Předmíchaná báze vyplní celý zbývající objem
        premixedBaseVolume = remainingVolume;
        
        // VG a PG z předmíchané báze
        const premixedVgContent = premixedBaseVolume * (premixedVgPercent / 100);
        const premixedPgContent = premixedBaseVolume * (premixedPgPercent / 100);
        
        // Skutečný VG/PG poměr ze všech složek
        const actualVgFromAll = nicotineVgContent + flavorVgContent + premixedVgContent;
        const actualPgFromAll = nicotinePgContent + flavorPgContent + premixedPgContent;
        const actualVgPercent = (actualVgFromAll / totalAmount) * 100;
        
        // Pokud slider hodnota odpovídá skutečnému poměru (±1.5%), nepřidávat doladění
        const sliderMatchesActual = Math.abs(vgPercent - actualVgPercent) < 1.5;
        
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (!sliderMatchesActual) {
            // Uživatel změnil slider - potřeba doladění
            adjustmentVg = targetVgTotal - actualVgFromAll;
            adjustmentPg = targetPgTotal - actualPgFromAll;
            
            if (adjustmentVg < 0) adjustmentVg = 0;
            if (adjustmentPg < 0) adjustmentPg = 0;
            
            // Upravit předmíchanou bázi aby bylo místo na doladění
            const totalAdjustment = adjustmentVg + adjustmentPg;
            if (totalAdjustment > 0.1 && totalAdjustment < remainingVolume) {
                premixedBaseVolume = remainingVolume - totalAdjustment;
            }
        }
        
        // Add premixed base
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Add adjustment VG if needed (only if user changed slider)
        if (!sliderMatchesActual && adjustmentVg > 0.01) {
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: adjustmentVg,
                percent: (adjustmentVg / totalAmount) * 100
            });
            pureVgNeeded = adjustmentVg;
        }
        
        // Add adjustment PG if needed (only if user changed slider)
        if (!sliderMatchesActual && adjustmentPg > 0.01) {
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: adjustmentPg,
                percent: (adjustmentPg / totalAmount) * 100
            });
            purePgNeeded = adjustmentPg;
        }
    } else {
        // SEPARATE PG/VG MODE (original logic)
        pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
        purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;
        
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
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent + (baseType === 'premixed' ? premixedBaseVolume * (premixedVgPercent / 100) : 0);
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent + (baseType === 'premixed' ? premixedBaseVolume * ((100 - premixedVgPercent) / 100) : 0);
    
    // Display results
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'shakevape',
        flavorType: 'fruit',
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null
    });
    showPage('results');
}

// =========================================
// Shortfill Calculator Functions
// =========================================

// Calculate shortfill results in real-time (preview)
function calculateShortfill() {
    const bottleVolume = parseFloat(document.getElementById('sfBottleVolume')?.value) || 60;
    const liquidVolume = parseFloat(document.getElementById('sfLiquidVolume')?.value) || 50;
    const nicStrength = parseFloat(document.getElementById('sfNicStrength')?.value) || 20;
    const nicShotVolume = parseFloat(document.getElementById('sfNicShotVolume')?.value) || 10;
    const shotCount = parseInt(document.getElementById('sfShotCountValue')?.value) || 1;
    
    // Calculate results
    const totalNicVolume = nicShotVolume * shotCount;
    const totalVolume = liquidVolume + totalNicVolume;
    const resultNic = (nicStrength * totalNicVolume) / totalVolume;
    const freeSpace = bottleVolume - totalVolume;
    
    // Update display
    const totalEl = document.getElementById('sfResultTotal');
    const nicEl = document.getElementById('sfResultNic');
    const spaceEl = document.getElementById('sfResultSpace');
    
    if (totalEl) totalEl.textContent = `${totalVolume.toFixed(1)} ml`;
    if (nicEl) nicEl.textContent = `${resultNic.toFixed(2)} mg/ml`;
    if (spaceEl) spaceEl.textContent = `${freeSpace.toFixed(1)} ml`;
    
    // Show/hide warning
    const warningEl = document.getElementById('sfWarning');
    if (warningEl) {
        if (freeSpace < 0) {
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
}

// Adjust shot count
function adjustSfShotCount(change) {
    const valueEl = document.getElementById('sfShotCountValue');
    const displayEl = document.getElementById('sfShotCount');
    
    let current = parseInt(valueEl?.value) || 1;
    current += change;
    
    if (current < 1) current = 1;
    if (current > 10) current = 10;
    
    if (valueEl) valueEl.value = current;
    if (displayEl) displayEl.textContent = current;
    
    calculateShortfill();
}

// Calculate shortfill and show in results (Tvůj recept)
function calculateShortfillMix() {
    const bottleVolume = parseFloat(document.getElementById('sfBottleVolume')?.value) || 60;
    const liquidVolume = parseFloat(document.getElementById('sfLiquidVolume')?.value) || 50;
    const nicStrength = parseFloat(document.getElementById('sfNicStrength')?.value) || 20;
    const nicShotVolume = parseFloat(document.getElementById('sfNicShotVolume')?.value) || 10;
    const shotCount = parseInt(document.getElementById('sfShotCountValue')?.value) || 1;
    
    // Calculate results
    const totalNicVolume = nicShotVolume * shotCount;
    const totalVolume = liquidVolume + totalNicVolume;
    const resultNic = (nicStrength * totalNicVolume) / totalVolume;
    const freeSpace = bottleVolume - totalVolume;
    
    // Build ingredients for results display
    const ingredients = [];
    
    // Shortfill liquid
    ingredients.push({
        ingredientKey: 'shortfill_liquid',
        volume: liquidVolume,
        percent: (liquidVolume / totalVolume) * 100
    });
    
    // Nicotine shots (show total volume)
    ingredients.push({
        ingredientKey: 'nicotine_booster',
        vgRatio: 50,
        params: {
            strength: nicStrength,
            vgpg: '50/50',
            count: shotCount
        },
        volume: totalNicVolume,
        percent: (totalNicVolume / totalVolume) * 100
    });
    
    // Determine VG/PG ratio (typically shortfills are 70/30 VG/PG)
    // Assume shortfill is 70/30, nic shot is 50/50
    const shortfillVgPercent = 70;
    const nicShotVgPercent = 50;
    
    const vgFromShortfill = liquidVolume * (shortfillVgPercent / 100);
    const vgFromNic = totalNicVolume * (nicShotVgPercent / 100);
    const totalVg = vgFromShortfill + vgFromNic;
    const actualVgPercent = Math.round((totalVg / totalVolume) * 100);
    const actualPgPercent = 100 - actualVgPercent;
    
    // Display results
    displayResults(totalVolume, actualVgPercent, actualPgPercent, resultNic, ingredients, totalVolume, totalVg, totalVolume - totalVg, {
        formType: 'shortfill',
        flavorType: 'none',
        bottleVolume: bottleVolume,
        freeSpace: freeSpace,
        shotCount: shotCount
    });
    
    // Show warning if overflow
    if (freeSpace < 0) {
        showNotification(t('shortfill.overflow_warning', 'Pozor: Obsah přesáhne kapacitu lahvičky!'), 'warning');
    }
    
    showPage('results');
}

// Export shortfill functions
window.calculateShortfill = calculateShortfill;
window.adjustSfShotCount = adjustSfShotCount;
window.calculateShortfillMix = calculateShortfillMix;

// =========================================
// Liquid PRO Functions
// =========================================

let proVgPgLimits = { min: 0, max: 100 };

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode)
function autoRecalculateProVgPgRatio() {
    const baseType = document.getElementById('proBaseType')?.value || 'separate';
    if (baseType === 'premixed') {
        const actualVg = calculateActualVgPgRatio('pro');
        const slider = document.getElementById('proVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateProRatioDisplay();
        }
    }
    updateProVgPgLimits();
}

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
    const saltTypeContainer = document.getElementById('proSaltTypeContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        targetGroup.classList.add('hidden');
        if (saltTypeContainer) saltTypeContainer.classList.add('hidden');
        document.getElementById('proTargetNicotine').value = 0;
        updateProNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        targetGroup.classList.remove('hidden');
        
        // Show salt type selector only for salt type
        if (saltTypeContainer) {
            if (type === 'salt') {
                saltTypeContainer.classList.remove('hidden');
                // Aplikovat překlady na nově zobrazený kontejner
                if (window.i18n && window.i18n.applyTranslations) {
                    window.i18n.applyTranslations();
                }
            } else {
                saltTypeContainer.classList.add('hidden');
            }
        }
    }
    
    autoRecalculateProVgPgRatio();
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
    
    autoRecalculateProVgPgRatio();
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

    autoRecalculateProVgPgRatio();
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
    autoRecalculateProVgPgRatio();
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
    autoRecalculateProVgPgRatio();
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

    autoRecalculateProVgPgRatio();
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
    
    autoRecalculateProVgPgRatio();
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
                    
                    <!-- Volitelné složení příchutě (PRO) -->
                    <div class="form-group-sub flavor-composition-section">
                        <button type="button" class="prep-item-btn composition-toggle-btn" onclick="toggleFlavorComposition(${proFlavorCount})">
                            <span data-i18n="form.flavor_composition">${window.i18n?.t('form.flavor_composition') || 'Složení příchutě'}</span>
                            <span class="prep-arrow">▼</span>
                        </button>
                        <div class="prep-detail flavor-composition-detail hidden" id="flavorComposition${proFlavorCount}">
                            <p class="composition-hint" data-i18n="form.flavor_composition_hint">${window.i18n?.t('form.flavor_composition_hint') || 'Údaje najdete na webu výrobce'}</p>
                            <div class="composition-grid">
                                <div class="composition-item">
                                    <label>PG</label>
                                    <input type="number" id="proFlavorCompPg${proFlavorCount}" min="0" max="100" value="60" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label>VG</label>
                                    <input type="number" id="proFlavorCompVg${proFlavorCount}" min="0" max="100" value="5" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.alcohol">${window.i18n?.t('form.alcohol') || 'Alkohol'}</label>
                                    <input type="number" id="proFlavorCompAlcohol${proFlavorCount}" min="0" max="100" value="25" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.water">${window.i18n?.t('form.water') || 'Voda'}</label>
                                    <input type="number" id="proFlavorCompWater${proFlavorCount}" min="0" max="100" value="5" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.other">${window.i18n?.t('form.other') || 'Ostatní'}</label>
                                    <span id="proFlavorCompOther${proFlavorCount}" class="composition-calculated">5</span>
                                    <span>%</span>
                                </div>
                            </div>
                            <button type="button" class="neon-button small secondary" onclick="resetFlavorComposition(${proFlavorCount})" data-i18n="form.use_average">${window.i18n?.t('form.use_average') || 'Použít průměr'}</button>
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
        'proFlavorTrackRatio', 'proFlavorVgValue', 'proFlavorPgValue',
        'flavorComposition', 'proFlavorCompPg', 'proFlavorCompVg',
        'proFlavorCompAlcohol', 'proFlavorCompWater', 'proFlavorCompOther'
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

// ============================================
// FLAVOR COMPOSITION FUNCTIONS (PRO)
// ============================================

// Toggle flavor composition panel
function toggleFlavorComposition(flavorIndex) {
    const panel = document.getElementById(`flavorComposition${flavorIndex}`);
    const btn = document.querySelector(`button[onclick="toggleFlavorComposition(${flavorIndex})"]`);
    const arrow = btn?.querySelector('.prep-arrow');
    
    if (panel) {
        // Remove hidden class if present (initial state)
        panel.classList.remove('hidden');
        // Toggle open class for animation
        panel.classList.toggle('open');
        
        if (arrow) {
            arrow.textContent = panel.classList.contains('open') ? '▲' : '▼';
        }
        if (btn) {
            btn.classList.toggle('active', panel.classList.contains('open'));
        }
        
        // Pre-fill with average values for selected flavor type if opening
        if (panel.classList.contains('open')) {
            const flavorType = document.getElementById(`proFlavorType${flavorIndex}`)?.value || 'fruit';
            prefillFlavorComposition(flavorIndex, flavorType);
        }
    }
}

// Pre-fill flavor composition with average values from database
function prefillFlavorComposition(flavorIndex, flavorType) {
    const flavorData = flavorDatabase[flavorType];
    if (!flavorData || !flavorData.composition) return;
    
    const comp = flavorData.composition;
    const pgEl = document.getElementById(`proFlavorCompPg${flavorIndex}`);
    const vgEl = document.getElementById(`proFlavorCompVg${flavorIndex}`);
    const alcoholEl = document.getElementById(`proFlavorCompAlcohol${flavorIndex}`);
    const waterEl = document.getElementById(`proFlavorCompWater${flavorIndex}`);
    const otherEl = document.getElementById(`proFlavorCompOther${flavorIndex}`);
    
    if (pgEl) pgEl.value = comp.pg;
    if (vgEl) vgEl.value = comp.vg;
    if (alcoholEl) alcoholEl.value = comp.alcohol;
    if (waterEl) waterEl.value = comp.water;
    if (otherEl) otherEl.textContent = comp.other;
}

// Update "Other" value in composition (auto-calculate to 100%)
function updateFlavorCompositionOther(flavorIndex) {
    const pgEl = document.getElementById(`proFlavorCompPg${flavorIndex}`);
    const vgEl = document.getElementById(`proFlavorCompVg${flavorIndex}`);
    const alcoholEl = document.getElementById(`proFlavorCompAlcohol${flavorIndex}`);
    const waterEl = document.getElementById(`proFlavorCompWater${flavorIndex}`);
    const otherEl = document.getElementById(`proFlavorCompOther${flavorIndex}`);
    
    const pg = parseFloat(pgEl?.value) || 0;
    const vg = parseFloat(vgEl?.value) || 0;
    const alcohol = parseFloat(alcoholEl?.value) || 0;
    const water = parseFloat(waterEl?.value) || 0;
    
    const other = Math.max(0, 100 - pg - vg - alcohol - water);
    if (otherEl) otherEl.textContent = other.toFixed(0);
}

// Reset flavor composition to average
function resetFlavorComposition(flavorIndex) {
    const flavorType = document.getElementById(`proFlavorType${flavorIndex}`)?.value || 'fruit';
    prefillFlavorComposition(flavorIndex, flavorType);
}

// Get custom composition for a flavor (if set)
function getFlavorCustomComposition(flavorIndex) {
    const panel = document.getElementById(`flavorComposition${flavorIndex}`);
    if (!panel || panel.classList.contains('hidden')) {
        return null; // Not customized
    }
    
    const pg = parseFloat(document.getElementById(`proFlavorCompPg${flavorIndex}`)?.value) || 0;
    const vg = parseFloat(document.getElementById(`proFlavorCompVg${flavorIndex}`)?.value) || 0;
    const alcohol = parseFloat(document.getElementById(`proFlavorCompAlcohol${flavorIndex}`)?.value) || 0;
    const water = parseFloat(document.getElementById(`proFlavorCompWater${flavorIndex}`)?.value) || 0;
    const other = Math.max(0, 100 - pg - vg - alcohol - water);
    
    return { pg, vg, alcohol, water, other };
}

// Export flavor composition functions
window.toggleFlavorComposition = toggleFlavorComposition;
window.prefillFlavorComposition = prefillFlavorComposition;
window.updateFlavorCompositionOther = updateFlavorCompositionOther;
window.resetFlavorComposition = resetFlavorComposition;
window.getFlavorCustomComposition = getFlavorCustomComposition;

// ============================================
// ADDITIVES FUNCTIONS (PRO only)
// ============================================

let proAdditiveCount = 0;
const MAX_PRO_ADDITIVES = 4;

// Add a new additive row
function addProAdditive() {
    if (proAdditiveCount >= MAX_PRO_ADDITIVES) {
        return;
    }
    
    proAdditiveCount++;
    const container = document.getElementById('proAdditivesContainer');
    
    const additiveHtml = `
        <div class="additive-row form-group-sub" id="proAdditiveRow${proAdditiveCount}">
            <div class="additive-header">
                <select id="proAdditiveType${proAdditiveCount}" class="neon-select" onchange="updateProAdditiveType(${proAdditiveCount})">
                    <option value="" data-i18n="form.additive_select">${window.i18n?.t('form.additive_select') || 'Vyberte typ...'}</option>
                    <option value="coolant" data-i18n="additive.coolant">${window.i18n?.t('additive.coolant') || 'Chladivo (WS-23, Koolada)'}</option>
                    <option value="sweetener" data-i18n="additive.sweetener">${window.i18n?.t('additive.sweetener') || 'Sladidlo (Sukralóza)'}</option>
                    <option value="enhancer" data-i18n="additive.enhancer">${window.i18n?.t('additive.enhancer') || 'Zesilovač (Smooth, TH)'}</option>
                    <option value="terpene" data-i18n="additive.terpene">${window.i18n?.t('additive.terpene') || 'Terpeny'}</option>
                </select>
                <button type="button" class="remove-btn" onclick="removeProAdditive(${proAdditiveCount})">×</button>
            </div>
            
            <div id="proAdditiveDetails${proAdditiveCount}" class="additive-details hidden">
                <div class="additive-description" id="proAdditiveDesc${proAdditiveCount}"></div>
                
                <div class="additive-percent-row">
                    <label data-i18n="form.percent">${window.i18n?.t('form.percent') || 'Procento'}:</label>
                    <div class="input-wrapper small">
                        <input type="number" id="proAdditivePercent${proAdditiveCount}" min="0.1" max="10" step="0.1" value="1" class="neon-input small" oninput="updateProAdditiveCalculation()">
                        <span class="input-unit">%</span>
                    </div>
                </div>
                
                <button type="button" class="prep-item-btn composition-toggle-btn small" onclick="toggleAdditiveComposition(${proAdditiveCount})">
                    <span data-i18n="form.custom_composition">${window.i18n?.t('form.custom_composition') || 'Vlastní složení'}</span>
                    <span class="prep-arrow">▼</span>
                </button>
                <div class="prep-detail additive-composition-detail hidden" id="additiveComposition${proAdditiveCount}">
                    <div class="composition-grid">
                        <div class="composition-item">
                            <label>PG</label>
                            <input type="number" id="proAdditiveCompPg${proAdditiveCount}" min="0" max="100" value="100" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label>VG</label>
                            <input type="number" id="proAdditiveCompVg${proAdditiveCount}" min="0" max="100" value="0" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label data-i18n="form.alcohol">${window.i18n?.t('form.alcohol') || 'Alkohol'}</label>
                            <input type="number" id="proAdditiveCompAlcohol${proAdditiveCount}" min="0" max="100" value="0" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label data-i18n="form.other">${window.i18n?.t('form.other') || 'Ostatní'}</label>
                            <span id="proAdditiveCompOther${proAdditiveCount}" class="composition-calculated">0</span>
                            <span>%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', additiveHtml);
    
    // Hide add button if max reached
    if (proAdditiveCount >= MAX_PRO_ADDITIVES) {
        document.getElementById('proAddAdditiveBtn').classList.add('hidden');
    }
}

// Remove an additive
function removeProAdditive(additiveIndex) {
    const row = document.getElementById(`proAdditiveRow${additiveIndex}`);
    if (row) {
        row.remove();
    }
    
    proAdditiveCount--;
    
    // Show add button if below max
    if (proAdditiveCount < MAX_PRO_ADDITIVES) {
        document.getElementById('proAddAdditiveBtn').classList.remove('hidden');
    }
    
    autoRecalculateProVgPgRatio();
}

// Update additive type selection
function updateProAdditiveType(additiveIndex) {
    const typeSelect = document.getElementById(`proAdditiveType${additiveIndex}`);
    const detailsContainer = document.getElementById(`proAdditiveDetails${additiveIndex}`);
    const descEl = document.getElementById(`proAdditiveDesc${additiveIndex}`);
    const percentEl = document.getElementById(`proAdditivePercent${additiveIndex}`);
    
    const type = typeSelect?.value;
    
    if (type && additiveDatabase[type]) {
        const additive = additiveDatabase[type];
        
        // Show details
        if (detailsContainer) detailsContainer.classList.remove('hidden');
        
        // Set description
        if (descEl) {
            descEl.textContent = t(additive.descriptionKey, '');
        }
        
        // Set default percent
        if (percentEl) {
            percentEl.value = additive.defaultPercent;
            percentEl.min = additive.minPercent;
            percentEl.max = additive.maxPercent;
        }
        
        // Pre-fill composition
        prefillAdditiveComposition(additiveIndex, type);
        
    } else {
        if (detailsContainer) detailsContainer.classList.add('hidden');
    }
    
    autoRecalculateProVgPgRatio();
}

// Toggle additive composition panel
function toggleAdditiveComposition(additiveIndex) {
    const panel = document.getElementById(`additiveComposition${additiveIndex}`);
    const btn = document.querySelector(`button[onclick="toggleAdditiveComposition(${additiveIndex})"]`);
    const arrow = btn?.querySelector('.prep-arrow');
    
    if (panel) {
        // Remove hidden class if present (initial state)
        panel.classList.remove('hidden');
        // Toggle open class for animation
        panel.classList.toggle('open');
        
        if (arrow) {
            arrow.textContent = panel.classList.contains('open') ? '▲' : '▼';
        }
        if (btn) {
            btn.classList.toggle('active', panel.classList.contains('open'));
        }
    }
}

// Pre-fill additive composition with default values
function prefillAdditiveComposition(additiveIndex, type) {
    const additive = additiveDatabase[type];
    if (!additive || !additive.composition) return;
    
    const comp = additive.composition;
    const pgEl = document.getElementById(`proAdditiveCompPg${additiveIndex}`);
    const vgEl = document.getElementById(`proAdditiveCompVg${additiveIndex}`);
    const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${additiveIndex}`);
    const otherEl = document.getElementById(`proAdditiveCompOther${additiveIndex}`);
    
    if (pgEl) pgEl.value = comp.pg;
    if (vgEl) vgEl.value = comp.vg;
    if (alcoholEl) alcoholEl.value = comp.alcohol;
    if (otherEl) otherEl.textContent = comp.other;
}

// Update "Other" value in additive composition (auto-adjust to 100%)
function updateAdditiveCompositionOther(additiveIndex) {
    const pgEl = document.getElementById(`proAdditiveCompPg${additiveIndex}`);
    const vgEl = document.getElementById(`proAdditiveCompVg${additiveIndex}`);
    const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${additiveIndex}`);
    const otherEl = document.getElementById(`proAdditiveCompOther${additiveIndex}`);
    
    let pg = parseFloat(pgEl?.value) || 0;
    let vg = parseFloat(vgEl?.value) || 0;
    let alcohol = parseFloat(alcoholEl?.value) || 0;
    
    // Zajistit aby hodnoty nepřekročily 100%
    const total = pg + vg + alcohol;
    if (total > 100) {
        // Proporcionálně snížit hodnoty
        const ratio = 100 / total;
        pg = Math.round(pg * ratio);
        vg = Math.round(vg * ratio);
        alcohol = Math.round(alcohol * ratio);
        
        // Aktualizovat vstupní pole
        if (pgEl) pgEl.value = pg;
        if (vgEl) vgEl.value = vg;
        if (alcoholEl) alcoholEl.value = alcohol;
    }
    
    const other = Math.max(0, 100 - pg - vg - alcohol);
    if (otherEl) otherEl.textContent = other.toFixed(0);
    
    // Přepočítat VG/PG poměr
    autoRecalculateProVgPgRatio();
}

// Update calculation when additive percent changes
function updateProAdditiveCalculation() {
    autoRecalculateProVgPgRatio();
}

// Get all additives data
function getProAdditivesData() {
    const additives = [];
    
    for (let i = 1; i <= MAX_PRO_ADDITIVES; i++) {
        const typeEl = document.getElementById(`proAdditiveType${i}`);
        const percentEl = document.getElementById(`proAdditivePercent${i}`);
        
        if (typeEl && typeEl.value && percentEl) {
            const type = typeEl.value;
            const percent = parseFloat(percentEl.value) || 0;
            
            // Check for custom composition
            const panel = document.getElementById(`additiveComposition${i}`);
            let customComposition = null;
            
            if (panel && !panel.classList.contains('hidden')) {
                const pg = parseFloat(document.getElementById(`proAdditiveCompPg${i}`)?.value) || 0;
                const vg = parseFloat(document.getElementById(`proAdditiveCompVg${i}`)?.value) || 0;
                const alcohol = parseFloat(document.getElementById(`proAdditiveCompAlcohol${i}`)?.value) || 0;
                const other = Math.max(0, 100 - pg - vg - alcohol);
                customComposition = { pg, vg, alcohol, water: 0, other };
            }
            
            additives.push({
                index: i,
                type: type,
                percent: percent,
                customComposition: customComposition
            });
        }
    }
    
    return additives;
}

// Export additive functions
window.addProAdditive = addProAdditive;
window.removeProAdditive = removeProAdditive;
window.updateProAdditiveType = updateProAdditiveType;
window.toggleAdditiveComposition = toggleAdditiveComposition;
window.updateAdditiveCompositionOther = updateAdditiveCompositionOther;
window.updateProAdditiveCalculation = updateProAdditiveCalculation;
window.getProAdditivesData = getProAdditivesData;

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
    
    const limitValueLeft = document.getElementById('proLimitValueLeft');
    const limitValueRight = document.getElementById('proLimitValueRight');
    
    if (disabledLeft) {
        disabledLeft.style.width = proVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - proVgPgLimits.max) + '%';
    }
    
    // Zobrazit hodnoty limitů
    if (limitValueLeft) {
        if (proVgPgLimits.min > 0) {
            limitValueLeft.textContent = proVgPgLimits.min + '%';
            limitValueLeft.style.display = 'block';
        } else {
            limitValueLeft.style.display = 'none';
        }
    }
    if (limitValueRight) {
        if (proVgPgLimits.max < 100) {
            limitValueRight.textContent = proVgPgLimits.max + '%';
            limitValueRight.style.display = 'block';
        } else {
            limitValueRight.style.display = 'none';
        }
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
    
    // Get base type (separate or premixed) - PRO version
    const baseType = document.getElementById('proBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('proPremixedRatio')?.value || '60/40';
    
    // Získat data všech příchutí (multi-flavor support)
    const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
    const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
    const totalFlavorVolume = (totalFlavorPercent / 100) * totalAmount;
    
    // Získat data aditiv
    const additivesData = typeof getProAdditivesData === 'function' ? getProAdditivesData() : [];
    const totalAdditivePercent = additivesData.reduce((sum, a) => sum + a.percent, 0);
    const totalAdditiveVolume = (totalAdditivePercent / 100) * totalAmount;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    const remainingVolume = totalAmount - nicotineVolume - totalFlavorVolume - totalAdditiveVolume;
    
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
    
    // Spočítat VG/PG obsah z aditiv
    let totalAdditiveVgContent = 0;
    let totalAdditivePgContent = 0;
    
    additivesData.forEach(additive => {
        const additiveVolume = (additive.percent / 100) * totalAmount;
        const composition = additive.customComposition || (additiveDatabase[additive.type]?.composition) || { pg: 100, vg: 0 };
        totalAdditiveVgContent += additiveVolume * (composition.vg / 100);
        totalAdditivePgContent += additiveVolume * (composition.pg / 100);
    });
    
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;
    
    let pureVgNeeded = targetVgTotal - nicotineVgContent - totalFlavorVgContent - totalAdditiveVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - totalFlavorPgContent - totalAdditivePgContent;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 60;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    const ingredients = [];
    
    if (baseType === 'premixed') {
        // PREMIXED BASE MODE for PRO
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 60;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        premixedBaseVolume = remainingVolume;
        
        const premixedVgContent = premixedBaseVolume * (premixedVgPercent / 100);
        const premixedPgContent = premixedBaseVolume * (premixedPgPercent / 100);
        
        // Skutečný VG/PG poměr ze všech složek (včetně aditiv)
        const actualVgFromAll = nicotineVgContent + totalFlavorVgContent + totalAdditiveVgContent + premixedVgContent;
        const actualPgFromAll = nicotinePgContent + totalFlavorPgContent + totalAdditivePgContent + premixedPgContent;
        const actualVgPercent = (actualVgFromAll / totalAmount) * 100;
        
        // Pokud slider hodnota odpovídá skutečnému poměru (±1%), nepřidávat doladění
        const sliderMatchesActual = Math.abs(vgPercent - actualVgPercent) < 1.5;
        
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (!sliderMatchesActual) {
            // Uživatel změnil slider - potřeba doladění
            adjustmentVg = targetVgTotal - actualVgFromAll;
            adjustmentPg = targetPgTotal - actualPgFromAll;
            
            if (adjustmentVg < 0) adjustmentVg = 0;
            if (adjustmentPg < 0) adjustmentPg = 0;
        }
        
        const totalAdjustment = adjustmentVg + adjustmentPg;
        if (totalAdjustment > 0.1 && totalAdjustment < remainingVolume) {
            premixedBaseVolume = remainingVolume - totalAdjustment;
            pureVgNeeded = adjustmentVg;
            purePgNeeded = adjustmentPg;
        } else {
            premixedBaseVolume = remainingVolume;
            pureVgNeeded = 0;
            purePgNeeded = 0;
        }
        
        // Add nicotine
        if (nicotineVolume > 0) {
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: `${nicVgPercent}/${nicPgPercent}`
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }
        
        // Add all flavors
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
                percent: (flavorVolume / totalAmount) * 100
            });
        });
        
        // Add all additives
        additivesData.forEach((additive) => {
            const additiveVolume = (additive.percent / 100) * totalAmount;
            
            ingredients.push({
                ingredientKey: 'additive',
                additiveType: additive.type,
                customComposition: additive.customComposition,
                volume: additiveVolume,
                percent: (additiveVolume / totalAmount) * 100
            });
        });
        
        // Add premixed base
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Add adjustment VG/PG if needed
        if (pureVgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: pureVgNeeded,
                percent: (pureVgNeeded / totalAmount) * 100
            });
        }
        
        if (purePgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: purePgNeeded,
                percent: (purePgNeeded / totalAmount) * 100
            });
        }
        
    } else {
        // SEPARATE PG/VG MODE (original logic)
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
        
        // Add nicotine
        if (nicotineVolume > 0) {
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: `${nicVgPercent}/${nicPgPercent}`
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }
        
        // Add all flavors
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
                percent: (flavorVolume / totalAmount) * 100
            });
        });
        
        // Add all additives
        additivesData.forEach((additive) => {
            const additiveVolume = (additive.percent / 100) * totalAmount;
            
            ingredients.push({
                ingredientKey: 'additive',
                additiveType: additive.type,
                customComposition: additive.customComposition,
                volume: additiveVolume,
                percent: (additiveVolume / totalAmount) * 100
            });
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
    }
    
    // Calculate actual VG/PG
    let actualVg = pureVgNeeded + nicotineVgContent + totalFlavorVgContent + totalAdditiveVgContent;
    let actualPg = purePgNeeded + nicotinePgContent + totalFlavorPgContent + totalAdditivePgContent;
    
    if (baseType === 'premixed' && premixedBaseVolume > 0) {
        actualVg += premixedBaseVolume * (premixedVgPercent / 100);
        actualPg += premixedBaseVolume * ((100 - premixedVgPercent) / 100);
    }
    
    // Uložit data příchutí pro recept
    window.lastProFlavorsData = flavorsData;
    
    // Kontrola přihlášení před zobrazením výsledků - Liquid PRO vyžaduje přihlášení
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'liquidpro',
        flavors: flavorsData,
        additives: additivesData,
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null
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
    
    // Zkontrolovat zda uživatel již souhlasil s OP (terms_accepted_at v DB)
    let hasAcceptedTerms = false;
    if (isLoggedIn && window.LiquiMixerDB) {
        try {
            const userData = await window.LiquiMixerDB.getUser(window.Clerk.user.id);
            hasAcceptedTerms = !!userData?.terms_accepted_at;
            console.log('showSubscriptionModal: hasAcceptedTerms =', hasAcceptedTerms, 'terms_accepted_at =', userData?.terms_accepted_at);
        } catch (e) {
            console.warn('showSubscriptionModal: Failed to check terms acceptance:', e);
        }
    }
    
    // Zobrazit správný stav podle přihlášení A souhlasu s OP
    // Přihlášený uživatel bez souhlasu s OP musí nejprve souhlasit (Stav A)
    if (isLoggedIn && hasAcceptedTerms && loggedInState) {
        // STAV B: Uživatel je přihlášen A již souhlasil s OP → zobrazit potvrzení a tlačítko Zaplatit
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
async function startRegistrationAndPayment() {
    const termsCheckbox = document.getElementById('termsCheckboxGuest');
    if (!termsCheckbox?.checked) {
        return;
    }
    
    // Zkontrolovat zda je uživatel přihlášen (OAuth uživatel bez souhlasu s OP)
    if (window.Clerk?.user) {
        // Přihlášený uživatel - uložit souhlas s OP do DB a rovnou přejít na platbu
        console.log('startRegistrationAndPayment: User is logged in, saving terms acceptance and proceeding to payment...');
        
        if (window.LiquiMixerDB) {
            await window.LiquiMixerDB.saveTermsAcceptance(window.Clerk.user.id);
        }
        
        // Přejít přímo na platbu
        startPayment();
        return;
    }
    
    // Nepřihlášený uživatel - standardní flow: uložit flag a přejít na registraci
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

// Detekovat lokaci uživatele - VŽDY použít IP geolokaci, pak fallback
async function detectUserLocation() {
    // Získat aktuální jazyk z i18n (pouze pro fallback)
    const currentLocale = window.i18n?.getLocale() || 'cs';
    
    // Cenové mapy - pouze CZK, EUR, USD
    const priceMap = {
        'CZK': { grossAmount: 59, currency: 'CZK', vatRate: 21 },
        'EUR': { grossAmount: 2.4, currency: 'EUR', vatRate: 20 },
        'USD': { grossAmount: 2.9, currency: 'USD', vatRate: 0 }
    };
    
    // Mapování jazyků na měny (pouze CZK, EUR, USD) - pouze pro fallback
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
        // VŽDY zkusit IP geolokaci - i pro nepřihlášené uživatele
        // Pro přihlášené použít Clerk token, pro nepřihlášené bez tokenu
        const clerkToken = window.Clerk?.user ? await getClerkToken() : null;
        
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/geolocation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                ...(clerkToken ? { 'x-clerk-token': clerkToken } : {}),
            },
            body: JSON.stringify({ 
                action: 'detect',
                data: { clerkId: window.Clerk?.user?.id || null }
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
        
        // Fallback: Použít měnu podle aktuálního jazyka
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
                    // Jazyk uživatele pro fakturu - použít getLocale() funkci z i18n modulu
                    locale: window.i18n?.getLocale?.() || 'en',
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
    const noteInput = document.getElementById('saveRecipeReminderNote');
    if (checkbox) checkbox.checked = false;
    if (fields) fields.classList.add('hidden');
    if (mixDateInput) mixDateInput.value = '';
    if (reminderDateInput) reminderDateInput.value = '';
    if (noteInput) noteInput.value = '';
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
    let maxSteepingDays = 7; // Default steeping days
    
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
            if (maxSteeping > 0) maxSteepingDays = maxSteeping;
            flavorName = currentRecipeData.flavors
                .filter(f => f.type && f.type !== 'none')
                .map(f => getFlavorName(f.type))
                .join(', ');
        } else if (currentRecipeData.flavorType && currentRecipeData.flavorType !== 'none') {
            flavorType = currentRecipeData.flavorType;
            flavorName = getFlavorName(flavorType);
            const flavorData = flavorDatabase[flavorType];
            if (flavorData && flavorData.steepingDays) {
                maxSteepingDays = flavorData.steepingDays;
            }
        } else if (currentRecipeData.formType === 'shisha' && currentRecipeData.flavors) {
            // Shisha recepty
            let maxSteeping = 0;
            for (const flavor of currentRecipeData.flavors) {
                if (flavor.type && flavor.type !== 'none') {
                    const flavorData = shishaFlavorDatabase[flavor.type];
                    if (flavorData && flavorData.steepingDays > maxSteeping) {
                        maxSteeping = flavorData.steepingDays;
                        flavorType = flavor.type;
                    }
                }
            }
            if (maxSteeping > 0) maxSteepingDays = maxSteeping;
            flavorName = currentRecipeData.flavors
                .filter(f => f.type && f.type !== 'none')
                .map(f => {
                    const fd = shishaFlavorDatabase[f.type];
                    return fd ? t(`shisha.flavor_${f.type}`, fd.name) : f.type;
                })
                .join(', ');
        }
    }

    const noteInput = document.getElementById('saveRecipeReminderNote');
    let note = noteInput ? noteInput.value.trim() : '';
    
    // Pokud uživatel nezadal vlastní poznámku, automaticky přidat informaci o počtu dní zrání
    if (!note && maxSteepingDays > 0) {
        const daysText = maxSteepingDays === 1 ? t('common.day', 'den') : 
            (maxSteepingDays >= 2 && maxSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
        note = t('reminder.auto_note_steeping', 'Zrání {days} {daysUnit}')
            .replace('{days}', maxSteepingDays.toString())
            .replace('{daysUnit}', daysText);
    }

    return {
        mixed_at: mixDateInput.value,
        remind_at: reminderDateInput.value,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague',
        note: note || null
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
    
    // Kontrola vyzrálosti - remind_at <= dnes a status je pending
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.remind_at);
    reminderDate.setHours(0, 0, 0, 0);
    const isMatured = reminder.status === 'pending' && reminderDate <= today;
    
    // Stock tracking
    const stockPercent = reminder.stock_percent ?? 100;
    const isConsumed = reminder.consumed_at != null;
    
    // Skrýt spotřebované připomínky
    if (isConsumed) return '';
    
    // Barva podle stavu zásoby
    const stockColor = stockPercent >= 50 ? 'var(--neon-green)' : 
                       stockPercent > 20 ? '#ffcc00' : '#ff4444';
    const lowClass = stockPercent <= 20 ? 'low' : '';
    // Barva textu procent: černá při >=50%, bílá při <50%
    const percentTextClass = stockPercent >= 50 ? '' : 'low-text';
    
    // Sestavit CSS třídy
    let statusClass = '';
    if (reminder.status === 'sent') {
        statusClass = 'sent';
    } else if (reminder.status === 'cancelled') {
        statusClass = 'cancelled';
    } else if (isMatured) {
        statusClass = 'matured';
    }

    let statusBadge = '';
    if (reminder.status === 'sent') {
        statusBadge = `<span class="reminder-status-badge sent">✓ ${t('reminder.sent', 'Odesláno')}</span>`;
    } else if (reminder.status === 'cancelled') {
        statusBadge = `<span class="reminder-status-badge cancelled">✕ ${t('reminder.cancelled', 'Zrušeno')}</span>`;
    } else if (isMatured) {
        statusBadge = `<span class="reminder-status-badge matured">✓ ${t('reminder.matured', 'Vyzrálo')}</span>`;
    }

    return `
        <div class="reminder-item ${statusClass}" data-reminder-id="${reminder.id}">
            <div class="reminder-dates clickable" onclick="showViewReminderModal('${reminder.id}')">
                <div class="reminder-mixed-date">${t('reminder.mixed_on', 'Namícháno')}: ${mixedDate}</div>
                <div class="reminder-remind-date">${t('reminder.reminder_on', 'Připomínka')}: ${remindDate} ${statusBadge}</div>
            </div>
            
            <!-- Wrapper pro stock bar + akční tlačítka (mobilní 2-řádkový layout) -->
            <div class="reminder-controls">
                <!-- Stock bar - bateriový styl s pořadím: mínus-baterie-plus -->
                <div class="reminder-stock">
                    <button type="button" class="stock-btn minus" onclick="event.stopPropagation(); updateReminderStockUI('${reminder.id}', '${recipeId}', -10)" title="-10%">−</button>
                    <div class="stock-battery">
                        <div class="battery-body">
                            <div class="battery-level ${lowClass}" 
                                 id="stock-bar-${reminder.id}"
                                 style="width: ${stockPercent}%; background: ${stockColor};">
                            </div>
                            <span class="battery-percent ${percentTextClass}">${stockPercent}%</span>
                        </div>
                        <div class="battery-tip"></div>
                    </div>
                    <button type="button" class="stock-btn plus" onclick="event.stopPropagation(); updateReminderStockUI('${reminder.id}', '${recipeId}', +10)" title="+10%">+</button>
                </div>
                
                ${reminder.status === 'pending' ? `
                    <div class="reminder-actions">
                        <button type="button" class="reminder-btn edit" onclick="event.stopPropagation(); showEditReminderModal('${reminder.id}', '${recipeId}')">${reminderEditIcon}</button>
                        <button type="button" class="reminder-btn delete" onclick="event.stopPropagation(); deleteReminderConfirm('${reminder.id}', '${recipeId}')">${reminderDeleteIcon}</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// =============================================
// KONTROLA VYZRÁLÝCH LIQUIDŮ (IN-APP NOTIFIKACE)
// =============================================

// Konstanty pro localStorage klíče
const MATURED_DISMISS_COUNT_PREFIX = 'liquimixer_matured_dismiss_count_';
const MATURED_DISMISSED_TODAY_PREFIX = 'liquimixer_matured_dismissed_today_';

// Zkontrolovat zda byla konkrétní připomínka dnes již zavřena
function wasReminderDismissedToday(reminderId) {
    const dismissedDate = localStorage.getItem(MATURED_DISMISSED_TODAY_PREFIX + reminderId);
    if (!dismissedDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return dismissedDate === today;
}

// Označit připomínku jako zavřenou dnes
function setReminderDismissedToday(reminderId) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(MATURED_DISMISSED_TODAY_PREFIX + reminderId, today);
}

// Získat počet zavření pro konkrétní připomínku (celkový - pro permanentní skrytí po 3x)
function getMaturedDismissCount(reminderId) {
    const count = localStorage.getItem(MATURED_DISMISS_COUNT_PREFIX + reminderId);
    return count ? parseInt(count, 10) : 0;
}

// Inkrementovat počet zavření pro připomínku
function incrementMaturedDismissCount(reminderId) {
    const count = getMaturedDismissCount(reminderId);
    localStorage.setItem(MATURED_DISMISS_COUNT_PREFIX + reminderId, (count + 1).toString());
}

// Zavřít notifikaci a uložit stav do localStorage
function dismissMaturedNotification(reminderIds) {
    // Pro každou připomínku:
    // 1. Označit jako zavřenou dnes (nezobrazí se znovu dnes)
    // 2. Inkrementovat celkové počítadlo (po 3x se nezobrazí vůbec)
    if (reminderIds && Array.isArray(reminderIds)) {
        reminderIds.forEach(id => {
            setReminderDismissedToday(id);
            incrementMaturedDismissCount(id);
        });
    }
    
    // Odstranit notifikaci z DOM
    const notification = document.querySelector('.matured-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

// Zkontrolovat vyzrálé liquidy a zobrazit in-app notifikaci
async function checkMaturedReminders() {
    if (!window.Clerk?.user || !window.LiquiMixerDB) return;
    
    try {
        const clerkId = window.Clerk.user.id;
        const reminders = await window.LiquiMixerDB.getUserReminders(clerkId);
        
        if (!reminders || reminders.length === 0) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Najít vyzrálé liquidy (pending a remind_at <= dnes)
        // Filtrovat ty, které:
        // 1. Jsou spotřebované (consumed_at != null nebo stock_percent <= 0)
        // 2. Byly dnes již zavřeny (nezobrazí se znovu dnes)
        // 3. Byly zavřeny 3x nebo více (nezobrazí se vůbec)
        const maturedReminders = reminders.filter(r => {
            if (r.status !== 'pending') return false;
            
            // Přeskočit spotřebované připomínky
            if (r.consumed_at != null) return false;
            const stockPercent = r.stock_percent ?? 100;
            if (stockPercent <= 0) return false;
            
            const remindDate = new Date(r.remind_at);
            remindDate.setHours(0, 0, 0, 0);
            if (remindDate > today) return false;
            
            // Přeskočit pokud byla připomínka dnes již zavřena
            if (wasReminderDismissedToday(r.id)) {
                console.log(`Reminder ${r.id} was dismissed today, skipping`);
                return false;
            }
            
            // Přeskočit pokud má připomínka 3+ celkových zavření
            const dismissCount = getMaturedDismissCount(r.id);
            if (dismissCount >= 3) {
                console.log(`Reminder ${r.id} dismissed ${dismissCount} times total, skipping permanently`);
                return false;
            }
            
            return true;
        });
        
        if (maturedReminders.length > 0) {
            console.log('Found matured reminders:', maturedReminders.length);
            showMaturedLiquidsNotification(maturedReminders);
        }
    } catch (error) {
        console.error('Error checking matured reminders:', error);
    }
}

// Zobrazit notifikaci o vyzrálých liquidech
function showMaturedLiquidsNotification(maturedReminders) {
    if (!maturedReminders || maturedReminders.length === 0) return;
    
    // Získat překlady
    const title = t('reminder.matured_title', 'Vaše liquidy jsou vyzrálé!');
    const singleLiquid = t('reminder.matured_single', 'Váš liquid "{name}" je vyzrálý a připraven k použití.');
    const multipleLiquids = t('reminder.matured_multiple', '{count} liquidů je vyzrálých a připravených k použití.');
    const viewButton = t('reminder.view_recipes', 'Zobrazit recepty');
    const dismissButton = t('common.dismiss', 'Zavřít');
    
    // Sestavit zprávu
    let message;
    if (maturedReminders.length === 1) {
        const name = maturedReminders[0].recipe_name || maturedReminders[0].flavor_name || 'Liquid';
        message = singleLiquid.replace('{name}', name);
    } else {
        message = multipleLiquids.replace('{count}', maturedReminders.length.toString());
    }
    
    // Uložit ID připomínek pro dismiss handler
    const reminderIds = maturedReminders.map(r => r.id);
    window._currentMaturedReminderIds = reminderIds;
    
    // Vytvořit toast notifikaci s akcemi
    const existing = document.querySelector('.matured-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification toast-success matured-notification';
    notification.innerHTML = `
        <div class="matured-notification-content">
            <div class="matured-notification-icon">🧪</div>
            <div class="matured-notification-text">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        </div>
        <div class="matured-notification-actions">
            <button class="matured-btn-view" onclick="goToSavedRecipes(); this.closest('.matured-notification').remove();">${viewButton}</button>
            <button class="matured-btn-dismiss" onclick="dismissMaturedNotification(window._currentMaturedReminderIds);">${dismissButton}</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animace
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-dismiss po 30 sekundách (bez inkrementace počítadla - pouze skrytí)
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 30000);
}

// Přejít na uložené recepty (z notifikace o vyzrálých liquidech)
function goToSavedRecipes() {
    // Volat showMyRecipes() pro správné načtení receptů
    showMyRecipes();
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

    // Vyčistit poznámku pro novou připomínku
    const noteInput = document.getElementById('reminderNote');
    if (noteInput) noteInput.value = '';

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
    const noteInput = document.getElementById('reminderNote');
    if (mixDateInput) { mixDateInput.value = reminder.mixed_at; initDatePickerElement(mixDateInput); }
    if (remindDateInput) { remindDateInput.value = reminder.remind_at; initDatePickerElement(remindDateInput); }
    if (noteInput) noteInput.value = reminder.note || '';

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
    const noteInput = document.getElementById('reminderNote');
    const note = noteInput ? noteInput.value.trim() : '';

    if (isNaN(new Date(mixDate).getTime()) || isNaN(new Date(remindDate).getTime())) {
        alert(t('reminder.invalid_date', 'Neplatný formát data.'));
        return false;
    }

    try {
        if (editingReminderId) {
            const updated = await window.LiquiMixerDB.updateReminder(window.Clerk.user.id, editingReminderId, { mixed_at: mixDate, remind_at: remindDate, note: note });
            if (updated) { alert(t('reminder.updated', 'Připomínka byla upravena!')); }
            else { alert(t('reminder.update_error', 'Chyba při úpravě připomínky.')); return false; }
        } else {
            const recipe = window.currentViewingRecipe;
            await saveNewReminder(currentReminderRecipeId, mixDate, remindDate, currentReminderFlavorType, currentReminderFlavorName, recipe?.name || '', note);
        }
        // Uložit recipeId před zavřením modálu (hideAddReminderModal nastaví currentReminderRecipeId na null)
        const recipeIdToRefresh = currentReminderRecipeId;
        
        hideAddReminderModal();
        
        // Obnovit seznam připomínek
        if (recipeIdToRefresh) loadRecipeReminders(recipeIdToRefresh);
        
        // Po uložení připomínky aktualizovat maturedRecipeIds a zkontrolovat notifikace
        await loadMaturedRecipeIds();
        // Zkontrolovat zda nová připomínka je vyzrálá a zobrazit notifikaci
        checkMaturedReminders();
    } catch (error) {
        console.error('Error saving reminder:', error);
        alert(t('reminder.save_error', 'Chyba při ukládání připomínky.'));
    }

    return false;
}

async function saveNewReminder(recipeId, mixDate, remindDate, flavorType, flavorName, recipeName, note = '') {
    if (!window.Clerk || !window.Clerk.user) return false;
    const reminderData = {
        recipe_id: recipeId,
        mixed_at: mixDate,
        remind_at: remindDate,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        recipe_name: recipeName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague',
        note: note || null
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

// Aktuální zobrazená připomínka v modalu (pro stock aktualizace)
let currentViewReminderId = null;
let currentViewReminderRecipeId = null;

// Zobrazit detail připomínky (read-only)
async function showViewReminderModal(reminderId) {
    // Načíst aktuální data přímo z databáze (ne z cache)
    const clerkId = window.Clerk?.user?.id;
    let reminder = allRecipeReminders.find(r => r.id === reminderId);
    
    // Pokud je uživatel přihlášen, načíst čerstvá data z databáze
    if (clerkId && window.database?.getReminderById) {
        try {
            const freshReminder = await window.database.getReminderById(clerkId, reminderId);
            if (freshReminder) {
                reminder = freshReminder;
                // Aktualizovat také cache
                const idx = allRecipeReminders.findIndex(r => r.id === reminderId);
                if (idx >= 0) {
                    allRecipeReminders[idx] = freshReminder;
                }
            }
        } catch (e) {
            console.warn('Could not refresh reminder from DB:', e);
        }
    }
    
    if (!reminder) { console.error('Reminder not found:', reminderId); return; }

    const modal = document.getElementById('viewReminderModal');
    if (!modal) return;

    // Uložit ID pro aktualizace stock baru
    currentViewReminderId = reminderId;
    currentViewReminderRecipeId = reminder.recipe_id;

    // Formátovat datumy pro zobrazení
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const mixDateEl = document.getElementById('viewReminderMixDate');
    const remindDateEl = document.getElementById('viewReminderRemindDate');
    const noteEl = document.getElementById('viewReminderNote');
    const stockContainer = document.getElementById('viewReminderStockContainer');

    if (mixDateEl) mixDateEl.textContent = formatDate(reminder.mixed_at);
    if (remindDateEl) remindDateEl.textContent = formatDate(reminder.remind_at);
    if (noteEl) noteEl.textContent = reminder.note || t('reminder.no_note', 'Bez poznámky');

    // Vykreslit stock bar
    if (stockContainer) {
        const stockPercent = reminder.stock_percent ?? 100;
        const stockColor = stockPercent >= 50 ? 'var(--neon-green)' : 
                           stockPercent > 20 ? '#ffcc00' : '#ff4444';
        const lowClass = stockPercent <= 20 ? 'low' : '';
        const percentTextClass = stockPercent >= 50 ? '' : 'low-text';

        stockContainer.innerHTML = `
            <button type="button" class="stock-btn minus" onclick="updateViewReminderStock(-10)" title="-10%">−</button>
            <div class="stock-battery">
                <div class="battery-body">
                    <div class="battery-level ${lowClass}" 
                         id="view-stock-bar"
                         style="width: ${stockPercent}%; background: ${stockColor};">
                    </div>
                    <span class="battery-percent ${percentTextClass}" id="view-stock-percent">${stockPercent}%</span>
                </div>
                <div class="battery-tip"></div>
            </div>
            <button type="button" class="stock-btn plus" onclick="updateViewReminderStock(+10)" title="+10%">+</button>
        `;
    }

    modal.classList.remove('hidden');
}

// Aktualizovat stock z viewReminderModal
async function updateViewReminderStock(delta) {
    if (!currentViewReminderId || !currentViewReminderRecipeId) return;
    
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) return;
    
    try {
        // Načíst aktuální stav přímo z databáze
        const reminder = await window.database.getReminderById(clerkId, currentViewReminderId);
        if (!reminder) return;
        
        const currentStock = reminder.stock_percent ?? 100;
        let newStock = Math.max(0, Math.min(100, currentStock + delta));
        
        // Aktualizovat UI v modalu
        const stockBar = document.getElementById('view-stock-bar');
        const percentLabel = document.getElementById('view-stock-percent');
        
        if (stockBar) {
            stockBar.style.transition = 'width 0.5s ease-out, background 0.5s ease';
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            stockBar.style.width = `${newStock}%`;
            stockBar.style.background = stockColor;
            
            if (newStock <= 20) {
                stockBar.classList.add('low');
            } else {
                stockBar.classList.remove('low');
            }
        }
        
        if (percentLabel) {
            percentLabel.textContent = `${newStock}%`;
            if (newStock >= 50) {
                percentLabel.classList.remove('low-text');
            } else {
                percentLabel.classList.add('low-text');
            }
        }
        
        // Aktualizovat databázi
        if (newStock === 0) {
            const confirmed = await showConsumedConfirmDialog();
            if (confirmed) {
                await window.database.markReminderConsumed(clerkId, currentViewReminderId);
                showNotification(t('reminder.consumed_success', 'Liquid označen jako spotřebovaný!'), 'success');
                hideViewReminderModal();
                loadRecipeReminders(currentViewReminderRecipeId);
            } else {
                // Vrátit na 10%
                newStock = 10;
                if (stockBar) {
                    stockBar.style.width = '10%';
                    stockBar.style.background = '#ff4444';
                }
                if (percentLabel) percentLabel.textContent = '10%';
                await window.database.updateReminderStock(clerkId, currentViewReminderId, 10);
            }
        } else {
            await window.database.updateReminderStock(clerkId, currentViewReminderId, newStock);
        }
        
        // Aktualizovat také seznam připomínek pokud je viditelný
        const listStockBar = document.getElementById(`stock-bar-${currentViewReminderId}`);
        if (listStockBar) {
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            listStockBar.style.width = `${newStock}%`;
            listStockBar.style.background = stockColor;
            const listPercentLabel = listStockBar.parentElement?.querySelector('.battery-percent');
            if (listPercentLabel) {
                listPercentLabel.textContent = `${newStock}%`;
                if (newStock >= 50) {
                    listPercentLabel.classList.remove('low-text');
                } else {
                    listPercentLabel.classList.add('low-text');
                }
            }
        }
        
    } catch (error) {
        console.error('Error updating view reminder stock:', error);
        showNotification(t('common.error', 'Chyba při aktualizaci'), 'error');
    }
}

function hideViewReminderModal() {
    const modal = document.getElementById('viewReminderModal');
    if (modal) modal.classList.add('hidden');
}

// Export funkcí pro připomínky
window.toggleReminderFields = toggleReminderFields;
window.updateReminderDate = updateReminderDate;
window.initReminderFieldsEnabled = initReminderFieldsEnabled;
window.loadRecipeReminders = loadRecipeReminders;
window.showAddReminderModal = showAddReminderModal;
window.showEditReminderModal = showEditReminderModal;
window.hideAddReminderModal = hideAddReminderModal;
window.showViewReminderModal = showViewReminderModal;
window.hideViewReminderModal = hideViewReminderModal;
window.updateViewReminderStock = updateViewReminderStock;
window.updateReminderModalDate = updateReminderModalDate;
window.saveReminderFromModal = saveReminderFromModal;
window.deleteReminderConfirm = deleteReminderConfirm;

// =============================================
// VEŘEJNÁ DATABÁZE RECEPTŮ
// =============================================

let currentDbPage = 1;
let dbSearchTimeout = null;

// Zobrazit stránku databáze receptů
function showRecipeDatabase() {
    // Kontrola přihlášení
    if (!window.Clerk?.user) {
        showLoginRequiredModal();
        return;
    }
    
    showPage('recipe-database');
    initFlavorFilterOptions();
    loadPublicRecipes();
}

// Inicializovat/regenerovat select s typy příchutí z flavorDatabase
function initFlavorFilterOptions(forceRegenerate = false) {
    const select = document.getElementById('dbFilterFlavorType');
    if (!select) return;
    
    // Pokud již inicializováno a není forceRegenerate, přeskočit
    if (!forceRegenerate && select.options.length > 1) return;
    
    // Uložit aktuální hodnotu
    const currentValue = select.value;
    
    // Vymazat existující options (kromě první "Všechny")
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Aktualizovat překlad první option
    if (select.options[0]) {
        select.options[0].textContent = t('recipe_database.all', 'Všechny');
    }
    
    // Přidat typy z flavorDatabase
    if (window.flavorDatabase) {
        Object.keys(window.flavorDatabase).forEach(key => {
            if (key === 'none') return; // Přeskočit "Žádná"
            const option = document.createElement('option');
            option.value = key;
            const flavorData = window.flavorDatabase[key];
            // Použít správný překlad - shisha příchutě mají klíče shisha.flavor_*, ostatní form.flavor_*
            const i18nKey = flavorData.isShishaOnly ? `shisha.flavor_${key}` : `form.flavor_${key}`;
            option.textContent = t(i18nKey, flavorData.name || key);
            option.setAttribute('data-i18n', i18nKey);
            select.appendChild(option);
        });
    }
    
    // Obnovit vybranou hodnotu
    if (currentValue) {
        select.value = currentValue;
    }
}

// Toggle rozbalovacích filtrů
function toggleDatabaseFilters() {
    const panel = document.getElementById('dbFiltersPanel');
    const icon = document.querySelector('.filter-toggle-icon');
    if (!panel || !icon) return;
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('open');
        icon.textContent = '▲';
        
        // Regenerovat překlady filtrů při otevření
        initFlavorFilterOptions(true);
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } else {
        panel.classList.remove('open');
        panel.classList.add('hidden');
        icon.textContent = '▼';
    }
}

// Reset všech filtrů
function resetDatabaseFilters() {
    document.getElementById('dbFilterFormType').value = '';
    document.getElementById('dbFilterFlavorType').value = '';
    document.getElementById('dbFilterVgMin').value = '';
    document.getElementById('dbFilterVgMax').value = '';
    document.getElementById('dbFilterNicMin').value = '';
    document.getElementById('dbFilterNicMax').value = '';
    document.getElementById('dbFilterHasAdditive').checked = false;
    document.getElementById('dbSearchInput').value = '';
    currentDbPage = 1;
    loadPublicRecipes();
}

// Debounce pro vyhledávání
function debounceSearch() {
    if (dbSearchTimeout) clearTimeout(dbSearchTimeout);
    dbSearchTimeout = setTimeout(() => {
        currentDbPage = 1;
        loadPublicRecipes();
    }, 300);
}

// Načíst veřejné recepty
async function loadPublicRecipes() {
    const listEl = document.getElementById('publicRecipesList');
    const paginationEl = document.getElementById('dbPagination');
    if (!listEl) return;
    
    // Zobrazit loading
    listEl.innerHTML = `<div class="loading-message">${t('recipe_database.loading', 'Načítání receptů...')}</div>`;
    
    // Sestavit filtry
    const filters = {
        search: document.getElementById('dbSearchInput')?.value || '',
        formType: document.getElementById('dbFilterFormType')?.value || '',
        flavorType: document.getElementById('dbFilterFlavorType')?.value || '',
        vgMin: document.getElementById('dbFilterVgMin')?.value || '',
        vgMax: document.getElementById('dbFilterVgMax')?.value || '',
        nicMin: document.getElementById('dbFilterNicMin')?.value || '',
        nicMax: document.getElementById('dbFilterNicMax')?.value || '',
        hasAdditive: document.getElementById('dbFilterHasAdditive')?.checked || false,
        sortBy: document.getElementById('dbSortBy')?.value || 'rating_desc'
    };
    
    try {
        const result = await window.LiquiMixerDB.getPublicRecipes(filters, currentDbPage, 50);
        
        if (!result.recipes || result.recipes.length === 0) {
            listEl.innerHTML = `<div class="no-recipes-message">${t('recipe_database.no_recipes', 'Žádné recepty nenalezeny')}</div>`;
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }
        
        // Render karty receptů
        listEl.innerHTML = result.recipes.map(recipe => renderPublicRecipeCard(recipe)).join('');
        
        // Render paginace
        if (paginationEl) {
            renderDbPagination(paginationEl, result.total, result.page, result.limit);
        }
        
        // Aplikovat překlady
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading public recipes:', error);
        listEl.innerHTML = `<div class="error-message">${t('common.error', 'Chyba při načítání')}</div>`;
    }
}

// Render karty veřejného receptu
function renderPublicRecipeCard(recipe) {
    const avgRating = recipe.public_rating_avg || 0;
    const ratingCount = recipe.public_rating_count || 0;
    const formType = recipe.form_type || 'liquid';
    const recipeData = recipe.recipe_data || {};
    
    // VG/PG a nikotin z recipe_data
    const vgRatio = recipeData.vgRatio || recipeData.ratio || 70;
    const nicStrength = recipeData.nicStrength || 0;
    const flavorType = recipeData.flavorType || '';
    
    // Render hvězdiček
    const stars = renderStars(avgRating);
    
    return `
        <div class="public-recipe-card" onclick="loadPublicRecipeDetail('${recipe.id}')">
            <div class="recipe-card-header">
                <h4 class="recipe-card-name">${escapeHtml(recipe.name)}</h4>
                <div class="recipe-card-rating">
                    <span class="rating-avg">${avgRating.toFixed(1)}</span>
                    <span class="rating-stars">${stars}</span>
                    <span class="rating-count">(${ratingCount})</span>
                </div>
            </div>
            <div class="recipe-card-type">${formType.toUpperCase()}</div>
            <div class="recipe-card-meta">
                <span class="recipe-card-badge vg-pg">${vgRatio}/${100 - vgRatio} VG/PG</span>
                ${nicStrength > 0 ? `<span class="recipe-card-badge nicotine">${nicStrength} mg</span>` : ''}
                ${flavorType ? `<span class="recipe-card-badge flavor">${t(`form.flavor_type_${flavorType}`, flavorType)}</span>` : ''}
            </div>
        </div>
    `;
}

// Render hvězdiček
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else if (i - 0.5 <= rating) {
            stars += '☆';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// Render paginace
function renderDbPagination(container, total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Tlačítko Předchozí
    html += `<button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} 
             onclick="goToDbPage(${currentPage - 1})">◀</button>`;
    
    // Čísla stránek
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                     onclick="goToDbPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Tlačítko Další
    html += `<button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} 
             onclick="goToDbPage(${currentPage + 1})">▶</button>`;
    
    // Info o počtu
    html += `<span class="pagination-info">${t('recipe_database.results_count', 'Nalezeno {count} receptů').replace('{count}', total)}</span>`;
    
    container.innerHTML = html;
}

// Přejít na stránku
function goToDbPage(page) {
    currentDbPage = page;
    loadPublicRecipes();
    // Scroll nahoru
    document.getElementById('recipe-database')?.scrollIntoView({ behavior: 'smooth' });
}

// Načíst detail veřejného receptu
async function loadPublicRecipeDetail(recipeId) {
    try {
        const recipe = await window.LiquiMixerDB.getPublicRecipeById(recipeId);
        if (!recipe) {
            showNotification(t('common.error', 'Recept nenalezen'), 'error');
            return;
        }
        
        window.currentSharedRecipe = recipe;
        
        // Načíst hodnocení uživatele
        let userRating = 0;
        if (window.Clerk?.user) {
            userRating = await window.LiquiMixerDB.getUserRatingForRecipe(window.Clerk.user.id, recipeId);
        }
        
        // Zobrazit detail
        displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent', [], true);
        
        // Přidat sekci hodnocení
        appendRatingSection(recipeId, recipe.public_rating_avg || 0, recipe.public_rating_count || 0, userRating);
        
        // Přidat tlačítko zpět do databáze
        appendBackToDatabaseButton();
        
        // Označit, že recept je z veřejné databáze (pro blokování public checkboxu)
        window.isFromPublicDatabase = true;
        
        showPage('shared-recipe');
        
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading public recipe detail:', error);
        showNotification(t('common.error', 'Chyba při načítání receptu'), 'error');
    }
}

// Přidat sekci hodnocení do detailu receptu
function appendRatingSection(recipeId, avgRating, ratingCount, userRating) {
    const container = document.getElementById('sharedRecipeContent');
    if (!container) return;
    
    const ratingHtml = `
        <div class="recipe-rating-section">
            <h3 data-i18n="rating.title">Hodnocení</h3>
            <div class="rating-summary">
                <span class="rating-avg">${avgRating.toFixed(1)}</span>
                <span class="rating-stars">${renderStars(avgRating)}</span>
                <span class="rating-count">(${ratingCount} ${t('rating.votes', 'hlasů')})</span>
            </div>
            <div class="rating-user">
                <label data-i18n="rating.your_rating">Vaše hodnocení:</label>
                <div class="star-rating-input" data-recipe-id="${recipeId}">
                    ${[1,2,3,4,5].map(i => `
                        <span class="star-input ${i <= userRating ? 'active' : ''}" 
                              data-value="${i}" 
                              onclick="submitRating('${recipeId}', ${i})">★</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', ratingHtml);
}

// Odeslat hodnocení
async function submitRating(recipeId, rating) {
    if (!window.Clerk?.user) {
        showLoginRequiredModal();
        return;
    }
    
    try {
        await window.LiquiMixerDB.addRecipeRating(window.Clerk.user.id, recipeId, rating);
        
        // Aktualizovat UI
        const stars = document.querySelectorAll(`.star-rating-input[data-recipe-id="${recipeId}"] .star-input`);
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
        
        showNotification(t('rating.thank_you', 'Děkujeme za hodnocení!'), 'success');
    } catch (error) {
        console.error('Error submitting rating:', error);
        showNotification(t('common.error', 'Chyba při ukládání hodnocení'), 'error');
    }
}

// Přidat tlačítko zpět do databáze receptů - na konec k ostatním tlačítkům
function appendBackToDatabaseButton() {
    // Najít button-group na stránce shared-recipe
    const sharedRecipePage = document.getElementById('shared-recipe');
    if (!sharedRecipePage) return;
    
    const buttonGroup = sharedRecipePage.querySelector('.button-group');
    if (!buttonGroup) return;
    
    // Zkontrolovat, zda tlačítko již neexistuje
    if (buttonGroup.querySelector('.back-to-database-btn')) return;
    
    // Přidat tlačítko zpět - použít goBack() pro správnou navigaci v historii
    const backBtnHtml = `
        <button class="neon-button secondary back-to-database-btn" onclick="goBack()">
            <span data-i18n="recipe_detail.back">Zpět</span>
        </button>
    `;
    buttonGroup.insertAdjacentHTML('afterbegin', backBtnHtml);
    
    // Aplikovat překlady
    if (window.i18n?.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// Odstranit tlačítko zpět do databáze (při opuštění stránky)
function removeBackToDatabaseButton() {
    const btn = document.querySelector('.back-to-database-btn');
    if (btn) btn.remove();
}

// =============================================
// STOCK TRACKING (SKLADOVÁ ZÁSOBA)
// =============================================

// Aktualizovat zásobu připomínky (volá se z tlačítek +/-)
async function updateReminderStockUI(reminderId, recipeId, delta) {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) return;
    
    try {
        // Načíst aktuální stav
        const reminder = await window.database.getReminderById(clerkId, reminderId);
        if (!reminder) return;
        
        const currentStock = reminder.stock_percent ?? 100;
        let newStock = Math.max(0, Math.min(100, currentStock + delta));
        
        // Animace změny
        const stockBar = document.getElementById(`stock-bar-${reminderId}`);
        if (stockBar) {
            stockBar.style.transition = 'width 0.5s ease-out, background 0.5s ease';
            stockBar.style.width = `${newStock}%`;
            
            // Změna barvy podle stavu
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            stockBar.style.background = stockColor;
            
            // Aktualizovat procenta
            const percentLabel = stockBar.parentElement?.querySelector('.battery-percent');
            if (percentLabel) {
                percentLabel.textContent = `${newStock}%`;
                // Barva textu: černá >=50%, bílá <50%
                if (newStock >= 50) {
                    percentLabel.classList.remove('low-text');
                } else {
                    percentLabel.classList.add('low-text');
                }
            }
            
            // Toggle low class pro animaci
            if (newStock <= 20) {
                stockBar.classList.add('low');
            } else {
                stockBar.classList.remove('low');
            }
        }
        
        // Při dosažení 0% - zobrazit dialog
        if (newStock === 0) {
            const confirmed = await showConsumedConfirmDialog();
            if (confirmed) {
                await window.database.markReminderConsumed(clerkId, reminderId);
                showNotification(t('reminder.consumed_success', 'Liquid označen jako spotřebovaný!'), 'success');
                // Refresh seznamu - připomínka zmizí
                loadRecipeReminders(recipeId);
            } else {
                // Vrátit na 10%
                newStock = 10;
                if (stockBar) {
                    stockBar.style.width = '10%';
                    stockBar.style.background = '#ff4444';
                    const percentLabel = stockBar.parentElement?.querySelector('.battery-percent');
                    if (percentLabel) percentLabel.textContent = '10%';
                }
                await window.database.updateReminderStock(clerkId, reminderId, 10);
            }
        } else {
            await window.database.updateReminderStock(clerkId, reminderId, newStock);
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification(t('common.error', 'Chyba při aktualizaci'), 'error');
    }
}

// Dialog pro potvrzení spotřebování
function showConsumedConfirmDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-icon">🧪</div>
                <h3 data-i18n="reminder.consumed_title">Liquid spotřebován?</h3>
                <p data-i18n="reminder.consumed_text">
                    Chcete označit tento liquid jako spotřebovaný? 
                    Připomínka bude odstraněna ze seznamu.
                </p>
                <div class="confirm-dialog-buttons">
                    <button class="neon-button secondary" onclick="this.closest('.confirm-dialog-overlay').remove(); window._consumedResolve(false);">
                        <span data-i18n="common.cancel">Zrušit</span>
                    </button>
                    <button class="neon-button" onclick="this.closest('.confirm-dialog-overlay').remove(); window._consumedResolve(true);">
                        <span data-i18n="reminder.mark_consumed">Ano, spotřebován</span>
                    </button>
                </div>
            </div>
        `;
        
        window._consumedResolve = resolve;
        document.body.appendChild(dialog);
        
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
        // Animace vstupu
        requestAnimationFrame(() => dialog.classList.add('visible'));
    });
}

// Export funkcí pro veřejnou databázi a stock
window.showRecipeDatabase = showRecipeDatabase;
window.loadPublicRecipes = loadPublicRecipes;
window.toggleDatabaseFilters = toggleDatabaseFilters;
window.resetDatabaseFilters = resetDatabaseFilters;
window.debounceSearch = debounceSearch;
window.goToDbPage = goToDbPage;
window.loadPublicRecipeDetail = loadPublicRecipeDetail;
window.submitRating = submitRating;
window.updateReminderStockUI = updateReminderStockUI;
window.appendBackToDatabaseButton = appendBackToDatabaseButton;
window.removeBackToDatabaseButton = removeBackToDatabaseButton;

// =========================================
// EXPORT: Funkce pro globalni pristup z onclick
// =========================================
window.toggleMenu = toggleMenu;
window.handleLoginFromRequired = handleLoginFromRequired;
window.handleRegisterFromRequired = handleRegisterFromRequired;
// Auth Choice Modal
window.showAuthChoiceModal = showAuthChoiceModal;
window.hideAuthChoiceModal = hideAuthChoiceModal;
window.handleAuthChoiceModalBackdropClick = handleAuthChoiceModalBackdropClick;
window.handleHaveAccount = handleHaveAccount;
window.handleWantRegister = handleWantRegister;
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
window.autoRecalculateProVgPgRatio = autoRecalculateProVgPgRatio;

// =========================================
// SHISHA (Hookah) Functions
// =========================================

let shVgPgLimits = { min: 0, max: 100 };
let shFlavorCount = 1;

// Initialize Shisha form
function initShishaForm() {
    updateShishaVgPgLimits();
    updateShishaRatioDisplay();
    updateShishaFlavorType(1);
    updateShishaTotalFlavorPercent();
    updateShishaPremiumElements();
    
    // Apply translations
    if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// Premium elements management
function updateShishaPremiumElements() {
    const isPremium = window.checkSubscriptionStatus && window.checkSubscriptionStatus();
    
    // Custom base ratio button
    const customBaseBtn = document.querySelector('.sh-premixed-ratio-btn[data-value="custom"]');
    const customBaseBadge = document.getElementById('shCustomBasePremiumBadge');
    
    if (customBaseBtn) {
        if (isPremium) {
            customBaseBtn.classList.remove('locked');
            if (customBaseBadge) customBaseBadge.classList.add('hidden');
        } else {
            customBaseBtn.classList.add('locked');
        }
    }
    
    // Add flavor button
    const addFlavorGroup = document.getElementById('shAddFlavorGroup');
    const addFlavorBadge = document.getElementById('shAddFlavorPremiumBadge');
    
    if (addFlavorGroup) {
        if (isPremium) {
            addFlavorGroup.classList.remove('locked');
            if (addFlavorBadge) addFlavorBadge.classList.add('hidden');
        } else {
            addFlavorGroup.classList.add('locked');
            if (addFlavorBadge) addFlavorBadge.classList.remove('hidden');
        }
    }
}

// Premixed base ratio
function updateShishaPremixedRatio(ratio) {
    const isPremium = window.checkSubscriptionStatus && window.checkSubscriptionStatus();
    
    // Check if custom requires premium
    if (ratio === 'custom' && !isPremium) {
        if (window.requireSubscription) {
            window.requireSubscription();
        }
        return;
    }
    
    // Update active button
    document.querySelectorAll('.sh-premixed-ratio-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('shPremixedRatio').value = ratio;
    
    // Show/hide custom container
    const customContainer = document.getElementById('shCustomPremixedContainer');
    if (ratio === 'custom') {
        customContainer.classList.remove('hidden');
    } else {
        customContainer.classList.add('hidden');
    }
    
    autoRecalculateShishaVgPgRatio();
}

function updateShishaCustomPremixedPg() {
    const vgInput = document.getElementById('shCustomPremixedVg');
    const pgInput = document.getElementById('shCustomPremixedPg');
    
    let vg = parseInt(vgInput.value) || 0;
    vg = Math.max(0, Math.min(100, vg));
    vgInput.value = vg;
    pgInput.value = 100 - vg;
    
    autoRecalculateShishaVgPgRatio();
}

// Starý select handler pro zpětnou kompatibilitu
function handleShishaNicotineSelect() {
    updateShishaNicotineType();
}

// Starý toggle pro zpětnou kompatibilitu
function toggleShishaNicotine() {
    updateShishaNicotineType();
}

// Aktualizovat typ nikotinu - jako v Liquid formuláři
function updateShishaNicotineType() {
    const typeSelect = document.getElementById('shNicotineType');
    const strengthContainer = document.getElementById('shNicotineStrengthContainer');
    const ratioContainer = document.getElementById('shNicotineRatioContainer');
    const targetGroup = document.getElementById('shTargetNicotineGroup');
    const targetSlider = document.getElementById('shTargetNicotine');
    
    if (!typeSelect) return;
    
    const type = typeSelect.value;
    
    if (type === 'none') {
        // Skrýt všechna nastavení nikotinu
        if (strengthContainer) strengthContainer.classList.add('hidden');
        if (ratioContainer) ratioContainer.classList.add('hidden');
        if (targetGroup) targetGroup.classList.add('hidden');
        if (targetSlider) {
            targetSlider.value = 0;
            updateShishaNicotineDisplay();
        }
    } else {
        // Zobrazit nastavení nikotinu
        if (strengthContainer) strengthContainer.classList.remove('hidden');
        if (ratioContainer) ratioContainer.classList.remove('hidden');
        if (targetGroup) targetGroup.classList.remove('hidden');
        
        // Nastavit max hodnotu podle typu
        const baseStrengthInput = document.getElementById('shNicotineBaseStrength');
        if (baseStrengthInput) {
            const maxValue = type === 'salt' ? 72 : 200;
            baseStrengthInput.max = maxValue;
            if (parseInt(baseStrengthInput.value) > maxValue) {
                baseStrengthInput.value = maxValue;
            }
        }
    }
    
    autoRecalculateShishaVgPgRatio();
}

// Aktualizovat poměr VG/PG nikotinu pomocí tlačítek
function updateShishaNicotineRatio(ratio) {
    const buttons = document.querySelectorAll('.sh-nic-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const hiddenInput = document.getElementById('shNicotineRatio');
    if (hiddenInput) hiddenInput.value = ratio;
    
    autoRecalculateShishaVgPgRatio();
}

// Starý slider handler pro zpětnou kompatibilitu
function adjustShishaNicRatio(change) {
    // Již nepoužíváme slider, ale zachováno pro kompatibilitu
}

function updateShishaNicRatioDisplay() {
    // Již nepoužíváme slider, ale zachováno pro kompatibilitu
    
    if (track) {
        track.style.width = vg + '%';
    }
    
    autoRecalculateShishaVgPgRatio();
}

function adjustShishaTargetNicotine(change) {
    const slider = document.getElementById('shTargetNicotine');
    if (!slider) return;
    
    let currentValue = parseInt(slider.value);
    const maxValue = parseInt(slider.max) || 45;
    
    let newValue = currentValue + change;
    newValue = Math.max(0, Math.min(maxValue, newValue));
    slider.value = newValue;
    updateShishaNicotineDisplay();
}

function updateShishaNicotineDisplay() {
    const slider = document.getElementById('shTargetNicotine');
    const display = document.getElementById('shTargetNicotineValue');
    const displayContainer = display?.parentElement;
    const track = document.getElementById('shNicotineTrack');
    const descEl = document.getElementById('shNicotineDescription');
    
    if (!slider) return;
    
    const value = parseInt(slider.value);
    const maxValue = parseInt(slider.max) || 10;
    
    if (display) display.textContent = value;
    
    // Barevná škála podle síly nikotinu - SHISHA specifické popisy (max 10mg)
    const desc = shishaNicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        if (descEl) {
            descEl.textContent = getShishaNicotineDescriptionText(value);
            descEl.style.color = desc.color;
            descEl.style.borderLeftColor = desc.color;
        }
        if (displayContainer) {
            displayContainer.style.color = desc.color;
            displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        }
        if (track) {
            // Plná šířka track s gradientem - jako ostatní formuláře
            track.style.width = '100%';
            track.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
        }
    } else if (track) {
        track.style.width = '100%';
    }
    
    autoRecalculateShishaVgPgRatio();
}

// Flavor functions
function updateShishaFlavorType(index) {
    const select = document.getElementById(`shFlavorType${index}`);
    const strengthContainer = document.getElementById(`shFlavorStrengthContainer${index}`);
    
    if (!select) return;
    
    const flavorType = select.value;
    
    if (flavorType === 'none') {
        if (strengthContainer) strengthContainer.classList.add('hidden');
    } else {
        if (strengthContainer) strengthContainer.classList.remove('hidden');
        
        // Set default strength from database
        const flavor = shishaFlavorDatabase[flavorType];
        if (flavor) {
            const slider = document.getElementById(`shFlavorStrength${index}`);
            if (slider) {
                slider.value = flavor.ideal;
                updateShishaFlavorStrength(index);
            }
        }
    }
    
    updateShishaTotalFlavorPercent();
    autoRecalculateShishaVgPgRatio();
}

function adjustShishaFlavor(index, change) {
    const slider = document.getElementById(`shFlavorStrength${index}`);
    if (!slider) return;
    
    let currentValue = parseInt(slider.value);
    let newValue = currentValue + change;
    newValue = Math.max(0, Math.min(30, newValue));
    slider.value = newValue;
    updateShishaFlavorStrength(index);
}

function updateShishaFlavorStrength(index) {
    const slider = document.getElementById(`shFlavorStrength${index}`);
    const display = document.getElementById(`shFlavorValue${index}`);
    const displayContainer = display?.parentElement;
    const track = document.getElementById(`shFlavorTrack${index}`);
    const select = document.getElementById(`shFlavorType${index}`);
    const strengthDisplay = document.getElementById(`shFlavorStrengthDisplay${index}`);
    
    if (!slider) return;
    
    const value = parseInt(slider.value);
    if (display) display.textContent = value;
    
    // Plná šířka track jako v liquid formuláři
    if (track) track.style.width = '100%';
    
    // Zobrazení doporučení síly příchutě (jako u Liquid formu)
    if (select) {
        const flavorType = select.value;
        const flavor = shishaFlavorDatabase[flavorType] || shishaFlavorDatabase.custom;
        
        let color, text;
        if (value < flavor.min) {
            color = '#ffaa00';
            text = t('shisha.flavor_weak', 'Slabá chuť - pro shisha doporučeno {min}–{max}%')
                .replace('{min}', flavor.min)
                .replace('{max}', flavor.max);
            if (track) track.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
        } else if (value > flavor.max) {
            color = '#ff0044';
            text = t('shisha.flavor_strong', 'Příliš silná chuť - doporučeno max {max}%')
                .replace('{min}', flavor.min)
                .replace('{max}', flavor.max);
            if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
        } else {
            color = '#00cc66';
            const note = getShishaFlavorNote(flavorType);
            text = t('shisha.flavor_ideal', 'Ideální pro shisha ({min}–{max}%) - {note}')
                .replace('{min}', flavor.min)
                .replace('{max}', flavor.max)
                .replace('{note}', note);
            if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
        }
        
        // Barva čísla a % pod sliderem
        if (displayContainer) {
            displayContainer.style.color = color;
            displayContainer.style.textShadow = `0 0 15px ${color}`;
        }
        
        if (strengthDisplay) {
            strengthDisplay.innerHTML = `
                <div class="flavor-strength-info" style="border-left: 3px solid ${color}; padding-left: 10px; margin-bottom: 10px;">
                    <span style="color: ${color};">${text}</span>
                </div>
            `;
        }
    }
    
    updateShishaTotalFlavorPercent();
    autoRecalculateShishaVgPgRatio();
}

// Získat poznámku k shisha příchuti
function getShishaFlavorNote(flavorType) {
    const noteKeys = {
        'double_apple': 'shisha.note_double_apple',
        'mint': 'shisha.note_mint',
        'grape': 'shisha.note_grape',
        'watermelon': 'shisha.note_watermelon',
        'lemon_mint': 'shisha.note_lemon_mint',
        'blueberry': 'shisha.note_blueberry',
        'peach': 'shisha.note_peach',
        'mango': 'shisha.note_mango',
        'strawberry': 'shisha.note_strawberry',
        'mixed_fruit': 'shisha.note_mixed_fruit',
        'cola': 'shisha.note_cola',
        'gum': 'shisha.note_gum',
        'rose': 'shisha.note_rose',
        'custom': 'shisha.note_custom'
    };
    
    const defaultNotes = {
        'double_apple': 'klasická shisha příchuť',
        'mint': 'osvěžující, kombinovatelná',
        'grape': 'sladká ovocná',
        'watermelon': 'lehká letní',
        'lemon_mint': 'citrusová svěžest',
        'blueberry': 'sladká lesní',
        'peach': 'jemně sladká',
        'mango': 'tropická exotika',
        'strawberry': 'klasická ovocná',
        'mixed_fruit': 'komplexní ovocná',
        'cola': 'sladká nápojová',
        'gum': 'sladká žvýkačková',
        'rose': 'květinová orientální',
        'custom': 'vlastní příchuť'
    };
    
    const key = noteKeys[flavorType];
    const defaultNote = defaultNotes[flavorType] || 'vlastní příchuť';
    
    return t(key, defaultNote);
}

function adjustShishaFlavorRatio(index, change) {
    const slider = document.getElementById(`shFlavorRatioSlider${index}`);
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
    updateShishaFlavorRatioDisplay(index);
}

function updateShishaFlavorRatioDisplay(index) {
    const slider = document.getElementById(`shFlavorRatioSlider${index}`);
    const vgValue = document.getElementById(`shFlavorVgValue${index}`);
    const pgValue = document.getElementById(`shFlavorPgValue${index}`);
    const track = document.getElementById(`shFlavorTrackRatio${index}`);
    
    if (!slider) return;
    
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    if (vgValue) vgValue.textContent = vg;
    if (pgValue) pgValue.textContent = pg;
    if (track) track.style.width = vg + '%';
    
    autoRecalculateShishaVgPgRatio();
}

function updateShishaTotalFlavorPercent() {
    let total = 0;
    
    for (let i = 1; i <= shFlavorCount; i++) {
        const select = document.getElementById(`shFlavorType${i}`);
        const slider = document.getElementById(`shFlavorStrength${i}`);
        
        if (select && slider && select.value !== 'none') {
            total += parseInt(slider.value) || 0;
        }
    }
    
    const totalDisplay = document.getElementById('shTotalFlavorPercent');
    const warningDisplay = document.getElementById('shFlavorTotalWarning');
    
    if (totalDisplay) totalDisplay.textContent = total;
    
    if (warningDisplay) {
        if (total > 25 || (total > 0 && total < 15)) {
            warningDisplay.classList.remove('hidden');
        } else {
            warningDisplay.classList.add('hidden');
        }
    }
}

function addShishaFlavor() {
    const isPremium = window.checkSubscriptionStatus && window.checkSubscriptionStatus();
    
    if (!isPremium) {
        if (window.requireSubscription) {
            window.requireSubscription();
        }
        return;
    }
    
    if (shFlavorCount >= 4) return;
    
    shFlavorCount++;
    const container = document.getElementById('shAdditionalFlavorsContainer');
    
    // Clone flavor 1 structure - použít t() pro překlad
    const flavorLabel = t('shisha.flavor_label', 'Příchuť');
    const flavorHtml = `
        <div class="form-group sh-flavor-group" id="shFlavorGroup${shFlavorCount}">
            <label class="form-label">
                <span>${flavorLabel}</span>
                <span class="flavor-number"> ${shFlavorCount}</span>
                <button type="button" class="remove-flavor-btn" onclick="removeShishaFlavor(${shFlavorCount})">✕</button>
            </label>
            <div class="flavor-container">
                <select id="shFlavorType${shFlavorCount}" class="neon-select sh-flavor-select" data-flavor-index="${shFlavorCount}" onchange="updateShishaFlavorType(${shFlavorCount})">
                    <option value="none" data-i18n="form.flavor_none">Žádná (bez příchutě)</option>
                    <option value="double_apple" data-i18n="shisha.flavor_double_apple">Double Apple (klasika)</option>
                    <option value="mint" data-i18n="shisha.flavor_mint">Mint / Máta</option>
                    <option value="grape" data-i18n="shisha.flavor_grape">Grape / Hroznové</option>
                    <option value="watermelon" data-i18n="shisha.flavor_watermelon">Watermelon / Meloun</option>
                    <option value="lemon_mint" data-i18n="shisha.flavor_lemon_mint">Lemon Mint</option>
                    <option value="blueberry" data-i18n="shisha.flavor_blueberry">Blueberry / Borůvka</option>
                    <option value="peach" data-i18n="shisha.flavor_peach">Peach / Broskev</option>
                    <option value="mango" data-i18n="shisha.flavor_mango">Mango</option>
                    <option value="strawberry" data-i18n="shisha.flavor_strawberry">Strawberry / Jahoda</option>
                    <option value="mixed_fruit" data-i18n="shisha.flavor_mixed_fruit">Mixed Fruit</option>
                    <option value="cola" data-i18n="shisha.flavor_cola">Cola</option>
                    <option value="gum" data-i18n="shisha.flavor_gum">Gum / Žvýkačka</option>
                    <option value="rose" data-i18n="shisha.flavor_rose">Rose / Růže</option>
                    <option value="custom" data-i18n="form.custom">Vlastní</option>
                </select>
                <div id="shFlavorStrengthContainer${shFlavorCount}" class="hidden">
                    <!-- Zobrazení doporučení síly příchutě (jako u Liquid) -->
                    <div id="shFlavorStrengthDisplay${shFlavorCount}" class="flavor-strength-display"></div>
                    
                    <div class="slider-container small">
                        <button class="slider-btn small" onclick="adjustShishaFlavor(${shFlavorCount}, -1)">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="shFlavorStrength${shFlavorCount}" min="0" max="30" value="15" class="flavor-slider sh-flavor-slider" data-flavor-index="${shFlavorCount}" oninput="updateShishaFlavorStrength(${shFlavorCount})">
                            <div class="slider-track flavor-track" id="shFlavorTrack${shFlavorCount}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustShishaFlavor(${shFlavorCount}, 1)">▶</button>
                    </div>
                    <div class="flavor-display">
                        <span id="shFlavorValue${shFlavorCount}">15</span>%
                    </div>
                    <div class="form-group-sub">
                        <label class="form-label-small" data-i18n="form.flavor_ratio_label">Poměr VG/PG v koncentrátu příchutě</label>
                        <div class="ratio-container compact">
                            <div class="ratio-labels">
                                <span class="ratio-label left" data-i18n="form.vg_label">Dým (VG)</span>
                                <span class="ratio-label right" data-i18n="form.pg_label">Chuť (PG)</span>
                            </div>
                            <div class="slider-container">
                                <button class="slider-btn small" onclick="adjustShishaFlavorRatio(${shFlavorCount}, -5)">◀</button>
                                <div class="slider-wrapper">
                                    <input type="range" id="shFlavorRatioSlider${shFlavorCount}" min="0" max="100" value="0" class="ratio-slider sh-flavor-ratio" data-flavor-index="${shFlavorCount}" oninput="updateShishaFlavorRatioDisplay(${shFlavorCount})">
                                    <div class="slider-track" id="shFlavorTrackRatio${shFlavorCount}"></div>
                                </div>
                                <button class="slider-btn small" onclick="adjustShishaFlavorRatio(${shFlavorCount}, 5)">▶</button>
                            </div>
                            <div class="ratio-display small">
                                <span id="shFlavorVgValue${shFlavorCount}">0</span>:<span id="shFlavorPgValue${shFlavorCount}">100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', flavorHtml);
    
    // Update hint
    const hint = document.getElementById('shFlavorCountHint');
    if (hint) {
        hint.textContent = `(${shFlavorCount}/4 příchutí)`;
    }
    
    // Hide add button if max reached
    if (shFlavorCount >= 4) {
        document.getElementById('shAddFlavorGroup').classList.add('hidden');
    }
    
    // Apply translations
    if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

function removeShishaFlavor(index) {
    const group = document.getElementById(`shFlavorGroup${index}`);
    if (group) {
        group.remove();
    }
    
    // Renumber remaining flavors would be complex, so we just hide add button logic
    shFlavorCount--;
    
    // Show add button
    document.getElementById('shAddFlavorGroup').classList.remove('hidden');
    
    // Update hint
    const hint = document.getElementById('shFlavorCountHint');
    if (hint) {
        hint.textContent = `(${shFlavorCount}/4 příchutí)`;
    }
    
    updateShishaTotalFlavorPercent();
    autoRecalculateShishaVgPgRatio();
}

function getShishaFlavorsData() {
    const flavors = [];
    
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`shFlavorType${i}`);
        const slider = document.getElementById(`shFlavorStrength${i}`);
        const ratioSlider = document.getElementById(`shFlavorRatioSlider${i}`);
        
        if (select && slider && select.value !== 'none') {
            const flavorType = select.value;
            const flavorData = shishaFlavorDatabase[flavorType] || shishaFlavorDatabase.custom;
            
            flavors.push({
                type: flavorType,
                percent: parseInt(slider.value) || 0,
                vgRatio: parseInt(ratioSlider?.value) || 0,
                data: flavorData
            });
        }
    }
    
    return flavors;
}

// Sweetener select handler (nahrazuje toggle)
function handleShishaSweetenerSelect() {
    const select = document.getElementById('shSweetenerSelect');
    const container = document.getElementById('shSweetenerContainer');
    const slider = document.getElementById('shSweetenerStrength');
    
    if (!select) return;
    
    const sweetenerType = select.value;
    
    if (sweetenerType !== 'none') {
        container.classList.remove('hidden');
        
        // Nastavit doporučenou hodnotu ze sweetenerDatabase
        const sweetener = sweetenerDatabase[sweetenerType];
        if (sweetener && slider) {
            slider.min = sweetener.minPercent;
            slider.max = sweetener.maxPercent;
            slider.value = sweetener.defaultPercent;
        }
        
        updateShishaSweetenerDisplay();
    } else {
        container.classList.add('hidden');
    }
}

// Starý toggle pro zpětnou kompatibilitu
function toggleShishaSweetener() {
    // Tato funkce již není používána, ale zachována pro kompatibilitu
    handleShishaSweetenerSelect();
}

function updateShishaSweetenerType() {
    const select = document.getElementById('shSweetenerType');
    const slider = document.getElementById('shSweetenerStrength');
    
    if (!select || !slider) return;
    
    const sweetenerType = select.value;
    const sweetener = sweetenerDatabase[sweetenerType];
    
    if (sweetener) {
        slider.value = sweetener.defaultPercent;
        slider.max = sweetener.maxPercent;
        updateShishaSweetenerDisplay();
    }
}

function adjustShishaSweetener(change) {
    const slider = document.getElementById('shSweetenerStrength');
    if (!slider) return;
    
    let currentValue = parseFloat(slider.value);
    let newValue = currentValue + change;
    newValue = Math.max(0, Math.min(parseFloat(slider.max), newValue));
    slider.value = newValue;
    updateShishaSweetenerDisplay();
}

function updateShishaSweetenerDisplay() {
    const slider = document.getElementById('shSweetenerStrength');
    const display = document.getElementById('shSweetenerValue');
    const displayContainer = display?.parentElement;
    const track = document.getElementById('shSweetenerTrack');
    const sweetenerSelect = document.getElementById('shSweetenerSelect');
    
    if (!slider) return;
    
    const value = parseFloat(slider.value);
    if (display) display.textContent = value;
    
    // Plná šířka track s dynamickou barvou
    if (track) {
        track.style.width = '100%';
        
        // Dynamická barva podle doporučených hodnot
        const sweetenerType = sweetenerSelect?.value || 'sucralose';
        const sweetener = sweetenerDatabase[sweetenerType] || sweetenerDatabase.sucralose;
        const minVal = sweetener.minPercent || 1;
        const maxVal = sweetener.maxPercent || 5;
        const defaultVal = sweetener.defaultPercent || 3;
        
        let color;
        if (value < minVal) {
            color = '#ffaa00'; // slabé
            track.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
        } else if (value > maxVal) {
            color = '#ff0044'; // příliš silné
            track.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
        } else {
            color = '#00cc66'; // ideální
            track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
        }
        
        if (displayContainer) {
            displayContainer.style.color = color;
            displayContainer.style.textShadow = `0 0 15px ${color}`;
        }
    }
}

// Water functions - voda je nyní vždy viditelný slider bez toggle
// Toggle funkce zachována pro zpětnou kompatibilitu (voda je nyní vždy viditelná)
function toggleShishaWater() {
    // Prázdná funkce - voda je nyní vždy viditelná, toggle již není potřeba
}

function adjustShishaWater(change) {
    const slider = document.getElementById('shWaterPercent');
    if (!slider) return;
    
    let currentValue = parseFloat(slider.value);
    let newValue = currentValue + change;
    newValue = Math.max(0, Math.min(5, newValue));
    slider.value = newValue;
    updateShishaWaterDisplay();
}

function updateShishaWaterDisplay() {
    const slider = document.getElementById('shWaterPercent');
    const display = document.getElementById('shWaterValue');
    const displayContainer = display?.parentElement;
    const track = document.getElementById('shWaterTrack');
    
    if (!slider) return;
    
    const value = parseFloat(slider.value);
    if (display) display.textContent = value;
    
    // Plná šířka track s dynamickou barvou
    // Voda: 0-2% ideální, 2-5% hodně
    if (track) {
        track.style.width = '100%';
        
        let color;
        if (value === 0) {
            color = '#00aaff'; // bez vody
            track.style.background = 'linear-gradient(90deg, #00aaff, #00aaff)';
        } else if (value <= 2) {
            color = '#00cc66'; // ideální
            track.style.background = 'linear-gradient(90deg, #00aaff, #00cc66)';
        } else {
            color = '#ffaa00'; // hodně vody
            track.style.background = 'linear-gradient(90deg, #00cc66, #ffaa00)';
        }
        
        if (displayContainer) {
            displayContainer.style.color = color;
            displayContainer.style.textShadow = `0 0 15px ${color}`;
        }
    }
}

// VG/PG ratio functions
function adjustShishaRatio(change) {
    const slider = document.getElementById('shVgPgRatio');
    if (!slider) return;
    
    let currentValue = parseInt(slider.value);
    let newValue;
    
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    // Respect limits
    newValue = Math.max(shVgPgLimits.min, Math.min(shVgPgLimits.max, newValue));
    slider.value = newValue;
    updateShishaRatioDisplay();
}

function updateShishaRatioDisplay() {
    const slider = document.getElementById('shVgPgRatio');
    const vgValue = document.getElementById('shVgValue');
    const pgValue = document.getElementById('shPgValue');
    const track = document.getElementById('shSliderTrack');
    
    if (!slider) return;
    
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    if (vgValue) vgValue.textContent = vg;
    if (pgValue) pgValue.textContent = pg;
    if (track) track.style.width = vg + '%';
}

function autoRecalculateShishaVgPgRatio() {
    const result = calculateActualVgPgRatio('shisha');
    
    if (result && result.actualVg !== undefined) {
        const slider = document.getElementById('shVgPgRatio');
        if (slider) {
            let newValue = Math.round(result.actualVg);
            newValue = Math.max(shVgPgLimits.min, Math.min(shVgPgLimits.max, newValue));
            slider.value = newValue;
            updateShishaRatioDisplay();
        }
    }
    
    updateShishaVgPgLimits();
}

function updateShishaVgPgLimits() {
    const slider = document.getElementById('shVgPgRatio');
    const disabledLeft = document.getElementById('shSliderDisabledLeft');
    const disabledRight = document.getElementById('shSliderDisabledRight');
    
    if (!slider) return;
    
    const totalAmount = parseFloat(document.getElementById('shTotalAmount')?.value) || 200;
    
    // Get nicotine contribution
    let nicotineVgVolume = 0;
    let nicotinePgVolume = 0;
    
    const nicToggle = document.getElementById('shNicotineToggle');
    if (nicToggle && nicToggle.checked) {
        const nicStrength = parseFloat(document.getElementById('shNicotineBaseStrength')?.value) || 20;
        const targetNic = parseFloat(document.getElementById('shTargetNicotine')?.value) || 0;
        // Parsovat VG/PG poměr z hidden inputu (formát "50/50")
        const nicRatioInput = document.getElementById('shNicotineRatio');
        const nicRatioValue = nicRatioInput?.value || '50/50';
        const nicRatio = parseInt(nicRatioValue.split('/')[0]) || 50;
        
        if (targetNic > 0 && nicStrength > 0) {
            const nicVolume = (targetNic / nicStrength) * totalAmount;
            nicotineVgVolume = nicVolume * (nicRatio / 100);
            nicotinePgVolume = nicVolume * ((100 - nicRatio) / 100);
        }
    }
    
    // Get flavor contribution
    const flavorsData = getShishaFlavorsData();
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
    
    shVgPgLimits.min = Math.max(0, minVgPercent);
    shVgPgLimits.max = Math.min(100, maxVgPercent);
    
    const limitValueLeft = document.getElementById('shLimitValueLeft');
    const limitValueRight = document.getElementById('shLimitValueRight');
    
    if (disabledLeft) {
        disabledLeft.style.width = shVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - shVgPgLimits.max) + '%';
    }
    
    // Show limit values
    if (limitValueLeft) {
        if (shVgPgLimits.min > 0) {
            limitValueLeft.textContent = shVgPgLimits.min + '%';
            limitValueLeft.style.display = 'block';
        } else {
            limitValueLeft.style.display = 'none';
        }
    }
    if (limitValueRight) {
        if (shVgPgLimits.max < 100) {
            limitValueRight.textContent = shVgPgLimits.max + '%';
            limitValueRight.style.display = 'block';
        } else {
            limitValueRight.style.display = 'none';
        }
    }
    
    // Constrain current value
    let currentValue = parseInt(slider.value);
    if (currentValue < shVgPgLimits.min) {
        slider.value = shVgPgLimits.min;
        updateShishaRatioDisplay();
    } else if (currentValue > shVgPgLimits.max) {
        slider.value = shVgPgLimits.max;
        updateShishaRatioDisplay();
    }
}

// Calculate Shisha Mix - main calculation function
function calculateShishaMix() {
    // Get values
    const totalAmount = parseFloat(document.getElementById('shTotalAmount')?.value) || 200;
    
    // VG/PG ratio
    const vgPercent = parseInt(document.getElementById('shVgPgRatio')?.value) || 80;
    const pgPercent = 100 - vgPercent;
    
    // Premixed base ratio
    const premixedRatio = document.getElementById('shPremixedRatio')?.value || '80/20';
    let premixedVg, premixedPg;
    if (premixedRatio === 'custom') {
        premixedVg = parseInt(document.getElementById('shCustomPremixedVg')?.value) || 80;
        premixedPg = 100 - premixedVg;
    } else {
        const parts = premixedRatio.split('/');
        premixedVg = parseInt(parts[0]) || 80;
        premixedPg = parseInt(parts[1]) || 20;
    }
    
    // Nicotine - nová struktura jako Liquid formulář
    let nicotineVolume = 0;
    let nicotineVgVolume = 0;
    let nicotinePgVolume = 0;
    let targetNicotine = 0;
    
    const nicTypeSelect = document.getElementById('shNicotineType');
    const nicotineType = nicTypeSelect?.value || 'none';
    
    const hasNicotine = nicotineType !== 'none';
    
    if (hasNicotine) {
        const baseNicotine = parseFloat(document.getElementById('shNicotineBaseStrength')?.value) || 20;
        targetNicotine = parseFloat(document.getElementById('shTargetNicotine')?.value) || 0;
        
        // Získat poměr VG/PG z tlačítek nebo defaultní 50/50
        const nicRatioInput = document.getElementById('shNicotineRatio');
        const nicRatio = nicRatioInput?.value || '50/50';
        const nicRatioParts = nicRatio.split('/');
        const nicVgPercent = parseInt(nicRatioParts[0]) || 50;
        
        if (targetNicotine > 0 && baseNicotine > 0) {
            nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
            nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
            nicotinePgVolume = nicotineVolume * ((100 - nicVgPercent) / 100);
        }
    }
    
    // Flavors
    const flavorsData = getShishaFlavorsData();
    let totalFlavorVolume = 0;
    let totalFlavorVgVolume = 0;
    let totalFlavorPgVolume = 0;
    
    flavorsData.forEach(flavor => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        totalFlavorVolume += flavorVolume;
        totalFlavorVgVolume += flavorVolume * (flavor.vgRatio / 100);
        totalFlavorPgVolume += flavorVolume * ((100 - flavor.vgRatio) / 100);
    });
    
    // Sweetener - použít nový select nebo starý toggle pro zpětnou kompatibilitu
    let sweetenerVolume = 0;
    let sweetenerType = 'none';
    const sweetenerSelect = document.getElementById('shSweetenerSelect');
    const sweetenerToggle = document.getElementById('shSweetenerToggle');
    
    // Preferovat select, pokud existuje
    if (sweetenerSelect) {
        sweetenerType = sweetenerSelect.value;
        if (sweetenerType !== 'none') {
            const sweetenerPercent = parseFloat(document.getElementById('shSweetenerStrength')?.value) || 0;
            sweetenerVolume = (sweetenerPercent / 100) * totalAmount;
        }
    } else if (sweetenerToggle && sweetenerToggle.checked) {
        const sweetenerPercent = parseFloat(document.getElementById('shSweetenerStrength')?.value) || 0;
        sweetenerVolume = (sweetenerPercent / 100) * totalAmount;
        sweetenerType = document.getElementById('shSweetenerType')?.value || 'sucralose';
    }
    
    // Water - vždy viditelný slider, nepotřebuje toggle
    let waterVolume = 0;
    const waterPercent = parseFloat(document.getElementById('shWaterPercent')?.value) || 0;
    if (waterPercent > 0) {
        waterVolume = (waterPercent / 100) * totalAmount;
    }
    
    // Calculate remaining base volume
    const usedVolume = nicotineVolume + totalFlavorVolume + sweetenerVolume + waterVolume;
    const baseVolume = totalAmount - usedVolume;
    
    // Calculate VG and PG needed from base
    // Target VG/PG minus what we already have from nicotine, flavors
    const targetVgVolume = (vgPercent / 100) * totalAmount;
    const targetPgVolume = (pgPercent / 100) * totalAmount;
    
    // VG/PG already provided by nicotine and flavors
    const providedVg = nicotineVgVolume + totalFlavorVgVolume;
    const providedPg = nicotinePgVolume + totalFlavorPgVolume;
    
    // Calculate pure VG and PG needed
    let pureVgVolume = targetVgVolume - providedVg;
    let purePgVolume = targetPgVolume - providedPg;
    
    // If using premixed base, calculate how much base is needed
    let premixedBaseVolume = 0;
    if (baseVolume > 0) {
        // The base fills the remaining volume
        premixedBaseVolume = baseVolume;
        // Adjust pure VG/PG based on premixed base composition
        pureVgVolume = Math.max(0, pureVgVolume - (premixedBaseVolume * premixedVg / 100));
        purePgVolume = Math.max(0, purePgVolume - (premixedBaseVolume * premixedPg / 100));
    }
    
    // Build results
    const results = [];
    
    // Add premixed base or separate VG/PG
    if (premixedBaseVolume > 0) {
        const baseDensity = calculatePremixedBaseDensity(premixedVg);
        results.push({
            name: `${t('results.premixed_base')} (${premixedVg}/${premixedPg})`,
            volume: premixedBaseVolume.toFixed(2),
            grams: mlToGrams(premixedBaseVolume, baseDensity),
            type: 'base'
        });
    }
    
    // Nicotine
    if (nicotineVolume > 0) {
        // Parsovat VG/PG poměr z hidden inputu (formát "50/50")
        const nicRatioInputRes = document.getElementById('shNicotineRatio');
        const nicRatioValueRes = nicRatioInputRes?.value || '50/50';
        const nicVgPercent = parseInt(nicRatioValueRes.split('/')[0]) || 50;
        const nicDensity = calculateNicotineDensity(nicVgPercent);
        results.push({
            name: t('results.nicotine'),
            volume: nicotineVolume.toFixed(2),
            grams: mlToGrams(nicotineVolume, nicDensity),
            type: 'nicotine'
        });
    }
    
    // Flavors - použít přeložené názvy
    flavorsData.forEach((flavor, index) => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        const flavorData = shishaFlavorDatabase[flavor.type] || shishaFlavorDatabase.custom;
        const flavorDensity = calculateCompositionDensity(flavorData.composition);
        // Získat přeložený název příchutě
        const flavorName = t(`shisha.flavor_${flavor.type}`, flavorData.name);
        results.push({
            name: `${t('results.flavor')} ${index + 1}: ${flavorName}`,
            volume: flavorVolume.toFixed(2),
            grams: mlToGrams(flavorVolume, flavorDensity),
            type: 'flavor'
        });
    });
    
    // Sweetener - použít přeložený název
    if (sweetenerVolume > 0) {
        const sweetener = sweetenerDatabase[sweetenerType] || sweetenerDatabase.sucralose;
        const sweetenerName = t(`shisha.sweetener_${sweetenerType}`, sweetener.name);
        results.push({
            name: `${t('shisha.sweetener_label')}: ${sweetenerName}`,
            volume: sweetenerVolume.toFixed(2),
            grams: mlToGrams(sweetenerVolume, sweetener.density || 1.0),
            type: 'sweetener'
        });
    }
    
    // Water
    if (waterVolume > 0) {
        results.push({
            name: t('form.water'),
            volume: waterVolume.toFixed(2),
            grams: mlToGrams(waterVolume, 1.0),
            type: 'water'
        });
    }
    
    // Update results display
    document.getElementById('resultTotal').textContent = totalAmount + ' ml';
    document.getElementById('resultRatio').textContent = vgPercent + ':' + pgPercent;
    document.getElementById('resultNicotine').textContent = targetNicotine + ' mg/ml';
    
    // Build results table
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    let runningTotal = 0;
    let totalGrams = 0;
    
    results.forEach(item => {
        const row = document.createElement('tr');
        const volume = parseFloat(item.volume);
        const grams = parseFloat(item.grams);
        runningTotal += volume;
        totalGrams += grams;
        
        // Přidat procenta
        const percent = ((volume / totalAmount) * 100).toFixed(1);
        
        row.innerHTML = `
            <td class="ingredient-name">${escapeHtml(item.name)} <span class="ingredient-percent-inline">(${percent}%)</span></td>
            <td class="ingredient-value">${item.volume}</td>
            <td class="ingredient-grams">${item.grams}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Přidat řádek celkem
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)}</td>
        <td class="ingredient-grams">${totalGrams.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);
    
    // Add mixing notes
    const notesList = document.getElementById('mixingNotesList');
    notesList.innerHTML = '';
    
    const notes = [
        t('results.note_glycerin_first'),
        t('results.note_add_nic'),
        t('results.note_add_flavor')
    ];
    
    if (sweetenerVolume > 0) {
        notes.push(t('shisha.note_add_sweetener') || 'Přidejte sladidlo a promíchejte.');
    }
    if (waterVolume > 0) {
        notes.push(t('shisha.note_add_water') || 'Přidejte vodu pro zředění.');
    }
    
    // Add steeping note
    if (flavorsData.length > 0) {
        const maxSteeping = Math.max(...flavorsData.map(f => f.data?.steepingDays || 3));
        const steepingNote = t('shisha.note_steeping', `Nechte směs zrát ${maxSteeping} dní pro lepší chuť.`).replace('{{days}}', maxSteeping);
        notes.push(steepingNote);
    }
    
    notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        notesList.appendChild(li);
    });
    
    // Store current recipe data
    const hasSweetener = sweetenerSelect ? sweetenerType !== 'none' : (sweetenerToggle?.checked);
    window.currentRecipeData = {
        formType: 'shisha',
        totalAmount: totalAmount,
        vgPercent: vgPercent,
        pgPercent: pgPercent,
        nicotineStrength: targetNicotine,
        premixedRatio: premixedRatio,
        flavors: flavorsData,
        sweetener: hasSweetener ? {
            type: sweetenerType,
            percent: parseFloat(document.getElementById('shSweetenerStrength')?.value) || 0
        } : null,
        water: waterPercent > 0 ? waterPercent : 0,
        results: results
    };
    
    // Show results page
    showPage('results');
    
    // Show appropriate buttons
    document.getElementById('resultsNewButtons').classList.remove('hidden');
    document.getElementById('resultsEditButtons').classList.add('hidden');
}

// Export Shisha functions
window.initShishaForm = initShishaForm;
window.updateShishaPremiumElements = updateShishaPremiumElements;
window.updateShishaPremixedRatio = updateShishaPremixedRatio;
window.updateShishaCustomPremixedPg = updateShishaCustomPremixedPg;
window.toggleShishaNicotine = toggleShishaNicotine;
window.handleShishaNicotineSelect = handleShishaNicotineSelect;
window.updateShishaNicotineType = updateShishaNicotineType;
window.updateShishaNicotineRatio = updateShishaNicotineRatio;
window.adjustShishaNicRatio = adjustShishaNicRatio;
window.updateShishaNicRatioDisplay = updateShishaNicRatioDisplay;
window.adjustShishaTargetNicotine = adjustShishaTargetNicotine;
window.updateShishaNicotineDisplay = updateShishaNicotineDisplay;
window.updateShishaFlavorType = updateShishaFlavorType;
window.adjustShishaFlavor = adjustShishaFlavor;
window.updateShishaFlavorStrength = updateShishaFlavorStrength;
window.adjustShishaFlavorRatio = adjustShishaFlavorRatio;
window.updateShishaFlavorRatioDisplay = updateShishaFlavorRatioDisplay;
window.updateShishaTotalFlavorPercent = updateShishaTotalFlavorPercent;
window.addShishaFlavor = addShishaFlavor;
window.removeShishaFlavor = removeShishaFlavor;
window.getShishaFlavorsData = getShishaFlavorsData;
window.toggleShishaSweetener = toggleShishaSweetener;
window.handleShishaSweetenerSelect = handleShishaSweetenerSelect;
window.updateShishaSweetenerType = updateShishaSweetenerType;
window.adjustShishaSweetener = adjustShishaSweetener;
window.updateShishaSweetenerDisplay = updateShishaSweetenerDisplay;
window.toggleShishaWater = toggleShishaWater;
window.adjustShishaWater = adjustShishaWater;
window.updateShishaWaterDisplay = updateShishaWaterDisplay;
window.adjustShishaRatio = adjustShishaRatio;
window.updateShishaRatioDisplay = updateShishaRatioDisplay;
window.autoRecalculateShishaVgPgRatio = autoRecalculateShishaVgPgRatio;
window.updateShishaVgPgLimits = updateShishaVgPgLimits;
window.calculateShishaMix = calculateShishaMix;