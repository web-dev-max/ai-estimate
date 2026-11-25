// generate-init-data.js
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env');
  process.exit(1);
}

// Данные пользователя (ID должен совпадать с тем, что мы засеяли в БД: 123456789)
const userId = 123456789;
const username = 'test_master';

const authDate = Math.floor(Date.now() / 1000);
const user = JSON.stringify({ id: userId, username, first_name: 'Test' });

const params = new URLSearchParams({
  auth_date: authDate.toString(),
  user: user,
});

// 1. Формируем data-check-string
const dataCheckString = Array.from(params.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// 2. Вычисляем секретный ключ и хеш (по документации Telegram)
const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

// 3. Собираем итоговую строку initData
params.set('hash', hash);
const initData = params.toString();

console.log('\n=== Ваш initData для Swagger ===\n');
console.log(initData);
console.log('\n================================\n');
