
const { Ward, Locality, Municipality} = require('../models');
const { getError, ValidationError, NotFoundError } = require('../utils/errors');

async function postWard(ward) {
    try{
        const { localityId } = ward;
        if (!localityId || isNaN(localityId))
            throw new ValidationError('localityId','not found');

        const locality = await Locality.findOne({where: {id: localityId}});
        if (!locality)
            throw new NotFoundError('locality')

        // Set localities countryId,stateId, districtId, and municipalityId the same as that of locality's
        ward = {
            ...ward,
            countryId: locality.countryId,
            stateId: locality.stateId,
            districtId: locality.districtId,
            municipalityId: locality.municipalityId,
        }
        // remove id if given
        delete ward.id;

        ward = await locality.createWard(ward);
        return {id: ward.id, number: ward.number}
    }catch(err){
        throw await getError(err);
    }
}

async function getWards(localityId) {
    try {
        if (localityId) {
            if (isNaN(localityId))
                throw ValidationError('id parameter') 
            const locality = await Locality.findOne({where:{id:localityId}});
            if (!locality)
                throw new NotFoundError('locality');
        }
        const query = localityId? {localityId} : {};
        const allWards = await Ward.findAll({where:query});      
        return {count: allWards.length, data: allWards.map(ward=>({localityId: ward.localityId,id: ward.id,number: ward.number}))}
    }catch(err){
        throw await getError(err);
    }
}


async function updateWard(ward) {

    try{
        const { id } = ward
        oldWard = await Ward.findOne({where:{id}});
        if (!oldWard)
            throw new NotFoundError('ward')
        Ward.update(ward,{where:{id}});
        return ward;
    }catch(err){
        throw await getError(err);
    }
    
}

async function deleteWard(id) {

    try{
        const ward = await Ward.findOne({where:{id}});
        if (!ward)
            throw new NotFoundError('ward')

        Ward.destroy({where:{id}});
        return ward.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postWard, getWards, updateWard, deleteWard };