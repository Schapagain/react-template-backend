
const db = require('../utils/db');

const validateSetPassword = async (req, res, next) => {
    
    const { id } = req.params;

    const userIsPending = await checkUserPending(id);

    if(!userIsPending){
        return sendError(res,'Could not set new password. Verify that the user exists and has not already set their password');
    }
    next();
}

const sendError = (res,errorMessage) => {
    return res.status(400).json({
        error: errorMessage
    })
}

const checkUserPending = async id => {
    try{
        const queryString = 'SELECT password FROM login WHERE id=$1';
        const queryValues = [id];
        const result = await db.query(queryString,queryValues);

        const userFound = result.rows.length > 0;
        if (!userFound) return false;

        const currentPassword = result.rows[0].password;
        console.log('current password is',currentPassword);
        const userIsPending =  !currentPassword;
        return userIsPending;
    }
    catch(err) {
        console.log(err.message);
        return false;
    }
}

module.exports = validateSetPassword;