import { Chat, initChat, ModelAlias } from "jsr:@mumulhl/duckduckgo-ai-chat@3.3.0";
import { events } from "jsr:@lukeed/fetch-event-stream";

import { Hono } from "jsr:@hono/hono";
import { BlankEnv, BlankSchema } from "jsr:@hono/hono/types";
import { SSEStreamingApi, streamSSE } from "jsr:@hono/hono/streaming";

import * as cache from "./../cache.ts";

type Messages = { content: string; role: "user" | "assistant" | "system" | "developer" }[];

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

async function fetchFull(chat: Chat, messages: Messages) {
  let message: Response | undefined;
  let text: string = ""; // Initialize text
  let messageData: MessageData | undefined;

  for (let i = 0; i < messages.length; i += 2) {
    text = ""; // Reset the text at each loop to avoid stacking
    const content = messages[i].content;
    message = await chat.fetch(content);

    const stream = events(message as Response);
    for await (const event of stream) {
      if (!event.data || event.data === "[DONE]") {
        break; // End the loop if there's no data or received end message
      }

      try {
        messageData = JSON.parse(event.data) as MessageData;
        if (messageData.message === undefined) {
          break;
        } else {
          text += messageData.message; // Append message content
        }
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        break; // End the loop on parse error
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
      let text = ""; // Reset the text at each loop to avoid stacking
      let messageData: MessageData | undefined;

      const content = messages[i].content;
      const message = await chat.fetch(content);

      const stream = events(message as Response);

      for await (const event of stream) {
        if (!event.data || event.data === "[DONE]") {
          break; // End the loop if there's no data or received end message
        }

        try {
          messageData = JSON.parse(event.data);
          if (messageData?.message === undefined) {
            break;
          } else {
            text += messageData.message; // Append message content
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          break; // End the loop on parse error
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
      cache.setCache(chat);
      cache.setRedoCache(chat);
    }
  };
}

function chat(app: Hono<BlankEnv, BlankSchema, "/">) {
  app.post("/v1/chat/completions", async (c) => {
    const body = await c.req.json();
    const stream: boolean = body.stream;
    const model_name: ModelAlias = body.model;
    let messages: Messages = body.messages;

    if (messages[0].role === "system" || messages[0].role === "developer") {
      messages[1].content = messages[0].content + messages[1].content;
      messages = messages.slice(1);
    }

    let chat = cache.findCache(messages);
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
      cache.setCache(chat);
      cache.setRedoCache(chat);
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
}

export { chat };
