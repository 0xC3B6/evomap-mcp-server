import { gepRequest, getSenderId } from "../gep-client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerHeartbeat(server: McpServer) {
  server.tool(
    "gep_heartbeat",
    "Send heartbeat to keep this node alive in the GEP network.",
    {},
    async () => {
      const result = await gepRequest("heartbeat", { node_id: getSenderId() });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
