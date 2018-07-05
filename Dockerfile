FROM nginx:stable-alpine

ENV NODE_ENV production

ADD . /fonio
WORKDIR /fonio

RUN apk add --no-cache --virtual .build-deps git nodejs=8.9.3-r1 build-base python \
    && npm install --quiet --production false \
    && npm run build:docker \
    && mv ./build/bundle.js ./build/bundle.js.template \
    && apk del .build-deps \
    && rm -rf ./node_modules /root/.npm /root/.node-gyp /root/.config /usr/lib/node_modules

RUN rm /etc/nginx/conf.d/default.conf
COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

CMD /bin/sh docker-cmd.sh
