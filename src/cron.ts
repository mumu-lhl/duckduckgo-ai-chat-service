import * as cache from "./cache.ts";

function cron() {
  const cron_var = Deno.env.get("CLEAN_CACHE_CRON");
  let cron = 1;
  if (cron_var !== undefined) {
    cron = Number(cron_var);
  }
  Deno.cron("Clean cache", { hour: { every: cron } }, () => {
    cache.chatCache.clear();
  });
}

export { cron };
