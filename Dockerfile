# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /src/Frontend/konyvkocka

COPY Frontend/konyvkocka/package*.json ./
RUN npm install --no-package-lock

COPY Frontend/konyvkocka/ ./

# Build-time values for Vite; defaults are Render-friendly.
ARG VITE_API_BASE_URL=
ARG VITE_RECAPTCHA_SITE_KEY=6LcgfKssAAAAAKMyEc84VvRt_75CYrWNtdlBKTvH
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

COPY Backend/KonyvkockaAPI/KonyvkockaAPI.csproj Backend/KonyvkockaAPI/
RUN dotnet restore Backend/KonyvkockaAPI/KonyvkockaAPI.csproj

COPY Backend/KonyvkockaAPI/ Backend/KonyvkockaAPI/
RUN dotnet publish Backend/KonyvkockaAPI/KonyvkockaAPI.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/Frontend/konyvkocka/dist ./wwwroot

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet KonyvkockaAPI.dll --urls http://0.0.0.0:${PORT:-10000}"]
