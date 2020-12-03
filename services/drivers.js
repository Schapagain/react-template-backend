
const auth = require('../middlewares/auth');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const fs = require('fs');
const { Login, Driver, Distributor, sequelize, Vehicle, Package } = require('../models');
const { getError, NotAuthorizedError, ValidationError, NotFoundError } = require('../utils/errors');
const { expectedFiles } = require('../utils');

async function _saveFiles(files, fileNames) {
    const filePath = path.join('.','uploads'); 
    const writeFile = fs.promises.writeFile;
    const readFile = fs.promises.readFile;
    files.forEach( async (file,index) => {
        if (file) {
            const fileStream = await readFile(file.path).catch(err => { throw err });
            const fullPath = path.join(filePath,fileNames[index]);
            writeFile(fullPath,fileStream).catch(err=>{throw err});
        }
    })
}

async function postDriver(driver) {
    try{
        const { distributorId } = driver;
        if (!distributorId)
            throw new ValidationError('distributorId');

        const distributor = await Distributor.findOne({where:{id:driver.distributorId}});
        if (!distributor)
            throw new NotAuthorizedError(' distributor with that token/id does not exist!'); 

        // Extract files
        allFiles = expectedFiles.map(fieldName => driver[fieldName]);

        // Replace files with random filenames before posting to database
        allFileNames = [];
        expectedFiles.forEach(fieldName => {
            const file = driver[fieldName];
            const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
            driver[fieldName] = fileName;
            allFileNames.push(fileName);
        })

        const result = await sequelize.transaction( async t => {
            driver = await distributor.createDriver(driver,{transaction:t});

             // Generate an OTP
            // [TODO] send this code via text   
            const code_length = 6;
            const otpCode = getRandomCode(code_length)
            console.log('OTP for driver: ',otpCode)

            const { id:driverId, phone, name } = driver;
            const {id: loginId} = await driver.createLogin({phone,name,driverId,otpCode},{transaction:t});
            await Driver.update({loginId},{where:{id:driverId},transaction:t});
            return { id:driverId, name, phone };
        });

        await _saveFiles(allFiles,allFileNames);
        return result;
    }catch(err){
        throw await getError(err);
    }
}

async function registerDriver(driver) {
    try{
        const { appId } = driver;
        if (!appId)
            throw new ValidationError('appId',"not found");

        const distributor = await Distributor.findOne({where:{appId}});
        if (!distributor)
            throw new NotFoundError('app'); 

        // Extract files
        allFiles = expectedFiles.map(fieldName => driver[fieldName]);

        // Replace files with random filenames before posting to database
        allFileNames = [];
        expectedFiles.forEach(fieldName => {
            const file = driver[fieldName];
            const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
            driver[fieldName] = fileName;
            allFileNames.push(fileName);
        })

        const result = await sequelize.transaction( async t => {

            //Booleanify the value for usesPan field
            driver.usesPan = driver.pan? true : false;

            const reseller = await distributor.createDistributor(driver,{transaction:t});
            driver = await reseller.createDriver(driver,{transaction:t});

             // Generate an OTP
            // [TODO] send this code via text   
            const code_length = 6;
            const otpCode = getRandomCode(code_length)
            console.log('OTP for driver: ',otpCode)

            const { id:driverId, phone, name } = driver;
            const {id: loginId} = await driver.createLogin({phone,name,driverId,distributorId: reseller.id,otpCode},{transaction:t});
            await Driver.update({loginId},{where:{id:driverId},transaction:t});
            return { id:driverId, name, phone };
        });

        await _saveFiles(allFiles,allFileNames);
        return result;
    }catch(err){
        throw await getError(err);
    }
}

async function getDrivers(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allDrivers;        
        if (distributor.isSuperuser){
            allDrivers = await Driver.findAll({include: Vehicle});
        }else{
            allDrivers = await distributor.getDrivers({include: [Vehicle,Package]});
        }
        
        allDrivers = await Promise.all(allDrivers.map(async driver => {
            const {id, distributorId, subscriptionType, cutPercent, name, phone, Vehicle,Package} = driver
            return {
                id, 
                distributorId,
                subscriptionType, 
                cutPercent,
                name,
                phone,
                vehicle: Vehicle? {
                    id: Vehicle.id,
                    model: Vehicle.company.concat(' ',Vehicle.model,', ', Vehicle.modelYear), 
                    licensePlate: Vehicle.licensePlate
                } : null,
                package: Package? {
                    id: Package.id,
                    name: Package.name,
                    price: Package.price,
                    duration: Package.duration,
                } : null,
            }
        }));

        return {count: allDrivers.length, data: allDrivers}

    }catch(err){
        throw await getError(err);
    }
}

async function getDriver(distributorId,id) {
    try {
        let driver;
        // View their own info
        if (distributorId == id){
            driver = await Driver.findAll({where:{id},include: Vehicle});
        }else{
            const distributor = await Distributor.findOne({where:{id:distributorId}});

            if (!distributor)
                throw new NotAuthorizedError('distributor with that token does not exist'); 
            
            if (distributor.isSuperuser)
                driver = await Driver.findAll({where:{id},include: Vehicle});
            else
                driver = await distributor.getDrivers({where:{id}, include: Vehicle});
        }

        if (!driver.length)
            throw new NotFoundError('driver');
        
        return {count: 1, data: driver.map(driver => driver.dataValues)}

    }catch(err){
        throw await getError(err);
    } 
}


async function getAssignedVehicles(driverId) {
    try {

        if (!driverId)
            throw new ValidationError('driver Id');

        const driver = await Driver.findOne({where:{id:driverId}});

        if (!driver)
            throw new NotAuthorizedError('driver');
        let allVehicles = await Vehicle.findAll({where:{driverId}});

        return {count: allVehicles.length, data: allVehicles};
    }catch(err){
        throw await getError(err);
    }
}

async function deleteDriver(distributorId,id) {

    const distributor = await Distributor.findOne({where:{id:distributorId}});

    if (!distributor)
        throw new NotAuthorizedError('distributor with that token does not exist'); 

    const result = await Driver.findOne({where:{distributorId,id}});
    if (!result) return false;

    deleteFiles(result.dataValues);
    Driver.destroy({where:{distributorId,id},force:true})
    Login.destroy({where:{id},force:true});

    const { email, name } = result;
    return { id, email, name }
}

async function disableDriver(distributorId,id) {

    try{
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token/id does not exist'); 
        let driver;
        if (distributor.isSuperuser)
            driver = await Driver.findOne({where:{id}});
        else
            driver = await Driver.findOne({where:{distributorId,id}});
        if (!driver)
            throw new NotFoundError('driver');

        Driver.destroy({where:{id}})
        const { phone, name } = driver;
        return { id, distributorId: driver.distributorId, name, phone };
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

async function updateDriver(driver) {
    try{
        const { id } = driver;
        let result = await Driver.findOne({where:{id}});
        if (!result)
            throw new NotFoundError('driver');

        const newDriver = {
            ...driver,
            distributorId: result.distributorId 
        };
        result = await Driver.update(newDriver,{where:{id},returning:true,plain:true});

        const { phone, name } = result[1].dataValues;
        return {id, name, phone}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postDriver, registerDriver, getDrivers, getDriver, updateDriver, disableDriver, deleteDriver, getAssignedVehicles };