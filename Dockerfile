FROM node:24-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev


FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]