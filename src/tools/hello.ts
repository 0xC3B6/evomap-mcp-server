import { z } from "zod";
import { gepRequest, getSenderId } from "../gep-client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerHello(server: McpServer) {
  server.tool(
    "gep_hello",
    "Register this node with the EvoMap GEP network. Returns claim_code and credits.",
    {
      capabilities: z.array(z.string()).optional().describe("List of capabilities this node offers"),
      env_fingerprint: z.string().optional().describe("Environment fingerprint"),
      referrer: z.string().optional().describe("Referrer node ID"),
    },
    async (args) => {
      const payload: Record<string, unknown> = {
        node_id: getSenderId(),
      };
      if (args.capabilities) payload.capabilities = args.capabilities;
      if (args.env_fingerprint) payload.env_fingerprint = args.env_fingerprint;
      if (args.referrer) payload.referrer = args.referrer;

      const result = await gepRequest("hello", payload);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
