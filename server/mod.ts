import { Cookie, getCookies, delCookie, setCookie } from "https://deno.land/std/http/cookie.ts";
import { serve, ServerRequest, Response } from "https://deno.land/std/http/server.ts";
import { blue, green, red, yellow, underline, white, cyan } from "https://deno.land/std/fmt/colors.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

// setup logs

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

const debugWithTime = (text: string) =>
  log.debug(`${cyan(Date.now().toString())} ${text}`);

for await (const request of serve(`:${port}`)) {
  const { method, url } = request;
  const cookies = getCookies(request);
  const params = new URLSearchParams(url);
  const timestamp = Date.now();

  // server logs
  debugWithTime(`${green(method)}`);

  log.debug(green(JSON.stringify(request.headers)));

  log.debug(JSON.stringify(cookies));
  log.debug(JSON.stringify(params));

  // prepare the response
  const response: Response = {};

  // modify the cookie
  const visitorId = cookies['visitorId'] || v4.generate();
  const newCookie: Cookie = { name: 'visitorId', value: visitorId };
  setCookie(response, newCookie);

  log.debug(JSON.stringify(getCookies(request)));

  log.info(v4.generate());

  const data = {
    url,
    params,
    cookies
  };

  // set response headers, and prepare final response
  response.headers.set('Content-Type', contentType('json'));
  response.body = new TextEncoder().encode(JSON.stringify(data));
  response.status = 200;

  request.respond(response);
}
