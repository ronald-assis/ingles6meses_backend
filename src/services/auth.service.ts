import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

function publicUser(u: { id: string; nome: string; email: string; role: string }) {
  return { id: u.id, nome: u.nome, email: u.email, role: u.role };
}

export const authService = {
  async register(nome: string, email: string, senha: string) {
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) throw new AppError("E-mail já cadastrado", 409);

    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({
      data: { nome, email, senhaHash },
    });
    const token = signToken({ sub: user.id, role: user.role });
    return { token, user: publicUser(user) };
  },

  async login(email: string, senha: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Credenciais inválidas", 401);

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) throw new AppError("Credenciais inválidas", 401);

    const token = signToken({ sub: user.id, role: user.role });
    return { token, user: publicUser(user) };
  },
};
