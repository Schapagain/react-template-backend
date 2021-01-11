const express = require('express');
const router = express.Router();
const { calculateFare, calculateDistance } = require('../../controllers/trips');

/**
 * Route to calculate fare given distance and wait time
 * @name    api/trips/calculate_fare
 * @method  POST
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/calculate_fare',
    async (req, res) => {
        try{
            let result = await calculateFare(req.body);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    });

/**
 * Route to calculate distance given origin and destination coordinates
 * @name    api/trips/calculate_distance
 * @method  POST
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/calculate_distance',
    async (req, res) => {
        try{
            let result = await calculateDistance(req.body);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    });

module.exports = router;