const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const validateNewDistributor = require('../../middlewares/validateNewDistributor');
const formParser = require('../../middlewares/formParser');
const { postDistributor, getDistributor, getDistributors, deleteDistributor } = require('../services/distributors');
const { getFiles } = require('../services/db');
const path = require('path');

// @route   POST api/distributors
// @desc    Add a new distributor
// @access  Public
router.post('/', 
    formParser,
    validateNewDistributor,
    async (req, res) => {
        try{
            const result = await postDistributor(req.body);
            if (result) return res.status(200).json(result);
            throw new Error();
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
            const parentId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            const result = await getDistributor(parentId,id);
            if(!result) return res.json({error:'No distributor found'})

            // Get files from filesystem
            let files = await getFiles(id);
            
            // Add api route to files as a prefix 
            files = files.map(fileName => path.join(req.get('host'),'api','files',id,fileName));
             
            const resultWithFiles = {...result,files};
            res.status(200).json(resultWithFiles);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch distributor"})
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
            const parentId = req.body.id;
            let result = await getDistributors(parentId);
            if(!result) throw new Error();

            result = result.map(distributor => ({
                ...distributor,
                'more info:': path.join(req.get('host'),'api','distributors',distributor.id)
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
            const parentId = req.body.id;
            const id = req.params.id;
            const result = await deleteDistributor(parentId,id);
            if(!result) {
                return res.status(400).json({
                    error: "Distributor not found"
                })
            };
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not delete distributor. Try again later"})
        }
    }
);

module.exports = router;