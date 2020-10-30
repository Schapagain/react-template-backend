const db = require('../../utils/db');

const updatePassword = async (id,password) => {

    const queryString = "update login set password=$2 WHERE id=$1 RETURNING email";
    const queryValues = [id,password];

    try{
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

module.exports = { updatePassword };