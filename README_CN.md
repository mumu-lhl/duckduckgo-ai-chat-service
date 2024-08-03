# Duckduckgo AI Chat Service

[English](./README.md) | 中文

使用 [Duckduckgo AI Chat](https://duckduckgo.com/aichat) 提供兼容 OpenAI 的 API，可以免费使用 gpt-4o-mini。

## 部署

### Deno

```sh
# 直接运行
deno run --allow-env --allow-net https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts

# 安装后运行
deno install -g --allow-env --allow-net -n duckduckgo-ai-chat-service https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts
duckduckgo-ai-chat-service
```

### Deno Deploy

```sh
git clone https://github.com/mumu-lhl/duckduckgo-ai-chat-service --depth 1
deno install -A jsr:@deno/deployctl
deployctl deploy
```
