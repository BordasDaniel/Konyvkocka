# 🌱 Develop Branch

Ez a branch az **aktív fejlesztés** helye.  
Ide kerülnek be a különböző `feature/...` branchek merge-jei, miután egy funkció elkészült és működik.

## 🔧 Szabályok
- Ne commitolj közvetlenül ide!
- Minden új funkcióhoz hozz létre **külön feature branchet ebből a branchből**, pl.: feature/login-page feature/payment-api
(A weboldalon lépj be a develop branchbe és ahol írja, hogy hány branch van és tag azon a soron ott írja, hogy develop. Kattints rá és kezdj el beírni egy nevet pl.: feature/pay-html majd alul kattints a `create branch ... from develop` gombra.
Ilyenkor az egész developot átmásolja neked és abba az új branchba és eltudsz kezdeni dolgozni az adott funkción... 
- Ha kész a funkció, csinálj **pull requestet ide (feature → develop)**.
- Itt még lehetnek hibák, ez a fejlesztés közbeni verzió.

## 🧠 Cél
A `develop` branch tartalmazza az **összes legújabb, de még nem kiadott** fejlesztést.
Amikor stabil, akkor ebből lesz a `releases` verzió.
