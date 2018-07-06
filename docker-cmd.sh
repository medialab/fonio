# Templating the bundle file
sed "s;@@URL_PREFIX@@;${URL_PREFIX};" /fonio/build/bundle.js.template > /fonio/build/bundle.js

# Templating the HTML index
envsubst < /fonio/index.prod.html.template > /fonio/index.html

# Templating the NGINX conf
envsubst '\$HOST \$PORT' < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf

# No daemon
nginx -g 'daemon off;'
