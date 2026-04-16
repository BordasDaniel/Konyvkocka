# Konyvkocka - Branch dokumentacio: releases

## Attekintes

A kiadasra jelolt valtozatok osszefesulesi pontja. Minosegbiztositasi attekinteshez es release-elokesziteshez hasznalt branch.

## Programtipus

Release osszeallito full-stack branch, amely a stabil kiadas elotti allapotot fogja ossze.

## Fo fajlok es mappak leirasa

- .dockerignore: A kontener buildbol kizart fajlok listaja.
- .gitignore: Verzokezelesbol kizart fajlok es mappak szabalyai.
- Backend: ASP.NET Core API projekt, REST vegpontokkal, szolgaltatasokkal, DTO-kal es adateleressel.
- Database: SQL scriptgyujtemeny, adatmodell-leirasok es adatbazis-segedanyagok.
- Dockerfile: Kontener build-definicio a futtathato alkalmazaskep eloallitasahoz.
- Frontend: React/Vite alapokon epulo kliensalkalmazas, felhasznaloi felulettel es oldalnavigacioval.
- docker-compose.yml: Osszehangolt helyi futtatas tobb szolgaltatassal (app + adatbazis).
- render.yaml: Render platformhoz szolo deploy konfiguracio.

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- 03cb576 (2026-04-14): Merge branch 'develop' into releases - d487416 (2026-04-14): rebase - e668b76 (2026-04-14): - WPF t├Ârl├ęse (el┼Ĺtte a wpf brancbe ├ítker├╝lt) - Tiszt├şt├ísok - cae72a4 (2026-04-14): Merge branch 'kliensWPF' into develop - 275a925 (2026-04-14): rebase

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
