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
        note: 'Standardní start: 10%, zrát 3–7 dní'
    },
    citrus: { 
        name: 'Citrónové (citron, limeta)', 
        min: 6, max: 10, ideal: 8,
        note: 'Silné kyseliny, méně stačí, mentol zesiluje'
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
        note: 'Sladké tlumí throat hit, vyšší % nutné'
    },
    dessert: { 
        name: 'Dezerty (koláč, pudink)', 
        min: 15, max: 22, ideal: 18,
        note: 'Komplexní: 2–4 týdny steeping, riziko přepíchnutí'
    },
    bakery: { 
        name: 'Zákusky (tyčinka, donut)', 
        min: 18, max: 25, ideal: 20,
        note: 'Max zóna: testovat 15% nejdříve'
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
        note: 'Nejsložitější: 3–6 týdnů steeping'
    },
    nuts: { 
        name: 'Oříškové (arašíd, lískový)', 
        min: 12, max: 18, ideal: 15,
        note: 'Dobře tlumí nikotin, střední %'
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
    { vgMin: 0, vgMax: 9, color: '#000000', text: 'Maximální pára, žádná chuť ani škrábání. Velmi hustý liquid.' },
    { vgMin: 10, vgMax: 29, color: '#0044aa', text: 'Maximální pára, minimální chuť bez škrábání. Hustý liquid pro cloudové vapování.' },
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
    vgPgRatioSlider.addEventListener('input', updateRatioDisplay);
    targetNicotineSlider.addEventListener('input', updateNicotineDisplay);
    flavorStrengthSlider.addEventListener('input', updateFlavorDisplay);
    
    document.getElementById('nicotineBaseStrength').addEventListener('input', updateMaxTargetNicotine);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// =========================================
// VG/PG Ratio Functions
// =========================================

function adjustRatio(change) {
    const slider = document.getElementById('vgPgRatio');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(100, newValue));
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

// =========================================
// Nicotine Functions
// =========================================

function updateNicotineType() {
    const type = nicotineTypeSelect.value;
    const strengthContainer = document.getElementById('nicotineStrengthContainer');
    const targetGroup = document.getElementById('targetNicotineGroup');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        targetGroup.classList.add('hidden');
        targetNicotineSlider.value = 0;
        updateNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        targetGroup.classList.remove('hidden');
        updateMaxTargetNicotine();
    }
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
    const descEl = document.getElementById('nicotineDescription');
    const trackEl = document.getElementById('nicotineTrack');
    
    displayEl.textContent = value;
    
    // Find matching description
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        descEl.textContent = desc.text;
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        displayEl.style.color = desc.color;
        displayEl.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }
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
    displayEl.style.color = color;
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
    // Get user inputs
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 100;
    const vgPercent = parseInt(vgPgRatioSlider.value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = nicotineTypeSelect.value;
    const targetNicotine = parseFloat(targetNicotineSlider.value) || 0;
    const baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength').value) || 0;
    const flavorType = flavorTypeSelect.value;
    const flavorPercent = flavorType !== 'none' ? parseFloat(flavorStrengthSlider.value) : 0;

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
    // Most freebase nicotine is in PG base (100% PG)
    // Nicotine salts are often 50/50 or in PG
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    
    if (nicotineType === 'freebase') {
        // Freebase is typically 100% PG
        nicotinePgContent = nicotineVolume;
        nicotineVgContent = 0;
    } else if (nicotineType === 'salt') {
        // Salt nicotine is often 50/50
        nicotinePgContent = nicotineVolume * 0.5;
        nicotineVgContent = nicotineVolume * 0.5;
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
        const nicotineName = nicotineType === 'salt' ? 'Nikotinová sůl' : 'Freebase nikotin';
        const nicotineBase = nicotineType === 'salt' ? '50/50' : 'PG báze';
        ingredients.push({
            name: `${nicotineName} (${baseNicotine} mg/ml, ${nicotineBase})`,
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
