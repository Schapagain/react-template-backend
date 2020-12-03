const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { getDistricts } = require('../../services/districts');
const { postState, getStates, updateState, deleteState } = require('../../services/states');

/**
 * Route to add a new state
 * @name    api/districts
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
            let state = req.body;
            let result = await postState(state);
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
 * Route to get all districts for a state 
 * @name    api/states/:id/districts
 * @method  GET
 * @access  Public 
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/districts', 
async (req,res) => {
    try{
        let result = await getDistricts(req.params.id);
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);    

/**
* Route to get state info
* @name    api/states/:id
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
        let result = await getStates(req.params.id);
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
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
            let result = await getStates();
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update a State
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
            let result = await updateState({...req.body,id});
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    }
);

/**
 * Route to delete a State
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
            let result = await deleteState(id);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({error: err.message})
        }
    }
);

module.exports = router;