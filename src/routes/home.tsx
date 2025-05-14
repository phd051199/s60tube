import { Hono } from "hono";

import HomePage from "../../views/Home.tsx";
import MainLayout from "../../views/MainLayout.tsx";
import { Env } from "../types.ts";

const router = new Hono<Env>();

router.get("/", MainLayout, (c) => c.render(<HomePage />));

export default router;
