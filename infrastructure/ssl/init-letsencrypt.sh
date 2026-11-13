#!/bin/bash

# ЗАМЕНИ эти значения:
domains=(your-domain.com)
email="your-email@example.com" # Ваш email для уведомлений от Let's Encrypt
rsa_key_size=4096
data_path="../docker" # Путь к папке docker-compose

if ! [ -x "$(command -v docker compose)" ]; then
  echo 'Ошибка: docker compose не установлен.' >&2
  exit 1
fi

echo "### Создание директорий..."
mkdir -p ./certs ./www

echo "### Скачивание рекомендуемых параметров TLS..."
if [ ! -e ./certs/options-ssl-nginx.conf ]; then
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certs/options-ssl-nginx.conf
fi
if [ ! -e ./certs/ssl-dhparams.pem ]; then
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certs/ssl-dhparams.pem
fi

echo "### Создание временного сертификата..."
# Создаем пустышку, чтобы Nginx запустился
docker compose -f $data_path/docker-compose.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1\
    -keyout '/etc/nginx/certs/live/your-domain.com/privkey.pem' \
    -out '/etc/nginx/certs/live/your-domain.com/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Запуск Nginx..."
docker compose -f $data_path/docker-compose.yml up --force-recreate -d frontend

echo "### Удаление временного сертификата..."
docker compose -f $data_path/docker-compose.yml run --rm --entrypoint "\
  rm -Rf /etc/nginx/certs/live/your-domain.com \
  && rm -Rf /etc/nginx/certs/archive/your-domain.com \
  && rm -Rf /etc/nginx/certs/renewal/your-domain.com" certbot

echo "### Запрос реального сертификата Let's Encrypt..."
docker compose -f $data_path/docker-compose.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $email \
    -d $domains \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

echo "### Перезагрузка Nginx..."
docker compose -f $data_path/docker-compose.yml exec frontend nginx -s reload
