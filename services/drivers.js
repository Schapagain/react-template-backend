
const auth = require('../middlewares/auth');
const path = require('path');
const { getRandomId } = require('../utils');
const fs = require('fs');
const { Login, Driver, Distributor, sequelize } = require('../models');
const { DRIVER } = require('../utils/roles');
const { getError, NotAuthorizedError, ValidationError, NotFoundError } = require('../utils/errors');
const { expectedFiles } = require('../utils')

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
            const { id:driverId, phone, email, name } = driver;
            const {id: loginId} = await driver.createLogin({phone,email,name,driverId},{transaction:t});
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
            allDrivers = await Driver.findAll();
        }else{
            allDrivers = await distributor.getDrivers();
        }
        
        return {count: allDrivers.length, data: allDrivers.map(driver => {
            const {id, distributorId, phone, name} = driver
            return {id, distributorId, phone, name}
        })}
    }catch(err){
        throw await getError(err);
    }
}

async function getDriver(distributorId,id) {
    try {

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 
        
        let driver;
        if (distributor.isSuperuser)
            driver = await Driver.findOne({where:{id}});
        else
            driver = await distributor.getDrivers({where:{id}});
        return driver? driver.dataValues : driver;
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
        const { id, distributorId } = driver;
        if (!id || !distributorId)
            throw new ValidationError('distributor with that token/id does not exist');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 

        let result;
        if (distributor.isSuperuser)
            result = await Driver.findOne({where:{id}});
        else
            result = await Driver.findOne({where:{distributorId,id}});
        if (!result)
            throw new NotFoundError('driver');
        // Keep the distributorId for the driver unchanged
        driver.distributorId = result.distributorId;

        result = await Driver.update(driver,{where:{id},returning:true,plain:true});
        const { phone, name } = result[1].dataValues;
        return {id, name, phone}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postDriver, getDrivers, getDriver, updateDriver, disableDriver, deleteDriver };