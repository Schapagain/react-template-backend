
const { District, State, Municipality} = require('../database/models');
const { getError, ValidationError, NotFoundError } = require('../utils/errors');

async function postDistrict(district) {
    try{
        const { stateId } = district;
        if (!stateId)
            throw new ValidationError('stateId','not found');

        const state = await State.findOne({where: {id: stateId}});
        if (!state)
            throw new NotFoundError('state')

        // Set districts countryId the same as that of state's
        district = {
            ...district,
            countryId: state.countryId
        }
        
        district = await state.createDistrict(district);
        return {id: district.id, name: district.name}
    }catch(err){
        throw await getError(err);
    }
}

async function getDistricts(stateId) {
    try {
        if (stateId) {
            if (isNaN(stateId))
                throw new ValidationError('id parameter')
            const state = await State.findOne({where:{id:stateId}});
            if (!state)
                throw new NotFoundError('state');
        }
        const query = stateId? {stateId} : {};
        const allDistricts = await District.findAll({where:query,include: Municipality});      
        return {count: allDistricts.length, data: allDistricts.map(district=>{
            const {stateId,id,name,Municipalities} = district;
            return {
                stateId,
                id,
                name,
                municipalities: Municipalities? Municipalities.map(district => ({id: district.id, name: district.name})) : []
            }})
        }
    }catch(err){
        throw await getError(err);
    }
}


async function updateDistrict(district) {

    try{
        const { id } = district

        if (isNaN(id))
            throw new ValidationError('id parameter')

        oldDistrict = await District.findOne({where:{id}});
        if (!oldDistrict)
            throw new NotFoundError('district')
        District.update(district,{where:{id}});
        return district;
    }catch(err){
        throw await getError(err);
    }
    
}

async function deleteDistrict(id) {

    try{
        if (isNaN(id))
            throw new ValidationError('id parameter')
        const district = await District.findOne({where:{id}});
        if (!district)
            throw new NotFoundError('district')

        District.destroy({where:{id}});
        return district.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postDistrict, getDistricts, updateDistrict, deleteDistrict };