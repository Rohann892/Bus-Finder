/**
 * Haversine formula — returns the great-circle distance in metres between two
 * GeoJSON coordinate pairs [lon, lat].
 */
function haversineMetres([lon1, lat1], [lon2, lat2]) {
    const R = 6_371_000; // Earth radius in metres
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * generateTransferEdges(stops)
 *
 * Given an array of Stop documents (each having .name, .mode, and
 * .location.coordinates as a GeoJSON [lon, lat] pair), returns an array of
 * virtual "walk" route objects that connect nearby stops of different transit
 * modes.  Only stop pairs within 400 m and with different modes are linked.
 *
 * Each transfer route has the shape expected by findJourney():
 *   {
 *     routeNumber : 'WALK:A→B',
 *     mode        : 'walk',
 *     stops       : [A, B],
 *     avgTimePerStop: <metres / 80 m·min⁻¹, rounded>
 *   }
 *
 * Walk speed is assumed to be 80 m/min (~4.8 km/h).
 */
function generateTransferEdges(stops) {
    const WALK_SPEED_MPS = 80;   // metres per minute
    const MAX_DIST_M     = 400;  // threshold in metres

    const transferRoutes = [];

    for (let i = 0; i < stops.length; i++) {
        const a = stops[i];
        if (!a.location?.coordinates) continue;

        for (let j = i + 1; j < stops.length; j++) {
            const b = stops[j];
            if (!b.location?.coordinates) continue;

            // Only create a transfer edge between different transit modes
            if (a.mode === b.mode) continue;

            const dist = haversineMetres(a.location.coordinates, b.location.coordinates);
            if (dist > MAX_DIST_M) continue;

            const walkMinutes = Math.round(dist / WALK_SPEED_MPS);

            // A→B
            transferRoutes.push({
                routeNumber: `WALK:${a.name}→${b.name}`,
                mode: 'walk',
                stops: [a.name, b.name],
                avgTimePerStop: walkMinutes
            });

            // B→A  (walking is bidirectional)
            transferRoutes.push({
                routeNumber: `WALK:${b.name}→${a.name}`,
                mode: 'walk',
                stops: [b.name, a.name],
                avgTimePerStop: walkMinutes
            });
        }
    }

    return transferRoutes;
}

export { generateTransferEdges };
