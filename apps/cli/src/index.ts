#!/usr/bin/env node
import { Command } from "commander";
import { io } from "socket.io-client";
import type { TunnelRelayMessage } from "@hookbridge/types";

const program = new Command();

program
  .name("hookbridge")
  .description("HookBridge local tunnel agent")
  .version("0.1.0");

program
  .command("listen")
  .description("Relay incoming webhooks to a local port")
  .argument("<port>", "local port to forward to")
  .option("-s, --server <url>", "HookBridge server URL", process.env.HOOKBRIDGE_SERVER ?? "http://localhost:4000")
  .option("-e, --endpoint <id>", "endpoint id to subscribe to")
  .action((port: string, opts: { server: string; endpoint?: string }) => {
    const socket = io(opts.server, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log(`Connected to ${opts.server}; forwarding to http://localhost:${port}`);
      if (opts.endpoint) socket.emit("tunnel:subscribe", { endpointId: opts.endpoint });
    });

    socket.on("tunnel:relay", (msg: TunnelRelayMessage) => {
      console.log(`→ ${msg.method} ${msg.path} (${msg.eventId})`);
    });

    socket.on("disconnect", () => console.log("Disconnected"));
  });

program.parse();
