FROM mariadb:10.11

# The SQL dump is executed only on first container start (empty data dir).
COPY Database/konyvkocka_vegleges.sql /docker-entrypoint-initdb.d/001_konyvkocka.sql
