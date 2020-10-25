const { v4 : uuid } = require('uuid');
const fs = require('fs');

const id = (req,res,next) => {

    console.log('creating new file system..')

    // Generate unique id and inject into req
    const uniqueId = uuid();
    req.body.id = uniqueId;
    console.log(uniqueId);
    // Create a directory for the potential user
    fs.mkdir('./uploads/'.concat(uniqueId),err => {
        if (err) {
            return res.status(500).json({
                error: "Could not add new user. Try again later."
            })
        }
    })
    
    next();
}

module.exports = id;