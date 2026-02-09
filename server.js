import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const publicPath = fileURLToPath(new URL("./public/", import.meta.url));

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        // Enable iframe embedding and CORS
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        handler(req, res);
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

// 404 fallback
fastify.setNotFoundHandler((req, reply) => {
  return reply.code(404).type('text/html').sendFile('404.html');
});

fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("🎮 Game Launcher (Scramjet) is running!");
  console.log(`   http://localhost:${address.port}`);
  console.log(`   http://${hostname()}:${address.port}`);
  console.log(
    `   http://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`
  );
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
