#!/bin/bash
# infrastructure/backup/restore.sh

CONTAINER_NAME="ai-smeta-db"
DB_USER="postgres"
DB_NAME="ai_smeta"

# Проверка, что передан аргумент
if [ -z "$1" ]; then
    echo "Использование: ./restore.sh <путь_к_файлу_бэкапа>"
    echo "Доступные бэкапы:"
    ls -lh "$(dirname "$0")/backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ОШИБКА: Файл $BACKUP_FILE не найден."
    exit 1
fi

echo "⚠️  ВНИМАНИЕ! Это действие ПОЛНОСТЬЮ УДАЛИТ все текущие данные в базе $DB_NAME."
read -p "Вы уверены, что хотите продолжить? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Отменено."
    exit 1
fi

echo "🔄 Восстанавливаю базу из $BACKUP_FILE..."

# 1. Копируем файл внутрь контейнера
docker cp "$BACKUP_FILE" "$CONTAINER_NAME":/tmp/restore.dump

# 2. Выполняем pg_restore
# --clean: удаляет объекты перед созданием (перезапись)
# --if-exists: не падает, если удалять нечего
# -j 4: параллельное восстановление (ускоряет процесс)
if docker exec -t "$CONTAINER_NAME" pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists -j 4 /tmp/restore.dump; then
    echo "✅ База успешно восстановлена!"
else
    echo "❌ ОШИБКА при восстановлении базы."
fi

# 3. Удаляем временный файл
docker exec -t "$CONTAINER_NAME" rm -f /tmp/restore.dump
