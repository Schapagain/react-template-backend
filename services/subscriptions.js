
const auth = require('../middlewares/auth');
const { Subscription, Login, Driver, Distributor } = require('../models');
const Package = require('../models/Package');
const { getError, ValidationError,NotFoundError } = require('../utils/errors');

async function postSubscription(subscription) {

    try{
        // Check if the given distributorId exists
        const distributor = await Distributor.findOne({where:{id:subscription.distributorId}});
        if (!distributor)
            throw new NotFoundError('distributor');


        // Calculate expiry date for package subscriptions
        if (!subscription.packageId) {
            const package = await Package.findOne({where:{id:packageId}});
            if (!package) throw new NotFoundError('package');
            const duration = package.duration;
            let expiresAt = package.startsAt || new Date();
            expiresAt = new Date(expiresAt);
            expiresAt.setDate(expiresAt.getDate() + duration);
            subscription.expiresAt = expiresAt;
        }

        subscription = await distributor.createSubscription(subscription);
        const { id, distributorId, type, cutPercent, packageId } = subscription;
        return { distributorId, id, type, cutPercent, packageId }
    }catch(err){
        throw await getError(err);
    }
}

async function getSubscription(distributorId,id) {
    try {
        if (!distributorId)
            throw new ValidationError('distributor Id');
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');

        let subscription;
        if (distributor.isSuperuser)
            subscription = await Subscription.findOne({where:{id}});
        else
            subscription = await distributor.getSubscriptions({where:{id}});
        
        if (!subscription)
            throw new NotFoundError('subscription');

        return {count: 1, data: subscription}
    }catch(err){
        throw await getError(err);
    }
}

async function getSubscriptions(distributorId) {
    try {

        if (!distributorId)
            throw new ValidationError('distributor Id');

        const distributor = await Distributor.findOne({where:{id:distributorId}});

        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist');
        let allSubscriptions;        
        if (distributor.isSuperuser){
            allSubscriptions = await Subscription.findAll({attributes : ['id','type','cut_percent','package_id']});
        }else{
            allSubscriptions = await distributor.getSubscriptions({attributes : ['id','type','cut_percent','package_id']});
        }

        allSubscriptions = allSubscriptions.map(subscription => subscription.dataValues);
        return {count: allSubscriptions.length, data: allSubscriptions};
    }catch(err){
        throw await getError(err);
    }
}

async function disableSubscription(distributorId,id) {

    try{
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token/id does not exist'); 
        let subscription;
        if (distributor.isSuperuser)
            subscription = await Subscription.findOne({where:{id},attributes : ['id','type','cut_percent','package_id']});
        else
            subscription = await Subscription.findOne({where:{distributorId,id},attributes : ['id','type','cut_percent','package_id']});
        if (!subscription)
            throw new NotFoundError('subscription');

        Subscription.destroy({where:{id}})
        return subscription.dataValues;
    }catch(err){
        throw await getError(err);
    }
}

async function updateSubscription(subscription) {
    try{
        const { id, distributorId } = subscription;
        if (!id || !distributorId)
            throw new ValidationError('id or distributorId');
        
        const distributor = await Distributor.findOne({where:{id:distributorId}});
        if (!distributor)
            throw new NotAuthorizedError('distributor with that token does not exist'); 

        let result;
        if (distributor.isSuperuser)
            result = await Subscription.findOne({where:{id}});
        else
            result = await Subscription.findOne({where:{distributorId,id}});
        if (!result)
            throw new NotFoundError('subscription');

        // Keep the distributorId for the driver unchanged
        subscription.distributorId = result.distributorId;

        result = await Subscription.update(subscription,{where:{id},returning:true,plain:true});
        const { type, cutPercent, packageId } = result[1].dataValues;
        return {id, type, cutPercent, packageId}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postSubscription, getSubscription, getSubscriptions, updateSubscription, disableSubscription };