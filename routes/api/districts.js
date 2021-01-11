const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDistrict,getDistricts, updateDistrict, deleteDistrict } = require('../../controllers/districts');
const { getMunicipalities } = require('../../controllers/municipalities');

/**
 * Route to add a new district
 * @name    api/districts
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
            let district = req.body;
            let result = await postDistrict(district);
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
 * Route to get all municipalities for a district 
 * @name    api/districts/:id/municipalities
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/municipalities', 
    async (req,res) => {
        try{
            let result = await getMunicipalities(req.params.id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);    

/**
 * Route to get all districts
 * @name    api/districts
 * @method  GET
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/', 
    auth,
    async (req,res) => {
        try{
            let result = await getDistricts();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to update a District
 * @name    api/districts/:id
 * @method  PATCH
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.patch('/:id', 
    auth,
    async (req,res) => {
        try{
            const id = req.params.id;
            let result = await updateDistrict({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

/**
 * Route to delete a District
 * @name    api/districts/:id
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
            let result = await deleteDistrict(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;