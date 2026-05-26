import Route from "../models/routeSchema.js";
import { findJourney } from "../algorithm/bfs.js";
import Stop from "../models/StopSchema.js";
import { translateStop } from "../algorithm/translator.js";
import { recommendFirstBus } from "../algorithm/nextBus.js";
import { estimateTime } from "../algorithm/timeEstimator.js";

export const searchJourneys = async (req, res) => {
    try {
        let { from, to } = req.query;
        from = translateStop(from);
        to = translateStop(to);
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both from and to stops'
            });
        }

        if (from === to) {
            return res.status(400).json({
                success: false,
                message: 'Source and destination are same. Please provide correct source and destination'
            });
        }

        const routes = await Route.find({});
        const journeys = findJourney(from, to, routes);

        const allJourneys = [
            ...journeys.direct,
            ...journeys.oneChange,
            ...journeys.twoChange
        ];

        const recommendations = recommendFirstBus(allJourneys, routes)

        const noResult = recommendations.length === 0;

        if (noResult) {
            return res.status(404).json({
                success: false,
                message: 'No routes found between ' + from + ' and ' + to
            })
        }

        const response = {
            direct: journeys.direct.map(j => ({
                path: j,
                estimatedTime: estimateTime(j, routes),
                type: 'Direct'
            })),
            oneChange: journeys.oneChange.map(j => ({
                path: j,
                estimatedTime: estimateTime(j, routes),
                type: '1 Change'
            })),
            twoChange: journeys.twoChange.map(j => ({
                path: j,
                estimatedTime: estimateTime(j, routes),
                type: '2 Changes'
            })),
            bestOption: recommendations[0] // earliest bus
        };

        return res.status(200).json({
            success: true,
            response,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Search Journey Error'
        })
    }
}

export const getAllStops = async (req, res) => {
    try {
        const stops = await Stop.find({}, 'name');
        const stopNames = stops.map(stop => stop.name);
        return res.status(200).json({
            success: true,
            data: stopNames,
            message: 'All stops fetched successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Get All Stops Error'
        })
    }
}


export const addRoute = async (req, res) => {
    try {
        const { routeNumber, routeName, stops } = req.body;
        if (!routeNumber || !routeName || !stops) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the details'
            })
        }
        const route = await Route.create({
            routeNumber,
            routeName,
            stops
        })
        return res.status(201).json({
            success: true,
            data: route,
            message: 'Route added successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Add Route Error'
        })
    }
}

export const addStop = async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the details'
            })
        }
        const stop = await Stop.create({
            name,
            location
        })
        return res.status(201).json({
            success: true,
            data: stop,
            message: 'Stop added successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Add Stop Error'
        })
    }
}



export const getRouteTimings = async (req, res) => {
    try {
        const { routeNumber } = req.params;

        const route = await Route.findOne({ routeNumber });
        if (!route) {
            return res.status(404).json({
                error: 'Route not found'
            });
        }

        res.status(200).json({
            routeNumber: route.routeNumber,
            routeName: route.routeName,
            firstBus: route.schedule.firstBus,
            lastBus: route.schedule.lastBus,
            frequency: `Every ${route.schedule.frequency} minutes`,
            stops: route.stops
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};