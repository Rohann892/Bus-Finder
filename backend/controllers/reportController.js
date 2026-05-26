import Report from '../models/reportSchema.js'

export const reportRoute = async (req, res) => {
    try {
        const { routeNumber, issueType, description } = req.body;

        if (!routeNumber || !issueType) {
            return res.status(400).json({
                error: 'routeNumber and issueType are required'
            });
        }

        // Valid issue types
        const validIssues = [
            'wrong_stop',
            'wrong_timing',
            'missing_stop',
            'route_discontinued',
            'other'
        ];

        if (!validIssues.includes(issueType)) {
            return res.status(400).json({
                error: 'Invalid issue type'
            });
        }

        const report = new Report({
            routeNumber,
            issueType,
            description
        });
        await report.save();

        res.status(201).json({
            message: 'Report submitted, thank you!',
            reportId: report._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};