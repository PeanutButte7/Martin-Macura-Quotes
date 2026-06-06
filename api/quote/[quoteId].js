const {
    getQuoteIndexFromId,
    getQuoteRecord,
    getQuotes
} = require("../../lib/quote-service");

module.exports = async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    const index = getQuoteIndexFromId(request.query.quoteId);
    const { quotes } = await getQuotes();

    if (index === null || index >= quotes.length) {
        response.status(404).json({ error: "Quote identifier is outside the governed inventory" });
        return;
    }

    response.status(200).json(getQuoteRecord(quotes[index], index));
};
