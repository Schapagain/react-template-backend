const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postVehicle, getVehicle, getVehicles, updateVehicle, getAssignedDrivers, disableVehicle } = require('../../services/vehicles');
const path = require('path');
const { expectedFiles } = require('../../utils');

/**
 * Route to add a new vehicle
 * @name    api/vehicles
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
            const vehicle = req.body;
            const distributorId = req.auth.id;
            let result = await postVehicle({...vehicle,distributorId});
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
 * Route to get vehicle info
 * @name    api/vehicles/:id
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

        // Get info from database
        let result = await getVehicle(distributorId,id);
        // Convert filenames to API endpoints
        expectedFiles.forEach(fieldName => {
            result.data.forEach(vehicle => {
                vehicle[fieldName] = vehicle[fieldName]? path.join(req.get('host'),req.originalUrl,'files',fieldName) : null 

            })
        })
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode || 500 ).json({ error: err.message })
    }
}
);

/**
 * Route to get driver info assigned to a vehicle
 * @name    api/vehicles/:id/drivers
 * @method  GET
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
*/
router.get('/:id/drivers', 
auth,
async (req,res) => {
    try{
        const id = req.params.id;
        if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');

        // Get info from database
        const result = await getAssignedDrivers(id);

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
 * Route to get all vehicles
 * @name    api/vehicles
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
            let result = await getVehicles(distributorId);
            result.data = result.data.map(vehicle => ({
                ...vehicle,
            }))

            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);

/**
 * Route to disable a vehicle
 * @name    api/vehicles/:id
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
            const result = await disableVehicle(distributorId,id);;
            res.status(200).json({
                message: "Vechicle deleted successfully",
                ...result,
            });
        }catch(err){
            console.log(err);
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
);


/**
 * Route to udpate vehicle info
 * @name    api/vehicles/:id
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
            let result = await updateVehicle({distributorId,...req.body,id});
            result = {
                'message' : 'Vehicle updated successfully',
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
    }
);

/**
 * Route to get vehicle files
 * @name    api/vehicles/:id/files/:fileName
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