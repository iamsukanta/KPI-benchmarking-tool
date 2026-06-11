FROM nginx
RUN apt-get update && apt-get install -y openssl

COPY ./nginx/test/app.conf /etc/nginx/conf.d/default.conf
