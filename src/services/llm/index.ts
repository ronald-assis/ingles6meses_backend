import { env } from "../../lib/env.js";
import { AppError } from "../../lib/errors.js";
import { createOpenRouterProvider } from "./openrouter.js";
import { createOllamaProvider } from "./ollama.js";
import type { LLMProvider } from "./types.js";

let instancia: LLMProvider | null = null;

export function getLLM(): LLMProvider {
  if (instancia) return instancia;

  switch (env.llm.provider) {
    case "openrouter":
      instancia = createOpenRouterProvider({
        baseUrl: env.llm.openrouter.baseUrl,
        model: env.llm.openrouter.model,
        apiKey: env.llm.openrouter.apiKey,
      });
      break;
    case "ollama":
      instancia = createOllamaProvider({
        baseUrl: env.llm.ollama.baseUrl,
        model: env.llm.ollama.model,
      });
      break;
    default:
      throw new AppError(`Provedor de LLM desconhecido: ${env.llm.provider}`, 500);
  }

  return instancia;
}

export type { ChatMessage, LLMProvider } from "./types.js";
