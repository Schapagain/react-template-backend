const { emailFormat } = require('../utils');
const validateNewDistributor = (req, res, next) => {
    
    const {
        name,
        language,
        street,
        country,
        state,
        district,
        municipality,
        ward,
        postal,
        phone,
        mobile,
        email,
        website,
        documents,
        profilePicture
    } = req.body;

    const allowedCountries = new Set(['nepal','usa','united states','ghana','india','norway','indonesia','china','mauritius']);
    const allowedLanguages = new Set(['nepali','english','chinese','hindi','swahili','russian']);
    
    if (!name || !country || !language ||!email || !documents || !(phone || mobile) || !street || !state || !postal) {
        return sendError(res,'Please provide all required details');
    }

    if (!allowedCountries.has(country)){
        return sendError(res,'Invalid country');
    }

    if(!allowedLanguages.has(language)){
        return sendError(res,'Invalid language');
    }

    if(!email.match(emailFormat)){
        return sendError(res,'Invalid email');
    }

    next();
}

const sendError = (res,errorMessage) => {
    return res.status(400).json({
        error: errorMessage
    })
}

module.exports = validateNewDistributor;