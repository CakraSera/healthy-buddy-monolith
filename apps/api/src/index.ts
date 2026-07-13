import { serve } from "@hono/node-server";
import { Hono } from "hono";
import chatRoute from "./modules/chat/route.js";
import { cors } from "hono/cors";

const app = new Hono();
app.use(cors());

app.route("chat", chatRoute);

// type utillity -? helper
export type AppType = typeof app;

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
