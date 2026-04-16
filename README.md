# Konyvkocka - Branch dokumentacio: develop

## Attekintes

A napi fejlesztes kozponti agya. Uj funkciok, bugfixek es integracios valtozasok itt ernek ossze release elott.

## Programtipus

Aktiv fejlesztoi full-stack branch, integralt backend, frontend es adatbazis komponensekkel.

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

- 39c1def (2026-04-15): - Badge fix - 8b2c91a (2026-04-15): - Report elt├ívol├ştva saj├ít magadr├│l - Teljes├ştett gomb elv├ętele - f41e6b8 (2026-04-15): - Typo - Gitignore fix - 1459c28 (2026-04-15): Merge pull request #35 from BordasDaniel/main - 177caba (2026-04-15): H├ítha...

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
