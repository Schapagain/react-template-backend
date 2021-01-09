const { Distributor } = require("../models");
const { ValidationError } = require("../utils/errors");


async function calculateFare(req) {

    let { appId, distance, waitTime } = req;
    distance = parseFloat(distance);
    waitTime = parseFloat(waitTime);

    if (!appId) throw new ValidationError('appId');
    if (!distance) throw new ValidationError('distance');
    if (!waitTime) throw new ValidationError('waitTime');

    const config = (await Distributor.findOne({where:{appId},attributes:['config']})).dataValues.config;
    if (!config) throw new ValidationError('appId')
    
    const fare = (config.minFare || 0) + (distance * config.farePerUnitDistance || 0) + (waitTime * config.farePerUnitWait || 0);
    return {fare,distance,waitTime}
}


module.exports = { calculateFare }; 