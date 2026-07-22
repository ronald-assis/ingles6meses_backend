import { getLLM } from "./llm/index.js";
import type { ChatMessage } from "./llm/types.js";
import { AppError } from "../lib/errors.js";

const SISTEMA_TUTOR =
  "Você é um tutor de inglês paciente e encorajador para falantes de português brasileiro que estão aprendendo do zero rumo à fluência. Responda de forma clara e objetiva. Quando corrigir, explique o porquê de forma simples.";

function extrairJson<T>(texto: string): T {
  const limpo = texto
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(limpo) as T;
  } catch {
    throw new AppError("A LLM não retornou um JSON válido", 502);
  }
}

export const aiService = {
  async corrigirFrase(frase: string) {
    const messages: ChatMessage[] = [
      { role: "system", content: SISTEMA_TUTOR },
      {
        role: "user",
        content:
          `Corrija a frase em inglês a seguir. Responda em JSON com as chaves ` +
          `"correta" (a frase corrigida), "temErro" (boolean) e "explicacao" ` +
          `(explicação curta em português). Frase: "${frase}"`,
      },
    ];
    const resposta = await getLLM().chat(messages, { json: true, temperature: 0.2 });
    return extrairJson<{
      correta: string;
      temErro: boolean;
      explicacao: string;
    }>(resposta);
  },

  async explicarDuvida(pergunta: string) {
    const messages: ChatMessage[] = [
      { role: "system", content: SISTEMA_TUTOR },
      {
        role: "user",
        content: `Explique de forma simples, em português, com um exemplo em inglês: ${pergunta}`,
      },
    ];
    const explicacao = await getLLM().chat(messages, { temperature: 0.4 });
    return { explicacao };
  },

  async gerarExercicios(tema: string, nivel: string, quantidade: number) {
    const messages: ChatMessage[] = [
      { role: "system", content: SISTEMA_TUTOR },
      {
        role: "user",
        content:
          `Gere ${quantidade} questões de múltipla escolha de inglês sobre "${tema}" ` +
          `para o nível ${nivel}. Responda em JSON no formato ` +
          `{"questoes":[{"enunciado":string,"alternativas":[{"texto":string,"correta":boolean}]}]}. ` +
          `Cada questão deve ter 4 alternativas e exatamente uma correta.`,
      },
    ];
    const resposta = await getLLM().chat(messages, { json: true, temperature: 0.6 });
    return extrairJson<{
      questoes: Array<{
        enunciado: string;
        alternativas: Array<{ texto: string; correta: boolean }>;
      }>;
    }>(resposta);
  },

  async tutor(mensagens: ChatMessage[]) {
    const messages: ChatMessage[] = [
      { role: "system", content: SISTEMA_TUTOR },
      ...mensagens,
    ];
    const resposta = await getLLM().chat(messages, { temperature: 0.8 });
    return { resposta };
  },
};
