const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postWard,getWards, updateWard, deleteWard } = require('../../controllers/wards');

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
router.post('/',
    auth, 
    formParser,
    async (req, res) => {
        try{
            let ward = req.body;
            let result = await postWard(ward);
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
 * Route to get all wards
 * @name    api/wards
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
            let result = await getWards();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to update a Ward
 * @name    api/wards/:id
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
            let result = await updateWard({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;

/**
 * Route to delete a Ward
 * @name    api/wards/:id
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
            let result = await deleteWard(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;