import { Prisma } from '../../database/generated/prisma/client';
import type { ILlmUsage } from './llm-provider';

export interface ModelPriceRub {
  inputPer1k: number;
  cachedPer1k: number;
  outputPer1k: number;
}

// Ключ: `${provider}:${model}`. model берётся из конфига, не хардкодится.
export const LLM_PRICING_RUB: Record<string, ModelPriceRub> = {
  'gigachat:GigaChat-2': { inputPer1k: 0, cachedPer1k: 0, outputPer1k: 0 },
  'gigachat:GigaChat-2-Pro': { inputPer1k: 0, cachedPer1k: 0, outputPer1k: 0 },
  'yandex:yandexgpt-5.1': { inputPer1k: 0.8, cachedPer1k: 0.8, outputPer1k: 0.8 },
  'mock:mock': { inputPer1k: 0, cachedPer1k: 0, outputPer1k: 0 },
};

export function estimateCostRub(
  provider: string,
  model: string,
  usage: ILlmUsage,
): Prisma.Decimal {
  const price = LLM_PRICING_RUB[`${provider}:${model}`];
  if (!price) return new Prisma.Decimal(0);

  const fresh = Math.max(0, usage.promptTokens - usage.cachedTokens);
  return new Prisma.Decimal(fresh).mul(price.inputPer1k)
    .plus(new Prisma.Decimal(usage.cachedTokens).mul(price.cachedPer1k))
    .plus(new Prisma.Decimal(usage.completionTokens).mul(price.outputPer1k))
    .div(1000)
    .toDecimalPlaces(6);
}
