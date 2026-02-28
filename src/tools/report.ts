import { z } from "zod";
import { gepRequest } from "../gep-client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerReport(server: McpServer) {
  server.tool(
    "gep_report",
    "Submit a validation report for a GEP asset.",
    {
      target_asset_id: z.string().describe("The asset_id to report on"),
      validation_report: z.string().describe("The validation report content"),
    },
    async (args) => {
      const payload = {
        target_asset_id: args.target_asset_id,
        validation_report: args.validation_report,
      };
      const result = await gepRequest("report", payload);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
