# Shisha formulář — detailní UX popis (krok po kroku)

---

## Společné pro všechny režimy

### Krok 0: Přepínač režimu
- **Typ prvku:** 3 toggle tlačítka (stejný styl jako stávající "Separátní PG/VG / Předmíchaná báze")
- **Možnosti:** `Mix tabáků` | `DIY tabák` | `Molasses mix`
- **Default:** `Mix tabáků` (nejpopulárnější)
- **Chování:** Klik přepne viditelnost sekcí. Zlato/hnědý styl (form-gold).
- **i18n:** `shisha.mode_mix`, `shisha.mode_diy`, `shisha.mode_molasses`

---

## REŽIM 1: Mix hotových tabáků

> Uživatel má doma hotové tabáky (Al Fakher, Adalya, Darkside...) a chce je smíchat do korunky.

### Krok 1: Velikost korunky
- **Typ prvku:** Toggle tlačítka + volitelný custom input
- **Možnosti:** `10g` | `15g` (default, active) | `20g` | `25g` | `Vlastní`
- **Custom:** Klik na "Vlastní" → objeví se input (min 5, max 50, default 15)
- **i18n:** `shisha.bowl_size_label` (nový), `form.custom` (existující)
- **Tooltip/hint:** "Kolik tabáku se vejde do vaší korunky" → `shisha.bowl_size_hint` (nový)

### Krok 2: Tabák 1 (povinný)
- **Typ prvku:** Autocomplete input + slider podílu
- **Autocomplete:** Hledá v DB `product_type='shisha'` — zobrazuje "Název (Značka)" např. "Two Apples (Al Fakher)"
  - Přepoužití existujícího `flavor-search-input` stylu + autocomplete logiky
  - `data-product-type="shisha"` — filtr pro autocomplete
  - Placeholder: "Hledat tabák (Al Fakher, Adalya...)" → `shisha.search_tobacco_placeholder` (nový)
- **Slider podíl:** Range 0-100%, step 5%, default 50%
  - Tlačítka ◀ (-5%) a ▶ (+5%)
  - Zobrazení: "50%"
  - Přepoužití existujícího `flavor-slider` stylu
- **Label:** "Tabák 1" → `shisha.tobacco_label` (nový) + číslo

### Krok 3: Tabák 2 (povinný)
- **Identický jako Tabák 1**, ale default 50%
- **Automatická normalizace:** Když změním Tabák 1 na 60%, Tabák 2 se automaticky nastaví na 40%
  - S více tabáky: změna jednoho proporcionálně upraví ostatní (součet = 100%)

### Krok 4: Přidat tabák 3-4 (Premium)
- **Typ prvku:** Tlačítko "+ Přidat další tabák"
- **Premium gate:** Stejný jako stávající "+ Přidat další příchuť" — badge "Více tabáků vyžaduje Premium"
- **Max:** 4 tabáky
- **i18n:** `shisha.add_tobacco` (nový), `shisha.tobacco_count_hint` (nový)

### Krok 5: Kontrola celkového podílu
- **Zobrazení:** "Celkem: 100%" (zelená) nebo "Celkem: 110%" (červená + varování)
- **Validace:** Součet musí být 100%. Pokud ne → varování + tlačítko MIXUJ neaktivní
- **i18n:** `shisha.total_tobacco` (nový), `shisha.tobacco_total_warning` (nový)

### Krok 6: MIXUJ!
- **Typ prvku:** Zlaté tlačítko (přepoužití `btn-gold`)
- **Klik:** `calculateShishaMix()` → výsledky
- **i18n:** `form.mix_button` (existující)

### Výsledky (režim 1):
- Tabulka: Název tabáku (Značka) | Podíl (%) | Gramy
- Celkem řádek: 100% | Xg
- **Doba zrání:** Shisha tabáky jsou hotové produkty → "Ihned připraveno ke kouření" (steep = 0)
  - Pokud jsou tabáky čerstvě otevřené: "Doporučujeme promíchat a nechat 30 min odpočinout"
- Poznámky k míchání:
  1. "Odměřte každý tabák zvlášť"
  2. "Smíchejte na čisté podložce"
  3. "Naplňte korunky a přikryjte alobalem/HMD"
- **Gramy jako primární jednotka** (ne ml — tabák se váží)

---

## REŽIM 2: DIY tabák od nuly

> Uživatel kupuje sušené tabákové listy a chce si připravit vlastní shisha tabák.

### Krok 1: Množství tabáku
- **Typ prvku:** Number input
- **Rozsah:** 50-1000g, default 250g
- **Jednotka:** g
- **i18n:** `shisha.tobacco_amount_label` (nový)
- **Hint:** "Sušené tabákové listy — namočte, odstraňte stonky, nakrájejte" → `shisha.tobacco_amount_hint` (nový)

### Krok 2: Poměr tabák:molasses
- **Typ prvku:** Toggle tlačítka + volitelný custom input
- **Možnosti:** `4:1` (suchý) | `3:1` (default, standard) | `2:1` (mokrý) | `1:1` (velmi mokrý) | `Vlastní`
- **Custom:** Klik na "Vlastní" → objeví se 2 inputy (tabák:X a molasses:Y, default 3:1)
- **Popis pod tlačítky:**
  - 4:1 → "Suchý, méně kouře"
  - 3:1 → "Standard — nejčastější poměr"
  - 2:1 → "Mokrý, více kouře"
  - 1:1 → "Velmi mokrý, maximální kouř"
- **Automatický výpočet:** Zobrazit "= Xg molasses" pod tlačítky
  - Např. při 250g tabáku a 3:1 → "= 83g molasses"
- **i18n:** `shisha.tobacco_molasses_ratio_label` (nový), `form.custom` (existující)

### Krok 3: Základ molasses (sladidlo)
- **Typ prvku:** Select + Slider
- **Select:** `Melasa` (default) | `Med` | `Agáve`
  - Přepoužití: `shisha.sweetener_molasses`, `shisha.sweetener_honey`, `shisha.sweetener_agave`
- **Slider:** Kolik % molasses tvoří sladidlo
  - Range 30-70%, step 5%, default 55%
  - Tlačítka ◀ ▶
  - Zobrazení: "55% z molasses"
- **i18n:** `shisha.sweetener_base_label` (nový)

### Krok 4: Glycerin (VG)
- **Typ prvku:** Slider
- **Rozsah:** 10-50%, step 5%, default 30%
- **Zobrazení:** "30% z molasses"
- **Hint:** "Glycerin = hustý kouř" → `shisha.glycerin_hint` (nový)
- **i18n:** `shisha.glycerin_label` (nový)

### Krok 5: Příchutě (volitelné, až 4 jako v Liquid PRO)
- **Typ prvku:** Autocomplete + slider + info panel (PŘEPOUŽITÍ z Liquid PRO)
- **Autocomplete:** Hledá `product_type='vape'` (FA, CAP, TPA, INW...)
  - Přepoužití existujícího autocomplete systému z Liquid PRO
  - `data-product-type="vape"` — filtr
  - Zobrazení: "Název (Značka)" např. "Apple (FA)"
- **Po výběru příchutě zobrazit:**
  - **Min %** (z DB `min_percent`) — červená hranice
  - **Optimal %** (z DB `recommended_percent`) — zelená, default hodnota slideru
  - **Max %** (z DB `max_percent`) — červená hranice
  - **Steep time** (z DB `steep_days`) — zobrazit "Doba zrání: X dní"
  - Přepoužití info panelu z Liquid PRO
- **Slider:** min_percent–max_percent z DB, step 0.5%, default = recommended_percent
  - Tlačítka ◀ ▶
  - Barevná škála: červená < min, zelená = optimal, červená > max
- **Příchuť 1:** free, **Příchutě 2-4:** Premium (přepoužití multi-flavor z Liquid PRO)
- **Tlačítko:** "+ Přidat příchuť" → max 4
- **Label:** "Příchuť (volitelné)" → `shisha.flavor_label` (existující)
- **i18n:** Přepoužití `form.flavor_min`, `form.flavor_max`, `form.flavor_optimal`, `form.steep_days`

### Krok 6: Nikotin (volitelný — přepoužití z liquid formuláře)
- **Typ prvku:** Select + Number input + Slider (IDENTICKÝ jako v liquid formuláři)
- **Select:** `Bez nikotinu` (default) | `Nikotin booster` | `Nikotinová sůl`
  - Přepoužití: `form.nicotine_none`, `form.nicotine_booster`, `form.nicotine_salt`
- **Síla báze:** Number input (3-200 mg/ml, default 20)
  - Přepoužití: `nicotineBaseStrength` input + validace
- **VG/PG poměr nikotinu:** Toggle 50/50 | 70/30
  - Přepoužití: `ratio-toggle-buttons`
- **Cílová síla:** Slider 0-45 mg/ml, default 0
  - Přepoužití: `targetNicotine` slider + `nicotineDescription` (popisky síly)
- **Chování:** Stejné jako v liquid — vyberu typ → zobrazí se síla báze → slider cílové síly
- **Přepoužití i18n:** `form.nicotine_base_label`, `form.nicotine_base_hint`, `form.target_nicotine_label`, všechny `form.nicotine_*`

### Krok 6b: Finální poměr VG/PG (přepoužití z liquid formuláře)
- **Typ prvku:** Toggle + Slider + auto-výpočet (IDENTICKÝ jako v liquid)
- **Typ báze:** `Separátní PG/VG` (default) | `Předmíchaná báze`
  - Přepoužití: `form.base_separate`, `form.base_premixed`
- **Předmíchaná báze →** Toggle: 50/50 | 60/40 | 70/30 | 80/20
  - Přepoužití: `premixed-ratio-btn` toggle tlačítka
- **Finální poměr slider:** VG/PG 0-100, přednastaveno dle báze
  - Přepoužití: `vgPgRatio` slider + `autoRecalculateLiquidVgPgRatio()` logika
- **Počítání min/max:** Stejná logika jako v liquid — zohledňuje VG/PG poměry nikotinu a příchutí
- **Přepoužití i18n:** `form.base_type_label`, `form.premixed_ratio`, `form.vg_pg_ratio_label`

### Krok 7: Validace a info
- **Automatický výpočet:** Zobrazit součet % (sladidlo + glycerin + příchuť)
  - Pokud > 100% → varování (červená)
  - Zbylé % = voda/ostatní
- **Info:** "Doporučená doba zrání: 2-4 týdny" → `shisha.diy_steep_info` (nový)
- **Steep time:** Automaticky vypočítat z vybraných vape příchutí (max steep_days ze všech příchutí + minimum 1 den pro tabák)

### Krok 8: MIXUJ!
- **Výsledky:** Tabulka s 2 sekcemi:
  1. **Tabák:** Xg (připravený, namočený, nakrájený)
  2. **Molasses mix:**
     - Melasa/Med/Agáve: Xg (Xml)
     - Glycerin (VG): Xg (Xml)
     - Příchuť 1 [název (značka)]: Xg (Xml)
     - Příchuť 2-4 [název (značka)]: Xg (Xml) (pokud přidány)
     - Nikotin [typ, síla]: Xml (pokud přidán)
       - ⚠️ **"Množství nikotinu je orientační a nezohledňuje nikotin obsažený v tabáku."** → `shisha.nicotine_disclaimer` (nový)
     - Molasses celkem: Xg
  3. **Finální poměr VG/PG:** X/Y (vypočtený ze všech složek)
  4. **SMĚS CELKEM:** Xg
  5. **Doba zrání:** X dní (max steep_days z příchutí + min 1 den)
- **Poznámky:**
  1. "Smíchejte melasu, glycerin a příchuť v oddělené nádobě"
  2. "Přidejte molasses mix k připravenému tabáku"
  3. "Důkladně promíchejte mokrýma rukama"
  4. "Uzavřete do vzduchotěsné nádoby"
  5. "Nechte zrát minimálně 24 hodin, ideálně 2-4 týdny"

---

## REŽIM 3: Molasses mix (báze pro tabák)

> Uživatel chce připravit jen tekutou složku. Přidá ji pak k tabáku sám.

### Krok 1: Celkové množství
- **Typ prvku:** Number input
- **Rozsah:** 50-500ml, default 100
- **Jednotka:** ml (nebo g — přepínač?)
- **i18n:** `shisha.molasses_amount_label` (nový)

### Krok 2: Základ (sladidlo)
- **Identický jako Režim 2 Krok 3**
- Select: Melasa | Med | Agáve
- Slider: 30-70%, default 55%

### Krok 3: Glycerin (VG)
- **Identický jako Režim 2 Krok 4**
- Slider: 10-50%, default 30%

### Krok 4: Příchutě (volitelné, až 4 jako v Liquid PRO)
- **Identický jako Režim 2 Krok 5**
- Autocomplete (vape) + slider s min/max/optimal z DB + steep time z DB
- Až 4 příchutě (1 free, 2-4 Premium)
- Info panel: min %, optimal %, max %, steep time — stejný jako v Liquid PRO

### Krok 5: Nikotin (volitelný)
- **Identický jako Režim 2 Krok 6**
- Select: Bez / Booster / Sůl → síla báze → VG/PG → cílová síla slider

### Krok 5b: Finální poměr VG/PG
- **Identický jako Režim 2 Krok 6b**
- Separátní / Předmíchaná báze → slider + auto-výpočet

### Krok 6: Voda (volitelné)
- **Přepoužití stávajícího** water slideru
- Slider: 0-10%, step 0.5%, default 0%
- **i18n:** `shisha.water_label` (existující), `shisha.water_hint` (existující)

### Krok 7: Validace
- Zobrazit součet %: sladidlo + glycerin + příchutě + nikotin + voda
- Pokud > 100% → varování
- Zbylé % → zobrazit jako "ostatní/vzduch"

### Krok 8: MIXUJ!
- **Výsledky:** Tabulka:
  - Melasa/Med: Xml (Xg)
  - Glycerin (VG): Xml (Xg)
  - Příchuť 1-4 [název (značka)]: Xml (Xg)
  - Nikotin [typ, síla]: Xml (Xg) (pokud přidán)
    - ⚠️ **"Množství nikotinu je orientační a nezohledňuje nikotin obsažený v tabáku."** → `shisha.nicotine_disclaimer`
  - Voda: Xml (Xg)
  - **Finální poměr VG/PG:** X/Y
  - **CELKEM:** Xml (Xg)
  - **Doba zrání:** X dní (max steep_days z příchutí)
- **Poznámka k použití:**
  - "Pro standardní vlhkost smíchejte s tabákem v poměru 3:1 (tabák:molasses)"
  - "Tento mix vystačí na cca Xg tabáku"

---

## Sdílené/přepoužité prvky (ze stávajícího formuláře)

| Prvek | Kde se přepoužije | Původní ID/styl |
|-------|--------------------|-----------------|
| Autocomplete input | Režim 1 (shisha), 2+3 (vape) | `flavor-search-input`, autocomplete logika |
| Flavor slider | Režim 2+3 (% příchutě) | `flavor-slider`, `sh-flavor-slider` |
| Flavor select (kategorie) | Režim 2+3 | `sh-flavor-select` s options |
| Sweetener select | Režim 2+3 | `shSweetenerSelect` |
| Water slider | Režim 3 | `shWaterPercent` |
| Add flavor button | Režim 2+3 | `shAddFlavorGroup` + premium badge |
| Mix button | Všechny | `btn-gold` + `calculateShishaMix()` |
| Back button | Všechny | `goBack()` |
| Toggle buttons styl | Přepínač režimu, korunky, poměr | `ratio-toggle-buttons` |
| i18n flavor názvy | Režim 2+3 (kategorie select) | `shisha.flavor_*` (všech 14) |
| i18n sweetener názvy | Režim 2+3 | `shisha.sweetener_*` |
| i18n water | Režim 3 | `shisha.water_label`, `water_hint` |
| Premium badge | Režim 1 (3-4 tabáky), 2+3 (multi-flavor) | `premium-badge` |

## Nové i18n klíče (nutno přidat do 31 jazyků)

| Klíč | CZ | EN |
|------|----|----|
| `shisha.mode_label` | Režim | Mode |
| `shisha.mode_mix` | Mix tabáků | Tobacco Mix |
| `shisha.mode_diy` | DIY tabák | DIY Tobacco |
| `shisha.mode_molasses` | Molasses mix | Molasses Mix |
| `shisha.bowl_size_label` | Velikost korunky | Bowl Size |
| `shisha.bowl_size_hint` | Kolik tabáku se vejde do vaší korunky | How much tobacco fits in your bowl |
| `shisha.tobacco_label` | Tabák | Tobacco |
| `shisha.search_tobacco_placeholder` | Hledat tabák... | Search tobacco... |
| `shisha.add_tobacco` | + Přidat další tabák | + Add another tobacco |
| `shisha.tobacco_count_hint` | (max 4 tabáky) | (max 4 tobaccos) |
| `shisha.total_tobacco` | Celkem: | Total: |
| `shisha.tobacco_total_warning` | (musí být 100%) | (must be 100%) |
| `shisha.tobacco_amount_label` | Množství tabáku (g) | Tobacco Amount (g) |
| `shisha.tobacco_amount_hint` | Sušené listy — namočte, odstraňte stonky, nakrájejte | Dried leaves — soak, remove stems, chop |
| `shisha.tobacco_molasses_ratio_label` | Poměr tabák:molasses | Tobacco:Molasses Ratio |
| `shisha.sweetener_base_label` | Základ molasses | Molasses Base |
| `shisha.glycerin_label` | Glycerin (VG) | Glycerin (VG) |
| `shisha.glycerin_hint` | Glycerin = hustý kouř | Glycerin = thick smoke |
| `shisha.molasses_amount_label` | Množství molasses | Molasses Amount |
| `shisha.diy_steep_info` | Doba zrání: min. 1 den, ideálně 2-4 týdny | Steep time: min. 1 day, ideally 2-4 weeks |
| `shisha.molasses_usage_note` | Pro standardní vlhkost smíchejte s tabákem v poměru 3:1 | For standard moisture, mix with tobacco at 3:1 ratio |
| `shisha.nicotine_disclaimer` | Množství nikotinu je orientační a nezohledňuje nikotin obsažený v tabáku. | Nicotine amount is approximate and does not account for nicotine in the tobacco. |
| `shisha.ready_immediately` | Ihned připraveno ke kouření | Ready to smoke immediately |
| `shisha.rest_tip` | Doporučujeme promíchat a nechat 30 min odpočinout | We recommend mixing and letting it rest for 30 min |

## Steep time logika (podle režimu)

| Režim | Steep time zdroj | Logika |
|-------|-----------------|--------|
| Mix tabáků (1) | Žádný (hotové produkty) | Zobrazit "Ihned připraveno" + tip "30 min odpočinek" |
| DIY tabák (2) | `steep_days` z vape příchutí v DB | max(steep_days všech příchutí) + min 1 den pro nasáknutí tabáku |
| Molasses mix (3) | `steep_days` z vape příchutí v DB | max(steep_days všech příchutí), bez příchutí = 0 |

## Rozlišení typů příchutí (podle režimu)

| Režim | Typ produktu v DB | Co se vyhledává |
|-------|-------------------|----------------|
| Mix tabáků (1) | `product_type='shisha'` | Hotové shisha tabáky (Al Fakher, Adalya, Darkside...) |
| DIY tabák (2) | `product_type='vape'` | Vape koncentráty (FA, CAP, TPA, INW...) s min/max/optimal |
| Molasses mix (3) | `product_type='vape'` | Vape koncentráty (FA, CAP, TPA, INW...) s min/max/optimal |

**Celkem ~25 nových klíčů** vs ~65 existujících přepoužitých (včetně nikotinových).
