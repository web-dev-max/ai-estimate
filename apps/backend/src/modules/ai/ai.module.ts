import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { AiRequestLoggerService } from './ai-request-logger.service';
import { GigaChatProvider } from './gigachat.provider';
import { LLM_PROVIDER, type ILlmProvider } from './llm-provider';
import { MockLlmProvider } from './mock-llm.provider';
import { WorkExtractorService } from './work-extractor.service';

@Module({
  imports: [PrismaModule],
  providers: [
    AiRequestLoggerService,
    MockLlmProvider,
    GigaChatProvider,
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService, MockLlmProvider, GigaChatProvider],
      useFactory: (
        config: ConfigService,
        mock: MockLlmProvider,
        gigachat: GigaChatProvider,
      ): ILlmProvider =>
        config.get<string>('LLM_PROVIDER') === 'gigachat' ? gigachat : mock,
    },
    WorkExtractorService,
  ],
  exports: [WorkExtractorService, AiRequestLoggerService, LLM_PROVIDER],
})
export class AiModule {}
