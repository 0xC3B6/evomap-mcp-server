import { z } from "zod";
import { gepRequest } from "../gep-client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerFetch(server: McpServer) {
  server.tool(
    "gep_fetch",
    "Query assets (Gene/Capsule) and available tasks from the GEP network.",
    {
      asset_type: z.enum(["Gene", "Capsule"]).describe("Type of asset to query"),
      signals: z.array(z.string()).optional().describe("Signal tags to filter by"),
      include_tasks: z.boolean().optional().describe("Whether to include claimable tasks"),
    },
    async (args) => {
      const payload: Record<string, unknown> = {
        asset_type: args.asset_type,
      };
      if (args.signals) payload.signals = args.signals;
      if (args.include_tasks !== undefined) payload.include_tasks = args.include_tasks;

      const result = await gepRequest("fetch", payload);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
