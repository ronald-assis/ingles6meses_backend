import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./lib/env.js";
import { router } from "./routes.js";
import { errorHandler } from "./middlewares/error.js";
import { openapiSpec } from "./docs/openapi.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get("/docs.json", (_req, res) => res.json(openapiSpec));

app.use("/api/v1", router);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API em http://localhost:${env.port}`);
  console.log(`Docs em http://localhost:${env.port}/docs`);
});
