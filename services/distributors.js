const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { DISTRIBUTOR, DRIVER, ADMIN } = require('../utils/roles');
const { getError, NotFoundError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Login, Driver, sequelize, Op } = require('../models');
const { expectedFiles } = require('../utils');

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

            const { id: distributorId, name, email } = distributor;

            const login = await distributor.createLogin({
                distributorId,
                name,
                email,
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
            const {id, parentId, area, email, name} = distributor
            return {id, parentId, area, email, name}
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

        result = await Distributor.update(distributor,{where:{id},returning:true,plain:true});
        return result[1].dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postDistributor, getDistributor, getDistributors, disableDistributor, deleteDistributor, updateDistributor };