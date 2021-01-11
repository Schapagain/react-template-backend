const fs = require('fs');
const path = require('path');
const { getRandomId, getRandomCode } = require('../utils');
const { USER } = require('../utils/roles');
const { getError } = require('../utils/errors');

const { Distributor, Login, User, sequelize } = require('../database/models');
const { expectedFiles } = require('../utils');
const { ValidationError, NotFoundError, NotAuthorizedError } = require('../utils/errors');
const { queryDatabase } = require('../database');
/**
 * Check if any login with the given parameters exists in the database
 * , and return the first login found
 * @param {object} query
 * @param {String[]} attributes
 */
async function checkLoginPresence({query,attributes=['id']}) {
    try{
      const users = await queryDatabase({query});
      if (!users || !users.length) throw new NotFoundError('login');
      return users[0]
    }catch(err){
      throw await getError(err);
    }
    
  }

async function postUser(user) {

    try{
        // Check if the distributor is registered
        const distributorId = user.distributorId;
        if (!distributorId || isNaN(Number(distributorId))) throw new ValidationError('distribuftorId');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor) throw new NotFoundError('distributor');

        // Extract files
        let allFiles = expectedFiles.map(fieldName => user[fieldName]);

        // Replace files with random filenames before posting to database
        let allFileNames = [];
        expectedFiles.forEach(fieldName => {
            const file = user[fieldName];
            const fileName = file? getRandomId().concat(path.extname(file.name)) : null;
            user[fieldName] = fileName;
            allFileNames.push(fileName);
        })

        const result = await sequelize.transaction( async t => {
            user = await distributor.createUser(user,{transaction:t});

            // Generate an OTP
            // [TODO] send this code via text   
            const code_length = 6;
            const otpCode = getRandomCode(code_length)
            console.log('OTP for user: ',otpCode)

            const { id:userId, phone, name } = user;
            const {id: loginId} = await user.createLogin({phone,name,userId,otpCode},{transaction:t});
            console.log('login id is:',loginId)
            await User.update({loginId},{where:{id:userId},transaction:t});
            return { id:userId, name, phone };
        });

        await _saveFiles(allFiles, allFileNames);
        const { id, name, phone } = result;
        return { id, name, phone };
    }catch(err){
        throw await getError(err);
    }
}

async function registerUser(user) {
    try{
        const { appId } = user;
        if (!appId)
            throw new ValidationError('distributorId');

        const distributor = await Distributor.findOne({where:{appId}});
        if (!distributor)
            throw new NotFoundError('app'); 

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

            user = await distributor.createUser({distributorId: distributor.id,...user},{transaction:t});
            // Generate an OTP
            // [TODO] send this code via text   
            const code_length = 6;
            const otpCode = getRandomCode(code_length)
            console.log('OTP for user: ',otpCode)

            const { id:userId, phone,name } = user;
            const {id: loginId} = await user.createLogin({phone,name,userId,otpCode},{transaction:t});
            await User.update({loginId},{where:{id:userId},transaction:t});
            return { id:userId, name, phone };
        });

        await _saveFiles(allFiles,allFileNames);
        return result;
    }catch(err){
        throw await getError(err);
    }
}


async function _saveFiles(files, fileNames) {
    const filePath = path.resolve('.','uploads');
    const writeFile = fs.promises.writeFile;
    const readFile = fs.promises.readFile;
    try{
        files.forEach( async (file,index) => {
            if (file) {
                const fileStream = await readFile(file.path).catch(err => { throw err });
                const fullPath = path.join(filePath,fileNames[index]);
                writeFile(fullPath,fileStream).catch(err=>{throw err});
            }
        })
    }catch(err){
        throw new getError(err);
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

async function getUser(distributorId,id) {
    try {

        if(isNaN(id))
            throw new ValidationError('id parameter');

        let user;
        // View their own info
        if (distributorId == id){
            user = await User.findAll({where:{id}});
        }else{
            const distributor = await Distributor.findOne({where:{id:distributorId}});
            if (!distributor)
                throw new NotAuthorizedError('distributor with that token does not exist'); 
        
            if (distributor.isSuperuser)
                user = await User.findAll({where:{id}});
            else
                user = await distributor.getUsers({where:{id}});
        }
        
        if (!user.length)
            throw new NotFoundError('user');
        
        return {count: 1, data: user.map(user => user.dataValues)}

    }catch(err){
        throw await getError(err);
    }
}

async function getUsers(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allUsers;        
        if (distributor.isSuperuser){
            allUsers = await User.findAll({include: Login});
        }else{
            allUsers = await distributor.getUsers({include: Login});
        }

        allUsers = await Promise.all(allUsers.map(async user => {
            const {id, distributorId, name, phone, Login} = user; 
            return { id, distributorId, active: Login.active, name, phone};
        }));

        return {count: allUsers.length, data: allUsers}

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
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token/id does not exist'); 
        let user;
        if (distributor.isSuperuser)
            user = await User.findOne({where:{id}});
        else
            user = await User.findOne({where:{distributorId,id}});
        if (!user)
            throw new NotFoundError('user');

        User.destroy({where:{id}})
        const { phone, name } = user;
        return { id, distributorId: user.distributorId, name, phone };
    }catch(err){
        throw await getError(err);
    }

}

async function updateUser(user) {
    try{
        const { id, distributorId } = user;
        if (!id || !distributorId)
            throw new ValidationError('id');
        
        let result;
        // Update their own info
        if (distributorId == id){
            result = await User.findOne({where:{id}}); 
        }else{
            const distributor = await Distributor.findOne({where:{id:distributorId}});
            if (!distributor)
                throw new NotAuthorizedError('distributor with that token does not exist'); 

            let result;
            if (distributor.isSuperuser)
                result = await User.findOne({where:{id}});
            else
                result = await User.findOne({where:{distributorId,id}});
        }
        
        if (!result)
            throw new NotFoundError('user');

        // Keep the distributorId for the user unchanged
        user.distributorId = result.distributorId;

        result = await User.update(user,{where:{id},returning:true,plain:true});
        const { phone, name } = result[1].dataValues;
        return {id, distributorId, name, phone}
    }catch(err){
        throw await getError(err);
    }
    
} 

module.exports = { postUser, registerUser, getUsers, getUser, updateUser, disableUser, deleteUser, checkLoginPresence };