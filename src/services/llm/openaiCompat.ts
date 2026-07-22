import { AppError } from "../../lib/errors.js";
import type { ChatMessage, ChatOptions } from "./types.js";

interface ClientConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
  extraHeaders?: Record<string, string>;
}

export async function chatOpenAICompat(
  config: ClientConfig,
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.extraHeaders,
  };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: options.temperature ?? 0.7,
  };
  if (options.maxTokens) body.max_tokens = options.maxTokens;
  if (options.json) body.response_format = { type: "json_object" };

  let resp: Response;
  try {
    resp = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new AppError("Falha ao contatar o provedor de LLM", 502);
  }

  if (!resp.ok) {
    const detalhe = await resp.text().catch(() => "");
    throw new AppError(
      `Provedor de LLM retornou ${resp.status}: ${detalhe.slice(0, 300)}`,
      502
    );
  }

  const data = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new AppError("Resposta vazia do provedor de LLM", 502);
  return content;
}
