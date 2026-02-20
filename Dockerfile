

# Folosim imaginea oficială Bun pe bază de Alpine pentru dimensiune minimă
FROM oven/bun:1.1-alpine

# Setăm directorul de lucru
WORKDIR /usr/src/app

# Instalăm dependențele de sistem necesare pentru runtime-uri moderne (opțional, dar recomandat)
RUN apk add --no-cache libc6-compat

# Copiem fișierele de dependințe pentru a profita de cache-ul Docker
COPY package.json bun.lockb* ./

# Instalăm dependențele folosind Bun
RUN bun install --frozen-lockfile

# Copiem restul codului sursă
COPY . .

# Expunem portul aplicației
EXPOSE 3000

# Setăm variabila de mediu pentru dezvoltare
ENV NODE_ENV=development

# Pornim aplicația
CMD ["bun", "run", "dev"]