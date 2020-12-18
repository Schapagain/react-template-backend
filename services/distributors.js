const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { DISTRIBUTOR, DRIVER, ADMIN } = require('../utils/roles');
const { getError, NotFoundError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Login, Driver, sequelize, Op } = require('../models');
const { expectedFiles } = require('../utils');

const axios = require('axios');

async function postDistributor(distributor) {

    // Check if the given parentId exists
    const parent = await Distributor.findOne({where:{id:distributor.parentId}});
    if (!parent)
        throw new NotFoundError('parent');

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
            distributor = await parent.createDistributor({
                ...distributor
            },{transaction: t});
            
            // Generate a random code that allows setting a new password
            // [TODO] send this code via email   
            const code_length = 6;
            const setPasswordCode = getRandomCode(code_length)
            console.log('Set password code: ',setPasswordCode);

            const { id: distributorId, name, email, phone } = distributor;

            const login = await distributor.createLogin({
                distributorId,
                name,
                email,
                phone,
                setPasswordCode,
            },{transaction: t})

            const { id:loginId } = login;
            // Place foreign keys in Distributor model
            await Distributor.update({loginId},{where:{id: distributorId},transaction: t});

            return { id: distributorId, name, email };
        });

        await _saveFiles(allFiles,allFileNames);
        return result;
    }catch(err){
        throw await getError(err);
    }
}

async function _saveFiles(files, fileNames) {
        const filePath = path.join('.','uploads'); 
        const writeFile = fs.promises.writeFile;
        const readFile = fs.promises.readFile;
        try{
            files.forEach( async (file,index) => {
                if (file) {
                    const fileStream = await readFile(file.path);
                    const fullPath = path.join(filePath,fileNames[index]);
                    writeFile(fullPath,fileStream).catch(err=>{throw err});
                }
            })
        }catch(err){
            throw err;
        }
        
}

function _deleteFiles(user) {
    expectedFiles.forEach(fileName => {
        if (user[fileName]){
            const filePath = path.join('.','uploads',user[fileName]);
            fs.unlink(filePath,err=>console.log(err));
        }
    })
}

async function getDistributor(parentId,id) {
    try {

        let distributor;
        // View own info
        if (parentId == id){
            distributor = await Distributor.findAll({where:{id:parentId}}); 
        }else{
            const admin = await Distributor.findAll({where:{id:parentId}});
            if (!admin)
                throw new NotAuthorizedError('parent with that token does not exist!'); 

            if (admin.isSuperuser)
                distributor = await Distributor.findAll({where:{id}});
            else
                distributor = await admin[0].getDistributors({where:{id}}); 
        }
        

        if (!distributor.length)
            throw new NotFoundError('distributor');

        return {count: 1, data: distributor.map(dist => dist.dataValues)}
    }catch(err){
        throw await getError(err);
    }
}

async function getDistributors(parentId) {
    try {
        const admin = await Distributor.findOne({where: {id:parentId}});
        if (!admin)
            throw new NotAuthorizedError('parent with that token does not exist!'); 

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
            const {id, parentId, appId, area, email, name} = distributor
            return {id, parentId, appId, area, email, name}
        })}
    }catch(err){
        throw await getError(err);
    }
}

async function deleteDistributor(parentId,id) {

    try{
        const result = await Distributor.findOne({where:{parentId,id}});
        if (!result) return false;
    
        _deleteFiles(result.dataValues);
        Distributor.destroy({where:{parentId,id},force: true})
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
        const { id, parentId } = distributor;
        if (!id || !parentId) throw new ValidationError('id or parentId')

        const admin = await Distributor.findOne({where: {parentId}});
        if (!admin)
            throw new NotAuthorizedError('admin with that token does not exist!'); 

        const result = await Distributor.findOne({where:{parentId,id}});
        if (!result) throw new NotFoundError('distributor')

        Distributor.destroy({where:{parentId,id}})
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
        const { id, parentId } = distributor;
        if (!id || !parentId) throw new ValidationError('id or parentId')
        
        let result;
        // edit their own info
        if (parentId == id){
            result = await Distributor.findOne({where:{id}});
        }else{
            const parent = await Distributor.findOne({where: {id:parentId}});
            if (!parent)
                throw new NotAuthorizedError('parent with that token does not exist!'); 
            
            if (parent.isSuperuser){
                result = await Distributor.findOne({where:{id}});
            }else{
                result = await Distributor.findOne({where:{parentId,id}}); 
            }
        }
        

        if (!result) throw new NotFoundError('distributor');

        // Retain the previous parentId
        distributor.parentId = result.parentId;

        result = await Distributor.update(distributor,{where:{id},returning:true,plain:true});
        return result[1].dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

async function backupDistributors() {
    const distributors = await Distributor.findAll({attributes : ["id","name","email","phone"]});
    const method = 'create';
    const model = 'res.partner';
    const args = distributors.map(distributor => distributor.dataValues);
    const kwargs = {}
    const requestObject = _getOdooRequestFormat(method,model,args,kwargs);
    const endPoint = 'http://mobility.greatbear.tech/web/dataset/call_kw';
    await axios.post(endPoint,requestObject);
}

async function loginOdoo(){
    
    const data = JSON.stringify({
        "jsonrpc" : "2.0", 
        "method" : "call",
        "params" : {
            "db" : "live",
            "login" : "admin",
            "password" : process.env.ODOO_PASSWORD,
            "context" : {}
        }
    });

    var config = {
        method: 'post',
        url: 'http://mobility.greatbear.tech/web/session/authenticate',
        headers: { 
          'Content-Type': 'application/json'
        },
        data,
      };


    try{
        const result = await axios(config);

        return result.data.result.session_id;
    }catch(err){
        throw await getError(err);
    }
    
}

async function viewBackup() {

    const sessionId = await loginOdoo();

    const method = 'search_read';
    const model = 'res.partner';
    const kwargs = {
        "fields" : ["id","name","phone","email"]
    }
    const args = [];
    const data = _getOdooRequestFormat(method,model,args,kwargs);

    var config = {
        method: 'get',
        url: 'http://mobility.greatbear.tech/web/dataset/call_kw',
        headers: { 
          'Content-Type': 'application/json', 
          'Cookie': 'session_id=22d77fc7ce46be2c82fd28545e1b2cf2cae2e167'
        },
        data
      };

    const result = await axios(config);

    console.log(config.headers.Cookie);
    console.log(result.data);
      console.log(process.env.ODOO_PASSWORD);
    return result;
}

function _getOdooRequestFormat(method,model,args,kwargs){

    return {
        "jsonrpc": "2.0",
        "method" : "call",
        "params" : {
            kwargs,
            args,
            method,
            model,
        },
    }
}

module.exports = { postDistributor, getDistributor, getDistributors, disableDistributor, deleteDistributor, updateDistributor, backupDistributors, viewBackup};