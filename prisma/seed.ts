import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Semeando dados...");

  await prisma.tentativaQuiz.deleteMany();
  await prisma.alternativa.deleteMany();
  await prisma.questao.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.anotacao.deleteMany();
  await prisma.progressoAula.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash("123456", 10);
  const aluno = await prisma.user.create({
    data: {
      nome: "Ronald",
      email: "aluno@exemplo.com",
      senhaHash,
      xp: 1240,
      streak: 7,
    },
  });

  const cat = await prisma.categoria.create({
    data: { nome: "Trilha principal" },
  });

  const curso = await prisma.curso.create({
    data: {
      titulo: "Inglês em 6 Meses",
      descricao:
        "Do zero à conversa em 6 meses. Um módulo por mês, focado em comunicação.",
      cor: "indigo",
      nivel: "A1",
      status: "PUBLICADO",
      categoriaId: cat.id,
      modulos: {
        create: [
          {
            titulo: "Mês 1 — Sobrevivência",
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: "Cumprimentos e apresentações",
                  ordem: 1,
                  tipo: "VIDEO",
                  conteudo: "Hello! Nice to meet you.",
                },
                {
                  titulo: "Números, horas e datas",
                  ordem: 2,
                  tipo: "TEXTO",
                  conteudo: "One, two, three... What time is it?",
                },
              ],
            },
          },
          {
            titulo: "Mês 2 — Rotina e presente",
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: "Vocabulário do dia a dia",
                  ordem: 1,
                  tipo: "TEXTO",
                  conteudo: "home, work, food...",
                },
                {
                  titulo: "Falar da sua rotina",
                  ordem: 2,
                  tipo: "VIDEO",
                  conteudo: "I wake up at 7. I have breakfast. I go to work.",
                },
              ],
            },
          },
        ],
      },
    },
    include: { modulos: { include: { aulas: true } } },
  });

  await prisma.matricula.create({
    data: { userId: aluno.id, cursoId: curso.id },
  });
  const aulasMes1 = curso.modulos[0].aulas;
  for (const a of aulasMes1) {
    await prisma.progressoAula.create({
      data: { userId: aluno.id, aulaId: a.id },
    });
  }

  const mes2 = curso.modulos[1];
  await prisma.quiz.create({
    data: {
      titulo: "Quiz — Mês 2",
      moduloId: mes2.id,
      questoes: {
        create: [
          {
            enunciado: 'Como você diz "eu acordo às 7" em inglês?',
            ordem: 1,
            alternativas: {
              create: [
                { texto: "I waking up at 7", correta: false },
                { texto: "I wake up at 7", correta: true },
                { texto: "I wakes up at 7", correta: false },
                { texto: "I am wake up at 7", correta: false },
              ],
            },
          },
          {
            enunciado: "Qual frase usa o presente simples corretamente?",
            ordem: 2,
            alternativas: {
              create: [
                { texto: "She go to work every day", correta: false },
                { texto: "She goes to work every day", correta: true },
                { texto: "She going to work every day", correta: false },
                { texto: "She to go work every day", correta: false },
              ],
            },
          },
          {
            enunciado: '"Café da manhã" em inglês é:',
            ordem: 3,
            alternativas: {
              create: [
                { texto: "Lunch", correta: false },
                { texto: "Dinner", correta: false },
                { texto: "Breakfast", correta: true },
                { texto: "Coffee morning", correta: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Seed concluído. Login: aluno@exemplo.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
