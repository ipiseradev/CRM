# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=apps/api --workspace=packages/shared --include-workspace-root

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules/

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY package.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built files
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist/
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/migrations ./migrations/
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules/
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./package.json

# Copy shared package dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/dist ./node_modules/@salescore/shared/dist/
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/package.json ./node_modules/@salescore/shared/package.json

USER apiuser

EXPOSE 4000

CMD ["node", "dist/index.js"]
