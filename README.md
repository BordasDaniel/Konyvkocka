# Konyvkocka - Branch dokumentacio: Tests

## Attekintes

Onallo tesztkornyezet branch, amely tobb tesztszintet fog ossze: unit, in-memory integracios es Selenium alapu vegponti teszteket.

## Programtipus

Dedikalt teszt branch (InMemory, React unit tesztek, Selenium E2E).

## Fo fajlok es mappak leirasa

- .gitignore: Verzokezelesbol kizart fajlok es mappak szabalyai.
- InMemory: In-memory tesztprojektek es backend-validacios tesztfuttatasok.
- README.md: Branch-szintu attekinto dokumentacio.
- react: React komponens- es viselkedes-tesztek (Jest), tesztkonfiguracioval es tesztartefaktumokkal.
- selenium: Vegponti (E2E) automatizalt tesztek Selenium alapon.

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- c0ce281 (2026-04-09): Selenium / Jest / InMemory tesztek - d41a5cc (2025-11-01): Update README for versioning and branch descriptions - e0ce37d (2025-11-01): Delete CNAME - a35671d (2025-10-30): Update CNAME - 88cf9bf (2025-10-30): Update CNAME

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
