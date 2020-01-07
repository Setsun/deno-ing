import { serve } from "http/server.ts";

const body = new TextEncoder().encode("Hello World\n");

for await (const req of serve(":8000")) {
  req.respond({ body });
}
