#!/bin/bash
# infrastructure/backup/pg_backup.sh

# Настройки (соответствуют вашему docker-compose.yml)
CONTAINER_NAME="ai-smeta-db"
DB_USER="postgres"
DB_NAME="ai_smeta"
BACKUP_DIR="$(dirname "$0")/backups"
RETENTION_DAYS=7 # Хранить бэкапы за последние 7 дней

# Создаем папку для бэкапов, если ее нет
mkdir -p "$BACKUP_DIR"

# Формат имени файла: backup_2023-10-27_03-00-00.dump
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.dump"

echo "🔄 Начинаю бэкап базы $DB_NAME..."

# Выполняем pg_dump внутри контейнера и копируем на хост
# -Fc: custom format (сжатый, гибкий при восстановлении)
# -Z 9: максимальное сжатие
if docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc -Z 9 > "$BACKUP_FILE"; then
    echo "✅ Бэкап успешно создан: $BACKUP_FILE"

    # Проверка размера файла (если 0 байт, значит что-то пошло не так)
    if [ ! -s "$BACKUP_FILE" ]; then
        echo "❌ ОШИБКА: Файл бэкапа пустой!"
        exit 1
    fi
else
    echo "❌ ОШИБКА: Не удалось создать бэкап базы данных."
    # Удаляем битый файл
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Очистка старых бэкапов
echo "🧹 Удаляю бэкапы старше $RETENTION_DAYS дней..."
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "🎉 Бэкап завершен."
