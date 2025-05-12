import { Hono } from "hono";

import HomePage from "../../views/Home.tsx";
import MainLayout from "../../views/MainLayout.tsx";

const router = new Hono();

router.get("/", MainLayout, (c) => c.render(<HomePage />));

export default router;
