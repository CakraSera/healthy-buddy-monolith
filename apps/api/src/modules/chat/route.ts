import { Hono } from "hono";
import { getCoachResponse } from "./service.js";

const chatRoute = new Hono();

chatRoute.get("/", (c) => {
  return c.json({ message: "Hello from the chat module!" });
});

chatRoute.post("/", async (c) => {
  const body = await c.req.json();
  const result = await getCoachResponse(body.messages);
  return result;
});
export default chatRoute;
