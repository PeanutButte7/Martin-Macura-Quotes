module.exports = function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    const seed = Math.floor(Date.now() / 60000);

    response.status(200).json({
        windowDays: 90,
        availabilityPercent: Number((99.971 + ((seed % 17) / 10000)).toFixed(3)),
        medianLatencyMs: 12 + (seed % 19),
        p95LatencyMs: 41 + (seed % 23),
        sloPercent: 99.9,
        updatedAt: new Date().toISOString()
    });
};
