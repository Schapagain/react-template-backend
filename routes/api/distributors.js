const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postDistributor, getDistributor, getDistributors, disableDistributor, updateDistributor } = require('../../services/distributors');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');
const { getError, ValidationError } = require('../../utils/errors');
const { sendPasswordResetCode, updatePassword } = require('../../services/password');
const validateNewPassword = require('../../middlewares/validateNewPassword');

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
            }
            res.status(201).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({
                error : {
                    field: err.field,
                    msg: err.message
                    }
                })
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
            const adminId = req.auth.id;
            const id = req.params.id;
            if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');

            // Get info from database
            const result = await getDistributor(adminId,id);
            if(!result) return res.json({error:'No distributor found'})

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
            const adminId = req.auth.id;
            const id = req.params.id;
            if(!id || isNaN(Number(id))) throw new ValidationError('id parameter'); 

            // Get info from database
            let result = await updateDistributor({adminId,...req.body,id});
            result = {
                'message' : 'Distributor updated successfully',
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
 * Route to get all distributors
 * @name    api/distributors
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
            const adminId  = req.auth.id; 
            let result = await getDistributors(adminId);
            if(!result) throw new Error();

            result.data = result.data.map(distributor => ({
                ...distributor,
            }))

            res.status(200).json(result);
        }catch(err){
            console.log(err)
            res.status(err.httpCode || 500).json({ error: err.message })
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
            const adminId = req.auth.id;
            const id = req.params.id;
            if(!id || isNaN(Number(id))) throw new ValidationError('id parameter');
            let result = await disableDistributor({adminId,...req.body,id});
            result = {
                message: 'Distributor deleted successfully',
                ...result,
            }
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode || 500).json({ error: err.message })
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
            res.status(404).json({ error: "File not found" })
        }else{
            err = getError(err);
            res.status(err.httpCode || 500).json({ error: err.message })
        }
    }
});

   /**
 * Route to get forgetPassword code
 * @name    api/forget_password
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/forget_password', 
formParser,
async (req,res) => {

    let { email } = req.body;
    // Check if phone number is given
    
    try{
        if (!email)
            throw new ValidationError('email');

        const result = await sendPasswordResetCode(email);
        //[TODO] send code via email
        if (result)
            console.log('Password reset link for distributor: ', path.join(req.get('host'),'api','set_password',result.id.toString(),result.setPasswordCode.toString()));

        return res.status(200).json({
            message: "If the email is registered, a password reset code has been sent!",
        })
    }
    catch(err){
        res.status(err.httpCode || 500).json({ error: err.message })
    }
}
)

/**
 * Route to set distributor password
 * @name    api/distributors/set_password/:id/:code
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Validate New Password
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/set_password/:id/:setPasswordCode',
    formParser,
    validateNewPassword,
    async (req, res) => {
        const { id, setPasswordCode } = req.params;
        const { password } = req.body;
        try{
            if (!password)
                throw new ValidationError('password');

            await updatePassword(id,setPasswordCode,password);
            res.status(201).json({msg: "Password updated successfully"})
        }catch(err){
            res.status(err.httpCode || 500).json({error: err.message})
        }
        
    });

module.exports = router;