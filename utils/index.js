
const { v4: uuid } = require('uuid');

const expectedFiles = ['profilePicture','licenseDocument', 'registrationDocument'];

const allowedCountries = ['nepal','usa','united states','ghana','india','norway','indonesia','china','mauritius'];
const allowedLanguages = ['nepali','english','chinese','hindi','swahili','russian'];

const getRandomId = () => uuid().slice(0,5);

module.exports = { allowedCountries, allowedLanguages, expectedFiles, getRandomId };