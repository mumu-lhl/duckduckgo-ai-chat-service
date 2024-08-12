import { Hono } from "jsr:@hono/hono";
import { BlankEnv, BlankSchema } from "jsr:@hono/hono/types";

import { rateLimiter } from "npm:hono-rate-limiter";

function limit(app: Hono<BlankEnv, BlankSchema, "/">) {
  const limit_var = Deno.env.get("LIMIT");
  let limit = 2;
  if (limit_var !== undefined) {
    limit = Number(limit_var);
  }
  const limiter = rateLimiter({
    windowMs: 1000,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (_) => "1",
  });

  app.use("/v1/*", limiter);
}

export { limit };
