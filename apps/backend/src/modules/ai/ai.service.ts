import { Inject, Injectable } from '@nestjs/common';
import {
  ESTIMATE_EXTRACTION_JSON_SCHEMA,
  estimateExtractionSchema,
  type EstimateExtraction,
} from '@ai-smeta/validation';
import { LLM_PROVIDER, type ILlmProvider } from './llm-provider';
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionUserMessage,
} from './prompts/extraction.prompt';

@Injectable()
export class AiService {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {}

  async extract(input: {
    text: string;
    allowedUnitCodes: string[];
    regionName?: string | null;
  }): Promise<EstimateExtraction> {
    const { data } = await this.llm.completeJson(
      {
        system: EXTRACTION_SYSTEM_PROMPT,
        user: buildExtractionUserMessage(input),
        schemaName: 'EstimateExtraction',
        jsonSchema: ESTIMATE_EXTRACTION_JSON_SCHEMA,
        maxTokens: 3000,
      },
      (raw) => estimateExtractionSchema.parse(raw),
    );
    return data;
  }
}
