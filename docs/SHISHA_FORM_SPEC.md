# Specifikace: Nový Shisha Formulář (3 režimy)

## Kontext

Stávající shisha formulář je kopie vape liquid formuláře — počítá VG+PG+aroma směs.
To je špatně: tradiční shisha = tabák + molasses (glycerin + melasa/med + příchutě).
Hotové tabáky (Al Fakher, Adalya...) se dávají přímo do fajky — nepřidává se k nim liquid.
Míchání hotových tabáků je nejpopulárnější aktivita v hookah komunitě.

Nový formulář nabídne **tři režimy**:

---

## Režim 1: Mix hotových tabáků (nejpopulárnější)

Uživatel má hotové tabáky (Al Fakher, Adalya, Darkside...) a chce je smíchat.
Toto je nejčastější use case — většina hookah kuřáků míchá 2-4 tabáky.

### Vstupy:

1. **Velikost korunky / celková hmotnost** (g)
   - Tlačítka: 10g (malá), **15g** (standard), 20g (phunnel), 25g (velká)
   - Nebo vlastní hodnota (input)
   - Tooltip: "Kolik tabáku se vejde do vaší korunky"

2. **Tabák 1** (povinný)
   - Autocomplete z DB (product_type='shisha') — Al Fakher, Adalya, Starbuzz...
   - NEBO vlastní text (uživatel napíše název)
   - Slider podíl: 0-100%, default 50%

3. **Tabák 2** (povinný, min 2 tabáky)
   - Stejné jako Tabák 1
   - Slider podíl: 0-100%, default 50%
   - Součet všech podílů = 100% (automatická normalizace)

4. **Tabák 3-4** (volitelné, Premium)
   - Tlačítko "+ Přidat tabák"
   - Max 4 tabáky

### Výpočet:

```
tobacco1_grams = totalWeight * (tobacco1_percent / 100)
tobacco2_grams = totalWeight * (tobacco2_percent / 100)
// atd.
// Validace: součet % = 100%
```

### Výstup (tabulka):

| Tabák | Podíl | Gramy |
|-------|-------|-------|
| Al Fakher Two Apples | 60% | 9.0g |
| Adalya Love 66 | 40% | 6.0g |
| **CELKEM** | **100%** | **15.0g** |

### Poznámky k míchání:
1. Odměřte každý tabák zvlášť
2. Smíchejte na čisté podložce (nůžkami nebo rukama)
3. Naplňte korunky — rozvolněně (fluffy pack) nebo přitlačeně (dense pack) dle tabáku
4. Přikryjte alobalem/HMD a přiložte uhlíky

### Speciální funkce:
- **Uložit mix jako recept** — pro opakované použití
- **Doporučené mixy** — populární kombinace z komunity (seedované recepty)
- **Vizuální poměr** — barevný kruhový graf (pie chart) ukazující podíly

---

## Režim 2: DIY tabák od nuly (celá shisha směs)

Uživatel kupuje surové tabákové listy a chce připravit vlastní shisha tabák.
Niche use case pro pokročilé — vyžaduje surový tabák + ingredience.

### Vstupy:

1. **Množství tabáku** (g)
   - Input: 50g – 1000g, default 250g
   - Poznámka: "Použijte předem namočené a nakrájené tabákové listy"

2. **Poměr tabák:molasses** 
   - Tlačítka: 4:1 (suchý), **3:1** (standard), 2:1 (mokrý), 1:1 (velmi mokrý)
   - Default: 3:1 (tj. na 300g tabáku = 100g molasses)
   - Tooltip: "Vyšší poměr molasses = vlhčí tabák, více kouře"

3. **Typ sladidla** (základ molasses)
   - Select: Melasa (nejčastější) / Med / Agáve
   - % sladidla v molasses: slider 40-70%, default 55%

4. **Glycerin (VG)**
   - % glycerinu v molasses: slider 20-50%, default 30%
   - Tooltip: "Glycerin = hustý kouř. Více = hustější, ale může být příliš"

5. **Příchuť** (volitelné)
   - Autocomplete z DB (product_type='vape') — FA, CAP, TPA, INW...
   - NEBO generická kategorie (Double Apple, Mint, Grape...)
   - % příchutě v molasses: slider 2-15%, default 5%
   - Poznámka: "Začněte s malým množstvím, přidávat můžete vždy"
   - Max 2 příchutě (4 s Premium)

6. **Doba zrání** (info)
   - Zobrazení: "Minimum 1 den, doporučeno 2-4 týdny pro nejlepší chuť"

### Výpočet:

```
molassesAmount = tobaccoAmount / tobaccoMolassesRatio  // 300/3 = 100g
sweetenerVolume = molassesAmount * (sweetenerPercent / 100)
glycerinVolume = molassesAmount * (glycerinPercent / 100)
flavorVolume = molassesAmount * (flavorPercent / 100)
remainingVolume = molassesAmount - sweetenerVolume - glycerinVolume - flavorVolume
// remaining = voda/ostatní, zobrazit pokud > 0
```

### Výstup (tabulka):

| Složka | Gramy | ml |
|--------|-------|-----|
| Tabák (připravený) | 300g | — |
| Melasa | 55g | 39ml |
| Glycerin (VG) | 38g | 30ml |
| Příchuť: [název] | 5g | 5ml |
| **Molasses mix celkem** | **98g** | — |
| **SMĚS CELKEM** | **398g** | — |

### Poznámky k míchání:
1. Smíchejte melasu, glycerin a příchuť v oddělené nádobě (= molasses mix)
2. Přidejte molasses mix k připravenému tabáku
3. Důkladně promíchejte rukama (mokrýma)
4. Uzavřete do vzduchotěsné nádoby
5. Nechte zrát minimálně 24 hodin, ideálně 2-4 týdny
6. Občas promíchejte během zrání

---

## Režim 3: Molasses mix (báze pro tabák)

Uživatel chce připravit jen tekutou složku (molasses), kterou pak sám přidá k tabáku.
Užitečné když chce mít zásobu molasses pro více dávek.

### Vstupy:

1. **Celkové množství molasses** (ml nebo g)
   - Input: 50-500, default 100ml

2. **Typ sladidla**
   - Select: Melasa (nejčastější) / Med / Agáve
   - % sladidla v mixu: slider 40-70%, default 55%

3. **Glycerin (VG)**
   - % glycerinu v mixu: slider 20-50%, default 30%

4. **Příchuť** (volitelné)
   - Autocomplete z DB (product_type='vape') — vape concentráty
   - NEBO generická kategorie
   - % příchutě v mixu: slider 2-15%, default 5%

5. **Voda** (volitelné)
   - slider 0-10%, default 0%

### Výpočet:

```
sweetenerVolume = totalAmount * (sweetenerPercent / 100)
glycerinVolume = totalAmount * (glycerinPercent / 100)
flavorVolume = totalAmount * (flavorPercent / 100)
waterVolume = totalAmount * (waterPercent / 100)
// Validace: součet % ≤ 100% (zbytek = vzduch/prostor)
```

### Výstup:

| Složka | ml | Gramy |
|--------|-----|-------|
| Melasa | 55ml | 77g |
| Glycerin (VG) | 30ml | 38g |
| Příchuť: [název] | 5ml | 5g |
| Voda | 0ml | 0g |
| **CELKEM** | **90ml** | **120g** |

### Poznámka k použití:
- "Pro standardní vlhkost smíchejte s tabákem v poměru 3:1 (tabák:molasses)"
- "Tento mix vystačí na cca X gramů tabáku"

---

## UI/UX

### Přepínač režimu (nahoře formuláře)
- Tři tlačítka: **"Mix tabáků"** / "DIY tabák" / "Molasses mix"
- Default: Mix tabáků (nejpopulárnější)
- Styl: stejný jako stávající ratio-toggle-buttons (zlato-hnědá pro shisha)
- Při přepnutí se zobrazí/skryjí příslušné sekce

### Režim 1 (Mix tabáků) — specifické UI:
- Autocomplete hledá v DB product_type='shisha' (hotové tabáky)
- Slider procent každého tabáku (linked — součet = 100%)
- Při změně jednoho se automaticky upraví ostatní
- Vizuální kruhový graf podílů
- Tlačítka velikost korunky místo inputu ml

### Režim 2 (DIY) a 3 (Molasses) — specifické UI:
- Autocomplete pro příchutě hledá product_type='vape' (concentráty)
- Generické kategorie (Double Apple, Mint...) zůstávají v selectu
- Slider procent pro každou ingredienci
- Gramy jako primární jednotka (ne ml — shisha se váží)

### Shisha příchutě v DB:
- product_type='shisha' (826 položek) = hotové tabáky → min/max/rec = NULL
  - Zobrazují se v Režimu 1 (Mix tabáků) autocomplete
  - NEzobrazují se v Režimu 2/3 (tam jsou vape concentráty)
- product_type='vape' = concentráty → mají min/max/rec
  - Zobrazují se v Režimu 2/3 (DIY/Molasses) autocomplete
  - NEzobrazují se v Režimu 1 (Mix tabáků)

### Hustoty pro přepočet ml→g:
- Glycerin (VG): 1.261 g/ml
- Melasa: ~1.4 g/ml
- Med: ~1.42 g/ml  
- Agáve: ~1.35 g/ml
- Voda: 1.0 g/ml
- Vape concentrate (příchuť): ~1.03-1.05 g/ml (záleží na složení)

---

## Dopad na stávající kód

### Co se odstraní ze stávajícího shisha formuláře:
1. VG/PG poměr slider (irelevantní pro tabákovou shisha)
2. Separátní/Předmíchaná báze (irelevantní)
3. Nikotin sekce (nikotin je v tabáku samotném)
4. Stávající shisha flavor select (Double Apple atd.) — nahrazeno autocomplete + kategorie

### Co zůstane (přepoužité):
1. Sladidlo select (melasa/med/agáve) — pro režim 2 a 3
2. Voda slider — pro režim 3
3. Autocomplete pro příchutě — rozlišení dle product_type
4. Premium gating (multi-flavor/multi-tabák)

### Nové funkce:
1. `calculateShishaMix()` — přepsat pro 3 režimy
2. `getShishaFlavorsData()` → `getShishaTobaccosData()` pro režim 1
3. Nový HTML pro přepínač režimů + formuláře
4. Nové i18n klíče pro všechny 3 režimy (31 jazyků)

---

## Dopad na DB

- Shisha příchutě (826) = hotové tabáky → min/max/rec zůstává NULL ✓
- Žádné nové DB sloupce — stávající schéma stačí
- recipe_data formát se změní pro nové shisha recepty

## Dopad na recepty

- Stávající uložené shisha recepty (recipe_data s formType='shisha') = staré liquid mixy
  - Ponechat funkční se zpětnou kompatibilitou NEBO migrovat
- Nové formType hodnoty:
  - `shisha_mix` — Mix hotových tabáků (režim 1)
  - `shisha_diy` — DIY tabák od nuly (režim 2)
  - `shisha_molasses` — Molasses mix (režim 3)
  - Starý `shisha` — zpětná kompatibilita pro existující recepty

## Premium gating

- **Free:** 2 tabáky v mixu, 1 příchuť v DIY/Molasses
- **Premium:** 4 tabáky v mixu, 4 příchutě v DIY/Molasses
- Uložení receptu: Premium only (stejně jako teď)

## Otevřené otázky

1. Co se stávajícími shisha recepty v DB? Zpětná kompatibilita nebo migrace?
2. Mají se seedové shisha recepty přegenerovat pro nový formát?
3. Chceme doporučené mixy (populární kombinace tabáků) jako seed data?
4. Má režim 1 zobrazit i značku tabáku vedle názvu (Al Fakher Two Apples)?
