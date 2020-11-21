const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDriver, getDrivers, getDriver, updateDriver, disableDriver } = require('../../services/drivers');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

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
            const distributorId = req.body.id;
            let result = await postDriver({...driver,distributorId});
            if (!result) throw new Error();

            result = {
                message: 'Driver added successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','drivers',result.id.toString())
            }
            res.status(201).json(result)
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
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
        const distributorId = req.body.id;
        const id = req.params.id;
        if(!id) return res.json({error:'No id found'})

        // Get info from database
        const result = await getDriver(distributorId,id);
        if(!result) return res.json({error:'No driver found'})

        // Convert filenames to API endpoints
        expectedFiles.forEach(fieldName => {
            const fileName = result[fieldName];
            result[fieldName] = fileName ? path.join(req.get('host'),req.originalUrl,'files',fileName) : null
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
            const adminId = req.body.id;
            let result = await getDrivers(adminId);
            if(!result) throw new Error();

            result = result.map(driver => ({
                ...driver,
                'moreInfo:': path.join(req.get('host'),'api','drivers',driver.id.toString())
            }))

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
            const adminId = req.body.id;
            const id = req.params.id;
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
            const distributorId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

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
            res.status(err.httpCode || 500).json({ error: err.message })
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