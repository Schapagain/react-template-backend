
const auth = require('../middlewares/auth');
const path = require('path');
const { v4: uuid} = require('uuid');
const fs = require('fs');
const { Vehicle, Login, Driver, Distributor } = require('../models');
const { DRIVER } = require('../utils/roles');
const { getRandomId } = require('../utils');
const { getError, ValidationError } = require('../utils/errors');
const { expectedFiles } = require('../utils');

async function postVehicle(vehicle) {

    try{
        // Check if the given adminId exists
        const distributor = await Distributor.findOne({where:{id:vehicle.distributorId}});
        if (!distributor)
            throw new NotFoundError('distributor');

        // Extract files
        allFiles = expectedFiles.map(fieldName => vehicle[fieldName]);

        // Replace files with random filenames before posting to database
        allFileNames = [];
        expectedFiles.forEach(fieldName => {
            const file = vehicle[fieldName];
            const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
            vehicle[fieldName] = fileName;
            allFileNames.push(fileName);
        })

        vehicle = await distributor.createVehicle(vehicle);
        const { id, distributorId, model, modelYear, company } = vehicle;
        return { distributorId, id, model: [company,model,modelYear].join(' ')};
    }catch(err){
        // [TODO] delete files on rollback
        throw await getError(err);
    }
}

async function getVehicle(distributorId,id) {
    try {
        if (!distributorId)
            throw new ValidationError('distributor Id');
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');

        let vehicle;
        if (distributor.isSuperuser)
            vehicle = await Vehicle.findOne({where:{id}});
        else
            vehicle = await distributor.getVehicles({where:{id},include: Driver});
        
        if (!vehicle)
            throw new NotFoundError('vehicle');

        return {count: 1, data: vehicle}
    }catch(err){
        throw await getError(err);
    }
}

async function getAssignedDrivers(vehicleId) {
    try {

        if (!vehicleId)
            throw new ValidationError('driver Id');

        const vehicle = await Vehicle.findOne({where:{id:vehicleId}});

        if (!vehicle)
            throw new NotAuthorizedError('vehicle');
        let allDrivers = await Driver.findAll({where:{vehicleId}});

        return {count: allDrivers.length, data: allDrivers};
    }catch(err){
        throw await getError(err);
    }
}


async function getVehicles(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allVehicles;        
        if (distributor.isSuperuser){
            allVehicles = await Vehicle.findAll({include: Driver});
        }else{
            allVehicles = await distributor.getVehicles({include: Driver});
        }

        allVehicles = await Promise.all(allVehicles.map(async vehicle => {
            const {id, driverId, distributorId, company, model, modelYear, licensePlate, Driver} = vehicle
            return {
                id, 
                driverId, 
                distributorId, 
                model: company.concat(' ',model,', ', modelYear), 
                licensePlate, 
                driver: Driver? {
                    id: Driver.id,
                    name: Driver.name,
                    phone: Driver.phone,
                    licenseDocument: Driver.licenseDocument,
                } : null
            }
        }));
        return {count: allVehicles.length, data: allVehicles};
    }catch(err){
        throw await getError(err);
    }
}

async function deleteVehicle(distributorId,id) {

    const result = await Vehicle.findOne({where:{distributorId,id}});
    if (!result) return false;

    deleteFiles(result.dataValues);
    Vehicle.destroy({where:{distributorId,id},force:true})

    return { id }
}

async function disableVehicle(distributorId,id) {

    try{
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token/id does not exist'); 
        let vehicle;
        if (distributor.isSuperuser)
            vehicle = await Vehicle.findOne({where:{id}});
        else
            vehicle = await Vehicle.findOne({where:{distributorId,id}});
        if (!vehicle)
            throw new NotFoundError('vehicle');

        Vehicle.destroy({where:{id}})
        const { company, model, modelYear, licensePlate } = vehicle;
        return { id, distributorId: vehicle.distributorId, company, model, year, licensePlate };
    }catch(err){
        throw await getError(err);
    }
}

function deleteFiles(user) {
    expectedFiles.forEach(fileName => {
        if (user[fileName]){
            const filePath = path.join('.','uploads',user[fileName]);
            fs.unlink(filePath,err=>console.log(err));
        }
    })
}

async function updateVehicle(vehicle) {
    try{
        const { id, distributorId } = vehicle;
        if (!id || !distributorId)
            throw new ValidationError('id or distributorId');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 

        let result;
        if (distributor.isSuperuser)
            result = await Vehicle.findOne({where:{id}});
        else
            result = await Vehicle.findOne({where:{distributorId,id}});
        if (!result)
            throw new NotFoundError('vehicle');

        // Keep the distributorId for the driver unchanged
        vehicle.distributorId = result.distributorId;

        result = await Vehicle.update(vehicle,{where:{id},returning:true,plain:true});
        const { licensePlate, company, model, modelYear } = result[1].dataValues;
        return {id, licensePlate, company, model, modelYear}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postVehicle, getVehicle, getVehicles, updateVehicle, disableVehicle, deleteVehicle, getAssignedDrivers };