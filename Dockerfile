FROM nginx:stable-alpine

ARG SERVER_URL="http://localhost:3001"
ARG YOUTUBE_API_KEY=""
ARG SESSION_NAME="Session Name"
ARG URL_PREFIX=""

ARG PORT=3000
ARG HOST=localhost

ENV NODE_ENV production

ENV SERVER_URL=${SERVER_URL}
ENV YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
ENV SESSION_NAME=${SESSION_NAME}
ENV URL_PREFIX=${URL_PREFIX}

ENV PORT=${PORT}
ENV HOST=${HOST}

RUN apk update
RUN apk upgrade
RUN apk add --no-cache --virtual .build-deps git nodejs>8 build-base python

RUN mkdir -p /fonio/

ADD . /fonio
WORKDIR /fonio
RUN npm install --quiet --production false
RUN npm run build

RUN apk del .build-deps
RUN rm -rf node_modules

RUN rm /etc/nginx/conf.d/default.conf
COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

CMD /bin/sh -c "envsubst < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
