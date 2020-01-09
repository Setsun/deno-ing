import { Cookie, getCookies, setCookie } from "https://deno.land/std/http/cookie.ts";
import { serve, ServerRequest, Response } from "https://deno.land/std/http/server.ts";
import { blue, green, underline, cyan } from "https://deno.land/std/fmt/colors.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

// setup logger
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),

    file: new log.handlers.FileHandler("WARNING", {
      filename: './.logs/server.log',
      formatter: "[{levelName}] {msg}"
    })
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"]
    },

    tasks: {
      level: "ERROR",
      handlers: ["console"]
    }
  }
});

const port = 8800;

log.info(`Starting server on port ${port}`);

function requestLogLine(request: ServerRequest) {
  const now = cyan(Date.now().toString());
  const headers = JSON.stringify(request.headers);
  const cookies = JSON.stringify(getCookies(request));
  const method = green(request.method);
  const url = underline(blue(request.url));

  log.debug(`[${now}]: METHOD: ${method} URL: ${url} HEADERS: ${headers} COOKIES: ${cookies}`);
}

for await (const request of serve(`:${port}`)) {
  const cookies = getCookies(request);
  const params = new URLSearchParams(request.url);

  // server logs
  requestLogLine(request);

  // prepare the response
  const response: Response = {};

  // modify the cookie
  const visitorId = cookies['visitorId'] || v4.generate();
  const newCookie: Cookie = { name: 'visitorId', value: visitorId };
  setCookie(response, newCookie);

  const data = {
    url: request.url,
    params,
    cookies
  };

  // set response headers, and prepare final response
  response.headers.set('Content-Type', contentType('json'));
  response.body = new TextEncoder().encode(JSON.stringify(data));
  response.status = 200;

  request.respond(response);
}
