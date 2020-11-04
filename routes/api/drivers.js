const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDriver, getDrivers } = require('../../services/drivers');
const { getFiles } = require('../../utils/index');
const path = require('path');

// @route   POST api/drivers
// @desc    Add a new driver
// @access  distributor
router.post('/', 
    formParser,
    async (req, res) => {
        try{
            const result = await postDriver(req.body);
            if (result) return res.status(200).json(result);
            throw new Error();
        }catch(err){
            throw err;
        }
    });

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

            // result = result.map(distributor => ({
            //     ...distributor,
            //     'more info:': path.join(req.get('host'),'api','distributors',distributor.id)
            // }))

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
            const result = await deleteDistributor(adminId,id);
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