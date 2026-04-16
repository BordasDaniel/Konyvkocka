# Konyvkocka - Branch dokumentacio: release/v0.4-snapshot

## Attekintes

Negyedik snapshot, hangsullyal a feluleti finomhangolason, keresesi/paginacios javitasokon es reszponziv viselkedesen.

## Programtipus

Frontend snapshot branch kiforrottabb UI/UX es stabilizacios javitasokkal.

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

- 7a15bab (2026-03-14): Merge pull request #19 from BordasDaniel/develop - 7047380 (2026-03-14): hotfix - d317c0c (2026-03-14): Merge pull request #18 from BordasDaniel/develop - 48f1f91 (2026-03-14): - Burger fix - Pagination mindenhol - Apr├│bb sz├şn fixek - Anim├íci├│ fixek - Keres├ęs fix - Tablet reszponzivit├ís fix (t├Âbbnyire) - Egy├ęb fixek - 4769d9e (2026-03-14): Keres├ęs oldal kib┼Ĺv├ştve t├Âbb k├írty├íval az oldal v├ílt├íst szimul├ílva ezzel api-al

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
