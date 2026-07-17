import { Hono } from "hono";
import { prisma } from "../../utils/prisma.js";

const summaryRoute = new Hono();

summaryRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const summary = await prisma.summary.findUnique({ where: { id } });
  if (!summary) return c.json({ error: "Not found" }, 404);
  return c.json(summary);
});

export default summaryRoute;
