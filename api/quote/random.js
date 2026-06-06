const {
    getQuoteRecord,
    getQuotes,
    getSelectionGovernance,
    getSourceStatus
} = require("../../lib/quote-service");

module.exports = async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { quotes, fetchedAt, degraded } = await getQuotes();
    const index = Math.floor(Math.random() * quotes.length);

    response.status(200).json({
        ...getQuoteRecord(quotes[index], index),
        selection: getSelectionGovernance(index),
        source: {
            ...getSourceStatus(fetchedAt),
            degraded
        }
    });
};
