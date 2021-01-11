const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postModel, disableModel, getModel, updateModel, getModels } = require('../../controllers/vehicleModels');

/**
 * Route to add a new model
 * @name    api/vehicle_models
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
            const model = req.body;
            let result = await postModel(model);
            res.status(201).json(result)
        }catch(err){
            res.status(err.httpCode || 500).json({ error: {
                field: err.field,
                msg: err.message
            } })
        }
    });

/**
 * Route to get model info
 * @name    api/models/:id
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
        const result = await getModel(id)
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);

/**
 * Route to get all models
 * @name    api/models
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
            let result = await getModels();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a model
 * @name    api/models/:id
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
            let result = await disableModel(distributorId,id);
            const { message, title, name, } = result;
            res.status(200).json({ message, title, name });
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update a model
 * @name    api/models/:id
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
            let result = await updateModel({distributorId,...req.body,id});
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