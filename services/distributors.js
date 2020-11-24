const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { DISTRIBUTOR, DRIVER, ADMIN } = require('../utils/roles');
const { getError, NotFoundError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Login, Driver, sequelize } = require('../models');
const { expectedFiles } = require('../utils');

async function postDistributor(distributor) {
    //Booleanify the value for usesPan field
    distributor.usesPan = distributor.pan? true : false
    distributor.panOrVat = distributor.pan? distributor.pan : distributor.vat;
    // Extract files
    allFiles = expectedFiles.map(fieldName => distributor[fieldName]);

    // Replace files with random filenames before posting to database
    allFileNames = [];
    expectedFiles.forEach(fieldName => {
        const file = distributor[fieldName];
        const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
        distributor[fieldName] = fileName;
        allFileNames.push(fileName);
    })

    try{
        const filePath = path.resolve('.','uploads');
        
        const result = await sequelize.transaction(async t => {
            distributor = await Distributor.create(distributor,{transaction: t});
            
            // create a new driver model for the distributor
            const { id: distributorId, phone, email, name, licenseDocument } = distributor;
            const driver = await distributor.createDriver({
                phone,
                name,
                licenseDocument,
            },{transaction: t})
            
            // Generate a random code that allows setting a new password
            // [TODO] send this code via email   
            const code_length = 6;
            const setPasswordCode = getRandomCode(code_length)
            console.log('Set password code: ',setPasswordCode);

            const { id: driverId } = driver;
            console.log(driverId);
            const login = await distributor.createLogin({
                driverId,
                phone,
                email,
                setPasswordCode,
            },{transaction: t})

            const { id:loginId } = login;
            // Place foreign keys in Driver and Distributor models
            await Distributor.update({loginId},{where:{id: distributorId},transaction: t});
            await Driver.update({loginId},{where:{id:driverId}, transaction: t});

            return distributor;
        });

        await _saveFiles(filePath,allFiles,allFileNames);
        const { id, name, email } = result;
        return { id, email, name };
    }catch(err){
        // Sequelize automaticaly rolls back if we get here.
        // We don't need to rollback potential problems in _saveFiles 
        // since we either succeed there, or we fail storing the files in the first place
        console.log(err)
        throw await getError(err);
    }
}

async function _saveFiles(filePath, files, fileNames) {
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

function _deleteFiles(user) {
    expectedFiles.forEach(fileName => {
        if (user[fileName]){
            const filePath = path.join('.','uploads',user[fileName]);
            fs.unlink(filePath,err=>console.log(err));
        }
    })
}

async function getDistributor(adminId,id) {
    try {
        const result = await Distributor.findOne({where:{adminId,id}});
        return result? result.dataValues : result;
    }catch(err){
        throw await getError(err);
    }
}

async function getDistributors(adminId,role) {
    try {
        let allDistributors;
        if (role === ADMIN){
            allDistributors = await Distributor.findAll();
        }else{
            const distributor = await Distributor.findOne({where: {id:adminId}});
            if (!distributor)
                throw new NotAuthorizedError(' distributor with that token does not exist!');
            allDistributors = distributor.getDistributors();
        }
        return allDistributors.map(distributor => {
            const {id, email, name} = distributor
            return {id, email, name}
        });
    }catch(err){
        throw await getError(err);
    }
}

async function deleteDistributor(adminId,id) {

    try{
        const result = await Distributor.findOne({where:{adminId,id}});
        if (!result) return false;
    
        _deleteFiles(result.dataValues);
        Distributor.destroy({where:{adminId,id},force: true})
        Login.destroy({where:{id},force:true});
        Driver.destroy({where:{id},force:true});

        const { email, name } = result;
        return { id, email, name }
    }catch(err){
        console.log('here')
        console.log(err)
        throw await getError(err);
    }

}

async function disableDistributor(adminId,id) {

    try{
        const result = await Distributor.findOne({where:{adminId,id}});
        if (!result) return false;

        Distributor.destroy({where:{adminId,id}})
        Login.destroy({where:{id}});
        Driver.destroy({where:{id}})

        const { email, name } = result;
        return { id, email, name }
    }catch(err){
        console.log(err)
    }

}

async function updateDistributor(distributor) {
    try{
        const { id, adminId } = distributor;
        if (!id || !adminId) return false;

        let result = await Distributor.findOne({where:{adminId,id}});
        if (!result) return false;

        result = await Distributor.update(distributor,{where:{id},returning:true,plain:true});
        const { email, name } = result[1].dataValues;
        return {id, email, name}
    }catch(err){
        console.log(err);
        return false;
    }
    
}

module.exports = { postDistributor, getDistributor, getDistributors, disableDistributor, deleteDistributor, updateDistributor };