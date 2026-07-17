import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import chatRoute from "./modules/chat/route.js";
import summaryRoute from "./modules/summary/route.js";

const app = new Hono();
app.use(cors());

app.route("chat", chatRoute);
app.route("summary", summaryRoute);

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
