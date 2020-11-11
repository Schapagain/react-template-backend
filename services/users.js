const fs = require('fs');
const path = require('path');
const { getRandomId } = require('../utils');
const { USER } = require('../utils/roles');
const { getError } = require('../utils/errors');

const User = require('../models/User');
const Login = require('../models/Login');

const { expectedFiles } = require('../utils');

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

async function postUser(user) {

    // Save files to filesystem
    // Replace files with filenames
    Object.keys(user).forEach(key => {
        if (typeof user[key] === 'object'){
            const file = user[key];
            const fileName = getRandomId().concat(path.extname(file.name));
            _saveFile(user[key],fileName);
            user[key] = fileName;
        }
    })

    // Create a unique id for the new user
    user.id = getRandomId();
    try{
        const filePath = path.resolve('.','uploads');

        // [TO ASK] Promise.all doesn't seem to work with rollback
        // How can we make this better?
        await User.create(user);
        await _initLogin(user);
        await _saveFiles(filePath,allFiles,allFileNames);
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
        console.log(err);
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
        console.log(err)
    }
}

async function deleteUser(distributorId,id) {

    try{
        const result = await User.findOne({where:{distributorId,id}});
        if (!result) return false;
    
        _deleteFiles(result.dataValues);
        User.destroy({where:{distributorId,id},force: true})
        User.destroy({where:{id},force:true});

        const { phone, name } = result;
        return { id, name, phone }
    }catch(err){
        console.log(err);
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

module.exports = { postUser };