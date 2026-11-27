import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GigaChatProvider } from '../src/modules/ai/gigachat.provider';
import { estimateExtractionSchema } from '@ai-smeta/validation';

const tokenResponse = () => ({
  ok: true,
  status: 200,
  json: async () => ({ access_token: 't1', expires_at: Date.now() + 1_800_000 }),
});

const chatResponse = (content: string) => ({
  ok: true,
  status: 200,
  json: async () => ({
    model: 'GigaChat-2',
    choices: [{ finish_reason: 'stop', message: { content } }],
    usage: { prompt_tokens: 100, completion_tokens: 20 },
  }),
});

describe('GigaChatProvider', () => {
  let provider: GigaChatProvider;
  const fetchMock = jest.fn();

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    const module = await Test.createTestingModule({
      providers: [
        GigaChatProvider,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'GIGACHAT_AUTH_KEY' ? 'test-auth-key' : undefined,
          },
        },
      ],
    }).compile();

    provider = module.get(GigaChatProvider);
  });

  const call = () =>
    provider.completeJson(
      {
        system: 'верни json',
        user: 'плитка 12 м2',
        schemaName: 'EstimateExtraction',
        jsonSchema: {},
        maxTokens: 500,
      },
      (raw) => estimateExtractionSchema.parse(raw),
    );

  it('получает токен и парсит ответ', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(chatResponse('{"items":[],"questions":[]}'));

    const result = await call();

    expect(result.data.items).toEqual([]);
    expect(result.usage.promptTokens).toBe(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('кэширует токен между вызовами', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(chatResponse('{"items":[],"questions":[]}'))
      .mockResolvedValueOnce(chatResponse('{"items":[],"questions":[]}'));

    await call();
    await call();

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('срезает markdown-ограждение вокруг JSON', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        chatResponse('```json\n{"items":[],"questions":[]}\n```'),
      );

    const result = await call();
    expect(result.data.questions).toEqual([]);
  });

  it('ретраит пустой content', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(chatResponse('   '))
      .mockResolvedValueOnce(chatResponse('{"items":[],"questions":[]}'));

    const result = await call();
    expect(result.data.items).toEqual([]);
  });
});
