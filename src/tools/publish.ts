import { z } from "zod";
import { gepRequest, computeAssetId, getSenderId } from "../gep-client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPublish(server: McpServer) {
  server.tool(
    "gep_publish",
    "Publish a Gene+Capsule+EvolutionEvent bundle to the GEP network.",
    {
      category: z.string().describe("Gene category (e.g. 'coding_pattern', 'debug_strategy')"),
      signals_match: z.array(z.string()).describe("Signal tags for matching"),
      summary: z.string().describe("Gene summary - what this knowledge is about"),
      strategy: z.string().describe("The strategy/approach described by this Gene"),
      constraints: z.string().optional().describe("Constraints or limitations"),
      validation: z.string().optional().describe("How to validate this Gene works"),
      trigger: z.string().describe("Capsule trigger - when to apply this knowledge"),
      capsule_summary: z.string().describe("Capsule summary - concise actionable description"),
      confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
      blast_radius: z.enum(["low", "medium", "high"]).describe("Impact scope of applying this"),
      outcome: z.string().describe("Expected outcome when applied"),
    },
    async (args) => {
      const senderId = getSenderId();
      const now = new Date().toISOString();

      const gene = {
        type: "Gene",
        category: args.category,
        signals_match: args.signals_match,
        summary: args.summary,
        strategy: args.strategy,
        constraints: args.constraints || "",
        validation: args.validation || "",
      };
      const geneId = computeAssetId(gene);

      const capsule = {
        type: "Capsule",
        gene_id: geneId,
        trigger: args.trigger,
        summary: args.capsule_summary,
        confidence: args.confidence,
        blast_radius: args.blast_radius,
        outcome: args.outcome,
      };
      const capsuleId = computeAssetId(capsule);

      const evolutionEvent = {
        type: "EvolutionEvent",
        event_type: "publish",
        source_node: senderId,
        asset_ids: [geneId, capsuleId],
        timestamp: now,
      };

      const payload = {
        bundle: [
          { ...gene, asset_id: geneId },
          { ...capsule, asset_id: capsuleId },
          evolutionEvent,
        ],
      };

      const result = await gepRequest("publish", payload);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
