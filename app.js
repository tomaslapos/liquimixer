// =========================================
// LiquiMixer - E-liquid Calculator Logic
// Výpočet dle metodiky: http://www.todmuller.com/ejuice/ejuice.php
// =========================================

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
    
    // Calculate flavor volume (flavor is typically 100% PG)
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
    
    // Calculate VG and PG from nicotine
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);
    
    // Total fixed PG = from nicotine + from flavor
    const fixedPgVolume = nicotinePgVolume + flavorVolume;
    const fixedVgVolume = nicotineVgVolume;
    
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
                reasons.push(`příchuť (${flavorPercent}% v PG)`);
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

    // 5. Flavor is typically in PG base
    const flavorPgContent = flavorVolume;

    // 6. Calculate pure PG and VG needed to achieve target ratio
    // Target VG in final mix = (vgPercent / 100) * totalAmount
    // Target PG in final mix = (pgPercent / 100) * totalAmount
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    // Subtract what's already coming from nicotine and flavor
    let pureVgNeeded = targetVgTotal - nicotineVgContent;
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
        ingredients.push({
            name: `${flavor.name} příchuť (PG báze)`,
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
    const actualVg = pureVgNeeded + nicotineVgContent;
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;

    // Display results
    displayResults(totalAmount, vgPercent, pgPercent, targetNicotine, ingredients, actualTotal, actualVg, actualPg);
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg) {
    document.getElementById('resultTotal').textContent = `${total} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${nicotine} mg/ml`;
    
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
    
    // Flavor is typically 100% PG
    const fixedPgVolume = nicotinePgVolume + flavorVolume;
    const fixedVgVolume = nicotineVgVolume;
    
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
                reasons.push(`příchuť (${flavorVolume} ml v PG)`);
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
    const flavorPgContent = flavorVolume; // Flavor is 100% PG
    
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;
    
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;
    
    let pureVgNeeded = targetVgTotal - nicotineVgContent;
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
            name: `Příchuť (již v lahvičce, PG báze)`,
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
    
    const actualVg = pureVgNeeded + nicotineVgContent;
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
