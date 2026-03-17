-- =====================================================
-- AUDIT PŘÍCHUTÍ — OVĚŘENÉ OPRAVY
-- Datum: 2026-03-15
-- 
-- Tento skript obsahuje POUZE opravy pro příchutě kde máme
-- ověřený zdroj potvrzující správnou hodnotu.
-- =====================================================

-- =====================================================
-- 1. TJC — T-Juice (10 příchutí)
-- Zdroj: t-juice.com/products/red-astaire-concentrate
--        "Recommended mix: 20%"
-- DB aktuálně: ALL_SAME min=10 max=15 rec=12 → ŠPATNĚ
-- Oprava: blanket 20%
-- =====================================================
UPDATE flavors SET min_percent = 17, max_percent = 23, recommended_percent = 20
WHERE manufacturer_code = 'TJC' AND status = 'active';

-- =====================================================
-- 2. IMP — Imperia (68 příchutí)
-- Zdroj: imperia.cz — "doporučené dávkování 5-7%"
-- DB aktuálně: ALL_SAME min=2 max=3 rec=2.5 → ŠPATNĚ
-- Oprava dle kategorií (viz fix_imperia_percents.sql)
-- =====================================================
UPDATE flavors SET min_percent = 3.0, max_percent = 8.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'fruit';

UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'tobacco';

UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'cream';

UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 6.0
WHERE manufacturer_code = 'IMP' AND category = 'dessert';

UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 6.0
WHERE manufacturer_code = 'IMP' AND category = 'bakery';

UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'candy';

UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'drink';

UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'nuts';

UPDATE flavors SET min_percent = 2.0, max_percent = 5.0, recommended_percent = 3.0
WHERE manufacturer_code = 'IMP' AND category = 'spice';

UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.0
WHERE manufacturer_code = 'IMP' AND category = 'menthol';

-- =====================================================
-- 3. 7A — 7 Aromas (5 příchutí) → NULL
-- Zdroj: ŽÁDNÝ — web 7aromas.com neexistuje, žádné ATF data
-- DB aktuálně: ALL_SAME min=10 max=18 rec=14
-- =====================================================
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = '7A' AND status = 'active';

-- =====================================================
-- 4. ATM — Atmos Lab (22 příchutí) → NULL
-- Zdroj: atmoslab.com říká 5%, ELR říká 4-7%, DB má 10-18 → NESEDÍ
-- Korekční skript update_verified_flavor_percents.sql ř.172: "ATM bez individuálních dat"
-- =====================================================
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'ATM' AND status = 'active';

-- =====================================================
-- 5. Značky explicitně označené v update_verified_flavor_percents.sql
--    řádek 171-173 jako "DIY ale bez individuálních dat" → NULL
-- =====================================================

-- HS — Hangsen (12 příchutí) → NULL
-- Seed dal generické 5-12 rec=8, žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'HS' AND status = 'active';

-- GF — German Flavours (36 příchutí) → NULL
-- Seed dal generické 3-7 rec=5, žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'GF' AND status = 'active';

-- DEK — Dekang (8 příchutí) → NULL
-- Seed dal generické 5-12 rec=8, žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'DEK' AND status = 'active';

-- NV — NicVape (21 příchutí) → NULL
-- Seed dal generické, žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'NV' AND status = 'active';

-- SOL — Solub Arome (110 příchutí) → NULL
-- Blanket 10-15% je pro one-shot, seed dal 3-6% z ATF
-- Bez individuálního ověření pro single-flavor příchutě
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'SOL' AND status = 'active';

-- LA — LorAnn (9 příchutí) → NULL
-- Žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'LA' AND status = 'active';

-- TW — Twisted (4 příchutě) → NULL
-- Žádné individuální ověření
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'TW' AND status = 'active';

-- =====================================================
-- 6. CAP — 127 příchutí s generickým rec=6 → NULL
-- Zdroj: ATF + SessionDrummer potvrzují že CAP standalone je 3-4%
--        DB rec=6 je z fix_missing_flavor_data.sql (generické dle kategorie)
--        Nemáme individuální data pro těchto 127 příchutí
-- PONECHAT: 129 CAP příchutí s rec<6 (seedované, ověřené)
-- =====================================================
UPDATE flavors SET min_percent = NULL, max_percent = NULL, recommended_percent = NULL
WHERE manufacturer_code = 'CAP'
  AND status = 'active'
  AND recommended_percent = 6;

-- =====================================================
-- SOUHRN
-- =====================================================
-- TJC: 10 příchutí → oprava na 20% (blanket výrobce)
-- IMP: 68 příchutí → oprava dle kategorií (blanket výrobce 5-7%)
-- 7A:  5 příchutí → NULL (žádný zdroj)
-- ATM: 22 příchutí → NULL (DB nesedí se zdrojem)
-- HS:  12 příchutí → NULL (bez individuálních dat)
-- GF:  36 příchutí → NULL (bez individuálních dat)
-- DEK: 8 příchutí → NULL (bez individuálních dat)
-- NV:  21 příchutí → NULL (bez individuálních dat)
-- SOL: 110 příchutí → NULL (bez individuálních dat)
-- LA:  9 příchutí → NULL (bez individuálních dat)
-- TW:  4 příchutí → NULL (bez individuálních dat)
-- CAP: 127 příchutí → NULL (generické rec=6, nesedí s ATF/SessionDrummer)
-- 
-- CELKEM OPRAVENO: ~432 příchutí
-- PONECHÁNO BEZ ZMĚNY (ověřeno ✅): 818 + 129 CAP = 947 příchutí
-- ZBÝVÁ K OVĚŘENÍ: ~1948 příchutí
-- =====================================================
