const fs = require('fs');
const path = require('path');
const { getRandomId } = require('../utils');
const { USER } = require('../utils/roles');
const { getError } = require('../utils/errors');

const { Distributor, Login, User, sequelize } = require('../models');
const { expectedFiles } = require('../utils');
const { ValidationError, NotFoundError } = require('../utils/errors');

async function postUser(user) {

    try{
        // Check if the distributor is registered
        const distributorId = user.distributorId;
        if (!distributorId || isNaN(Number(distributorId))) throw new ValidationError('distribuftorId');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor) throw new NotFoundError('distributor');

        // Extract files
        allFiles = expectedFiles.map(fieldName => user[fieldName]);

        // Replace files with random filenames before posting to database
        allFileNames = [];
        expectedFiles.forEach(fieldName => {
            const file = user[fieldName];
            const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
            user[fieldName] = fileName;
            allFileNames.push(fileName);
        })

        const result = await sequelize.transaction( async t => {
            user = await distributor.createUser(user,{transaction:t});
            const { id:userId, phone, name } = user;
            const {id: loginId} = await user.createLogin({phone,name,userId},{transaction:t});
            await User.update({loginId},{where:{id:userId},transaction:t});
            return { id:userId, name, phone };
        });

        await _saveFiles(allFiles);
        const { id, name, phone } = result;
        return { id, name, phone };
    }catch(err){
        // [TODO] delete files to roll back changes
        throw await getError(err);
    }
}

async function _initLogin(user) {
    try{
        const { phone } = user;
        await Login.create({phone, role:USER});
    }catch(err){
        console.log(err);
    }
}

async function _saveFiles(files) {
    const filePath = path.resolve('.','uploads');
    const writeFile = fs.promises.writeFile;
    const readFile = fs.promises.readFile;
    files.forEach( async ({fileName, file}) => {
        if (file) {
            const fileStream = await readFile(file.path).catch(err => { throw err });
            const fullPath = path.join(filePath,fileName);
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

async function getUser(distributorId,id) {
    try {
        const result = await User.findOne({where:{distributorId,id}});
        if (!result || !result.dataValues) throw new NotFoundError('user');
        return result.dataValues;
    }catch(err){
        throw await getError(err);
    }
}

async function getUsers(distributorId) {
    try {
        const result = await User.findAll({where:{distributorId}})
        return result.map(user => {
            const {id, name, phone} = user
            return {id, name, phone}
        });
    }catch(err){
        throw await getError(err);
    }
}

async function deleteUser(distributorId,id) {

    try{
        if (!id) throw new ValidationError('id');
        if (!distributorId) throw new ValidationError('distributorId');

        const result = await User.findOne({where:{distributorId,id}});
        if (!result) throw new NotFoundError('user');
    
        _deleteFiles(result.dataValues);
        User.destroy({where:{distributorId,id},force: true})

        const { phone, name } = result;
        return { id, name, phone }
    }catch(err){
        console.log(err);
    }

}

async function disableUser(distributorId,id) {

    try{
        if (!id) throw new ValidationError('id');
        if (!distributorId) throw new ValidationError('distributorId');

        const result = await User.findOne({where:{distributorId,id}});
        if (!result) throw new NotFoundError('user');

        User.destroy({where:{distributorId,id}})
        Login.destroy({where:{id}});

        const { phone, name } = result;
        return { id, name, phone }
    }catch(err){
        throw await getError(err);
    }

}

async function updateUser(user) {
    try{
        const { id, distributorId } = user;
        if (!id) throw new ValidationError('id');
        if (!distributorId) throw new ValidationError('distributorId');

        let result = await User.findOne({where:{distributorId,id}});
        if (!result) throw new NotFoundError('user');

        result = await User.update(user,{where:{id},returning:true,plain:true});
        
        if (user.phone){
            Login.update({phone: user.phone},{where:{id}})
        }

        const { phone, name } = result[1].dataValues;
        return {id, name, phone }
    }catch(err){
        console.log(err)
        throw await getError(err);
    }
    
} 

module.exports = { postUser, getUsers, getUser, updateUser, disableUser, deleteUser };