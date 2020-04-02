/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const individual = require(path.join(__dirname, '..', 'models_index.js')).individual;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const models = require(path.join(__dirname, '..', 'models_index.js'));



/**
 * individual.prototype.accession - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
individual.prototype.accession = function({
    search
}, context) {
    try {
        return this.accessionImpl(search);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * individual.prototype.countFilteredMeasurements - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
individual.prototype.countFilteredMeasurements = async function({
    search
}, context) {
    try {
        let registeredAdapters = Object.values(models.measurement.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let countFilteredMeasurementsObj = await this.countFilteredMeasurementsImpl({
                search
            });
            [countFilteredMeasurementsObj, context] = helper.writeBenignErrors(authorizationCheck, context, countFilteredMeasurementsObj);
            return countFilteredMeasurementsObj.sum;
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
 * individual.prototype.measurementsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
individual.prototype.measurementsConnection = async function({
    search,
    order,
    pagination
}, context) {
    try {
        let registeredAdapters = Object.values(models.measurement.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        let authorizedAdapters = authorizationCheck.authorizedAdapters;
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let measurementsConnectionObj = await this.measurementsConnectionImpl({
                search,
                order,
                pagination,
                authorizedAdapters
            });
            //check adapter authorization Errors
            [measurementsConnectionObj, context] = helper.writeBenignErrors(authorizationCheck, context, measurementsConnectionObj)
            return measurementsConnectionObj;
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
     * individualsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    individualsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: individualsConnection");

        //check: adapters
        let registeredAdapters = Object.values(individual.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Individual"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Individual"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await individual.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Individual" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneIndividual - Check user authorization and return one record with the specified name in the name argument.
     *
     * @param  {number} {name}    name of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with name requested
     */
    readOneIndividual: async function({
        name
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: readOneIndividual");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, individual.adapterForIri(name), 'read');
            if (authorizationCheck === true) {
                return individual.readById(name);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addIndividual - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addIndividual: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: addIndividual");

        //check: input has idAttribute
        if (!input.name) {
            throw new Error(`Illegal argument. Provided input requires attribute 'name'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, individual.adapterForIri(input.name), 'create');
            if (authorizationCheck === true) {
                return individual.addOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddIndividualCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddIndividualCsv: function(_, context) {
        return checkAuthorization(context, 'Individual', 'create').then(authorization => {
            if (authorization === true) {
                return individual.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteIndividual - Check user authorization and delete a record with the specified name in the name argument.
     *
     * @param  {number} {name}    name of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteIndividual: async function({
        name
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: deleteIndividual");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, individual.adapterForIri(name), 'delete');
            if (authorizationCheck === true) {
                return individual.deleteOne(name);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateIndividual - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateIndividual: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: updateIndividual");

        //check: input has idAttribute
        if (!input.name) {
            throw new Error(`Illegal argument. Provided input requires attribute 'name'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, individual.adapterForIri(input.name), 'update');
            if (authorizationCheck === true) {
                return individual.updateOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countIndividuals - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countIndividuals: async function({
        search
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: countIndividual");

        //check: adapters
        let registeredAdapters = Object.values(individual.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Individual"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Individual"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await individual.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Individual"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateIndividual - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateIndividual: function(_, context) {
        return checkAuthorization(context, 'Individual', 'read').then(authorization => {
            if (authorization === true) {
                return individual.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}