const { Distributor, Driver, User, Vehicle, Country, Package, Contact, Subscription } = require('../models');

/**
 * Return accepted token authorization methods
 */
function getValidAuthMethods() {
    return ['bearer'];
}

/**
 * Return mappings from routes to [userModel,allowed roles]
 * Usermodel is the model associated with the route
 */
function getRoutePermissions() {
    const routePermissionsMap = {
        'drivers' : [Driver,new Set([ADMIN,DISTRIBUTOR])],
        'distributors' : [Distributor,new Set([ADMIN,DISTRIBUTOR])],
        'users' : [User,new Set([ADMIN,DISTRIBUTOR])],
        'vehicles' : [Vehicle,new Set([ADMIN,DRIVER,DISTRIBUTOR])],
        'countries' : [Country,new Set([ADMIN])],
        'states' : [Country,new Set([ADMIN])],
        'districts' : [Country,new Set([ADMIN])],
        'municipalities' : [Country,new Set([ADMIN])],
        'localities' : [Country,new Set([ADMIN])],
        'wards' : [Country,new Set([ADMIN])],
        'packages' : [Package,new Set([ADMIN,DISTRIBUTOR])],
        'contacts' : [Contact, new Set([ADMIN,DISTRIBUTOR])],
        'subscriptions':[Subscription, new Set([ADMIN,DISTRIBUTOR])],
    }
    return routePermissionsMap;
}

module.exports = {
    getValidAuthMethods,
    getRoutePermissions,
}