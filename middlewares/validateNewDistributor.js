
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
    const emailFormat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!name || !allowedCountries.has(country) || !allowedLanguages.has(language) ||!email.match(emailFormat) || !documents || !(phone || mobile) || !street || !state || !postal) {
        return res.status(400).json({
            error: "Please provide all required details"
        })
    }

    next();
}

module.exports = validateNewDistributor;