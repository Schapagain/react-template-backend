
const auth = require('../middlewares/auth');
const { Package, Login, Driver, Distributor } = require('../database/models');
const { DRIVER } = require('../utils/roles');
const { getError, ValidationError,NotFoundError } = require('../utils/errors');

async function postPackage(package) {

    try{
        // Check if the given distributorId exists
        const distributor = await Distributor.findOne({where:{id:package.distributorId}});
        if (!distributor)
            throw new NotFoundError('distributor');

        package = await distributor.createPackage(package);
        const { id, distributorId, name, price, duration } = package;
        return { distributorId, id, name, price, duration};
    }catch(err){
        throw await getError(err);
    }
}

async function getPackage(distributorId,id) {
    try {
        if (!distributorId)
            throw new ValidationError('distributor Id');
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');

        let package;
        if (distributor.isSuperuser)
            package = await Package.findOne({where:{id}});
        else
            package = await distributor.getPackages({where:{id}});
        
        if (!package)
            throw new NotFoundError('package');

        return {count: 1, data: package}
    }catch(err){
        throw await getError(err);
    }
}

async function getPackages(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allPackages;        
        if (distributor.isSuperuser){
            allPackages = await Package.findAll({attributes : ['id','name','price','duration']});
        }else{
            allPackages = await distributor.getPackages({attributes : ['id','name','price','duration']});
        }

        allPackages = allPackages.map(package => package.dataValues);
        return {count: allPackages.length, data: allPackages};
    }catch(err){
        throw await getError(err);
    }
}

async function disablePackage(distributorId,id) {

    try{
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token/id does not exist'); 
        let package;
        if (distributor.isSuperuser)
            package = await Package.findOne({where:{id},attributes : ['id','name','price','duration']});
        else
            package = await Package.findOne({where:{distributorId,id},attributes : ['id','name','price','duration']});
        if (!package)
            throw new NotFoundError('package');

        Package.destroy({where:{id}})
        return package.dataValues;
    }catch(err){
        throw await getError(err);
    }
}

async function updatePackage(package) {
    try{
        const { id, distributorId } = package;
        if (!id || !distributorId)
            throw new ValidationError('id or distributorId');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 

        let result;
        if (distributor.isSuperuser)
            result = await Package.findOne({where:{id}});
        else
            result = await Package.findOne({where:{distributorId,id}});
        if (!result)
            throw new NotFoundError('package');

        // Keep the distributorId for the driver unchanged
        package.distributorId = result.distributorId;

        result = await Package.update(package,{where:{id},returning:true,plain:true});
        const { name, price, duration } = result[1].dataValues;
        return {id, name, price, duration}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postPackage, getPackage, getPackages, updatePackage, disablePackage };