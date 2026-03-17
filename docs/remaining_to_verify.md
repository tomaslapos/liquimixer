# Příchutě zbývající k ověření
# Datum: 2026-03-15

## CO JE HOTOVO (nahrány do Supabase):
- 814(18), BGM(68), BM(25), DV(10), KB(11), SLN(8), WF(370), SSA(129), MF(44), LB(49), JF(43), PUR(43) = 818 příchutí ✅
- TJC(10) → opraveno na 20%, IMP(68) → opraveno dle kategorií
- 7A(5), ATM(22), HS(12), GF(36), DEK(8), NV(21), SOL(110), LA(9), TW(4) → NULL
- CAP 127 příchutí s rec=6 → NULL
- CAP 129 příchutí s rec<6 → seedované, ALE mohou být přepsané (viz FA problém)

## CELKEM ROZHODNUTO: ~1379 příchutí
## ZBÝVÁ OVĚŘIT: ~1948 příchutí (22 výrobců)

---

## PRIORITA 1 — Velcí výrobci s individuálními daty (1380 příchutí)
Mají seedovaná data, ale zjistili jsme že seed hodnoty mohly být přepsány.
Musíme ověřit zda aktuální DB hodnoty odpovídají zdrojům.

- **CAP (129)** — seedované s rec<6, ale seed_production dal jiné hodnoty než co je v DB
- **TPA (258)** — mix seedovaných a generických
- **FA (199)** — seed_production dal správné hodnoty ale v DB jsou jiné (Meringue 1.5→4)
- **FLV (212)** — SessionDrummer testuje na 0.5-2%
- **FW (216)** — nemá SessionDrummer thread
- **INW (239)** — SessionDrummer thread 2025

## PRIORITA 2 — Střední výrobci (568 příchutí)
- **ALQ (155)** — aromes-et-liquides.fr má individuální % na produktových stránkách
- **RF (123)** — VG 8-12% vs SC 1-2.5%, nutné rozlišit typ
- **TFA (74)** — možný duplikát TPA?
- **OOO (64)** — SessionDrummer thread existuje
- **VDLV (52)** — blanket 15% ale seed data 5-12
- **VV (52)** — Vampire Vape
- **MLB (46)** — SessionDrummer thread (Molinberry)
- **VTA (41)**
- **CF (40)**
- **DEL (37)** — SessionDrummer thread existuje
- **REV (35)**
- **CSC (33)** — SessionDrummer thread existuje
- **HQ (25)**

## PRIORITA 3 — Malí výrobci (47 příchutí)
- **CHF (15)** — Chefs Flavours
- **JJC (15)**
- **DH (12)** — Dinner Lady
- **ET (5)**
