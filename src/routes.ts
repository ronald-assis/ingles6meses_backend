import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "./lib/asyncHandler.js";
import { auth } from "./middlewares/auth.js";
import { authService } from "./services/auth.service.js";
import { userService } from "./services/user.service.js";
import { cursoService } from "./services/curso.service.js";
import { aulaService } from "./services/aula.service.js";
import { quizService } from "./services/quiz.service.js";

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
