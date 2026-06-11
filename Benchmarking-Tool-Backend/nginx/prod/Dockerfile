FROM nginx
RUN apt-get update && apt-get install -y openssl

COPY ./nginx/prod/app.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
