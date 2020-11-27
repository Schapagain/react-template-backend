const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { DISTRIBUTOR, DRIVER, ADMIN } = require('../utils/roles');
const { getError, NotFoundError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Login, Driver, sequelize, Op } = require('../models');
const { expectedFiles } = require('../utils');

async function postDistributor(distributor) {

    // Check if the given adminId exists
    const admin = await Distributor.findOne({where:{id:distributor.adminId}});
    if (!admin)
        throw new NotFoundError('admin');

    //Booleanify the value for usesPan field
    distributor.usesPan = distributor.pan? true : false;

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
        const result = await sequelize.transaction(async t => {
            distributor = await admin.createDistributor({
                ...distributor
            },{transaction: t});
            
            // create a new driver model for the distributor
            const { id: distributorId, phone, email, name, licenseDocument } = distributor;
            const driver = await distributor.createDriver({
                distributorId,
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

            return { id: distributorId, name, email };
        });

        await _saveFiles(allFiles,allFileNames);
        return result;
    }catch(err){
        // Sequelize automaticaly rolls back if we get here.
        // We don't need to rollback potential problems in _saveFiles 
        // since we either succeed there, or we fail storing the files in the first place
        throw await getError(err);
    }
}

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

        const admin = await Distributor.findOne({where:{id:adminId}});
        if (!admin)
            throw new NotAuthorizedError(' admin with that token does not exist!'); 

        let distributor;
        if (admin.isSuperuser)
            distributor = await Distributor.findOne({where:{id}});
        else
            distributor = await admin.getDistributors({where:{id}});

        return distributor? distributor.dataValues : null;
    }catch(err){
        throw await getError(err);
    }
}

async function getDistributors(adminId) {
    try {
        const admin = await Distributor.findOne({where: {id:adminId}});
        if (!admin)
            throw new NotAuthorizedError(' admin with that token does not exist!'); 

        let allDistributors;
        if (admin.isSuperuser){
            allDistributors = await Distributor.findAll({
                where: {
                    id: {
                        [Op.ne] : 1,
                    }
                }
            });
        }else{
            allDistributors = await admin.getDistributors();
        }
        return {count: allDistributors.length, data: allDistributors.map(distributor => {
            const {id, adminId, email, name} = distributor
            return {id, adminId, email, name}
        })}
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
        throw await getError(err);
    }

}

async function disableDistributor(distributor) {

    try{
        const { id, adminId } = distributor;
        if (!id || !adminId) throw new ValidationError('id or adminId')

        const admin = await Distributor.findOne({where: {adminId}});
        if (!admin)
            throw new NotAuthorizedError('admin with that token does not exist!'); 

        const result = await Distributor.findOne({where:{adminId,id}});
        if (!result) throw new NotFoundError('distributor')

        Distributor.destroy({where:{adminId,id}})
        Login.destroy({where:{id}});
        Driver.destroy({where:{id}})

        const { email, name } = result;
        return { id, email, name }
    }catch(err){
        throw await getError(err);
    }

}

async function updateDistributor(distributor) {
    try{
        const { id, adminId } = distributor;
        if (!id || !adminId) throw new ValidationError('id or adminId')

        const admin = await Distributor.findOne({where: {adminId}});
        if (!admin)
            throw new NotAuthorizedError(' admin with that token does not exist!'); 

        let result = await Distributor.findOne({where:{adminId,id}});
        if (!result) throw new NotFoundError('distributor');

        result = await Distributor.update(distributor,{where:{id},returning:true,plain:true});
        const { email, name } = result[1].dataValues;
        return {id, email, name}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postDistributor, getDistributor, getDistributors, disableDistributor, deleteDistributor, updateDistributor };