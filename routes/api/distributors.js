const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const validateNewDistributor = require('../../middlewares/validateNewDistributor');
const formParser = require('../../middlewares/formParser');
const { postDistributor, getDistributor, getDistributors, disableDistributor, updateDistributor } = require('../../services/distributors');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

// @route   POST api/distributors
// @desc    Add a new distributor
// @access  Public
router.post('/', 
    formParser,
    validateNewDistributor,
    async (req, res) => {
        try{
            const distributor = req.body;
            let result = await postDistributor(distributor);
            if (!result) throw new Error();

            result = {
                'message':'Distributor created successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','distributors',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            res.status(500).json({error:"Could not add distributor"})
        }
    });

// @route   GET api/distributors/:id
// @desc    Get distributor info
// @access  Private
router.get('/:id', 
    auth,
    async (req,res) => {
        try{
            const adminId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            const result = await getDistributor(adminId,id);
            if(!result) return res.json({error:'No distributor found'})

            // Convert filenames to API endpoints
            expectedFiles.forEach(fieldName => {
                const fileName = result[fieldName];
                result[fieldName] = fileName ? path.join(req.get('host'),req.originalUrl,'files',fileName) : null
            })
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch distributor"})
        }
    }
);

// @route   PATCH api/distributors/:id
// @desc    Update distributor info
// @access  Private
router.patch('/:id', 
    auth,
    formParser,
    async (req,res) => {
        try{
            const adminId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            let result = await updateDistributor({adminId,...req.body,id});
            if(!result) return res.json({error:'No distributor found'})
            result = {
                'message' : 'Distributor updated successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','distributors',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not update distributor"})
        }
    }
);

// @route   GET api/distributors
// @desc    View all distributors
// @access  admin
router.get('/', 
    auth,
    async (req,res) => {
        try{
            const adminId = req.body.id;
            let result = await getDistributors(adminId);
            if(!result) throw new Error();

            result = result.map(distributor => ({
                ...distributor,
                'moreInfo:': path.join(req.get('host'),'api','distributors',distributor.id)
            }))

            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch distributors"})
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
            let result = await disableDistributor(adminId,id);
            if(!result) {
                return res.status(400).json({
                    error: "Distributor not found"
                })
            };
            result = {
                message: 'Distributor deleted successfully',
                ...result,
            }
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not delete distributor. Try again later"})
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

module.exports = router;