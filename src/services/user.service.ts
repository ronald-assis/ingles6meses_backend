import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

const XP_POR_NIVEL = 500;
const META_DIARIA = 50;

export const userService = {
  async stats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const palavras = await prisma.progressoAula.count({
      where: { userId, concluida: true },
    });

    const levelNum = Math.floor(user.xp / XP_POR_NIVEL) + 1;

    return {
      nome: user.nome,
      email: user.email,
      role: user.role,
      xp: user.xp,
      xpMetaDiaria: META_DIARIA,
      xpHoje: 0,
      streak: user.streak,
      palavras,
      levelNum,
      nivel: "A1",
      nivelLabel: "Beginner",
    };
  },
};
