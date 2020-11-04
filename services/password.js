const bcrypt =  require('bcrypt');
const Login = require('../models/Login');

const updatePassword = async (id,password) => {

    try{
        password = await generatePasswordHash(password);

        const result = await Login.update({password},{where:{id}})
        if (!result){
            return false;
        }else{
            return result
        }
    }catch(err){
        console.log(err);
        return false;
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

module.exports = { updatePassword };