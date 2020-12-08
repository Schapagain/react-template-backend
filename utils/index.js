
const { v4: uuid } = require('uuid');
const { DISTRIBUTOR, DRIVER, USER } = require('./roles');

const expectedFiles = ['profilePicture','licenseDocument', 'registrationDocument'];

const allowedCountries = ['nepal','usa','united states','ghana','india','norway','indonesia','china','mauritius'];
const allowedLanguages = ['nepali','english','chinese','hindi','swahili','russian'];

const getRandomId = () => uuid().slice(0,5);

const getRandomCode = length => Math.floor(Math.random() * (10**length - 10**(length-1)) + 10**(length-1));

const getRoles = user => {
    const { distributorId, driverId, userId } = user;
    let roles = [];
    if (distributorId)
        roles.push({role:DISTRIBUTOR,id:distributorId});
    if (driverId)
        roles.push({role:DRIVER,id:driverId});
    if (userId)
        roles.push({role:USER,id:userId});
    return roles;
}

module.exports = { allowedCountries, allowedLanguages, expectedFiles, getRandomId, getRandomCode, getRoles };