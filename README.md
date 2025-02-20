# Duckduckgo AI Chat Service

![Docker Pulls](https://img.shields.io/docker/pulls/mumulhl/duckduckgo-ai-chat-service)
![GitHub Tag](https://img.shields.io/github/v/tag/mumu-lhl/duckduckgo-ai-chat-service)

English | [中文](./README_CN.md)

Provide an OpenAI-compatible API for [Duckduckgo AI Chat](https://duckduckgo.com/aichat) that can be used for free with o3-mini, gpt-4o-mini, claude-3-haiku, llama3.3...

## Deploy

### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mumu-lhl/duckduckgo-ai-chat-service)

### Docker

```sh
docker run -d mumulhl/duckduckgo-ai-chat-service
```

### Deno Deploy

#### Web

Fork this project, then visit <https://dash.deno.com> and create new project after loging in.

#### Command line

```sh
git clone https://github.com/mumu-lhl/duckduckgo-ai-chat-service --depth 1
deno install -A jsr:@deno/deployctl
deployctl deploy
```

### Deno

```sh
# Run directly
deno run --allow-env --allow-net --unstable-cron https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts

# Run after installation
deno install -g --allow-env --allow-net --unstable-cron -n duckduckgo-ai-chat-service https://raw.githubusercontent.com/mumu-lhl/duckduckgo-ai-chat-service/main/main.ts
duckduckgo-ai-chat-service
```

## Configuration

Configuration using environment variables:

* TOKEN - Limit the tokens that can access the API, if you don't fill in, any token can access the API.
* LIMIT - limit the request rate per second, default is 2
* CLEAN_CACHE_CRON - how many hours to clean up the cache, default is 1

## Usage

Just change the base url of the place where you need to use the OpenAI API to the one you deployed.
