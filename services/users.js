const fs = require('fs');
const path = require('path');
const { getRandomId } = require('../utils');
const { USER } = require('../utils/roles');
const { getError } = require('../utils/errors');

const User = require('../models/User');
const Login = require('../models/Login');
const Distributor = require('../models/Distributor');
const { expectedFiles } = require('../utils');
const { ValidationError, NotFoundError } = require('../utils/errors');

async function postUser(user) {

    try{
        // Check if the distributor is registered
        const distributorId = user.distributorId;
        if (!distributorId) throw new ValidationError('distribuftorId');
        
        const result = await Distributor.findOne({where:{id:distributorId}});
        if (!result) throw new ValidationError('distributorId');

        // extract all files and 
        // Replace files with filenames
        let allFiles = [];
        Object.keys(user).forEach(key => {
            if (typeof user[key] === 'object'){
                const file = user[key];
                const fileName = getRandomId().concat(path.extname(file.name));
                allFiles.push({fileName,file});
                user[key] = fileName;
            }
        })

        // Create a unique id for the new user
        user.id = getRandomId();

        // [TO ASK] Promise.all doesn't seem to work with rollback
        // How can we make this better?
        await User.create(user);
        await _initLogin(user);
        await _saveFiles(allFiles);
        const { id, name, phone } = user;
        return { id, name, phone };
    }catch(err){
        // Roll back changes
        deleteUser(user.distributorId,user.id);
        throw await getError(err);
    }
}

async function _initLogin(user) {
    try{
        const { id, phone } = user;
        await Login.create({id, phone, role:USER});
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