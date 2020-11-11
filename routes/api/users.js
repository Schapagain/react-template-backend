const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postUser } = require('../../services/users');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

/**
 * Route to add a new user
 * @name    api/users
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser  
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/', 
    formParser,
    async (req, res) => {
        try{
            const user = req.body;
            let result = await postUser(user);
            result = {
                'message':'User created successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','users',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    });

// @route   GET api/distributors/:id
// @desc    Get distributor info
// @access  Private
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
        console.log(err);
        res.status(500).json({error:"Could not fetch driver"})
    }
}
);

// @route   GET api/drivers
// @desc    View all drivers
// @access  distributor
router.get('/', 
    auth,
    async (req,res) => {
        try{
            const adminId = req.body.id;
            let result = await getDrivers(adminId);
            if(!result) throw new Error();

            result = result.map(driver => ({
                ...driver,
                'moreInfo:': path.join(req.get('host'),'api','drivers',driver.id)
            }))

            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch drivers"})
        }
    }
);

// @route   DELETE api/distributors
// @desc    delete a distributor
// @access  Private
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
            console.log(err);
            res.status(500).json({error:"Could not delete driver. Try again later"})
        }
    }
);

router.get('/:id/files/:fileName', auth, async (req,res)=>{

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

// @route   PATCH api/drivers/:id
// @desc    Update driver info
// @access  Private
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
                'moreInfo:': path.join(req.get('host'),'api','drivers',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not update driver"})
        }
    }
);

module.exports = router;