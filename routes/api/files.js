const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const util = require('util');
const fs = require('fs');
const path = require('path');

// @route   GET api/distributors/:id
// @desc    Get distributor info
// @access  Private
router.get('/:id/:filePath', auth, async (req,res)=>{
    const filePath = req.url;
    const rootPath = path.join('.','uploads');
    try{

        await fs.promises.access(path.join(rootPath,filePath))
        res.sendFile(filePath,{root: rootPath});
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
    
}
);

module.exports = router;
