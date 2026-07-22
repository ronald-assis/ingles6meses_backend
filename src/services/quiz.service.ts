import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export const quizService = {
  async obter(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questoes: {
          orderBy: { ordem: "asc" },
          include: {
            alternativas: { select: { id: true, texto: true } },
          },
        },
      },
    });
    if (!quiz) throw new AppError("Quiz não encontrado", 404);
    return quiz;
  },

  async tentar(
    quizId: string,
    userId: string,
    respostas: Record<string, string>
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questoes: { include: { alternativas: true } } },
    });
    if (!quiz) throw new AppError("Quiz não encontrado", 404);

    let acertos = 0;
    for (const q of quiz.questoes) {
      const correta = q.alternativas.find((a) => a.correta);
      if (correta && respostas[q.id] === correta.id) acertos++;
    }
    const total = quiz.questoes.length;
    const pontuacao = total === 0 ? 0 : acertos / total;

    await prisma.tentativaQuiz.create({
      data: { userId, quizId, pontuacao, respostas },
    });

    return { pontuacao, acertos, total };
  },
};
