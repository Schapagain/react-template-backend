
const auth = require('../middlewares/auth');
const path = require('path');
const { getRandomId } = require('../utils');
const fs = require('fs');
const { Login, Driver } = require('../models');
const { DRIVER } = require('../utils/roles');

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

async function postDriver(driver) {

    // Save files to filesystem
    // Replace files with filenames
    Object.keys(driver).forEach(key => {
        if (typeof driver[key] === 'object'){
            const file = driver[key];
            const fileName = getRandomId().concat(path.extname(file.name));
            _saveFile(driver[key],fileName);
            driver[key] = fileName;
        }
    })

    try{
        driver = await Driver.create(driver);
        await _initLogin(driver.phone);

        const { id, name, email } = driver;
        return { id, email, name };
    }catch(err){
        // [TODO] Roll back changes
        console.error(err);
        return false;
    }
}

async function _initLogin(phone) {
    try{
        const role = DRIVER
        await Login.create({phone, role});
    }catch(err){
        console.log(err);
    }
}

async function getDrivers(distributorId) {
    try {
        const result = await Driver.findAll({where:{distributorId}})
        return result.map(driver => {
            const {id, phone, name} = driver
            return {id, phone, name}
        });
    }catch(err){
        console.log(err)
    }
}

async function getDriver(distributorId,id) {
    try {
        const result = await Driver.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        console.log(err);
    }
}


async function deleteDriver(distributorId,id) {

    const result = await Driver.findOne({where:{distributorId,id}});
    if (!result) return false;

    deleteFiles(result.dataValues);
    Driver.destroy({where:{distributorId,id},force:true})
    Login.destroy({where:{id},force:true});

    const { email, name } = result;
    return { id, email, name }
}

async function disableDriver(distributorId,id) {

    const result = await Driver.findOne({where:{distributorId,id}});
    if (!result) return false;

    Driver.destroy({where:{distributorId,id}})
    Login.destroy({where:{id}});

    const { email, name } = result;
    return { id, email, name }
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
        if (!id || !distributorId) return false;

        let result = await Driver.findOne({where:{distributorId,id}});
        if (!result) return false;

        result = await Driver.update(driver,{where:{id},returning:true,plain:true});
        const { phone, name } = result[1].dataValues;
        return {id, name, phone}
    }catch(err){
        console.log(err);
        return false;
    }
    
}

module.exports = { postDriver, getDrivers, getDriver, updateDriver, disableDriver, deleteDriver };