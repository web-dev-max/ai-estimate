import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ESTIMATE_EXTRACTION_JSON_SCHEMA,
  estimateExtractionSchema,
  type EstimateExtraction,
} from '@ai-smeta/validation';
import { AiRequestLoggerService } from './ai-request-logger.service';
import { LLM_PROVIDER, type ILlmProvider } from './llm-provider';
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionUserMessage,
} from './prompts/extraction.prompt';

export interface ExtractInput {
  text: string;
  allowedUnitCodes: string[];
  regionName?: string | null;
  userId?: string | null;
  conversationId?: string | null;
}

@Injectable()
export class WorkExtractorService {
  private readonly logger = new Logger(WorkExtractorService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: ILlmProvider,
    private readonly aiLog: AiRequestLoggerService,
  ) {}

  async extract(input: ExtractInput): Promise<EstimateExtraction> {
    const started = Date.now();

    try {
      const result = await this.llm.completeJson(
        {
          system: EXTRACTION_SYSTEM_PROMPT,
          user: buildExtractionUserMessage(input),
          schemaName: 'EstimateExtraction',
          jsonSchema: ESTIMATE_EXTRACTION_JSON_SCHEMA,
          maxTokens: 3000,
        },
        (raw) => estimateExtractionSchema.parse(raw),
      );

      this.aiLog.record({
        provider: this.llm.name,
        model: this.llm.model,
        userId: input.userId,
        conversationId: input.conversationId,
        usage: result.usage,
        processingTimeMs: result.latencyMs,
        status: 'success',
      });

      this.logger.log(
        `extraction ok: ${result.data.items.length} работ, resolved model ${result.model}`,
      );

      return result.data;
    } catch (error) {
      this.aiLog.record({
        provider: this.llm.name,
        model: this.llm.model,
        userId: input.userId,
        conversationId: input.conversationId,
        usage: { promptTokens: 0, cachedTokens: 0, completionTokens: 0 },
        processingTimeMs: Date.now() - started,
        status: 'error',
      });
      throw error;
    }
  }
}
