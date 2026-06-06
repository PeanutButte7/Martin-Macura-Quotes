#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const BASE_URL = process.env.QUOTE_API_URL || "https://martin-macura-quotes.vercel.app";

async function apiCall(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API returned ${res.status}: ${body}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "martin-macura-quotes",
  version: "1.0.0",
});

server.tool(
  "get_random_quote",
  "Get a random Martin Macura quote",
  {},
  async () => {
    const data = await apiCall("/api/quote/random");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_quote",
  "Get a specific Martin Macura quote by ID (e.g. quote_0007)",
  { quoteId: z.string().regex(/^quote_\d{4}$/).describe("Quote ID in format quote_NNNN") },
  async ({ quoteId }) => {
    try {
      const data = await apiCall(`/api/quote/${quoteId}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Quote not found: ${quoteId}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_health",
  "Check the health status of the Martin Macura Quotes service",
  {},
  async () => {
    const data = await apiCall("/api/health");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_uptime",
  "Get uptime and latency metrics for the Martin Macura Quotes service",
  {},
  async () => {
    const data = await apiCall("/api/status/uptime");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_selection_governance",
  "Inspect the governance metadata for a quote selection process",
  { processId: z.string().regex(/^\d{4}$/).describe("Four-digit process ID (e.g. 0007)") },
  async ({ processId }) => {
    const data = await apiCall(`/api/governance/selection/${processId}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
