/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const accession = require(path.join(__dirname, '..', 'models_index.js')).accession;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const resolvers = require(path.join(__dirname, 'index.js'));


/**
 * accession.prototype.taxon - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
accession.prototype.taxon = function({
    search
}, context) {
    try {
        return this.taxonImpl(search);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}
/**
 * accession.prototype.location - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
accession.prototype.location = function({
    search
}, context) {
    try {
        return this.locationImpl(search);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * accession.prototype.countFilteredIndividuals - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
accession.prototype.countFilteredIndividuals = async function({
    search
}, context) {
    try {
        let registeredAdapters = Object.values(models.individual.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let countFilteredIndividualsObj = await this.countFilteredIndividualsImpl({
                search
            });
            [countFilteredIndividualsObj, context] = helper.writeBenignErrors(authorizationCheck, context, countFilteredIndividualsObj);
            return countFilteredIndividualsObj.sum;
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
 * accession.prototype.individualsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
accession.prototype.individualsConnection = async function({
    search,
    order,
    pagination
}, context) {
    try {
        let registeredAdapters = Object.values(models.individual.registeredAdapters);

        let authorizationCheck = await helper.authorizedAdapters(context, registeredAdapters, 'read');
        let authorizedAdapters = authorizationCheck.authorizedAdapters;
        if (authorizationCheck.authorizedAdapters.length > 0) {
            let individualsConnectionObj = await this.individualsConnectionImpl({
                search,
                order,
                pagination,
                authorizedAdapters
            });
            //check adapter authorization Errors
            [individualsConnectionObj, context] = helper.writeBenignErrors(authorizationCheck, context, individualsConnectionObj)
            return individualsConnectionObj;
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

/**
 * accession.prototype.countFilteredMeasurements - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
accession.prototype.countFilteredMeasurements = async function({
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
 * accession.prototype.measurementsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
accession.prototype.measurementsConnection = async function({
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


/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
 async function countAllAssociatedRecords(id, context ){
  let accession = await resolvers.readOneAccession({accession_id: id}, context); //this.readById(id);
  //check that record actually exists
  if (accession === null) throw new Error(`Record with ID = ${id} does not exist`);

  let promises_to_many = [];
  let promises_to_one = [];

  //console.log( "CONTEXT BEFORE:", context );

  promises_to_many.push( accession.countFilteredIndividuals({}, context) );
  promises_to_many.push( accession.countFilteredMeasurements({}, context) );
  promises_to_one.push( accession.location({},context) );

  //console.log( "CONTEXT AFTER:", context );

  let result_to_many = await Promise.all( promises_to_many);
  let result_to_one = await Promise.all(promises_to_one);

  console.log("RESULT TO ONE: ", result_to_one);
  console.log("RESULT TO MANY: ", result_to_many);

  let get_to_many_associated = result_to_many.reduce( (accumulator, current_val )=> accumulator + current_val ,  0 );
  let get_to_one_associated = result_to_one.filter( (r, index) => r !== null && r!== undefined).length;

  return get_to_one_associated + get_to_many_associated;
}


/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context){

  if( await countAllAssociatedRecords(id, context) > 0 ){
    throw new Error(`Accession with accession_id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
  }

  if (context.benignErrors.length > 0) {
    throw new Error('Errors occurred when counting associated records. No deletion permitted for reasons of security.');
  }

  return true;
}


module.exports = {

    /**
     * accessionsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    accessionsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: accessionsConnection");

        //check: adapters
        let registeredAdapters = Object.values(accession.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Accession"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Accession"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await accession.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Accession" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneAccession - Check user authorization and return one record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with accession_id requested
     */
    readOneAccession: async function({
        accession_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: readOneAccession");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(accession_id), 'read');
            if (authorizationCheck === true) {
                return accession.readById(accession_id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addAccession - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addAccession: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: addAccession");

        //check: input has idAttribute
        if (!input.accession_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'accession_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'create');
            if (authorizationCheck === true) {
                return accession.addOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddAccessionCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddAccessionCsv: function(_, context) {
        return checkAuthorization(context, 'Accession', 'create').then(authorization => {
            if (authorization === true) {
                return accession.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteAccession - Check user authorization and delete a record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteAccession: async function({
        accession_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: deleteAccession");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(accession_id), 'delete');
            if (authorizationCheck === true) {
              if(await validForDeletion(accession_id, context )){
                return accession.deleteOne(accession_id);
              }
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateAccession - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateAccession: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: updateAccession");

        //check: input has idAttribute
        if (!input.accession_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'accession_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'update');
            if (authorizationCheck === true) {
                return accession.updateOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countAccessions - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countAccessions: async function({
        search
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: countAccession");

        //check: adapters
        let registeredAdapters = Object.values(accession.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Accession"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Accession"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await accession.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Accession"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateAccession - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateAccession: function(_, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}
