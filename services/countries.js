
const { Distributor, Country, State} = require('../models');
const { getError, NotAuthorizedError, ValidationError, NotFoundError } = require('../utils/errors');

async function postCountry(country) {
    try{
        // remove if id given
        delete country.id;
        
        country = await Country.create(country);
        return country.dataValues;
    }catch(err){
        throw await getError(err);
    }
}

async function getCountries(id) {
    try {
        if (id && isNaN(id))
            throw new ValidationError('id parameter');

        const query = id? {id} : {};
        allCountries = await Country.findAll({where:query,include:State});
        allCountries = allCountries.map(country => {
            const {id, name, States} = country;
            return {
                id,name,
                States: States.map(state => {
                    const { id, name } = state;
                    return { id, name }
                })
            }
        })
        return {count: allCountries.length, data: allCountries}
    }catch(err){
        throw await getError(err);
    }
}

async function updateCountry(country){
    try{
        const { id } = country;

        if (isNaN(id))
            throw new ValidationError('id parameter');
        oldCountry = await Country.findOne({where:{id}});
        if (!oldCountry)
            throw new NotFoundError('country');
        Country.update(country,{where:{id:oldCountry.id}});
        return country;
    }catch(err){
        throw await getError(err);
    }
}

async function deleteCountry(id) {

    try{
        if (isNaN(id))
            throw ValidationError('id parameter')
            
        country = await Country.findOne({where:{id}});
        if (!country)
            throw new NotFoundError('country')
        Country.destroy({where:{id}});
        return {id: country.id,name:country.name};
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postCountry, getCountries, updateCountry, deleteCountry };