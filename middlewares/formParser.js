

const formidable = require('formidable');

const formParser = (req,res,next) => {
    const form = formidable({multiples:true})
    const acceptedFormats = new Set(['image/jpeg','image/jpg','image/png']);
    form.parse(req, (err,fields,files) => {
        if (err){
            return res.status(500).json({
                error: "Couldn't parse the form. Try again later"
            })
        }
        
        if (files.documents) {
            if (!Array.isArray(files.documents)){
                files.documents = [files.documents];
            }
            files.documents.forEach(file => {
                if (!acceptedFormats.has(file.type)) {
                    return next(new Error('Unacceptable file format'))
                }
            })
        }
        req.body = {...files,...fields};
        next();
    })
}

module.exports = formParser;
