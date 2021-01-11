
const { VehicleBrand } = require('../database/models');
const { getError, NotFoundError, ValidationError } = require('../utils/errors');

async function postVehicleBrand(brand) {
    try{
        await VehicleBrand.create(brand);
        const { id, name, title } = brand;
        return { id, name, title };
    }catch(err){
       throw await getError(err); 
    }
}


async function getVehicleBrands(distributorId) {
    try {
        const result = await VehicleBrand.findAll({where:{distributorId}})
        return result.map(brand => {
            return brand;
        });
    }catch(err){
        throw await getError(err);
    }
}

async function getVehicleBrand(distributorId,id) {
    try {
        const result = await VehicleBrand.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        throw await getError(err);
    }
}


async function deleteVehicleBrand(distributorId,id) {

    try{
        const result = await VehicleBrand.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('brand')
        VehicleBrand.destroy({where:{distributorId,id},force:true})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
   
}

async function disableVehicleBrand(distributorId,id) {

    try{
        const result = await VehicleBrand.findOne({where:{distributorId,id}});
        if (!result) return false;
        VehicleBrand.destroy({where:{distributorId,id}})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
    
}


async function updateVehicleBrand(brand) {
    try{
        const { id, distributorId } = brand;
        if (!id || !distributorId) 
            throw new ValidationError('id/distributorId')

        let result = await VehicleBrand.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('brand')

        result = await VehicleBrand.update(brand,{where:{id},returning:true,plain:true});
        const { title, name } = result[1].dataValues;
        return {id, title, name}
    }catch(err){
        throw await getError(err);
    }
}

module.exports = { postVehicleBrand, getVehicleBrands, getVehicleBrand, updateVehicleBrand, disableVehicleBrand, deleteVehicleBrand };