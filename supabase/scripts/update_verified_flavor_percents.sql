-- =====================================================
-- UPDATE ověřených min/max/recommended_percent pro vape příchutě
-- Datum: 01.03.2026
-- POUZE příchutě s reálným ověřením z komunitních zdrojů
-- =====================================================

-- =====================================================
-- SSA (Sobucky Super Aromas) — OVĚŘENÉ příchutě
-- Zdroj: SessionDrummer SFT reviews (ELR fórum, Bull City Flavors)
--   Thread: forum.e-liquid-recipes.com/t/247616
--   BCF: bullcityflavors.com product reviews
-- Zdroj: Noted 181 (DIY or DIE podcast panel)
--   URL: diyordievaping.com/2020/12/15/flavor-of-the-quarter-noted-181/
-- Zdroj: ATF (alltheflavors.com) recipe statistics
-- Zdroj: Reddit r/DIY_eJuice "94 Sobucky Super Aroma first impressions"
--
-- SessionDrummer: "these ARE fairly strong, I decided on a starting
-- point of 1% again" — otestoval 94+ SSA příchutí na ELR fóru
-- =====================================================

-- SessionDrummer ELR Series I-II: plný text přečten, explicitně ověřeno
-- Guava (SSA) 1% — "Very clean and full at 1%" — 9.25/10
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Guava' AND min_percent IS NULL;

-- Juicy Cherries (SSA) 0.75% — "ultra low 0.75%... I wouldn't go much higher... 0.5-0.75%" — 9.5/10
UPDATE flavors SET min_percent = 0.3, max_percent = 1.5, recommended_percent = 0.75
WHERE manufacturer_code = 'SSA' AND name = 'Juicy Cherries' AND min_percent IS NULL;

-- Raspberry Syrup (SSA) 1% — "nice and full, in no way hitting ceiling @ 1%" — 10/10
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Raspberry Syrup' AND min_percent IS NULL;

-- Ripe Banana (SSA) 1% — "Fairly full @ 1%" — 8.75/10
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Ripe Banana' AND min_percent IS NULL;

-- Ripe Coconut (SSA) 1% — "plenty full @ 1%" — 9.4/10
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Ripe Coconut' AND min_percent IS NULL;

-- SessionDrummer ELR Series III (thread /247616/341) + BCF product review:
-- Sweet Watermelon (SSA) 1% — BCF review: "full at 1%, no off notes" — 9.25/10
-- ATF: 246 receptů, průměr 2.31%
UPDATE flavors SET min_percent = 0.5, max_percent = 3.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Sweet Watermelon' AND min_percent IS NULL;

-- Ripe Peach (SSA) 1% — VapingUnderground snippet: "Ripe Peach (SSA) 1%" — 9.75/10
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Ripe Peach' AND min_percent IS NULL;

-- Grapefruit (SSA) 1% — SessionDrummer POTV/VU: "great natural, smooth, tempered GF taste"
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Grapefruit' AND min_percent IS NULL;

-- Noted 181 (DIY or DIE) — panel review:
-- Ripe Mango (SSA) — "Identifiable as mango. Tastes cooked, has some peel."
-- Testováno panelem, no explicit % ale SSA standard 1%
-- NEDOSTATEČNÁ DATA PRO STANDALONE % → NULL

-- Natural Wild Strawberry — ID10-T testoval na 2.25%
-- POZOR: "Natural Wild Strawberry" ≠ "Wild Strawberry" v naší DB — možný jiný produkt → NULL

-- Reddit r/DIY_eJuice (94 SSA first impressions):
-- Summer Fruits 3% — odpovídá naší "Summer Fruits" příchuti
-- Ale review je negativní: "raspberry-peach hybrid wrapped in plastic off note"
-- NEDOSTATEČNÁ KVALITA DAT → NULL

-- =====================================================
-- SSA — zbylých 28 příchutí
-- Zdroj: SessionDrummer blanket konsenzus "my standard 1% rate"
-- Testoval 94+ SSA příchutí, všechny na 1% (ELR fórum threads
-- /247616, /272376, /279581). Říká: "these ARE fairly strong"
-- Schváleno uživatelem 01.03.2026 jako dostatečný konsenzus.
-- Natural Mint Light — nižší % kvůli mentolovému profilu
-- (SessionDrummer testoval SSA mentoly na 0.5-1%)
-- =====================================================
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Blackberry Sweet' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Bubble Gum Fruity' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Cucumber' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Dark Blackberry' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Golden Apple' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 1.5, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Hemp Sweet' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Jelly Candy' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Juicy Lemon' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Lime' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Natural Lemon' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.3, max_percent = 1.5, recommended_percent = 0.8
WHERE manufacturer_code = 'SSA' AND name = 'Natural Mint Light' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Natural Raspberry' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Natural Soft Apple' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Panna Cotta' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Peach with Apricots' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Pear Williams' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Pink Bubble Gum' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Power Drink' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Ripe Mango' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Sour Lime' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Strawberry Candy' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Summer Fruits' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Sweet Banana' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Sweet Clementines' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Thai Pineapple' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Vanilla Cream' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Wild Cherry' AND min_percent IS NULL;

UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'SSA' AND name = 'Wild Strawberry' AND min_percent IS NULL;

-- =====================================================
-- STAV REVIZE — SOUHRN
-- =====================================================
-- SSA: 8 příchutí ověřeno (z 36 chybějících)
-- Komerční e-liquid brandy: NULL (rozhodnutí uživatele 01.03.2026)
--   12M, AIF, ALK, BJK, BMB, BVC, CFG, CUT, EJA, FNT, FRZ,
--   GLV, HLJ, HRN, IJC, IVP, JAM, JCH, K100, MKL, MVP, MVY,
--   MXC, N100, NIM, NMB, NRS, NTJ, NZV, PBD, PRL, PTV, SEJ,
--   SNC, SVC, TEJ, TWV, VKV, VNV, VPT, ZNW
-- DIY značky bez dostatečných dat: NULL
--   HS, DB, VL, SB, LA, GF, DEK, ATM, NV, SOL, TW, FLT,
--   LIQ, ELF, ALQ, ALZ, DAM, N100 (DIY ale bez individuálních dat)
-- =====================================================

-- Kontrola — všechny SSA vape příchutě
SELECT name, min_percent, max_percent, recommended_percent
FROM flavors
WHERE manufacturer_code = 'SSA' AND product_type = 'vape'
ORDER BY name;

-- Kontrola — celkový počet zbývajících NULL
SELECT COUNT(*) as remaining_null
FROM flavors
WHERE product_type = 'vape'
AND min_percent IS NULL;
