import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Variável de ambiente ausente: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: required("JWT_SECRET", "dev_secret_troque_em_producao"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  llm: {
    provider: (process.env.LLM_PROVIDER ?? "openrouter") as
      | "openrouter"
      | "ollama",
    openrouter: {
      baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      model: process.env.OLLAMA_MODEL ?? "llama3.1",
    },
  },
};
