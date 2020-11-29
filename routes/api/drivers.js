const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDriver, getDrivers, getDriver, updateDriver, disableDriver } = require('../../services/drivers');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');
const { ValidationError } = require('../../utils/errors');


/**
 * Route to add a new driver
 * @name    api/drivers/independent
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/independent', 
    formParser,
    async (req, res) => {
        try{
            const driver = req.body;
            let result = await postDriver(driver);
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
 * Route to add a new driver
 * @name    api/drivers
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
            const driver = req.body;
            const distributorId = req.auth.id;
            let result = await postDriver({...driver,distributorId});
            if (!result) throw new Error();

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
 * Route to get driver info
 * @name    api/drivers/:id
 * @method  GET
 * @access  Private
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
        if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');

        // Get info from database
        const result = await getDriver(distributorId,id);
        if(!result) return res.json({error:'No driver found'})

        // Convert filenames to API endpoints
        expectedFiles.forEach(fieldName => {
            const fileName = result.data[0][fieldName];
            result.data[0][fieldName] = fileName ? path.join(req.get('host'),req.originalUrl,'files',fileName) : null
        })

        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
);

/**
 * Route to get all drivers
 * @name    api/drivers
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
            const adminId = req.auth.id;
            let result = await getDrivers(adminId);

            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a driver
 * @name    api/drivers/:id
 * @method  DELETE
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.delete('/:id', 
    auth,
    async (req,res) => {
        try{
            const adminId = req.auth.id;
            const id = req.params.id;
            if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');

            let result = await disableDriver(adminId,id);
            if(!result) {
                return res.status(400).json({
                    error: "Driver not found"
                })
            };
            result ={
                message: 'Driver deleted successfully',
                ...result,
            }
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to update driver info
 * @name    api/drivers/:id
 * @method  PATCH
 * @access  Private
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
            if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');

            // Get info from database
            let result = await updateDriver({distributorId,...req.body,id});
            if(!result) return res.json({error:'No driver found'})
            result = {
                'message' : 'Driver updated successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','drivers',result.id.toString())
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
 * Route to get driver files
 * @name    api/drivers/:id/files/:fileName
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/files/:fileName', auth, async (req,res)=>{

    const rootPath = path.join('.','uploads');
    const { fileName } = req.params;
    try{
        await fs.promises.access(path.join(rootPath,fileName))
        res.sendFile(fileName,{root: rootPath});
    }catch(err){

        if (err.code === 'ENOENT'){
            res.status(404).json({ error: "File not found" })
        }else{
            err = getError(err);
            res.status(err.httpCode || 500).json({error: err.message})
        }
    }
});

module.exports = router;