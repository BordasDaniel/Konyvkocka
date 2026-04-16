# Konyvkocka - Branch dokumentacio: frontend

## Attekintes

A kliensoldali fejlesztesek validalasara hasznalt branch, ahol a felulet, navigacio es felhasznaloi folyamatok allnak a kozeppontban.

## Programtipus

Frontend-fokuszu monorepo branch, ahol a kliensoldali mukodes hangsulyos.

## Fo fajlok es mappak leirasa

- .github: CI/CD es workflow konfiguraciok a GitHub alapu automatizalasokhoz.
- .gitignore: Verzokezelesbol kizart fajlok es mappak szabalyai.
- Backend: ASP.NET Core API projekt, REST vegpontokkal, szolgaltatasokkal, DTO-kal es adateleressel.
- Database: SQL scriptgyujtemeny, adatmodell-leirasok es adatbazis-segedanyagok.
- Frontend: React/Vite alapokon epulo kliensalkalmazas, felhasznaloi felulettel es oldalnavigacioval.

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- 876c9ff (2026-04-08): Merge pull request #28 from BordasDaniel/backend - c6a9635 (2026-04-08): Adatb├ízis V1.1 - 025b6b3 (2026-04-08): Jelsz├│ vissza├íll├şt├ís - 8b4094d (2026-04-08): ├Üjrakezd├ęs gomb.. - 1308071 (2026-04-08): - Olvas├ís v├ędelem

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
