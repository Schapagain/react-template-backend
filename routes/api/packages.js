const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postPackage, getPackage, getPackages, updatePackage, disablePackage } = require('../../controllers/packages');
const path = require('path');
const { expectedFiles } = require('../../utils');

/**
 * Route to add a new package
 * @name    api/packages
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
            const package = req.body;
            const distributorId = req.auth.id;
            let result = await postPackage({...package,distributorId});
            return res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error : {
                field: err.field,
                msg: err.message
                }
            })
        }
    });

/**
 * Route to get package info
 * @name    api/packages/:id
 * @method  GET
 * @access  Admin/Distributor
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
        if(!id) return res.json({error:'No id found'})
        let result = await getPackage(distributorId,id);
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500 ).json({ error: err.message })
    }
});

/**
 * Route to get all packages
 * @name    api/packages
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
            let result = await getPackages(distributorId);
            result.data = result.data.map(package => ({
                ...package,
            }))

            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to disable a package
 * @name    api/packages/:id
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
            const distributorId = req.auth.id;
            const id = req.params.id;
            const result = await disablePackage(distributorId,id);;
            res.status(200).json({
                message: "Package deleted successfully",
                package: result,
            });
        }catch(err){
            console.log(err);
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);


/**
 * Route to udpate package info
 * @name    api/packages/:id
 * @method  PATCH
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.patch('/:id', 
    auth,
    formParser,
    async (req,res) => {
        try{
            const distributorId = req.auth.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            let result = await updatePackage({distributorId,...req.body,id});
            result = {
                'message' : 'Package updated successfully',
                package: result,
            }
            res.status(201).json(result);
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
 * Route to get package files
 * @name    api/packages/:id/files/:fileName
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