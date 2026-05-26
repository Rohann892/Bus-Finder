function findJourney(source, destination, routes) {
    const results = { direct: [], oneChange: [], twoChange: [] };
    const limit = 15; // Limit results per category to avoid overwhelming the response

    // 1. Build an index of routes by stop name for fast lookup
    const routesByStop = {};
    for (const route of routes) {
        if (!route.stops) continue;
        for (const stop of route.stops) {
            if (!routesByStop[stop]) {
                routesByStop[stop] = [];
            }
            routesByStop[stop].push(route);
        }
    }

    const sourceRoutes = routesByStop[source] || [];
    const destRoutes = routesByStop[destination] || [];

    if (sourceRoutes.length === 0 || destRoutes.length === 0) {
        return results;
    }

    // Use Sets to keep track of added paths to avoid duplicates
    const addedDirect = new Set();
    const addedOneChange = new Set();
    const addedTwoChange = new Set();

    // Helper to serialize path for deduplication
    const serializePath = (path) => path.map(p => `${p.bus}:${p.stop}`).join("->");

    // 2. Find Direct Journeys (0 Transfers)
    for (const r1 of sourceRoutes) {
        const sIdx = r1.stops.indexOf(source);
        const dIdx = r1.stops.indexOf(destination);

        if (sIdx !== -1 && dIdx !== -1 && sIdx < dIdx) {
            const path = [
                { bus: r1.routeNumber, stop: source },
                { bus: r1.routeNumber, stop: destination }
            ];
            const key = serializePath(path);
            if (!addedDirect.has(key)) {
                addedDirect.add(key);
                results.direct.push(path);
                if (results.direct.length >= limit) break;
            }
        }
    }

    // 3. Find One-Change Journeys (1 Transfer)
    for (const r1 of sourceRoutes) {
        const sIdx = r1.stops.indexOf(source);
        if (sIdx === -1) continue;

        // Iterate through stops on r1 after the source stop
        for (let i = sIdx + 1; i < r1.stops.length; i++) {
            const t1 = r1.stops[i];
            if (t1 === destination) continue;

            const t1Routes = routesByStop[t1] || [];
            for (const r2 of t1Routes) {
                if (r2.routeNumber === r1.routeNumber) continue;

                const t1Idx = r2.stops.indexOf(t1);
                const dIdx = r2.stops.indexOf(destination);

                if (t1Idx !== -1 && dIdx !== -1 && t1Idx < dIdx) {
                    const path = [
                        { bus: r1.routeNumber, stop: source },
                        { bus: r1.routeNumber, stop: t1 },
                        { bus: r2.routeNumber, stop: t1 },
                        { bus: r2.routeNumber, stop: destination }
                    ];
                    const key = serializePath(path);
                    if (!addedOneChange.has(key)) {
                        addedOneChange.add(key);
                        results.oneChange.push(path);
                        if (results.oneChange.length >= limit) break;
                    }
                }
            }
            if (results.oneChange.length >= limit) break;
        }
        if (results.oneChange.length >= limit) break;
    }

    // 4. Find Two-Change Journeys (2 Transfers)
    // Only search if we haven't filled up direct and one-change options
    for (const r1 of sourceRoutes) {
        const sIdx = r1.stops.indexOf(source);
        if (sIdx === -1) continue;

        for (let i = sIdx + 1; i < r1.stops.length; i++) {
            const t1 = r1.stops[i];
            if (t1 === destination) continue;

            const t1Routes = routesByStop[t1] || [];
            for (const r2 of t1Routes) {
                if (r2.routeNumber === r1.routeNumber) continue;

                const t1IdxInR2 = r2.stops.indexOf(t1);
                if (t1IdxInR2 === -1) continue;

                for (let j = t1IdxInR2 + 1; j < r2.stops.length; j++) {
                    const t2 = r2.stops[j];
                    if (t2 === source || t2 === destination || t2 === t1) continue;

                    const t2Routes = routesByStop[t2] || [];
                    for (const r3 of t2Routes) {
                        if (r3.routeNumber === r2.routeNumber || r3.routeNumber === r1.routeNumber) continue;

                        const t2IdxInR3 = r3.stops.indexOf(t2);
                        const dIdx = r3.stops.indexOf(destination);

                        if (t2IdxInR3 !== -1 && dIdx !== -1 && t2IdxInR3 < dIdx) {
                            const path = [
                                { bus: r1.routeNumber, stop: source },
                                { bus: r1.routeNumber, stop: t1 },
                                { bus: r2.routeNumber, stop: t1 },
                                { bus: r2.routeNumber, stop: t2 },
                                { bus: r3.routeNumber, stop: t2 },
                                { bus: r3.routeNumber, stop: destination }
                            ];
                            const key = serializePath(path);
                            if (!addedTwoChange.has(key)) {
                                addedTwoChange.add(key);
                                results.twoChange.push(path);
                                if (results.twoChange.length >= limit) break;
                            }
                        }
                    }
                    if (results.twoChange.length >= limit) break;
                }
                if (results.twoChange.length >= limit) break;
            }
            if (results.twoChange.length >= limit) break;
        }
        if (results.twoChange.length >= limit) break;
    }

    return results;
}

export { findJourney };