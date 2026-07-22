import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export const cursoService = {
  async listar(busca?: string, categoria?: string) {
    const cursos = await prisma.curso.findMany({
      where: {
        status: "PUBLICADO",
        titulo: busca ? { contains: busca, mode: "insensitive" } : undefined,
        categoria: categoria ? { nome: categoria } : undefined,
      },
      include: {
        categoria: true,
        _count: { select: { modulos: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return cursos.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      descricao: c.descricao,
      categoria: c.categoria?.nome ?? "Geral",
      cor: c.cor,
      nivel: c.nivel,
    }));
  },

  async detalhe(cursoId: string, userId: string) {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        categoria: true,
        modulos: {
          orderBy: { ordem: "asc" },
          include: {
            aulas: { orderBy: { ordem: "asc" } },
            quizzes: { select: { id: true, titulo: true } },
          },
        },
      },
    });
    if (!curso) throw new AppError("Curso não encontrado", 404);

    const concluidas = await prisma.progressoAula.findMany({
      where: { userId, concluida: true, aula: { modulo: { cursoId } } },
      select: { aulaId: true },
    });
    const setConcluidas = new Set(concluidas.map((p) => p.aulaId));

    const totalAulas = curso.modulos.reduce((s, m) => s + m.aulas.length, 0);
    const progresso =
      totalAulas === 0 ? 0 : Math.round((setConcluidas.size / totalAulas) * 100);

    return {
      id: curso.id,
      titulo: curso.titulo,
      descricao: curso.descricao,
      cor: curso.cor,
      nivel: curso.nivel,
      progresso,
      totalAulas,
      modulos: curso.modulos.map((m) => ({
        id: m.id,
        titulo: m.titulo,
        ordem: m.ordem,
        quizId: m.quizzes[0]?.id ?? null,
        aulas: m.aulas.map((a) => ({
          id: a.id,
          titulo: a.titulo,
          ordem: a.ordem,
          tipo: a.tipo,
          concluida: setConcluidas.has(a.id),
        })),
      })),
    };
  },

  async matricular(cursoId: string, userId: string) {
    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) throw new AppError("Curso não encontrado", 404);

    return prisma.matricula.upsert({
      where: { userId_cursoId: { userId, cursoId } },
      create: { userId, cursoId },
      update: {},
    });
  },
};
