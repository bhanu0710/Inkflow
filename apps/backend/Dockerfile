FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN npm install --workspace @inkflow/backend

FROM dependencies AS build

COPY tsconfig.base.json ./
COPY apps/backend apps/backend

RUN npm run prisma:generate --workspace @inkflow/backend
RUN npm run build --workspace @inkflow/backend

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm install --omit=dev --workspace @inkflow/backend && npm cache clean --force

COPY --from=build --chown=node:node /app/apps/backend/dist apps/backend/dist
COPY --from=build --chown=node:node /app/apps/backend/prisma apps/backend/prisma
COPY --from=build --chown=node:node /app/node_modules/.prisma node_modules/.prisma
COPY --from=build --chown=node:node /app/node_modules/@prisma/client node_modules/@prisma/client

USER node

CMD ["npm", "run", "start", "--workspace", "@inkflow/backend"]
