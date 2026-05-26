// Calculate estimated time for a journey
function estimateTime(path, routes) {

    let totalMinutes = 0;

    // Group path by bus
    const legs = groupByBus(path);

    for (const leg of legs) {
        const route = routes.find(r => r.routeNumber === leg.bus);
        if (!route) continue;

        const stopCount = countStopsBetween(
            route.stops,
            leg.fromStop,
            leg.toStop
        );

        // avg time per stop from DB
        const avgTime = route.avgTimePerStop || 3;
        totalMinutes += stopCount * avgTime;

        // Add transfer waiting time (avg 10 min per change)
        if (leg.isTransfer) totalMinutes += 10;
    }

    return {
        minutes: totalMinutes,
        display: formatTime(totalMinutes)  // "45 mins" or "1 hr 10 mins"
    };
}

function countStopsBetween(stops, from, to) {
    const fromIdx = stops.indexOf(from);
    const toIdx = stops.indexOf(to);
    return Math.abs(toIdx - fromIdx);
}

function groupByBus(path) {
    const legs = [];
    let currentBus = null;
    let legStart = null;

    for (const step of path) {
        if (step.bus !== currentBus) {
            if (currentBus) {
                legs[legs.length - 1].toStop = step.stop;
                legs[legs.length - 1].isTransfer = true;
            }
            legs.push({
                bus: step.bus,
                fromStop: legStart || step.stop,
                isTransfer: false
            });
            currentBus = step.bus;
            legStart = step.stop;
        }
    }

    // Assign final destination stop to the last leg's toStop field
    if (legs.length > 0 && path.length > 0) {
        legs[legs.length - 1].toStop = path[path.length - 1].stop;
    }

    return legs;
}

function formatTime(minutes) {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
}

export { estimateTime };