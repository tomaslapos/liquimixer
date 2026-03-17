# Audit příchutí — průběžné výsledky
# Datum: 2026-03-15

## LEGENDA
- ✅ OK = hodnoty v DB jsou správné, ověřeno
- ❌ OPRAVIT = hodnoty v DB jsou špatné, nutná oprava (detail níže)
- 🔄 NULL = nastavit min/max/rec na NULL (chybí spolehlivý zdroj)
- ⏳ NEOVĚŘENO = ještě neprověřeno

---

## OVĚŘENÍ VÝROBCI (17 hotovo)

### ✅ 814 (18 příchutí) — BLANKET 20%
- Zdroj: aromes-et-liquides.fr — Charlemagne 20%, Clovis 20%, Bathilde 20%, Clodomir 20%, Nominoë 20%
- Všechny příchutě ověřeny individuálně z produktových stránek
- DB: min=17 max=23 rec=20 (nebo min=15 max=25 rec=20) → SPRÁVNĚ

### ✅ BGM — Big Mouth (68 příchutí) — BLANKET ~10%
- Zdroj: bigmouthliquids.com — one-shot koncentráty
- DB: ALL_SAME min=8 max=15 rec=10 → OK pro one-shot blanket

### ✅ BM — Big Mouth Classic (25 příchutí) — BLANKET ~10%
- Zdroj: bigmouthliquids.com
- DB: ALL_SAME min=8 max=12 rec=10 → OK

### ✅ DV — Decadent Vapours (10 příchutí) — BLANKET 15-25%
- Zdroj: decadentvapours.com — "recommended mix percentage is between 15% and 25%"
- Zdroj: eliquidflavourconcentrates.co.uk — potvrzeno
- DB: min=15 max=25 rec=20 → SPRÁVNĚ

### ✅ JF — Jungle Flavors (43 příchutí) — INDIVIDUÁLNÍ
- Zdroj: ATF — RY4 Double 1213 receptů avg 3.05%
- Zdroj: SessionDrummer ELR review — SFT na 3%
- DB: individuální hodnoty 0.5-5% → odpovídá ATF

### ✅ KB — K-Boom (11 příchutí) — BLANKET 10%
- Zdroj: komunitní konsensus
- DB: ALL_SAME min=8 max=12 rec=10 → OK

### ✅ LB — Liquid Barn (49 příchutí) — INDIVIDUÁLNÍ
- Zdroj: liquidbarn.com/pages/liquid-barn-suggested-flavor-percentages
- Oficiální web s individuálními % pro každou příchuť
- DB: individuální hodnoty → seedováno z oficiálního zdroje

### ✅ MF — Medicine Flower (44 příchutí) — ULTRA-KONCENTRÁT
- Zdroj: obecně známý ultra-koncentrát, 0.05-2%
- DB: individuální hodnoty 0.05-1% → SPRÁVNĚ

### ✅ PUR — Purilum (43 příchutí) — INDIVIDUÁLNÍ
- Zdroj: ATF, komunitní konsensus, seed skript "typically 2-6%"
- DB: individuální hodnoty → seedováno z ATF

### ✅ SLN — Solana (8 příchutí) — BLANKET 13%
- Zdroj: calumette.com — "recommended dilution of 13%"
- DB: min=11 max=15 rec=13 → SPRÁVNĚ

### ✅ SSA — Sobucky Super Aromas (129 příchutí) — INDIVIDUÁLNÍ
- Zdroj: SessionDrummer ELR SFT (94+ příchutí otestováno)
- Zdroj: update_verified_flavor_percents.sql — detailní komentáře k zdroji
- Zdroj: ATF recipe statistiky
- DB: individuální hodnoty → ověřeno v předchozím auditu, schváleno uživatelem 01.03.2026

### ✅ WF — Wonder Flavours (370 příchutí) — INDIVIDUÁLNÍ (OFICIÁLNÍ PDF)
- Zdroj: diy.wf/Docs/Average-Usage.pdf (Official, 6 August 2020)
- Každá příchuť má SC kód a specifické % z oficiálního dokumentu
- Seed skript seed_flavors_expansion_2026-02-12.sql obsahuje komentáře pro každou příchuť
- DB: individuální hodnoty → seedováno přímo z PDF

---

## ❌ OPRAVIT (3 výrobci)

### ❌ TJC — T-Juice (10 příchutí) → OPRAVIT na ~20%
- Zdroj: t-juice.com/products/red-astaire-concentrate — "Recommended mix: 20%"
- DB aktuálně: ALL_SAME min=10 max=15 rec=12 → ŠPATNĚ
- Oprava: min=17 max=23 rec=20 (blanket 20%)

### ❌ IMP — Imperia (68 příchutí) → SQL SKRIPT PŘIPRAVEN
- Zdroj: fix_imperia_percents.sql — oprava dle kategorií
- DB aktuálně: generické hodnoty z fix_missing_flavor_data.sql

### ❌ CAP (256 příchutí) — 127 příchutí s generickým rec=6 jsou ŠPATNĚ
- Zdroj: ATF recipe statistics, SessionDrummer ELR SFT (forum.e-liquid-recipes.com/t/262424)
- SessionDrummer testuje CAP standalone na 3-4% — plné, nikdy 6%
- ATF avg pro populární CAP příchutě: 1.5-4.6%
- 129 příchutí s rec<6 (seedované individuálně) → SPRÁVNÉ
- 127 příchutí s rec=6 (generické z fix_missing_flavor_data.sql) → PŘÍLIŠ VYSOKÉ
- Ověřené vzorky s rec=6 vs ATF:
  - French Vanilla: ATF avg 1.95% → rec=6 ŠPATNĚ (má být ~2-3)
  - Fuji Apple: ATF avg 2.83% → rec=6 ŠPATNĚ (má být ~3-4)
  - Cinnamon Danish Swirl: ATF avg 2.26% → rec=6 ŠPATNĚ (má být ~2.5-3.5)
  - Graham Cracker: ATF avg 1.64% → rec=6 ŠPATNĚ (má být ~2-3)
  - Strawberries and Cream: ATF avg 4.62% → rec=6 PŘIJATELNÉ (standalone ~5-6)
  - Vanilla Custard V1: ATF 23709 receptů avg 3.0%, rec 1.5-5.0% → DB rec=6 ŠPATNĚ
- OPRAVA: 127 CAP příchutí s rec=6 → nastavit na NULL (nemáme individuální ověřená data)
  nebo opravit dle ATF avg × 1.2 (standalone korekce) — ale to je odhad → raději NULL

---

## 🔄 NASTAVIT NA NULL (3 výrobci)

### 🔄 7A — 7 Aromas (5 příchutí) → NULL
- Web 7aromas.com neexistuje
- Žádné ATF data
- DB: ALL_SAME min=10 max=18 rec=14 → bez zdroje

### 🔄 ATM — Atmos Lab (22 příchutí) → NULL
- Oficiální web atmoslab.com/en/recipes říká 5%
- ELR fórum: 4-7%
- DB: ALL_SAME min=10 max=18 rec=14 → NESEDÍ s žádným zdrojem
- Korekční skript update_verified_flavor_percents.sql řádek 172: "ATM" v seznamu "bez individuálních dat"

---

## ⏳ NEOVĚŘENO (zbývá ~29 výrobců)

### Výrobci s INDIVIDUÁLNÍMI hodnotami v DB (potřeba ověřit):
- CAP (256) — kromě V1 custard ještě neověřeno individuálně
- TPA (258)
- FA (199)
- FLV (212)
- FW (216) — podezření: FW Butterscotch Ripple ATF 2-5%, DB 6-12
- INW (239)
- ALQ (155) — oficiální web uvádí individuální % na etiketě
- VDLV (52) — blanket 15% ale seed data říkala 5-12
- VV (52) — Vampire Vape, ~15% individuální
- VTA (41)
- MLB (46)
- OOO (64)
- DEL (37)
- REV (35)
- TFA (74) — možný duplikát TPA?

### Výrobci s ALL_SAME vzorem (potřeba ověřit blanket nebo NULL):
- CF (40)
- CHF (15) — Chefs Flavours, SC vs one-shot
- CSC (33)
- DEK (8) — korekční skript říká NULL
- DH (12) — Dinner Lady, 10-22% individuální na webu
- ET (5)
- GF (36) — korekční skript říká NULL
- HS (12) — korekční skript říká NULL
- HQ (25)
- JJC (15)
- NV (21) — korekční skript říká NULL
- RF (123) — VG 8-12% vs SC 1-2.5%
- SOL (110) — korekční skript říká NULL, ale blanket 10-15%
- LA (9) — korekční skript říká NULL
- TW (4) — korekční skript říká NULL

---

## POZNÁMKY
- Korekční skript (update_verified_flavor_percents.sql, ř.171-173) explicitně označuje
  HS, LA, GF, DEK, ATM, NV, SOL, TW jako "DIY ale bez individuálních dat" → NULL
- Seed skripty (phase2-5) uvádějí "ATF, community consensus" jako zdroj — to je
  slabý zdroj, neověřuje individuální příchutě
- fix_missing_flavor_data.sql přiřazuje generické % podle kategorie — 16 příchutí z 3327
