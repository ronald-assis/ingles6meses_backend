import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ehOntem(anterior: Date, hoje: Date) {
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  return mesmoDia(anterior, ontem);
}

export const aulaService = {
  async detalhe(aulaId: string, userId: string) {
    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        progresso: { where: { userId }, select: { concluida: true } },
      },
    });
    if (!aula) throw new AppError("Aula não encontrada", 404);
    return {
      id: aula.id,
      titulo: aula.titulo,
      tipo: aula.tipo,
      videoUrl: aula.videoUrl,
      conteudo: aula.conteudo,
      xp: aula.xp,
      concluida: aula.progresso[0]?.concluida ?? false,
    };
  },

  async concluir(aulaId: string, userId: string, concluida: boolean) {
    const aula = await prisma.aula.findUnique({ where: { id: aulaId } });
    if (!aula) throw new AppError("Aula não encontrada", 404);

    const jaExiste = await prisma.progressoAula.findUnique({
      where: { userId_aulaId: { userId, aulaId } },
    });

    if (concluida) {
      if (!jaExiste) {
        await prisma.progressoAula.create({
          data: { userId, aulaId, concluida: true },
        });
        await this.premiar(userId, aula.xp);
      }
    } else if (jaExiste) {
      await prisma.progressoAula.delete({
        where: { userId_aulaId: { userId, aulaId } },
      });
    }
    return { aulaId, concluida };
  },

  async premiar(userId: string, xp: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const hoje = new Date();
    let streak = user.streak;
    if (!user.ultimoEstudo) {
      streak = 1;
    } else if (!mesmoDia(user.ultimoEstudo, hoje)) {
      streak = ehOntem(user.ultimoEstudo, hoje) ? user.streak + 1 : 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xp }, streak, ultimoEstudo: hoje },
    });
  },
};
