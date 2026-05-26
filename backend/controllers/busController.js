import Route from "../models/routeSchema.js";
import { findJourney } from "../algorithm/bfs.js";
import Stop from "../models/StopSchema";

export const searchJourneys = async (req, res) => {
    try {
        const { from, to } = req.query;
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
        const result = findJourney(from, to, routes);

        const noResult = result.direct.length === 0 && result.oneChange.length === 0 && result.twoChange.length === 0;

        if (noResult) {
            return res.status(404).json({
                success: false,
                message: 'No routes found between ' + from + ' and ' + to
            })
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Routes found successfully'
        })

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