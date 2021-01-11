
const { Municipality, State, Locality, District } = require('../database/models');
const { getError, ValidationError, NotFoundError } = require('../utils/errors');

async function postMunicipality(municipality) {
    try{
        const { districtId } = municipality;
        if (!districtId || isNaN(districtId))
            throw new ValidationError('districtId','not found');

        const district = await District.findOne({where: {id: districtId}});
        if (!district)
            throw new NotFoundError('district')

        // Set municipalities' countryId,stateId the same as that of district's
        municipality = {
            ...municipality,
            countryId: district.countryId,
            stateId: district.stateId,
        }
        
        // remove id if given
        delete municipality.id
        
        municipality = await district.createMunicipality(municipality);
        return {id: municipality.id, name: municipality.name}
    }catch(err){
        throw await getError(err);
    }
}

async function getMunicipalities(districtId) {
    try {
        if (districtId) {
            if (isNaN(districtId))
                throw new ValidationError('id paramater')
            const district = await State.findOne({where:{id:districtId}});
            if (!district)
                throw new NotFoundError('district');
        }
        const query = districtId? {districtId} : {};
        const allMunicipalities = await Municipality.findAll({where:query,include: Locality});      
        return {count: allMunicipalities.length, data: allMunicipalities.map(municipality=>{
            const {districtId,id,name,Localities} = municipality;
            return {
                districtId,
                id,
                name,
                localities: Localities? Localities.map(locality => ({id: locality.id, name: locality.name})) : []
            }})
        }
    }catch(err){
        throw await getError(err);
    }
}


async function updateMunicipality(municipality) {

    try{
        const { id } = municipality

        if (isNaN(id))
            throw new ValidationError('id parameter')

        oldMunicipality = await Municipality.findOne({where:{id}});
        if (!oldMunicipality)
            throw new NotFoundError('municipality')
        Municipality.update(municipality,{where:{id}});
        return municipality;
    }catch(err){
        throw await getError(err);
    }
    
}

async function deleteMunicipality(id) {

    try{

        if(isNaN(id))
            throw new ValidationError('id paramter')

        const municipality = await Municipality.findOne({where:{id}});
        if (!municipality)
            throw new NotFoundError('municipality')

        Municipality.destroy({where:{id}});
        return municipality.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postMunicipality, getMunicipalities, updateMunicipality, deleteMunicipality };