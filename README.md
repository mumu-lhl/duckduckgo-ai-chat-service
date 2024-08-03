# Duckduckgo AI Chat Service

English | [中文](./README_CN.md)

Use [Duckduckgo AI Chat](https://duckduckgo.com/aichat) to provide an OpenAI-compatible API that can be used for free with gpt-4o-mini.

## Deploy

### Deno

```sh
# Run directly
deno run --allow-env --allow-net https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts

# Run after installation
deno install -g --allow-env --allow-net -n duckduckgo-ai-chat-service https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts
duckduckgo-ai-chat-service
```

### Deno Deploy

```sh
git clone https://github.com/mumu-lhl/duckduckgo-ai-chat-service --depth 1
deno install -A jsr:@deno/deployctl
deployctl deploy
```
