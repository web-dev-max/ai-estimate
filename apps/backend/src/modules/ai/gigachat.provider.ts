import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { ILlmJsonRequest, ILlmJsonResult, ILlmProvider } from './llm-provider';
import { IChatResponse, ITokenCache } from './interface';
import { cleanSchema, sleep, stripFences } from '../../common/utils/helpFuncAI';
import { USER_AGENT } from '../../common/constant';

@Injectable()
export class GigaChatProvider implements ILlmProvider {
  readonly name = 'gigachat';
  readonly model: string;
  /** Freemium физлица генерирует в один поток. */
  readonly maxConcurrency = 1;

  private readonly logger = new Logger(GigaChatProvider.name);
  private readonly authKey: string;
  private readonly scope: string;
  private readonly oauthUrl: string;
  private readonly apiUrl: string;

  private token: ITokenCache | null = null;
  private tokenPromise: Promise<string> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(config: ConfigService) {
    this.authKey = config.get<string>('GIGACHAT_AUTH_KEY') ?? '';
    this.scope = config.get<string>('GIGACHAT_SCOPE') ?? 'GIGACHAT_API_PERS';
    this.model = config.get<string>('GIGACHAT_MODEL') ?? 'GigaChat-2-Pro';
    this.oauthUrl =
      config.get<string>('GIGACHAT_OAUTH_URL') ??
      'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    this.apiUrl = config.get<string>('GIGACHAT_API_URL') ?? 'https://api.giga.chat/v1';
  }

  completeJson<T>(
    req: ILlmJsonRequest,
    parse: (raw: unknown) => T,
  ): Promise<ILlmJsonResult<T>> {
    const run = this.queue.then(
      () => this.run(req, parse),
      () => this.run(req, parse),
    );
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async run<T>(
    req: ILlmJsonRequest,
    parse: (raw: unknown) => T,
  ): Promise<ILlmJsonResult<T>> {
    const started = Date.now();
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        let token = await this.getToken();
        let res = await this.chat(token, req);

        if (res.status === 401) {
          this.token = null;
          token = await this.getToken();
          res = await this.chat(token, req);
        }

        if (!res.ok) {
          const body = (await res.text()).slice(0, 400);
          if (res.status === 429 || res.status >= 500) {
            lastError = new Error(`HTTP ${res.status}: ${body}`);
            await sleep(400 * attempt);
            continue;
          }
          throw new ServiceUnavailableException(`GigaChat HTTP ${res.status}: ${body}`);
        }

        const json = (await res.json()) as IChatResponse;
        const choice = json.choices?.[0];
        const usage = {
          promptTokens: json.usage?.prompt_tokens ?? 0,
          cachedTokens: json.usage?.precached_prompt_tokens ?? 0,
          completionTokens: json.usage?.completion_tokens ?? 0,
        };

        if (choice?.finish_reason === 'blacklist') {
          throw new ServiceUnavailableException(
            'GigaChat: запрос отклонён тематическими ограничениями',
          );
        }
        if (choice?.finish_reason === 'length') {
          lastError = new Error('ответ обрезан по max_tokens');
          await sleep(300);
          continue;
        }

        const content = choice?.message?.content ?? '';
        if (!content.trim()) {
          lastError = new Error('пустой content');
          await sleep(300);
          continue;
        }

        const raw: unknown = JSON.parse(stripFences(content));
        return {
          data: parse(raw),
          usage,
          latencyMs: Date.now() - started,
          model: json.model ?? this.model,
        };
      } catch (err) {
        if (err instanceof ServiceUnavailableException) throw err;
        lastError = err;
        if (attempt < 2) await sleep(400);
      }
    }

    throw new ServiceUnavailableException(
      `GigaChat: исчерпаны попытки (${String(lastError)})`,
    );
  }

  private chat(token: string, req: ILlmJsonRequest): Promise<Response> {
    return fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
        'X-Request-ID': randomUUID(),
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        temperature: 0,
        max_tokens: req.maxTokens,
        stream: false,
        response_format: {
          type: 'json_schema',
          schema: cleanSchema(req.jsonSchema),
          strict: true,
        },
      }),
    });
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && this.token.expiresAt - 60_000 > now) {
      return this.token.accessToken;
    }
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchToken().finally(() => {
        this.tokenPromise = null;
      });
    }
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<string> {
    if (!this.authKey) {
      throw new ServiceUnavailableException('GIGACHAT_AUTH_KEY не задан');
    }

    const res = await fetch(this.oauthUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.authKey}`,
        RqUID: randomUUID(),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: `scope=${encodeURIComponent(this.scope)}`,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = (await res.text()).slice(0, 400);
      throw new ServiceUnavailableException(`GigaChat OAuth ${res.status}: ${body}`);
    }

    const json = (await res.json()) as { access_token: string; expires_at: number };
    const rawExpiry = Number(json.expires_at);
    this.token = {
      accessToken: json.access_token,
      expiresAt: rawExpiry < 1_000_000_000_000 ? rawExpiry * 1000 : rawExpiry,
    };
    this.logger.log('GigaChat access token обновлён');
    return this.token.accessToken;
  }
}
