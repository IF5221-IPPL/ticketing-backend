# Dockerfile
FROM node:alpine

# create destination directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install package for better caching strategy
ADD package.json yarn.lock ./

RUN apk add --no-cache \
  mysql-client \
  tzdata \
  build-base \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  chromium

RUN apk add git
RUN apk add python3

# copy the app, note .dockerignore
COPY . .
RUN yarn install
RUN yarn build
RUN git clone https://github.com/vishnubob/wait-for-it.git

RUN apk update && apk add --no-cache bash

RUN cp -R /usr/src/app/src/Public /usr/src/app/dist/src/public

EXPOSE 5000

# RUN yarn add -g sequelize-cli
# RUN yarn sequelize-cli db:migrate --name 20230410130939-implementing_gmaps_api
# RUN yarn sequelize db:migrate --name 20230519140856-make_item_name_unique.js

CMD ["yarn", "start"]