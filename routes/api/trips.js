const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { calculateFare } = require('../../services/trips');

/**
 * Route to add a new ward
 * @name    api/wards
 * @method  POST
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser  
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/calculate_fare',
    formParser,
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



module.exports = router;