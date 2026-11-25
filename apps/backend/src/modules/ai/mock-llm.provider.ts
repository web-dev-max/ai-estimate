import { Injectable } from '@nestjs/common';
import type { ILlmJsonRequest, ILlmJsonResult, ILlmProvider } from './llm-provider';

@Injectable()
export class MockLlmProvider implements ILlmProvider {
  readonly name = 'mock';
  readonly model = 'mock';
  readonly maxConcurrency = 8;

  private fixture: unknown = null;

  setFixture(value: unknown): void {
    this.fixture = value;
  }

  async completeJson<T>(
    req: ILlmJsonRequest,
    parse: (raw: unknown) => T,
  ): Promise<ILlmJsonResult<T>> {
    try {
      const raw = this.fixture ?? this.heuristic(req.user);
      return {
        data: parse(raw),
        usage: {
          promptTokens: Math.ceil((req.system.length + req.user.length) / 4),
          cachedTokens: 0,
          completionTokens: 64,
        },
        latencyMs: 1,
        model: this.model,
      };
    } catch (error) {
      console.error('ОШИБКА В mock-llm.provider.completeJson:', error);
      throw error;
    }
  }

  /** Примитивный разбор для локальной отладки без модели. */
  private heuristic(user: string): unknown {
    const text = user.toLowerCase();
    const items: unknown[] = [];
    const patterns: Array<[RegExp, string, string]> = [
      [/плитк|кафел/, 'укладка плитки', 'm2'],
      [/покрас.*стен|окраск.*стен/, 'покраска стен', 'm2'],
      [/шпакл/, 'шпаклевка стен', 'm2'],
      [/обоев|обои/, 'поклейка обоев', 'm2'],
      [/розетк/, 'установка розетки', 'pcs'],
      [/унитаз/, 'установка унитаза', 'pcs'],
      [/стяжк/, 'стяжка пола', 'm2'],
    ];
    for (const [re, serviceQuery, unitCode] of patterns) {
      if (!re.test(text)) continue;
      const num = text.match(/(\d+(?:[.,]\d+)?)\s*(?:м2|м²|кв|шт|штук)?/);
      items.push({
        serviceQuery,
        quantity: num ? Number(num[1].replace(',', '.')) : null,
        unitCode,
        room: null,
        confidence: 0.5,
      });
    }
    return { items, questions: [] };
  }
}
