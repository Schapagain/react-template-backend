const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { getLocalities } = require('../../controllers/localities');
const { postMunicipality,getMunicipalities, updateMunicipality, deleteMunicipality } = require('../../controllers/municipalities');

/**
 * Route to add a new municipality
 * @name    api/municipalities
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
            let municipality = req.body;
            let result = await postMunicipality(municipality);
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
 * Route to get all localities for a municiaplity 
 * @name    api/municipalities/:id/localities
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/localities', 
async (req,res) => {
    try{
        let result = await getLocalities(req.params.id);
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode).json({ error: err.message })
    }
}
);    

/**
 * Route to get all municipalities
 * @name    api/municipalities
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
            let result = await getMunicipalities();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to update a Municipality
 * @name    api/municipalities/:id
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
            let result = await updateMunicipality({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);


/**
 * Route to delete a Municipality
 * @name    api/municipalities/:id
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
            let result = await deleteMunicipality(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;