function buildGraph(routes) {
    const graph = {};

    for (const route of routes) {
        const stops = route.stops;
        for (let i = 0; i < stops.length; i++) {
            if (!graph[stops[i]]) {
                graph[stops[i]] = [];
            }
            for (let j = 0; j < stops.length; j++) {
                if (i !== j) {
                    graph[stops[i]].push({
                        bus: route.routeNumber,
                        stop: stops[j],
                        distance: j - i
                    })
                }
            }
        }
    }
    return graph;
}

function findJourney(source, destination, routes) {
    const graph = buildGraph(routes);
    const results = { direct: [], oneChange: [], twoChange: [] };

    const queue = [{
        stop: source,
        busUsed: null,
        changes: 0,
        path: []
    }]

    const visited = new Set();

    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr.changes > 2) continue;

        const stateKey = `${curr.stop}-${curr.changes}-${curr.busUsed}`;
        if (visited.has(stateKey)) continue;
        visited.add(stateKey);

        if (curr.stop === destination) {
            if (curr.changes === 1) {
                results.direct.push(curr.path)
            }
            else if (curr.changes === 2) {
                results.oneChange.push(curr.path)
            }
            else if (curr.changes === 3) {
                results.twoChange.push(curr.path)
            }
            continue;
        }

        const neighbours = graph[curr.stop] || [];
        for (const { bus, stop } of neighbours) {
            const isChange = curr.busUsed && bus != curr.busUsed;
            queue.push({
                stop,
                busUsed: bus,
                changes: curr.changes + (isChange ? 1 : 0) + (curr.busUsed ? 0 : 1),
                path: [...curr.path, { bus, stop }]
            })
        }
    }

    return results;
}

module.exports = { findJourney };