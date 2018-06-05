FROM nginx:stable-alpine
# FROM node:8.4.0-alpine

ENV API_PORT=3001

ENV API_HOST=api

COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

RUN apk add --no-cache su-exec

RUN mkdir -p /fonio

ADD . /fonio

CMD /bin/sh -c "envsubst < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"