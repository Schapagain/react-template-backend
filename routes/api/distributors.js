const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDistributor, getDistributor, getDistributors, disableDistributor, updateDistributor } = require('../../services/distributors');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

/**
 * Route to add a new distributor
 * @name    api/distributors
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
            const distributor = req.body;
            let result = await postDistributor(distributor);
            result = {
                'message':'Distributor created successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','distributors',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    });

/**
 * Route to get distributor info
 * @name    api/distributors/:id
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
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

/**
 * Route to update distributor info
 * @name    api/distributors/:id
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

/**
 * Route to get all distributors
 * @name    api/distributors/:id
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

/**
 * Route to delete a distributor
 * @name    api/distributors/:id
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

/**
 * Route to get distributor files
 * @name    api/distributors/:id/files/:fileName
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