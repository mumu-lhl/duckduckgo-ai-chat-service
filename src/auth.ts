import { Hono } from "jsr:@hono/hono";
import { bearerAuth } from "jsr:@hono/hono/bearer-auth";
import { BlankEnv, BlankSchema } from "jsr:@hono/hono/types";

function auth(app: Hono<BlankEnv, BlankSchema, "/">) {
  const token = Deno.env.get("TOKEN");
  if (token) {
    app.use("/v1/*", bearerAuth({ token }));
  }
}

export { auth };
