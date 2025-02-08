import { Hono } from "jsr:@hono/hono";
import { BlankEnv, BlankSchema } from "jsr:@hono/hono/types";

function models(app: Hono<BlankEnv, BlankSchema, "/">) {
  app.get("/v1/models", (c) => {
    return c.json({
      data: [{
        "id": "gpt-4o-mini",
        "object": "model",
        "owned_by": "OpenAI",
      }, {
        "id": "claude-3-haiku",
        "object": "model",
        "owned_by": "Anthropic",
      }, {
        "id": "llama",
        "object": "model",
        "owned_by": "Meta",
      }, {
        "id": "mixtral",
        "object": "model",
        "owned_by": "Mixtral",
      }, {
        "id": "o3-mini",
        "object": "model",
        "owned_by": "OpenAI",
      }],
    });
  });
}

export { models };
