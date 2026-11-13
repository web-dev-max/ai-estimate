# База данных

## Общие правила
- Все ID — UUID.
- Деньги — `NUMERIC(14,2)`, не `FLOAT`.
- Время — UTC.
- Регионы — справочник, не свободный текст.
- У сметы хранить снимок цены и описания на момент создания.
- Удаление пользователя не уничтожает финансовую историю.
- Изоляция данных организаций; RLS в PostgreSQL как доп. защита, но проверка доступа — и в backend.
- Индексы: `user_id`, `estimate_id`, `(provider, external_user_id)`, `created_at`.

## Таблицы
| Таблица | Назначение |
|---|---|
| users | Пользователи |
| user_profiles | Профили мастеров |
| messenger_accounts | Telegram/MAX аккаунты |
| organizations | Бригады/компании |
| organization_members | Участники |
| categories | Категории работ |
| services | Справочник услуг |
| units | Единицы измерения |
| regions | Регионы РФ |
| price_lists | Прайс-листы |
| price_list_items | Расценки |
| estimates | Сметы |
| estimate_items | Позиции сметы |
| materials | Справочник материалов |
| estimate_materials | Материалы в смете |
| conversations | Диалоги |
| messages | Сообщения |
| ai_requests | Запросы к AI |
| documents | PDF и файлы |
| subscriptions | Подписки |
| payments | Платежи |
| usage_records | Лимиты |

## Ключевые поля

### users
`id UUID`, `email VARCHAR NULL`, `phone VARCHAR NULL`, `status ENUM`, `created_at`, `updated_at`

### messenger_accounts
`id UUID`, `user_id UUID`, `provider ENUM(telegram,max)`, `external_user_id VARCHAR`, `username VARCHAR NULL`, `linked_at TIMESTAMP`  
UNIQUE(`provider`, `external_user_id`)

### services
`id UUID`, `category_id UUID`, `code VARCHAR UNIQUE`, `name VARCHAR`, `description TEXT`, `default_unit_id UUID`, `is_active BOOLEAN`

### price_lists
`id UUID`, `owner_id UUID`, `name VARCHAR`, `type ENUM(system,personal,organization)`, `region_id UUID NULL`, `is_default BOOLEAN`, `created_at`

### price_list_items
`id UUID`, `price_list_id UUID`, `service_id UUID`, `unit_id UUID`, `price NUMERIC(14,2)`, `currency CHAR(3)`, `valid_from DATE`, `valid_to DATE NULL`

### estimates
`id UUID`, `user_id UUID`, `organization_id UUID NULL`, `title VARCHAR`, `customer_name VARCHAR NULL`, `location_id UUID NULL`, `status ENUM`, `work_total NUMERIC(14,2)`, `material_total NUMERIC(14,2)`, `discount_total NUMERIC(14,2)`, `grand_total NUMERIC(14,2)`, `currency CHAR(3)`, `created_at`, `updated_at`

### estimate_items
`id UUID`, `estimate_id UUID`, `service_id UUID NULL`, `description VARCHAR`, `quantity NUMERIC(14,3)`, `unit_id UUID`, `unit_price NUMERIC(14,2)`, `total_price NUMERIC(14,2)`, `source ENUM(system,personal,organization,manual)`, `position INTEGER`

### estimate_materials
Аналогично `estimate_items`: количество, цена за единицу, итог.

### messages
`conversation_id`, `role`, `content`, `message_type`, `metadata JSONB`, `created_at`

### ai_requests
`provider`, `model`, `user_id`, `conversation_id`, `prompt_tokens`, `completion_tokens`, `estimated_cost`, `processing_time_ms`, `status`, `created_at`

## Приоритет подбора цены
1. Индивидуальная цена мастера.
2. Прайс организации.
3. Региональный справочник.
4. Общероссийский справочник.
5. Ручной ввод (запросить у мастера).

У цены хранить дату обновления, источник и статус проверки. Системный справочник нельзя выдавать за официальную статистику.
