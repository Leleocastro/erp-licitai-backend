FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini
EXPOSE 3000

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS development
COPY package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .
CMD ["npm", "run", "start:dev"]

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

FROM base AS production
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
