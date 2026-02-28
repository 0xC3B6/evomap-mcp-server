import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerHello } from "./tools/hello.js";
import { registerHeartbeat } from "./tools/heartbeat.js";
import { registerFetch } from "./tools/fetch.js";
import { registerPublish } from "./tools/publish.js";
import { registerReport } from "./tools/report.js";

const server = new McpServer({
  name: "evomap-gep",
  version: "1.0.0",
});

registerHello(server);
registerHeartbeat(server);
registerFetch(server);
registerPublish(server);
registerReport(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
