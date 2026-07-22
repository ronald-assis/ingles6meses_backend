export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface LLMProvider {
  readonly nome: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
}
