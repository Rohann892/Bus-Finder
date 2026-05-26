import { estimateTime } from "./timeEstimator.js";

// Find next available bus for a route
function getNextBus(routeNumber, routes) {
    const route = routes.find(r => r.routeNumber === routeNumber);
    if (!route || !route.schedule) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const firstBusMinutes = timeToMinutes(route.schedule.firstBus);
    const lastBusMinutes = timeToMinutes(route.schedule.lastBus);
    const frequency = route.schedule.frequency; // every N mins

    // Check if service is running
    if (currentMinutes < firstBusMinutes) {
        return {
            status: 'not_started',
            nextBus: route.schedule.firstBus,
            waitMinutes: firstBusMinutes - currentMinutes
        };
    }

    if (currentMinutes > lastBusMinutes) {
        return {
            status: 'service_ended',
            nextBus: `Tomorrow at ${route.schedule.firstBus}`,
            waitMinutes: null
        };
    }

    // Calculate next bus time
    const minutesSinceFirst = currentMinutes - firstBusMinutes;
    const nextBusIn = frequency - (minutesSinceFirst % frequency);
    const nextBusTime = minutesToTime(currentMinutes + nextBusIn);

    return {
        status: 'running',
        nextBus: nextBusTime,
        waitMinutes: nextBusIn
    };
}

// Find which bus to catch FIRST for a journey
function recommendFirstBus(journeyOptions, routes) {
    const recommendations = [];

    for (const journey of journeyOptions) {
        if (journey.length === 0) continue;

        const firstBusNumber = journey[0].bus;
        const nextBusInfo = getNextBus(firstBusNumber, routes);
        const travelInfo = estimateTime(journey, routes);

        recommendations.push({
            journey,
            firstBus: firstBusNumber,
            nextBusInfo,
            // Calculate total time = wait time + travel time
            totalMinutes: (nextBusInfo?.waitMinutes || 999) + (travelInfo?.minutes || 0)
        });
    }

    // Sort by total estimated time (wait + travel)
    recommendations.sort((a, b) => a.totalMinutes - b.totalMinutes);

    return recommendations;
}

function timeToMinutes(timeStr) {
    // "05:30" -> 330
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 60 + mins;
}

function minutesToTime(minutes) {
    // 330 -> "05:30"
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export { recommendFirstBus, getNextBus };