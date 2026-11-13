# infrastructure/docker/backend/Dockerfile
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate
RUN apt-get update && apt-get install -y openssl

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app

# Копируем файлы конфигурации воркспейса
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/api-client/package.json ./packages/api-client/

# Устанавливаем зависимости
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Копируем исходники
COPY . .

# Генерируем Prisma Client (важно для Prisma 7)
RUN pnpm exec prisma generate

# Собираем NestJS
RUN pnpm --filter backend build

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Установка зависимостей для Puppeteer (генерация PDF)
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Копируем сгенерированный Prisma Client и билд
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/prisma ./prisma

WORKDIR /app/apps/backend
EXPOSE 3000

# Запускаем миграции и стартуем
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
