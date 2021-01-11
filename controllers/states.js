
const { District, State, Country} = require('../database/models');
const { getError, ValidationError, NotFoundError } = require('../utils/errors');

async function postState(state) {
    try{
        const { countryId } = state;
        if (!countryId || isNaN(countryId))
            throw new ValidationError('countryId','not found');

        const country = await Country.findOne({where: {id: countryId}});
        if (!country)
            throw new NotFoundError('country')

        // remove id if given
        delete state.id

        state = await country.createState(state);
        return {id: state.id, name: state.name}
    }catch(err){
        throw await getError(err);
    }
}

async function getStates(countryId) {
    try {
        if (countryId) {
            const country = await Country.findOne({where:{id:countryId}});
            if (!country)
                throw new NotFoundError('country');
        }
        const query = countryId? {countryId} : {};
        const allStates = await State.findAll({where:query,include: District});      
        return {count: allStates.length, data: allStates.map(state=>{
            const {countryId,id,name,Districts} = state;
            return {
                countryId,
                id,
                name,
                districts: Districts.map(district => ({id: district.id, name: district.name}))
            }})
        }
    }catch(err){
        throw await getError(err);
    }
}

async function updateState(state) {

    try{
        const { id } = state
        oldState = await State.findOne({where:{id}});
        if (!oldState)
            throw new NotFoundError('state')
        State.update(state,{where:{id}});
        return state;
    }catch(err){
        throw await getError(err);
    }
    
}

async function deleteState(id) {

    try{
        const state = await State.findOne({where:{id}});
        if (!state)
            throw new NotFoundError('state')

        State.destroy({where:{id}});
        return state.dataValues;
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postState, getStates, updateState, deleteState };