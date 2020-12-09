const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postContact, disableContact, getContact, updateContact, getContacts } = require('../../services/subscriptions');

/**
 * Route to add a new subscription
 * @name    api/subscriptions
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
            const subscription = req.body;
            const distributorId = req.auth.id;
            let result = await postContact({...subscription,distributorId});
            res.status(201).json(result)
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    });

/**
 * Route to get subscription info
 * @name    api/subscriptions/:id
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
        const distributorId = req.auth.id;
        const id = req.params.id;
        const result = await getContact(distributorId,id)
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);

/**
 * Route to get all subscriptions
 * @name    api/subscriptions
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
            const distributorId = req.auth.id;
            let result = await getContacts(distributorId);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a subscription
 * @name    api/subscriptions/:id
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
            let result = await disableContact(distributorId,id);
            const { message, title, name, } = result;
            res.status(200).json({ message, title, name });
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update a subscription
 * @name    api/subscriptions/:id
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
            let result = await updateContact({distributorId,...req.body,id});
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

module.exports = router;