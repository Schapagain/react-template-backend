
const auth = require('../middlewares/auth');
const path = require('path');
const { v4: uuid} = require('uuid');
const fs = require('fs');
const Driver = require('../models/Driver');
const Login  =  require('../models/Login');
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

    // [TODO] validation here

    // Save files to filesystem
    // Replace files with filenames
    Object.keys(driver).forEach(key => {
        if (typeof driver[key] === 'object'){
            const fileName = uuid().slice(0,4).concat(path.extname(file.name));
            _saveFile(driver[key],fileName);
            driver[key] = fileName;
        }
    })

    // Create a unique id for the new driver
    driver.id = uuid().slice(0,4);
    try{
        await Promise.all([ 
            Driver.create(driver),
            _initLogin(driver.id,driver.phone),
        ]);
        const { id, name, email } = driver;
        return { id, email, name };
    }catch(err){
        // [TODO] Roll back changes
        console.error(err);
        return false;
    }
}

async function _initLogin(id,phone) {
    try{
        const role = DRIVER
        await Login.create({id, phone, role});
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

module.exports = { postDriver, getDrivers };