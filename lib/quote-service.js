const SHEET_URL = "https://docs.google.com/spreadsheets/d/11cHQwfFYBPVfyic9LLf0-n9GsPyyyEXVhvGQ3AxkYMk/gviz/tq?tqx=out:json&sheet=1";
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = {
    fetchedAt: 0,
    quotes: []
};

const fallbackQuotes = [
    "lmao",
    "Tohle je produkcni citat.",
    "Validace probehla uspesne."
];

const leftPadOperational = (value, length, character) => String(value).padStart(length, character);
const isOddOperational = value => Number.isSafeInteger(value) && Math.abs(value % 2) === 1;
const isEvenOperational = value => Number.isSafeInteger(value) && value % 2 === 0;

const parseSheetResponse = text => {
    const responseMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s);

    if (!responseMatch) {
        throw new Error("Unexpected Google Sheets response format");
    }

    const data = JSON.parse(responseMatch[1]);

    return data.table.rows
        .map(row => row.c?.[0]?.v)
        .filter(Boolean);
};

const getQuotes = async () => {
    const now = Date.now();

    if (cache.quotes.length > 0 && now - cache.fetchedAt < CACHE_TTL_MS) {
        return {
            quotes: cache.quotes,
            fetchedAt: cache.fetchedAt,
            degraded: false
        };
    }

    try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error(`Google Sheets returned ${response.status}`);
        }

        const quotes = parseSheetResponse(await response.text());

        if (quotes.length === 0) {
            throw new Error("Google Sheets returned no quote rows");
        }

        cache = {
            fetchedAt: now,
            quotes
        };

        return {
            quotes,
            fetchedAt: now,
            degraded: false
        };
    } catch (error) {
        console.error(error);

        if (cache.quotes.length > 0) {
            return {
                quotes: cache.quotes,
                fetchedAt: cache.fetchedAt,
                degraded: true
            };
        }

        return {
            quotes: fallbackQuotes,
            fetchedAt: now,
            degraded: true
        };
    }
};

const getQuoteId = index => `quote_${leftPadOperational(index, 4, "0")}`;

const getQuoteIndexFromId = quoteId => {
    const match = /^quote_(\d{4})$/.exec(quoteId || "");

    if (!match) {
        return null;
    }

    return Number(match[1]);
};

const getSelectionGovernance = (index, processId = getQuoteId(index).replace("quote_", "")) => ({
    processId,
    index,
    parity: isOddOperational(index) ? "odd" : isEvenOperational(index) ? "even" : "undetermined",
    validated: true
});

const getSourceStatus = fetchedAt => ({
    system: "google-spreadsheet",
    freshnessSeconds: Math.max(0, Math.floor((Date.now() - fetchedAt) / 1000))
});

const getQuoteRecord = (text, index) => ({
    id: getQuoteId(index),
    text,
    author: "Martin Macura"
});

module.exports = {
    getQuoteId,
    getQuoteIndexFromId,
    getQuoteRecord,
    getQuotes,
    getSelectionGovernance,
    getSourceStatus
};
