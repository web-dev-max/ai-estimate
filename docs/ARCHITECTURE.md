# Архитектура

## Принцип
Модульный монолит. Микросервисы на старте не используем.

## Стек
| Компонент | Технология |
|---|---|
| Frontend | React 19 + TypeScript, Vite |
| UI | shadcn/ui + SCSS Modules |
| Backend | Node.js + NestJS + TypeScript |
| ORM | Prisma |
| БД | PostgreSQL |
| Кэш/очереди | Redis + BullMQ |
| AI | DeepSeek API (отдельный провайдер) |
| PDF | Puppeteer |
| Валидация | Zod |
| API | REST + Swagger/OpenAPI |
| Контейнеры | Docker Compose |
| Тесты | Jest + Supertest + Playwright |
| Мониторинг | Sentry |

## Структура monorepo (pnpm workspace)

├── apps/
│ ├── backend/
│ │ └── src/
│ │ ├── modules/
│ │ │ ├── auth/
│ │ │ ├── users/
│ │ │ ├── profiles/
│ │ │ ├── messengers/
│ │ │ │ ├── telegram/
│ │ │ │ └── max/
│ │ │ ├── ai/
│ │ │ ├── conversations/
│ │ │ ├── estimates/
│ │ │ ├── catalog/
│ │ │ ├── pricing/
│ │ │ ├── materials/
│ │ │ ├── documents/
│ │ │ ├── subscriptions/
│ │ │ ├── payments/
│ │ │ └── admin/
│ │ ├── common/
│ │ ├── database/
│ │ └── main.ts
│ └── frontend/
│ └── src/
│ ├── app/
│ ├── pages/
│ ├── widgets/
│ ├── features/
│ ├── entities/
│ ├── shared/
│ └── styles/
├── packages/
│ ├── shared-types/
│ ├── validation/
│ └── api-client/
├── prisma/
├── infrastructure/docker/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json

## Поток создания сметы

Сообщение → Intent Classifier → DeepSeek Extraction → Question Engine
→ Catalog Matcher → Estimate Calculator → JSON → PostgreSQL → PDF → пользователь

## AI-модуль
- `DeepSeekProvider` — изолирует API. Модель можно заменить, не переписывая бизнес-логику.
- Модели: `deepseek-flash` — основная; `deepseek-v4-pro` — опционально для сложных задач.
- JSON-режим + валидация ответов через Zod.
- Хранить токены, стоимость и время каждого запроса в `ai_requests`.
- Названия моделей — в конфиге, не хардкодить.

## Мессенджеры
Общий интерфейс:
```ts
interface MessengerAdapter {
  verifyWebhook(request: unknown): boolean;
  parseUpdate(payload: unknown): NormalizedMessage;
  sendText(chatId: string, text: string): Promise<void>;
  sendFile(chatId: string, file: Buffer, filename: string): Promise<void>;
  sendButtons(chatId: string, buttons: MessengerButton[][]): Promise<void>;
}
Реализации: telegram/, max/. Отдельный backend на мессенджер не делаем. Учитывать различия возможностей (capability detection + fallback).

Безопасность Mini App
Получить данные запуска.

Проверить подпись на backend (Telegram initData; для MAX — по актуальной спецификации).

Проверить время и защититься от replay.

Найти/создать пользователя.

Выдать короткоживущую сессию.

Проверять права на каждом запросе.

MAX
API: platform-api2.max.ru, токен в Authorization, не в URL.

Нужен сертификат Минцифры в доверенных.

Создание бота — для верифицированных организаций/ИП/самозанятых РФ, есть модерация. Запускать процесс параллельно с разработкой.
