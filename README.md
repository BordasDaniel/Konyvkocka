# KÖNYVKOCKA — Tests

## Röviden erről az ágról

A Tests branch dedikáltan az automatizált tesztelést gyűjti össze.

A cél a működés gyors visszaellenőrzése unit, integrációs és E2E szinteken.

## Mit találsz ebben a branchben?

- .gitignore: verziókezelésből kizárt fájlok és mappák.
- InMemory: memóriaalapú backend tesztek a gyors és izolált ellenőrzéshez.
- README.md: branch-szintű áttekintő dokumentáció.
- react: frontend komponens- és viselkedéstesztek (Jest).
- selenium: végponti (E2E) automatizált tesztek böngészőben.

## Kiemelt erősségek

- Átlátható struktúra az adott célterülethez igazítva.
- Könnyű tájékozódás és gyors belépési pont a projektbe.
- A branch funkciója egyértelműen felismerhető a tartalomból.

## Hogyan értelmezd ezt a tartalmat?

- A branch felépítése moduláris: külön rétegben jelenik meg a kliens, a szerver és az adatkezelés.
- A mappastruktúra tudatosan átlátható, így gyorsan megtalálhatók a kulcsfontosságú részek.
- A tartalom a branch nevéhez igazodik, ezért könnyen követhető, hogy ez az ág milyen szerepet tölt be a teljes projektben.

## Kinek ajánlott ez az ág?

- QA és fejlesztő csapatoknak, akik reprodukálható ellenőrzést várnak.
- Hibajavítás előtt/után validáló futtatásokhoz.

## Miért érdemes ezt megnézni?

- Jól látható rajta a KÖNYVKOCKA projekt fókusza és működési logikája.
- Gyors belépési pontot ad az adott funkcionális területhez.
- Segít abban, hogy pár perc alatt tudd, hol keresd a számodra fontos részeket.
