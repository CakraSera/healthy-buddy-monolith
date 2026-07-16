import { Hono } from "hono";
import { getCoachResponse } from "./service.js";

const chatRoute = new Hono();

chatRoute.get("/", (c) => {
  return c.json({ message: "Hello from the chat module!" });
});

function lastUserText(messages: any[]): string {
  const last = messages?.at(-1);
  if (!last) return "";
  if (typeof last.content === "string") return last.content;
  return (last.content ?? [])
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join(" ");
}
chatRoute.post("/", async (c) => {
  const body = await c.req.json();

  const sessionId: string = body?.metadata?.sessionId ?? "anonymous";
  const userInput = lastUserText(body?.messages ?? []);

  if (!userInput) return c.json({ error: "Empty message" }, 400);

  return await getCoachResponse(sessionId, userInput);
});
export default chatRoute;
