FROM nginx:1.13-alpine

ENV NODE_ENV production

ENV QUINOA_HOST quinoa
ENV QUINOA_PORT 3001
ENV MAX_SECTION_LEVEL 2
ENV MAX_RESOURCE_SIZE 4000000
ENV MAX_FOLDER_SIZE 50000000
ENV MAX_STORY_SIZE 60000000
ENV MAX_BATCH_NUMBER 50
ENV REQUIRE_PUBLICATION_CONSENT false
ENV URL_PREFIX http://localhost:3000
ENV API_URL ${URL_PREFIX}/quinoa

ADD . /fonio
WORKDIR /fonio

RUN apk add --no-cache --virtual .build-deps git nodejs=8.9.3-r1 build-base python \
    && npm install --quiet --production false --no-audit \
    && npm run build:docker \
    && mv ./build/bundle.js ./build/bundle.js.template \
    && apk del .build-deps \
    && rm -rf ./node_modules /root/.npm /root/.node-gyp /root/.config /usr/lib/node_modules

RUN rm /etc/nginx/conf.d/default.conf
COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

CMD /bin/sh docker-cmd.sh
