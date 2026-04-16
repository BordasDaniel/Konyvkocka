# Konyvkocka - Branch dokumentacio: release/v0.2-snapshot

## Attekintes

Masodik snapshot, ahol mar Vite-alapu strukturalt frontend projektben tortenik a funkcionalitas epites es tesztelese.

## Programtipus

Frontend snapshot branch, modulrendszeresitett Vite projekttel.

## Fo fajlok es mappak leirasa

- .github: CI/CD es workflow konfiguraciok a GitHub alapu automatizalasokhoz.
- README.md: Branch-szintu attekinto dokumentacio.
- konyvkocka: Onallo frontend projektmappa (Vite, TypeScript, public/src szerkezet).

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- 006e5b4 (2026-01-07): Merge pull request #11 from BordasDaniel/releases - 7d40ace (2026-01-07): - Olvas├ís oldalr├│l a vissza gomb fix├ílva. - Oldal v├ílt├ískor a kurzor felugrik a tetej├ęre fix├ílva. - bd04575 (2026-01-01): Merge pull request #8 from BordasDaniel/releases - 770b08a (2026-01-01): pdf hotfix - a55505a (2026-01-01): - Captcha bug fix├ílva - Page navigaton fix├ílva a githez - El├şr├ís fix├ílva

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
