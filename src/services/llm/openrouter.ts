import { AppError } from "../../lib/errors.js";
import { chatOpenAICompat } from "./openaiCompat.js";
import type { ChatMessage, ChatOptions, LLMProvider } from "./types.js";

interface Config {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export function createOpenRouterProvider(config: Config): LLMProvider {
  return {
    nome: "openrouter",
    async chat(messages: ChatMessage[], options?: ChatOptions) {
      if (!config.apiKey) {
        throw new AppError("OPENROUTER_API_KEY não configurada", 500);
      }
      return chatOpenAICompat(
        {
          baseUrl: config.baseUrl,
          model: config.model,
          apiKey: config.apiKey,
          extraHeaders: {
            "HTTP-Referer": "https://ingles6meses.app",
            "X-Title": "Inglês em 6 Meses",
          },
        },
        messages,
        options
      );
    },
  };
}
