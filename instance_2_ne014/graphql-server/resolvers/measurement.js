/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const measurement = require(path.join(__dirname, '..', 'models_index.js')).measurement;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const models = require(path.join(__dirname, '..', 'models_index.js'));



/**
 * measurement.prototype.individual - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
measurement.prototype.individual = function({
    search
}, context) {
    try {
        return this.individualImpl(search);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}
/**
 * measurement.prototype.accession - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
measurement.prototype.accession = function({
    search
}, context) {
    try {
        return this.accessionImpl(search);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


module.exports = {

    /**
     * measurementsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    measurementsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: measurementsConnection");

        //check: adapters
        let registeredAdapters = Object.values(measurement.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Measurement"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Measurement"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await measurement.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Measurement" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneMeasurement - Check user authorization and return one record with the specified measurement_id in the measurement_id argument.
     *
     * @param  {number} {measurement_id}    measurement_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with measurement_id requested
     */
    readOneMeasurement: async function({
        measurement_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: readOneMeasurement");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, measurement.adapterForIri(measurement_id), 'read');
            if (authorizationCheck === true) {
                return measurement.readById(measurement_id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addMeasurement - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addMeasurement: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: addMeasurement");

        //check: input has idAttribute
        if (!input.measurement_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'measurement_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, measurement.adapterForIri(input.measurement_id), 'create');
            if (authorizationCheck === true) {
                return measurement.addOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddMeasurementCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddMeasurementCsv: function(_, context) {
        return checkAuthorization(context, 'Measurement', 'create').then(authorization => {
            if (authorization === true) {
                return measurement.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteMeasurement - Check user authorization and delete a record with the specified measurement_id in the measurement_id argument.
     *
     * @param  {number} {measurement_id}    measurement_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteMeasurement: async function({
        measurement_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: deleteMeasurement");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, measurement.adapterForIri(measurement_id), 'delete');
            if (authorizationCheck === true) {
                return measurement.deleteOne(measurement_id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateMeasurement - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateMeasurement: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: updateMeasurement");

        //check: input has idAttribute
        if (!input.measurement_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'measurement_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, measurement.adapterForIri(input.measurement_id), 'update');
            if (authorizationCheck === true) {
                return measurement.updateOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countMeasurements - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countMeasurements: async function({
        search
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: countMeasurement");

        //check: adapters
        let registeredAdapters = Object.values(measurement.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Measurement"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Measurement"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await measurement.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Measurement"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateMeasurement - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateMeasurement: function(_, context) {
        return checkAuthorization(context, 'Measurement', 'read').then(authorization => {
            if (authorization === true) {
                return measurement.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}