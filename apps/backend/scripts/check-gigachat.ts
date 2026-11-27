import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

dotenv.config();

const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY;
const SCOPE = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS';
const MODEL = process.env.GIGACHAT_MODEL ?? 'GigaChat-2-Pro';
const OAUTH_URL =
  process.env.GIGACHAT_OAUTH_URL ?? 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const API_URL = process.env.GIGACHAT_API_URL ?? 'https://api.giga.chat/v1';
const UA = 'ai-smeta-backend/0.1';

async function main(): Promise<void> {
  if (!AUTH_KEY) throw new Error('GIGACHAT_AUTH_KEY не задан в .env');
  if (!process.env.NODE_EXTRA_CA_CERTS) {
    console.warn('⚠️  NODE_EXTRA_CA_CERTS не задан — TLS скорее всего упадёт');
  }

  console.log('1) Access token…');
  const tokenRes = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${AUTH_KEY}`,
      RqUID: randomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': UA,
    },
    body: `scope=${encodeURIComponent(SCOPE)}`,
    signal: AbortSignal.timeout(15_000),
  });

  if (!tokenRes.ok) {
    console.error('OAuth FAILED', tokenRes.status, (await tokenRes.text()).slice(0, 400));
    process.exit(1);
  }

  const token = (await tokenRes.json()) as { access_token: string; expires_at: number };
  const rawExpiry = Number(token.expires_at);
  const expiresAt = rawExpiry < 1_000_000_000_000 ? rawExpiry * 1000 : rawExpiry;
  console.log('   OK, истекает:', new Date(expiresAt).toISOString());

  const authHeaders = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json',
    'User-Agent': UA,
  };

  console.log(`2) GET ${API_URL}/models…`);
  const modelsRes = await fetch(`${API_URL}/models`, {
    headers: authHeaders,
    signal: AbortSignal.timeout(15_000),
  });

  if (!modelsRes.ok) {
    console.error('Models FAILED', modelsRes.status, (await modelsRes.text()).slice(0, 400));
    process.exit(1);
  }

  const models = (await modelsRes.json()) as { data?: Array<{ id?: string }> };
  console.log('   Доступные модели:', (models.data ?? []).map((m) => m.id).join(', '));

  console.log(`3) POST ${API_URL}/chat/completions (${MODEL})…`);
  const chatRes = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      'X-Request-ID': randomUUID(),
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Ты парсер строительных смет. Извлеки работы и объёмы. Цены не указывай. Допустимые unitCode: m2, m_p, pcs.',
        },
        {
          role: 'user',
          content: 'уложить плитку в санузле 12 м2 и поставить унитаз',
        },
      ],
      temperature: 0,
      max_tokens: 800,
      stream: false,
      response_format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  serviceQuery: { type: 'string' },
                  quantity: { type: ['number', 'null'] },
                  unitCode: { type: ['string', 'null'] },
                  confidence: { type: 'number' },
                },
                required: ['serviceQuery', 'quantity', 'unitCode', 'confidence'],
              },
            },
            questions: { type: 'array', items: { type: 'string' } },
          },
          required: ['items', 'questions'],
        },
        strict: true,
      },
    }),
  });

  if (!chatRes.ok) {
    console.error('Chat FAILED', chatRes.status, (await chatRes.text()).slice(0, 800));
    process.exit(1);
  }

  const chat = (await chatRes.json()) as {
    model?: string;
    choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
    usage?: Record<string, number>;
  };

  console.log('   model:', chat.model);
  console.log('   finish_reason:', chat.choices?.[0]?.finish_reason);
  console.log('   usage:', chat.usage);
  console.log('   content:');
  console.log(chat.choices?.[0]?.message?.content);
}

main().catch((e) => {
  console.error('ERROR:', e instanceof Error ? e.message : e);
  process.exit(1);
});
