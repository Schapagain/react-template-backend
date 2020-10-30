const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const validateNewDistributor = require('../../middlewares/validateNewDistributor');
const formParser = require('../../middlewares/formParser');
const {postDistributor,getDistributors} = require('../services/distributors');


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
router.get('/', 
    auth,
    async (req,res) => {
        try{
            if (req.role !== 'admin'){
                return res.status(401).json({error: "Not authorized"})
            }
            const result = await getDistributors();
            if(!result) throw new Error();
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch distributors"})
        }
    }
);

module.exports = router;