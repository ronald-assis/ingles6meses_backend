import { chatOpenAICompat } from "./openaiCompat.js";
import type { ChatMessage, ChatOptions, LLMProvider } from "./types.js";

interface Config {
  baseUrl: string;
  model: string;
}

export function createOllamaProvider(config: Config): LLMProvider {
  return {
    nome: "ollama",
    async chat(messages: ChatMessage[], options?: ChatOptions) {
      return chatOpenAICompat(
        { baseUrl: config.baseUrl, model: config.model },
        messages,
        options
      );
    },
  };
}
