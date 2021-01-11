const { Distributor } = require("../database/models");
const { ValidationError } = require("../utils/errors");
require('dotenv').config();
const axios = require('axios');

async function calculateFare({appId,distance,waitTime=0}) {
    distance = parseFloat(distance);
    waitTime = parseFloat(waitTime);

    if (!appId) throw new ValidationError('appId');
    if (!distance) throw new ValidationError('distance');

    const config = (await Distributor.findOne({where:{appId},attributes:['config']})).dataValues.config;
    if (!config) throw new ValidationError('appId')
    
    const fare = (config.minFare || 0) + (distance * config.farePerUnitDistance || 0) + (waitTime * config.farePerUnitWait || 0);
    return {fare,distance,waitTime}
}

async function calculateDistance({origin,destination}) {

    if (!destination || !destination.length || destination.length !== 2) throw new ValidationError('destination');
    if (!origin || !origin.length || origin.length !== 2 ) throw new ValidationError('origin');

    let response;
    try {
        const dist = await useDistanceMatrixAPI(origin,destination)
        response = {
            origin,
            destination,
            distance : dist.data.rows[0].elements[0].distance || 'NO_PATH',
            duration: dist.data.rows[0].elements[0].duration || 'NO_PATH'
        }
    } catch(err) {
        throw await getError(err);
    }
    
    return response;
}

async function useDistanceMatrixAPI(origin,destination) {
    const key = process.env.GOOGLE_API_KEY
    origin = origin.join(',');  
    destination = destination.join(',');
    parameters = `origins=${origin}&destinations=${destination}&key=${key}`;

    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?${parameters}`,
        headers: { 'Content-Type': 'application/json' },
    };
    return axios(config);
}

module.exports = { 
    calculateFare, 
    calculateDistance,    
}; 