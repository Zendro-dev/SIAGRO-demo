/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const location = require(path.join(__dirname, '..', 'models_index.js')).location;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const models = require(path.join(__dirname, '..', 'models_index.js'));





/**
 * location.prototype.countFilteredAccessions - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
location.prototype.countFilteredAccessions = async function({
    search
}, context) {
    try {
        let registeredAdapters = Object.values(models.accession.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let countFilteredAccessionsObj = await this.countFilteredAccessionsImpl({
                search
            });
            [countFilteredAccessionsObj, context] = helper.writeBenignErrors(authorizationCheck, context, countFilteredAccessionsObj);
            return countFilteredAccessionsObj.sum;
        } else { //adapters not auth || errors
            // else new Error
            if (authorizationCheck.authorizationErrors.length > 0) {
                throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
            } else {
                throw new Error('No available adapters for data model "Book"');
            }
        }

    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * location.prototype.accessionsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
location.prototype.accessionsConnection = async function({
    search,
    order,
    pagination
}, context) {
    try {
        let registeredAdapters = Object.values(models.accession.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        let authorizedAdapters = authorizationCheck.authorizedAdapters;
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let accessionsConnectionObj = await this.accessionsConnectionImpl({
                search,
                order,
                pagination,
                authorizedAdapters
            });
            //check adapter authorization Errors
            [accessionsConnectionObj, context] = helper.writeBenignErrors(authorizationCheck, context, accessionsConnectionObj)
            return accessionsConnectionObj;
        } else { //adapters not auth || errors
            // else new Error
            if (authorizationCheck.authorizationErrors.length > 0) {
                throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
            } else {
                throw new Error('No available adapters for data model "Book" ');
            }
        }

    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

module.exports = {

    /**
     * locationsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    locationsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: locationsConnection");

        //check: adapters
        let registeredAdapters = Object.values(location.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Location"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Location"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await location.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
                //check adapter authorization Errors
                if (authorizationCheck.authorizationErrors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
                }
                //check Errors returned by the model layer (time-outs, unreachable, etc...)
                if (connectionObj.errors !== undefined && Array.isArray(connectionObj.errors) && connectionObj.errors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(connectionObj.errors)
                    delete connectionObj['errors']
                }
                return connectionObj;
            } else { //adapters not auth || errors
                // else new Error
                if (authorizationCheck.authorizationErrors.length > 0) {
                    throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
                } else {
                    throw new Error('No available adapters for data model "Location" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneLocation - Check user authorization and return one record with the specified locationId in the locationId argument.
     *
     * @param  {number} {locationId}    locationId of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with locationId requested
     */
    readOneLocation: async function({
        locationId
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: readOneLocation");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, location.adapterForIri(locationId), 'read');
            if (authorizationCheck === true) {
                return location.readById(locationId);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addLocation - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addLocation: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: addLocation");

        //check: input has idAttribute
        if (!input.locationId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'locationId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, location.adapterForIri(input.locationId), 'create');
            if (authorizationCheck === true) {
                return location.addOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddLocationCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddLocationCsv: function(_, context) {
        return checkAuthorization(context, 'Location', 'create').then(authorization => {
            if (authorization === true) {
                return location.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteLocation - Check user authorization and delete a record with the specified locationId in the locationId argument.
     *
     * @param  {number} {locationId}    locationId of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteLocation: async function({
        locationId
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: deleteLocation");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, location.adapterForIri(locationId), 'delete');
            if (authorizationCheck === true) {
                return location.deleteOne(locationId);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateLocation - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateLocation: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: updateLocation");

        //check: input has idAttribute
        if (!input.locationId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'locationId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, location.adapterForIri(input.locationId), 'update');
            if (authorizationCheck === true) {
                return location.updateOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countLocations - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countLocations: async function({
        search
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: countLocation");

        //check: adapters
        let registeredAdapters = Object.values(location.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Location"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Location"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await location.countRecords(search, authorizationCheck.authorizedAdapters);
                //check adapter authorization Errors
                if (authorizationCheck.authorizationErrors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
                }
                //check Errors returned by the model layer (time-outs, unreachable, etc...)
                if (countObj.errors !== undefined && Array.isArray(countObj.errors) && countObj.errors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(countObj.errors)
                    delete countObj['errors']
                }
                return countObj.sum;
            } else { //adapters not auth || errors
                // else new Error
                if (authorizationCheck.authorizationErrors.length > 0) {
                    throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
                } else {
                    throw new Error('No available adapters for data model "Location"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateLocation - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateLocation: function(_, context) {
        return checkAuthorization(context, 'Location', 'read').then(authorization => {
            if (authorization === true) {
                return location.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}