const bcrypt =  require('bcrypt');
const { Login } = require('../models');
const { getError, NotAuthorizedError } = require('../utils/errors');
const { getRandomCode } = require('../utils');

const updatePassword = async (id,setPasswordCode,password) => {

    try{

        const user = await Login.findOne({where:{id,setPasswordCode}});
        if (!user)
            throw new NotAuthorizedError('Code has expired')

        password = await generatePasswordHash(password);
        console.log(setPasswordCode,id)
        const updated = await Login.update({password,setPasswordCode:null},{where:{id}})
        if (!updated){
            throw new Error();
        }
    }catch(err){
        throw await getError(err);
    }
    
}

const generatePasswordHash = async passwordPlain => {
    try{
        const saltRounds = 5;
        const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);
        return passwordHash;
    }
    catch(err){
        throw err;
    }
}

const sendPasswordResetCode = async email => {
    // Check if the user exists
    let result = await Login.findOne({where:{email}});
        
    if (result){
        // Generate random six-digit code
        const setPasswordCode = getRandomCode(6);

        // store code to the databse
        Login.update({...result.dataValues,setPasswordCode},{where:{email}})
        
        const { id } = result;
        return { id, setPasswordCode}
    }
}

module.exports = { updatePassword, sendPasswordResetCode };