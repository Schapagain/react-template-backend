const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postUser, getUsers, getUser, updateUser, disableUser } = require('../../services/users');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

/**
 * Route for an independent user to signup
 * @name    api/users/signup
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/signup', 
    formParser,
    async (req, res) => {
        try{
            const driver = req.body;
            let result = await registerDriver(driver);
            result = {
                message: 'Driver added successfully',
                ...result,
            }
            res.status(201).json(result)
        }catch(err){
            res.status(err.httpCode || 500).json({
                error : {
                    field: err.field,
                    msg: err.message
                    }
                })
        }
    });

/**
 * Route to add a new user
 * @name    api/users
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
            const user = req.body;
            let result = await postUser(user);
            result = {
                'message':'User created successfully',
                ...result,
            }
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
 * Route to get user info
 * @name    api/users/:id
 * @method  GET
 * @access  Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser  
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id', 
auth,
async (req,res) => {
    try{
        const distributorId = req.auth.id;
        const id = req.params.id;
        if(!id) return res.json({error:'No id found'})

        // Get info from database
        const result = await getUser(distributorId,id);

        // Convert profilePicture name to API endpoint
        if (result.data[0].profilePicture)
            result.data[0].profilePicture = path.join(req.get('host'),req.originalUrl,'files',fileName);

        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode).json({error: err.message})
    }
}
);

/**
 * Route to get all users
 * @name    api/users
 * @method  GET
 * @access  Admin/Distributor
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
            let result = await getUsers(distributorId);
            if(!result) throw new Error();

            result.data = result.data.map(user => ({
                ...user,
            }))

            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a user
 * @name    api/users/:id
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
            let result = await disableUser(distributorId,id);
            result ={
                message: 'User deleted successfully',
                ...result,
            }
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

/**
 * Route to update user info
 * @name    api/users/:id
 * @method  PATCH
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate  
 * @param   {callback} middleware - Form parser
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
            let result = await updateUser({distributorId,...req.body,id});
            result = {
                'message' : 'User updated successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','users',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode).json({error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    }
);

/**
 * Route to get user files
 * @name    api/users/:id/files/:fileName
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/files/:fileName', 
    auth, 
    async (req,res)=>{
        const rootPath = path.join('.','uploads');
        const { fileName } = req.params;
        try{
            await fs.promises.access(path.join(rootPath,fileName))
            res.sendFile(fileName,{root: rootPath});
        }catch(err){

            if (err.code === 'ENOENT'){
                res.status(404).json({
                    error: "File not found"
                })
            }else{
                res.status(500).json({
                    error: "Server error. Try again later."
                })
                throw err;
            }
        }
});

module.exports = router;