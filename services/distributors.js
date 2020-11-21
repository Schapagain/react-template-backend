const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { DISTRIBUTOR, DRIVER } = require('../utils/roles');
const { getAuthToken } = require('../utils/auth');
const { getError } = require('../utils/errors');

const Distributor = require('../models/Distributor');
const Login = require('../models/Login');
const Driver = require('../models/Driver');

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

        // [TO ASK] Promise.all doesn't seem to work with rollback
        // How can we make this better?
        distributor = await Distributor.create(distributor);
        await _initDriver(distributor);
        await _initLogin(distributor);
        await _saveFiles(filePath,allFiles,allFileNames);
        const { id, name, email } = distributor;
        return { id, email, name };
    }catch(err){
        // Roll back changes
        if (distributor.id)
            deleteDistributor(distributor.adminId,distributor.id);
        throw await getError(err);
    }
}

async function _initDriver(distributor) {
    try{
        const { phone, name, licenseDocument, id:distributorId } = distributor;
        await Driver.create({phone,name,licenseDocument,distributorId});
    }catch(err){
        throw err;
    }
}

async function _initLogin(distributor) {
    try{
        const { id, email, phone } = distributor;

        // Initialize login for the new distributor
        const result = await Login.create({id, email, phone, role:DISTRIBUTOR});

        // Generate a random code that allows setting a new password
        // [TODO] send this code via email   
        const code_length = 6;
        const setPasswordCode = getRandomCode(code_length)
        console.log('Set password code: ',setPasswordCode);

        // Store code in the database
        Login.update({setPasswordCode},{where:{id}})
        
    }catch(err){
        throw err;
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

async function getDistributors(adminId) {
    try {
        const result = await Distributor.findAll({where:{adminId}})
        return result.map(distributor => {
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