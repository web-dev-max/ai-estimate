export interface IChatResponse {
  model?: string;
  choices?: Array<{ finish_reason?: string; message?: { content?: string | null } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    precached_prompt_tokens?: number;
  };
}

export interface ITokenCache {
  accessToken: string;
  expiresAt: number;
}
