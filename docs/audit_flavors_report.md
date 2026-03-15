# Flavor Percentage Audit Report
**Datum:** 2026-03-16

## Celkový stav DB
- **Celkem aktivních příchutí:** 5092
- **S ověřenými daty:** 3440 (68%)
- **Bez dat (NULL):** 1652 (32%) — menší/lokální výrobci bez dostupných zdrojů

## Ověření výrobců (seřazeno podle počtu)

### Batch 1-8 (dříve)
| Výrobce | Počet | Zdroje | Status |
|---------|-------|--------|--------|
| TPA | 259 | VU CurlyxCracker standalone list | ✅ individuální |
| FW | 216 | ELR individuální + FW blanket 15-20% | ✅ mix |
| CAP | 287 | SD SFT 2022-23, DVR 2024, ELR | ✅ 113 PATCH + 15 INSERT |
| INW | 239 | SD SFT 2025 (12/12 potvrzeno) | ✅ blanket 1.5/4/2.5 OK |
| FLV | 217 | Flavorah official "start low 0.5-3%" | ✅ |
| FA | 211 | FA official 3-5%, SD SFT | ✅ |
| IMP | 68 | batch1 | ✅ |
| TJC | 10 | batch1 | ✅ |
| CSC | 33 | batch1 | ✅ |

### Batch 9 (WF + SSA)
| Výrobce | Počet | Zdroje | Akce |
|---------|-------|--------|------|
| WF | 393 | WF official (Frank) "SC 1-4%", SD SFT 3-3.5% full, Leilani SFT 1-4% | 23 INSERT |
| SSA | 137 | SD SFT 0.75-2% (6 sérií), Nom Nomz UK individ % | 8 INSERT + 1 PATCH (Ice Cream) |

### Batch 10 (menší výrobci)
| Výrobce | Počet | Zdroje | Status |
|---------|-------|--------|--------|
| RF | 123 | Reddit "SC 1-3%, regular 6-12%, VG 8-15%", SD SFT SC 2.5% | ✅ 3 linie OK |
| SOL | 113 | Calumette/Juicedoctor "Dosage 10-15%" | ✅ blanket 10/15/12 |
| TFA | 74 | = TPA duplicit, 51 cross-fix z TPA dat | ✅ 51 FIX |
| BGM | 68 | Reddit/ELR one-shot "8-15%" | ✅ blanket 8/15/10 |
| OOO | 65 | SD SFT 5-7%, ECF "5-15%", oooflavors.com | ✅ variabilní |
| ALQ | 165 | ELR "4-7%" | ✅ variabilní |
| GF | 67 | German Flavours, 31 NULL → blanket 3/7/5 | ✅ 31 PATCH |

## Celkový souhrn akcí
- **PATCH:** 113 CAP + 1 SSA + 31 GF + 51 TFA = **196 oprav**
- **INSERT:** 15 CAP + 23 WF + 8 SSA = **46 nových příchutí**
- **Verifikace:** Všechny batch skripty obsahují verifikační kroky

## NULL příchutě (1652)
Menší/lokální výrobci bez dostupných komunitních zdrojů (SD SFT, ELR, Reddit):
AZG(53), SRB(50), AFZ(50), MAZ(45), TRI(43), ALF(42), AWH(40), HAZ(40), DRK(39), STB(39), HOL(37), ADA(35), ELM(34), LA(33), TAN(31), SSM(31), FUM(30), ZOM(30), ZMO(30), NAK(30), NTJ(29), HS(28), LIQ(27), UGH(27), VL(26), TW(25), DB(22), ...

**Důvod ponechání NULL:** Žádné ověřené zdroje. Pravidlo: "neodhaduj, použij jen ověřená data."

## Použité zdroje
1. **SessionDrummer SFT** (ELR forum) — CAP, INW, WF, SSA, RF, OOO
2. **Výrobce official** — FA (3-5%), WF (1-4%), FLV (0.5-3%), SOL (10-15%)
3. **diy-vape-recipes.com** (2024 mix averages) — CAP
4. **VU CurlyxCracker standalone list** — TPA
5. **ELR tasting notes/community** — FW, ALQ, BGM
6. **Reddit r/DIY_eJuice** — RF (SC/VG/regular), BGM
7. **Nom Nomz UK eshop** — SSA individuální %
8. **Calumette/Juicedoctor eshopy** — SOL
9. **ECF community** — OOO

## Skripty
- `docs/apply_verified_batch8_cap.js` — CAP 113 PATCH + 15 INSERT
- `docs/apply_verified_batch9_wf_ssa.js` — WF 23 INSERT + SSA 8 INSERT
- `docs/apply_verified_batch10_misc.js` — GF 31 PATCH + TFA 51 cross-fix
