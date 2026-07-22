import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "./lib/asyncHandler.js";
import { auth } from "./middlewares/auth.js";
import { authService } from "./services/auth.service.js";
import { userService } from "./services/user.service.js";
import { cursoService } from "./services/curso.service.js";
import { aulaService } from "./services/aula.service.js";
import { anotacaoService } from "./services/anotacao.service.js";
import { quizService } from "./services/quiz.service.js";
import { aiService } from "./services/ai.service.js";

export const router = Router();

const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const { nome, email, senha } = registerSchema.parse(req.body);
    const result = await authService.register(nome, email, senha);
    res.status(201).json(result);
  })
);

router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, senha } = loginSchema.parse(req.body);
    res.json(await authService.login(email, senha));
  })
);

router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await userService.stats(req.userId!));
  })
);

router.get(
  "/cursos",
  auth,
  asyncHandler(async (req, res) => {
    const busca = typeof req.query.busca === "string" ? req.query.busca : undefined;
    const categoria =
      typeof req.query.categoria === "string" && req.query.categoria !== "Todos"
        ? req.query.categoria
        : undefined;
    res.json(await cursoService.listar(busca, categoria));
  })
);

router.get(
  "/cursos/:id",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await cursoService.detalhe(req.params.id, req.userId!));
  })
);

router.post(
  "/cursos/:id/matricula",
  auth,
  asyncHandler(async (req, res) => {
    res.status(201).json(await cursoService.matricular(req.params.id, req.userId!));
  })
);

router.get(
  "/aulas/:id",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await aulaService.detalhe(req.params.id, req.userId!));
  })
);

const concluirSchema = z.object({ concluida: z.boolean().default(true) });

router.post(
  "/aulas/:id/concluir",
  auth,
  asyncHandler(async (req, res) => {
    const { concluida } = concluirSchema.parse(req.body);
    res.json(await aulaService.concluir(req.params.id, req.userId!, concluida));
  })
);

router.get(
  "/quiz/:id",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await quizService.obter(req.params.id));
  })
);

const anotacaoSchema = z.object({ texto: z.string().min(1) });

router.get(
  "/aulas/:id/anotacoes",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await anotacaoService.listar(req.params.id, req.userId!));
  })
);

router.post(
  "/aulas/:id/anotacoes",
  auth,
  asyncHandler(async (req, res) => {
    const { texto } = anotacaoSchema.parse(req.body);
    res.status(201).json(await anotacaoService.criar(req.params.id, req.userId!, texto));
  })
);

router.put(
  "/anotacoes/:id",
  auth,
  asyncHandler(async (req, res) => {
    const { texto } = anotacaoSchema.parse(req.body);
    res.json(await anotacaoService.atualizar(req.params.id, req.userId!, texto));
  })
);

router.delete(
  "/anotacoes/:id",
  auth,
  asyncHandler(async (req, res) => {
    await anotacaoService.excluir(req.params.id, req.userId!);
    res.status(204).send();
  })
);

const tentativaSchema = z.object({
  respostas: z.record(z.string(), z.string()),
});

router.post(
  "/quiz/:id/tentativa",
  auth,
  asyncHandler(async (req, res) => {
    const { respostas } = tentativaSchema.parse(req.body);
    res.json(await quizService.tentar(req.params.id, req.userId!, respostas));
  })
);

const corrigirSchema = z.object({ frase: z.string().min(1).max(500) });
const explicarSchema = z.object({ pergunta: z.string().min(1).max(500) });
const exerciciosSchema = z.object({
  tema: z.string().min(1).max(120),
  nivel: z.string().default("A1"),
  quantidade: z.number().int().min(1).max(10).default(3),
});
const tutorSchema = z.object({
  mensagens: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1)
    .max(20),
});

router.post(
  "/ai/corrigir",
  auth,
  asyncHandler(async (req, res) => {
    const { frase } = corrigirSchema.parse(req.body);
    res.json(await aiService.corrigirFrase(frase));
  })
);

router.post(
  "/ai/explicar",
  auth,
  asyncHandler(async (req, res) => {
    const { pergunta } = explicarSchema.parse(req.body);
    res.json(await aiService.explicarDuvida(pergunta));
  })
);

router.post(
  "/ai/exercicios",
  auth,
  asyncHandler(async (req, res) => {
    const { tema, nivel, quantidade } = exerciciosSchema.parse(req.body);
    res.json(await aiService.gerarExercicios(tema, nivel, quantidade));
  })
);

router.post(
  "/ai/tutor",
  auth,
  asyncHandler(async (req, res) => {
    const { mensagens } = tutorSchema.parse(req.body);
    res.json(await aiService.tutor(mensagens));
  })
);
