const db = require('../../utils/db');
const bcrypt =  require('bcrypt');

const updatePassword = async (id,password) => {

    try{
        const passwordHash = await generatePasswordHash(password);
        const queryString = "update login set password=$2 WHERE id=$1 RETURNING email";
        const queryValues = [id,passwordHash];

        const result = await db.query(queryString,queryValues);
        if (!result || !result.rowCount){
            return false;
        }else{
            return result.rows[0];
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