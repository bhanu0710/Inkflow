FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package.json apps/frontend/package.json

RUN npm install --workspace @inkflow/frontend

FROM dependencies AS build

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY tsconfig.base.json ./
COPY apps/frontend apps/frontend

RUN npm run build --workspace @inkflow/frontend

FROM nginx:1.27.5-alpine AS runtime

RUN apk update && apk upgrade --no-cache

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
