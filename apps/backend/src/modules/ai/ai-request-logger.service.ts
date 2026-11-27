import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { estimateCostRub } from './llm-pricing';
import type { ILlmUsage } from './llm-provider';

export interface AiRequestLogEntry {
  provider: string;
  model: string;
  userId?: string | null;
  conversationId?: string | null;
  usage: ILlmUsage;
  processingTimeMs: number;
  status: 'success' | 'error';
}

@Injectable()
export class AiRequestLoggerService {
  private readonly logger = new Logger(AiRequestLoggerService.name);

  constructor(private readonly prisma: PrismaService) {}

  record(entry: AiRequestLogEntry): void {
    const estimatedCost = estimateCostRub(entry.provider, entry.model, entry.usage);

    void this.prisma.aiRequest
      .create({
        data: {
          provider: entry.provider,
          model: entry.model,
          userId: entry.userId ?? null,
          conversationId: entry.conversationId ?? null,
          promptTokens: entry.usage.promptTokens,
          completionTokens: entry.usage.completionTokens,
          estimatedCost,
          processingTimeMs: entry.processingTimeMs,
          status: entry.status,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(`ai_requests не записан: ${String(error)}`);
      });
  }
}
