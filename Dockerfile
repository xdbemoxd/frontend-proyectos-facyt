# ============================================================================
# Dockerfile — frontend Next.js 16
#
# Build desde la raiz de este repositorio:
#   docker build -t proyectos-facyt-frontend .
#
# Con docker-compose (backend/):
#   context: ../frontend-proyectos-facyt
#
# Variables de build:
#   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN  (opcional, se incrusta en el bundle)
#
# Variables de runtime (NO se hornean en la imagen):
#   BACKEND_URL, AUTH_SECRET, NEXTAUTH_SECRET, AUTH_URL, NEXTAUTH_URL,
#   AUTH_TRUST_HOST, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# ============================================================================

# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=""
ENV NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=$NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN

RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1

CMD ["npm", "run", "start"]
