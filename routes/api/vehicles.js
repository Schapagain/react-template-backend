const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postVehicle, getVehicle, getVehicles, updateVehicle, deleteVehicle, disableVehicle } = require('../../services/vehicles');
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
            const distributorId = req.body.id;
            let result = await postVehicle({...vehicle,distributorId});
            if (!result) throw new Error();

            result = {
                ...result,
                'driverInfo': path.join(req.get('host'),'api','drivers',result.driverInfo),
                'moreInfo': path.join(req.get('host'),'api','vehicles',result.id)
            }
            return res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
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
        const distributorId = req.body.id;
        const id = req.params.id;
        if(!id) return res.json({error:'No id found'})

        // Get info from database
        let result = await getVehicle(distributorId,id);
        if(!result) return res.json({error:'No vehicle found'})
        console.log(result);
        console.log(expectedFiles);
        // Convert filenames to API endpoints
        const fileName = result['registrationDocument'];
        result['registrationDocument'] = fileName ? path.join(req.get('host'),req.originalUrl,'files',fileName) : null;
        res.status(200).json(result);
    }catch(err){
        res.status(err.httpCode).json({ error: err.message })
    }
}
);

/**
 * Route to get all vehicles
 * @name    api/vehicles
 * @method  DELETE
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
            let result = await getVehicles(adminId);
            if(!result) throw new Error();
            result = result.map(vehicle => ({
                ...vehicle,
                'driverInfo': path.join(req.get('host'),'api','drivers',vehicle.driverInfo),
                'moreInfo:': path.join(req.get('host'),'api','vehicles',vehicle.id)
            }))

            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a vehicle
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
            const distributorId = req.body.id;
            const id = req.params.id;
            const result = await disableVehicle(distributorId,id);
            if(!result) {
                return res.status(400).json({
                    error: "Vehicle not found"
                })
            };
            res.status(200).json({
                message: "Vechicle delete successfully",
                ...result,
            });
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not delete vehicle. Try again later"})
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
            const distributorId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            let result = await updateVehicle({distributorId,...req.body,id});
            if(!result) return res.json({error:'No vehicle found'})
            result = {
                'message' : 'Vehicle updated successfully',
                ...result,
                'driverInfo': path.join(req.get('host'),'api','drivers',result.driverInfo),
                'moreInfo:': path.join(req.get('host'),'api','vehicles',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
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