import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

function serializar(a: {
  id: string;
  texto: string;
  aulaId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: a.id,
    texto: a.texto,
    aulaId: a.aulaId,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export const anotacaoService = {
  async listar(aulaId: string, userId: string) {
    const aula = await prisma.aula.findUnique({ where: { id: aulaId } });
    if (!aula) throw new AppError("Aula não encontrada", 404);

    const anotacoes = await prisma.anotacao.findMany({
      where: { aulaId, userId },
      orderBy: { createdAt: "asc" },
    });
    return anotacoes.map(serializar);
  },

  async criar(aulaId: string, userId: string, texto: string) {
    const aula = await prisma.aula.findUnique({ where: { id: aulaId } });
    if (!aula) throw new AppError("Aula não encontrada", 404);

    const anotacao = await prisma.anotacao.create({
      data: { aulaId, userId, texto },
    });
    return serializar(anotacao);
  },

  async atualizar(anotacaoId: string, userId: string, texto: string) {
    const anotacao = await this.buscarDoUsuario(anotacaoId, userId);
    const atualizada = await prisma.anotacao.update({
      where: { id: anotacao.id },
      data: { texto },
    });
    return serializar(atualizada);
  },

  async excluir(anotacaoId: string, userId: string) {
    const anotacao = await this.buscarDoUsuario(anotacaoId, userId);
    await prisma.anotacao.delete({ where: { id: anotacao.id } });
    return { id: anotacao.id };
  },

  // RN-17: o aluno só enxerga e altera anotações que são dele.
  async buscarDoUsuario(anotacaoId: string, userId: string) {
    const anotacao = await prisma.anotacao.findUnique({
      where: { id: anotacaoId },
    });
    if (!anotacao || anotacao.userId !== userId) {
      throw new AppError("Anotação não encontrada", 404);
    }
    return anotacao;
  },
};
