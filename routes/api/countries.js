const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postCountry, getCountries, deleteCountry, updateCountry } = require('../../controllers/countries');
const { getStates } = require('../../controllers/states');

/**
 * Route to add a new country
 * @name    api/countries
 * @method  POST
 * @access  Admin/Distributor 
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
            let country = req.body;
            let result = await postCountry(country);
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
 * Route to get all states for a country 
 * @name    api/countries/:id/states
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/states', 
    async (req,res) => {
        try{
            let result = await getStates(req.params.id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);    

/**
 * Route to get country info
 * @name    api/countries/:id
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id', 
    async (req,res) => {
        try{
            let result = await getCountries(req.params.id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);   

/**
 * Route to get all countries
 * @name    api/countries
 * @method  GET
 * @access  Public
 * @inner
 * @param   {string} path  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/', 
    async (req,res) => {
        try{
            let result = await getCountries();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to update a Country
 * @name    api/countries/:id
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
            let result = await updateCountry({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

/**
 * Route to delete a Country
 * @name    api/countries/:id
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
            let result = await deleteCountry(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;