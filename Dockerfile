FROM node:14.7.0-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN  npm run build

FROM node:14.19.0-slim

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/src/app/.env ./.env

CMD [ "node", "./dist/index.js"]