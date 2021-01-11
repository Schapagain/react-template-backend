const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postBrand, disableBrand, getBrand, updateBrand, getBrands } = require('../../controllers/vehicleBrands');

/**
 * Route to add a new brand
 * @name    api/vehicle_brands
 * @method  POST
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/', 
    auth,
    formParser,
    async (req, res) => {
        try{
            const brand = req.body;
            const distributorId = req.auth.id;
            let result = await postBrand({...brand,distributorId});
            res.status(201).json(result)
        }catch(err){
            res.status(err.httpCode || 500).json({ error: {
                field: err.field,
                msg: err.message
            } })
        }
    });

/**
 * Route to get brand info
 * @name    api/vehicle_brands/:id
 * @method  GET
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id', 
auth,
async (req,res) => {
    try{
        const id = req.params.id;
        const result = await getBrand(id)
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);

/**
 * Route to get all brands
 * @name    api/vehicle_brands
 * @method  GET
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/', 
    auth,
    async (req,res) => {
        try{
            let result = await getBrands();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a brand
 * @name    api/vehicle_brands/:id
 * @method  DELETE
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.delete('/:id', 
    auth,
    async (req,res) => {
        try{
            const distributorId = req.auth.id;
            const id = req.params.id;
            let result = await disableBrand(distributorId,id);
            const { message, title, name, } = result;
            res.status(200).json({ message, title, name });
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update a brand
 * @name    api/vehicle_brands/:id
 * @method  PATCh
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.patch('/:id', 
    auth,
    formParser,
    async (req,res) => {
        try{
            const distributorId = req.auth.id;
            const id = req.params.id;

            // Get info from database
            let result = await updateBrand({distributorId,...req.body,id});
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: {
                field: err.field,
                msg: err.message
            } })
        }
    }
);

module.exports = router;