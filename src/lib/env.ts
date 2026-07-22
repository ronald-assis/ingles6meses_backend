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
};
