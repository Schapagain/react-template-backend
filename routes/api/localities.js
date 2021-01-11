const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postLocality,getLocalities, updateLocality, deleteLocality } = require('../../controllers/localities');
const { getWards } = require('../../controllers/wards');
/**
 * Route to add a new locality
 * @name    api/localities
 * @method  POST
 * @access  Admin
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
            let locality = req.body;
            let result = await postLocality(locality);
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    });

/**
 * Route to get all wards for a locality 
 * @name    api/localities/:id/wards
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/wards', 
async (req,res) => {
    try{
        let result = await getWards(req.params.id);
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);  

/**
 * Route to get all localities
 * @name    api/localities
 * @method  GET
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/', 
    async (req,res) => {
        try{
            let result = await getLocalities();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update a Locality
 * @name    api/localities/:id
 * @method  PATCH
 * @access  Admin
 * @inn
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.patch('/:id', 
    auth,
    async (req,res) => {
        try{
            const id = req.params.id;
            let result = await updateLocality({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({error: err.message})
        }
    }
);

/**
 * Route to delete a Locality
 * @name    api/localitiess/:id
 * @method  DELETE
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.delete('/:id', 
    auth,
    async (req,res) => {
        try{
            const id = req.params.id;
            let result = await deleteLocality(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({error: err.message})
        }
    }
);

module.exports = router;