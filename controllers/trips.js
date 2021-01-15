const { Distributor } = require("../database/models");
const { ValidationError, NotFoundError } = require("../utils/errors");
require('dotenv').config();
const axios = require('axios');

async function calculateFare({appId,origin,destination,waitTime=0}) {
    waitTime = parseFloat(waitTime);

    const config = (await Distributor.findOne({where:{appId},attributes:['config']})).dataValues.config;
    if (!config) throw new ValidationError('appId')
    
    const distanceReponse = await calculateDistance({appId,origin,destination});
    const distance = distanceReponse.distance.value;
    if (!distance) throw new NotFoundError('path');

    const fare = (config.minFare || 0) + (distance/1000 * config.farePerUnitDistance || 0) + (waitTime * config.farePerUnitWait || 0);
    return {...distanceReponse,fare:{value:fare,waitTime,distance,farePerUnitDistance,farePerUnitWait,minFare}}
}

async function calculateDistance({appId,origin,destination}) {

    if (!appId) throw new ValidationError('appId');
    const distributor = await Distributor.findOne({where:{appId}});
    if (!distributor) throw new ValidationError('appId');

    distributor.isWithinArea(origin);
    distributor.isWithinArea(destination);

    if (!destination || !destination.length || destination.length !== 2) throw new ValidationError('destination');
    if (!origin || !origin.length || origin.length !== 2 ) throw new ValidationError('origin');

    let response;
    try {
        const dist = await useDistanceMatrixAPI(origin,destination)
        response = {
            origin: dist.data.origin_addresses[0] || origin,
            destination: dist.data.destination_addresses[0] || destination,
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