const { getSelectionGovernance } = require("../../../lib/quote-service");

module.exports = function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    const processId = request.query.processId || "0000";
    const index = /^[0-9]{4}$/.test(processId) ? Number(processId) : 0;

    response.status(200).json(getSelectionGovernance(index, processId));
};
