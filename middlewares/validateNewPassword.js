const { passwordFormat } = require('../utils');
const validateNewDistributor = (req, res, next) => {
    
    const { password } = req.body;
    
    if (!password) {
        return sendError(res,'Please provide a password');
    }

    if(!password.match(passwordFormat)){
        return sendError(res,'Password too weak.');
    }
    next();
}

const sendError = (res,errorMessage) => {
    return res.status(400).json({
        error: errorMessage
    })
}

module.exports = validateNewDistributor;