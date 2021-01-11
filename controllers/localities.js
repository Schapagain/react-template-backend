
const { Locality, State, Ward, Municipality} = require('../database/models');
const { getError, ValidationError, NotFoundError } = require('../utils/errors');

async function postLocality(locality) {
    try{
        const { municipalityId } = locality;
        if (!municipalityId || isNaN(municipalityId))
            throw new ValidationError('municipalityId','not found');

        const municipality = await Municipality.findOne({where: {id: municipalityId}});
        if (!municipality)
            throw new NotFoundError('municipality')

        // Set localities countryId,stateId, and districtId the same as that of municipality's
        locality = {
            ...locality,
            countryId: municipality.countryId,
            stateId: municipality.stateId,
            districtId: municipality.districtId,
        }
        // remove id if given
        delete locality.id
        
        locality = await municipality.createLocality(locality);
        return {id: locality.id, name: locality.name}
    }catch(err){
        throw await getError(err);
    }
}

async function getLocalities(municipalityId) {
    try {
        if (municipalityId) {
            const municipality = await Municipality.findOne({where:{id:municipalityId}});
            if (!municipality)
                throw new NotFoundError('municipality');
        }
        const query = municipalityId? {municipalityId} : {};
        const allLocalities = await Locality.findAll({where:query,include: Ward});      
        return {count: allLocalities.length, data: allLocalities.map(locality=>{
            const {municipalityId,id,name,Wards} = locality;
            return {
                municipalityId,
                id,
                name,
                wards: Wards? Wards.map(ward => ({id: ward.id, number: ward.number})) : []
            }})
        }
    }catch(err){
        throw await getError(err);
    }
}


async function updateLocality(locality) {

    try{
        const { id } = locality
        oldLocality = await Locality.findOne({where:{id}});
        if (!oldLocality)
            throw new NotFoundError('locality')
        Locality.update(locality,{where:{id}});
        return locality;
    }catch(err){
        throw await getError(err);
    }
    
}

async function deleteLocality(id) {

    try{
        const locality = await Locality.findOne({where:{id}});
        if (!locality)
            throw new NotFoundError('locality')

        Locality.destroy({where:{id}});
        return locality.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postLocality, getLocalities, updateLocality, deleteLocality };