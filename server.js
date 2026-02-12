import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { createBareServer } from "@tomphttp/bare-server-node";
import wisp from "wisp-server-node";

const publicPath = fileURLToPath(new URL("./public/", import.meta.url));

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        handler(req, res);
      })
      .on("upgrade", (req, socket, head) => {
        if (req.url.endsWith("/wisp/")) {
          wisp.routeRequest(req, socket, head);
        }
      });
  },
});

// Serve public files
fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
});

// Serve Scramjet
fastify.register(fastifyStatic, {
  root: scramjetPath,
  prefix: "/scram/",
  decorateReply: false,
});

// Serve BareMux
fastify.register(fastifyStatic, {
  root: baremuxPath,
  prefix: "/baremux/",
  decorateReply: false,
});

// Serve Epoxy
fastify.register(fastifyStatic, {
  root: epoxyPath,
  prefix: "/epoxy/",
  decorateReply: false,
});

// 404 fallback
fastify.setNotFoundHandler((req, reply) => {
  return reply.code(404).type('text/html').sendFile('404.html');
});

fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("🎮 Game Launcher is LIVE!");
  console.log("   With: Scramjet + BareMux + WISP + Epoxy");
  console.log(`   Local: http://localhost:${address.port}`);
  console.log(`   Network: http://${hostname()}:${address.port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("Shutting down gracefully...");
  fastify.close();
  process.exit(0);
}

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

fastify.listen({
  port: port,
  host: "0.0.0.0",
});
