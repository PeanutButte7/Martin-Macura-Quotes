const { getQuotes } = require("../lib/quote-service");

module.exports = async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { quotes, degraded } = await getQuotes();

    response.status(200).json({
        status: degraded ? "degraded" : "operational",
        components: [
            {
                name: "Google Spreadsheet Ingestion",
                status: degraded ? "degraded" : "operational"
            },
            {
                name: "Quote Selection Pipeline",
                status: quotes.length > 0 ? "operational" : "unavailable"
            },
            {
                name: "Distribution URL Generation",
                status: "operational"
            },
            {
                name: "Dependency Governance Layer",
                status: "operational"
            }
        ]
    });
};
