
const { VehicleModel } = require('../models');
const { getError, NotFoundError, ValidationError } = require('../utils/errors');

async function postVehicleModel(model) {
    try{
        await VehicleModel.create(model);
        const { id, name, title } = model;
        return { id, name, title };
    }catch(err){
       throw await getError(err); 
    }
}


async function getVehicleModels() {
    try {
        const result = await VehicleModel.findAll({where:{distributorId}})
        return result.map(model => {
            return model;
        });
    }catch(err){
        throw await getError(err);
    }
}

async function getVehicleModel(distributorId,id) {
    try {
        const result = await VehicleModel.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        throw await getError(err);
    }
}


async function deleteVehicleModel(distributorId,id) {

    try{
        const result = await VehicleModel.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('model')
        VehicleModel.destroy({where:{distributorId,id},force:true})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
   
}

async function disableVehicleModel(distributorId,id) {

    try{
        const result = await VehicleModel.findOne({where:{distributorId,id}});
        if (!result) return false;
        VehicleModel.destroy({where:{distributorId,id}})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
    
}


async function updateVehicleModel(model) {
    try{
        const { id, distributorId } = model;
        if (!id || !distributorId) 
            throw new ValidationError('id/distributorId')

        let result = await VehicleModel.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('model')

        result = await VehicleModel.update(model,{where:{id},returning:true,plain:true});
        const { title, name } = result[1].dataValues;
        return {id, title, name}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postVehicleModel, getVehicleModels, getVehicleModel, updateVehicleModel, disableVehicleModel, deleteVehicleModel };