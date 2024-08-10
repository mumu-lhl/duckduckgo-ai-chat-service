# Duckduckgo AI Chat Service

[English](./README.md) | 中文

为 [Duckduckgo AI Chat](https://duckduckgo.com/aichat) 提供兼容 OpenAI 的 API，可以免费使用 gpt-4o-mini。

## 部署

### Deno

```sh
# 直接运行
deno run --allow-env --allow-net --unstable https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts

# 安装后运行
deno install -g --allow-env --allow-net --unstable -n duckduckgo-ai-chat-service https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts
duckduckgo-ai-chat-service
```

### Deno Deploy

#### 命令行

```sh
git clone https://github.com/mumu-lhl/duckduckgo-ai-chat-service --depth 1
deno install -A jsr:@deno/deployctl
deployctl deploy
```

#### Web

fork 本项目，访问 <https://dash.deno.com>，登录后点击创建新项目。

### Docker

```sh
docker run -d mumulhl/duckduckgo-ai-chat-service
```

## 配置

采用环境变量进行配置：

* TOKEN - 限制可以访问 API 的 token，如果不填，任意的 token 都可以访问 API
* LIMIT - 每秒请求速率限制，默认为 2
* CLEAN_CACHE_CRON - 每个多少小时清理缓存，默认为 1

## 使用

将需要用到 OpenAI API 的地方的 base url 改成部署得到的即可。
