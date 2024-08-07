import { Hono } from "jsr:@hono/hono";
import { SSEStreamingApi, streamSSE } from "jsr:@hono/hono/streaming";
import { bearerAuth } from "jsr:@hono/hono/bearer-auth";
import { Chat, initChat, Model } from "jsr:@mumulhl/duckduckgo-ai-chat";
import { events } from "jsr:@lukeed/fetch-event-stream";
import { rateLimiter } from "npm:hono-rate-limiter";

type Messages = { content: string; role: "user" | "assistant" | "system" }[];

type MessageData = {
  id: string;
  model: string;
  created: number;
  role?: "assistant";
  message?: string;
};

class DataStream {
  id: string;
  model: string;
  created: number;
  choices: {
    delta: { content?: string; role?: "assistant" };
  }[];

  constructor(messageData: MessageData) {
    this.id = messageData.id;
    this.model = messageData.model;
    this.created = messageData.created;
    this.choices = [{ delta: { content: messageData.message } }];
    if (messageData.role === "assistant") {
      this.choices[0].delta.role = "assistant";
    }
  }
}

const app = new Hono();

const chatCache = new Map<string, Chat>();

const token = Deno.env.get("TOKEN");
if (token) {
  app.use("/v1/*", bearerAuth({ token }));
}

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

function setCache(chat: Chat) {
  const messages_only_content = chat.messages.map((m) => m.content);
  const stringify = JSON.stringify(messages_only_content);
  chatCache.set(stringify, chat);
}

function setRedoCache(chat: Chat) {
  const chatRedo = structuredClone(chat);
  chatRedo.messages.pop();
  chatRedo.messages.pop();
  chatRedo.newVqd = chatRedo.oldVqd;
  setCache(chatRedo);
}

function findCache(messages: Messages): Chat | undefined {
  const messages_only_content = messages.map((m) => m.content);
  const stringifyRedo = JSON.stringify(messages_only_content);
  let chat = chatCache.get(stringifyRedo);
  if (chat) {
    // redo
    return chat;
  } else {
    messages_only_content.pop();
    const stringify = JSON.stringify(messages_only_content);
    chat = chatCache.get(stringify);
    removeCache(messages_only_content);

    messages_only_content.pop();
    messages_only_content.pop();
    removeCache(messages_only_content);

    return chat;
  }
}

function removeCache(messages_only_content: string[]) {
  const stringify = JSON.stringify(messages_only_content);
  chatCache.delete(stringify);
}

async function fetchFull(chat: Chat, messages: Messages) {
  let message: Response | undefined;
  let messageData: MessageData | undefined;

  for (let i = 0; i < messages.length; i += 2) {
    let text = ""; // Reset text at the beginning of each loop iteration

    const content = messages[i].content;
    message = await chat.fetch(content);

    const stream = events(message as Response);
    for await (const event of stream) {
      if (!event.data || event.data === "[DONE]") {
        break; // End the loop if there's no data or if the end message is received
      }
      try {
        messageData = JSON.parse(event.data) as MessageData;
        if (messageData.message === undefined) {
          break;
        } else {
          text += messageData.message; // Accumulate the message content
        }
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        break; // Stop if parsing fails
      }
    }

    const newVqd = message.headers.get("x-vqd-4") as string;
    chat.oldVqd = chat.newVqd;
    chat.newVqd = newVqd;

    chat.messages.push({ content: text, role: "assistant" });
  }

  const { id, created, model } = messageData as MessageData;

  return { id, created, model, text };
}

function fetchStream(chat: Chat, messages: Messages) {
  return async (s: SSEStreamingApi) => {
    for (let i = 0; i < messages.length; i += 2) {
      let text = ""; // Reset text at the beginning of each loop iteration
      let messageData: MessageData | undefined;

      const content = messages[i].content;
      const message = await chat.fetch(content);

      const stream = events(message as Response);

      for await (const event of stream) {
        if (!event.data || event.data === "[DONE]") {
          break; // End the loop if there's no data or if the end message is received
        }

        try {
          messageData = JSON.parse(event.data);
          if (messageData.message === undefined) {
            break;
          } else {
            text += messageData.message; // Accumulate the message content
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          break; // Stop if parsing fails
        }

        if (i === messages.length - 1) {
          const dataStream = new DataStream(messageData);
          await s.writeSSE({
            data: JSON.stringify(dataStream),
          });
        }
      }

      const newVqd = message.headers.get("x-vqd-4") as string;
      chat.oldVqd = chat.newVqd;
      chat.newVqd = newVqd;

      chat.messages.push({ content: text, role: "assistant" });
    }

    if (chat.messages.length >= 4) {
      setCache(chat);
      setRedoCache(chat);
    }
  };
}

app.post("/v1/chat/completions", async (c) => {
  const body = await c.req.json();
  const stream: boolean = body.stream;
  const model_name: Model = body.model;
  let messages: Messages = body.messages;

  if (messages[0].role === "system") {
    messages[1].content = messages[0].content + messages[1].content;
    messages = messages.slice(1);
  }

  let chat = findCache(messages);
  if (chat === undefined) {
    chat = await initChat(model_name);
  } else {
    messages = messages.slice(-1);
  }

  if (stream) {
    return streamSSE(c, fetchStream(chat, messages));
  }

  const { id, model, created, text } = await fetchFull(chat, messages);

  if (chat.messages.length >= 4) {
    setCache(chat);
    setRedoCache(chat);
  }

  return c.json({
    id,
    model,
    created,
    choices: [{
      message: { role: "assistant", content: text },
    }],
  });
});

const cron_var = Deno.env.get("CLEAN_CACHE_CRON");
let cron = 1;
if (cron_var !== undefined) {
  cron = Number(cron_var);
}
Deno.cron("Clean cache", { hour: { every: cron } }, () => {
  chatCache.clear();
});

Deno.serve(app.fetch);
