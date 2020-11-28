
const auth = require('../middlewares/auth');
const path = require('path');
const { getRandomId } = require('../utils');
const fs = require('fs');
const { Login, Driver, Distributor, sequelize, Vehicle, Country} = require('../models');
const { DRIVER } = require('../utils/roles');
const { getError, NotAuthorizedError, ValidationError, NotFoundError } = require('../utils/errors');
const { expectedFiles } = require('../utils')

async function postCountry(country) {
    try{
        const { distributorId } = country;
        if (!distributorId)
            throw new ValidationError('distributorId');

        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError(' distributor with that token/id does not exist!'); 

        country = await distributor.createCountry(country);
        return country.dataValues;
    }catch(err){
        throw await getError(err);
    }
}

async function getCountries(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allCountries;        
        if (distributor.isSuperuser){
            allCountries = await Country.findAll();
        }else{
            allCountries = await distributor.getCountries();
        }

        return {count: allCountries.length, data: allCountries}

    }catch(err){
        throw await getError(err);
    }
}

async function deleteCountry(distributorId,id) {

    try{
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 

        let country;        
        if (distributor.isSuperuser){
            country = await Country.findOne({where:{id}});
        }else{
            country = await distributor.getCountries({where:{id}});
        } 
        if (!country)
            throw new NotFoundError('country')

        Country.destroy({where:{id}});
        return country.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postCountry, getCountries, deleteCountry };