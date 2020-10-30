const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const validateNewDistributor = require('../../middlewares/validateNewDistributor');
const formParser = require('../../middlewares/formParser');
const { postDistributor,getDistributors, deleteDistributor } = require('../services/distributors');

// @route   POST api/distributors
// @desc    Add a new distributor
// @access  Public
router.post('/', 
    formParser,
    validateNewDistributor,
    async (req, res) => {
        
        const result = await postDistributor(req.body);
        if (result){
            res.status(200).json(result)
        }else{
            res.status(500).json({error:"Could not add distributor"})
        }
    });

// @route   GET api/distributors
// @desc    View all distributors
// @access  Private
router.get('/:id', 
    auth,
    async (req,res) => {
        try{
            const result = await getDistributors();
            if(!result) throw new Error();
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch distributors"})
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
            const result = await getDistributors();
            if(!result) throw new Error();
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
            const id = req.params.id;
            const result = await deleteDistributor(id);
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