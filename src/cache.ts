import { Chat } from "jsr:@mumulhl/duckduckgo-ai-chat@3";

type Messages = { content: string; role: "user" | "assistant" | "system" }[];

const chatCache = new Map<string, Chat>();

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

export { chatCache, findCache, setCache, setRedoCache };
