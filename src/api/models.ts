import { Hono } from "jsr:@hono/hono";
import { BlankEnv, BlankSchema } from "jsr:@hono/hono/types";

function models(app: Hono<BlankEnv, BlankSchema, "/">) {
  app.get("/v1/models", (c) => {
    return c.json({
      data: [{
        "id": "gpt-4o-mini",
        "object": "model",
        "owned_by": "duckduckgo-chat-ai",
      }, {
        "id": "claude-3-haiku",
        "object": "model",
        "owned_by": "duckduckgo-chat-ai",
      }, {
        "id": "llama",
        "object": "model",
        "owned_by": "duckduckgo-chat-ai",
      }, {
        "id": "mixtral",
        "object": "model",
        "owned_by": "duckduckgo-chat-ai",
      }],
    });
  });
}

export { models };
