const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postCountry, getCountries, deleteCountry } = require('../../services/countries');
const path = require('path');
const { expectedFiles } = require('../../utils');
const fs = require('fs');

/**
 * Route to add a new country
 * @name    api/countries
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
            let country = req.body;
            country.distributorId = req.auth.id;
            let result = await postCountry(country);
            result = {
                'message':'Country added successfully',
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
    });


/**
 * Route to get all countries
 * @name    api/countries
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
            const distributorId = req.auth.id;
            let result = await getCountries(distributorId);
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({ error: err.message })
        }
    }
);

/**
 * Route to delete a Country
 * @name    api/countries/:id
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
            const distributorId = req.auth.id;
            const id = req.params.id;
            let result = await deleteCountry(distributorId,id);
            result ={
                message: 'Country deleted successfully',
                ...result,
            }
            res.status(200).json(result);
        }catch(err){
            res.status(err.httpCode).json({error: err.message})
        }
    }
);

module.exports = router;