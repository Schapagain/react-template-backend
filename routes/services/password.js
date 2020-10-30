const db = require('../../utils/db');
const bcrypt =  require('bcrypt');
const { updateTable } = require('./db');

const updatePassword = async (id,password) => {

    try{
        const passwordHash = await generatePasswordHash(password);

        const result = await updateTable('login',{id,password:passwordHash})
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