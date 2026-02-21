#!/bin/sh
set -e

echo "Waiting for database..."
until python manage.py migrate --noinput; do
  echo "Database unavailable, retrying in 2s..."
  sleep 2
done

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000