
const auth = require('../middlewares/auth');
const path = require('path');
const { v4: uuid} = require('uuid');
const fs = require('fs');
const Driver = require('../models/Driver');
const Login  =  require('../models/Login');
const { DRIVER } = require('../utils/roles');
const Vehicle = require('../models/Vehicle');
const { getRandomId } = require('../utils');
const { response } = require('express');

async function _saveFile(file, fileName) {

    const filePath = path.join('.','uploads');
    const writeFile = fs.promises.writeFile;
    const readFile = fs.promises.readFile;
    if (file) {
        const fileStream = await readFile(file.path).catch(err => { throw err });
        const fullPath = path.join(filePath,fileName);
        writeFile(fullPath,fileStream).catch(err=>{throw err});
    }
}

function validateNewVehicle(vehicle) {

    const { 
        company, 
        model, 
        modelYear, 
        licensePlate, 
        registrationDocument,
    } = vehicle;

    if ((!company || !model || !modelYear || !licensePlate || !registrationDocument)) return false;

    return true;
}

async function postVehicle(vehicle) {

    if (!validateNewVehicle(vehicle)) throw new Error('Please provide all fields');

    // Save files to filesystem
    // Replace files with filenames
    Object.keys(vehicle).forEach(key => {
        if (typeof vehicle[key] === 'object'){
            const file = vehicle[key]
            const fileName = getRandomId().concat(path.extname(file.name));
            _saveFile(vehicle[key],fileName);
            vehicle[key] = fileName;
        }
    })

    // Create a unique id for the new vehicle
    vehicle.id = getRandomId();

    // Assign the distributor as the intial driver of the vehicle
    vehicle.driverId = vehicle.distributorId;

    try{
        await Promise.all([ 
            Vehicle.create(vehicle),
        ]);
        const { id, model, modelYear, company } = vehicle;
        return { id, model: [company,model,modelYear].join(' '),driverInfo: vehicle.driverId};
    }catch(err){
        // [TODO] Roll back changes
        console.error(err);
        return false;
    }
}

async function getVehicle(distributorId,id) {
    try {
        const result = await Vehicle.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        console.log(err);
    }
}

async function getVehicles(distributorId) {
    try {
        let result = await Vehicle.findAll({where:{distributorId}})
        result =  await Promise.all(result.map(async vehicle => {
            const {id, driverId, model, modelYear, company, licensePlate} = vehicle
            const { name:driverName } = await Driver.findOne({where:{id:driverId}})
            return {id, model: [model,modelYear,company].join(' '), licensePlate, driver: driverName, driverInfo: driverId }
        }));
        return result;
    }catch(err){
        console.log(err)
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

    const result = await Vehicle.findOne({where:{distributorId,id}});
    if (!result) return false;
    Vehicle.destroy({where:{distributorId,id}})

    return { id }
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
        if (!id || !distributorId) return false;

        let result = await Vehicle.findOne({where:{distributorId,id}});
        if (!result) return false;

        result = await Vehicle.update(vehicle,{where:{id},returning:true,plain:true});
        const {driverId, model, modelYear, company, licensePlate} = result[1];
        const { name:driverName } = await Driver.findOne({where:{id:driverId}})
        return {id, model: [model,modelYear,company].join(' '), licensePlate, driver: driverName, driverInfo: driverId }
        
    }catch(err){
        console.log(err);
        return false;
    }
    
}

module.exports = { postVehicle, getVehicle, getVehicles, updateVehicle, disableVehicle, deleteVehicle };