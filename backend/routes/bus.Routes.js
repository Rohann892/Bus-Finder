import { addRoute, addStop, getAllStops, searchJourneys } from "../controllers/busController.js";
import express from 'express'
const busRouter = express.Router();

busRouter.get('/search', searchJourneys);
busRouter.get('/allStops', getAllStops);
busRouter.post('/addRoute', addRoute);
busRouter.post('/addStop', addStop);

export default busRouter;