# Templating the bundle file
sed "s;@@URL_PREFIX@@;${URL_PREFIX};" /fonio/build/bundle.js.template > /fonio/build/bundle.js

# Templating the HTML index
envsubst < /fonio/index.prod.html.template > /fonio/index.html

# Templating the NGINX conf
export NS=$(awk '/^nameserver/{print $2}' /etc/resolv.conf)
envsubst '\$NS \$QUINOA_HOST \$QUINOA_PORT \$MAX_STORY_SIZE' < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf

# No daemon
nginx -g 'daemon off;'
