FROM nginx:stable-alpine

# Warning: Don't publish Docker image builded with private token
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

ADD . /fonio
WORKDIR /fonio

RUN apk add --no-cache --virtual .build-deps git nodejs=8.9.3-r1 build-base python \
    && npm install --quiet --production false \
    && npm run build \
    && apk del .build-deps \
    && rm -rf ./node_modules /root/.npm /root/.node-gyp /root/.config /usr/lib/node_modules 

RUN rm /etc/nginx/conf.d/default.conf
COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

CMD /bin/sh -c "envsubst < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
