export interface ILlmUsage {
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
}

export interface ILlmJsonRequest {
  system: string;
  user: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  maxTokens: number;
}

export interface ILlmJsonResult<T> {
  data: T;
  usage: ILlmUsage;
  latencyMs: number;
  model: string;
}

export interface ILlmProvider {
  readonly name: string;
  readonly model: string;
  readonly maxConcurrency: number;
  completeJson<T>(
    req: ILlmJsonRequest,
    parse: (raw: unknown) => T,
  ): Promise<ILlmJsonResult<T>>;
}

export const Llm_PROVIDER = Symbol('Llm_PROVIDER');
