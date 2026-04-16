# Konyvkocka - Branch dokumentacio: release/v0.3-snapshot

## Attekintes

Harmadik snapshot, amely a release-folyamatot, build-kornyezetet es stabilitast erosito valtozasokat tartalmaz.

## Programtipus

Frontend snapshot branch tovabbfejlesztett build- es release-folyamattal.

## Fo fajlok es mappak leirasa

- .github: CI/CD es workflow konfiguraciok a GitHub alapu automatizalasokhoz.
- .gitignore: Verzokezelesbol kizart fajlok es mappak szabalyai.
- README.md: Branch-szintu attekinto dokumentacio.
- konyvkocka: Onallo frontend projektmappa (Vite, TypeScript, public/src szerkezet).

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- afe001c (2026-02-25): Merge pull request #17 from BordasDaniel/develop - c07a850 (2026-02-25): CI: npm helyett bun haszn├ílata a buildhez - 96f39e2 (2026-02-25): Merge pull request #16 from BordasDaniel/develop - 3cf0469 (2026-02-25): Revert "gitignore update" - e921e7c (2026-02-25): Revert "Delete .github directory"

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
