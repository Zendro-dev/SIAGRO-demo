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
 * accession.prototype.individualsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
accession.prototype.individualsFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        return this.individualsFilterImpl({
            search,
            order,
            pagination
        });
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
accession.prototype.countFilteredIndividuals = function({
    search
}, context) {
    try {
        return this.countFilteredIndividualsImpl({
            search
        });
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
accession.prototype.individualsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {
        return this.individualsConnectionImpl({
            search,
            order,
            pagination
        });
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

/**
 * accession.prototype.measurementsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
accession.prototype.measurementsFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        return this.measurementsFilterImpl({
            search,
            order,
            pagination
        });
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
accession.prototype.countFilteredMeasurements = function({
    search
}, context) {
    try {
        return this.countFilteredMeasurementsImpl({
            search
        });
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
accession.prototype.measurementsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {
        return this.measurementsConnectionImpl({
            search,
            order,
            pagination
        });
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}




module.exports = {

    /**
     * accessions - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    accessions: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.readAll(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

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
    accessionsConnection: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.readAllCursor(search, order, pagination);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },


    /**
     * readOneAccession - Check user authorization and return one record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with accession_id requested
     */
    readOneAccession: function({
        accession_id
    }, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.readById(accession_id);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * addAccession - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addAccession: function(input, context) {
        return checkAuthorization(context, 'Accession', 'create').then(authorization => {
            if (authorization === true) {
                return accession.addOne(input);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
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
    deleteAccession: function({
        accession_id
    }, context) {
        return checkAuthorization(context, 'Accession', 'delete').then(authorization => {
            if (authorization === true) {
                return accession.deleteOne(accession_id);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * updateAccession - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateAccession: function(input, context) {
        return checkAuthorization(context, 'Accession', 'update').then(authorization => {
            if (authorization === true) {
                return accession.updateOne(input);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * countAccessions - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countAccessions: function({
        search
    }, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.countRecords(search);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * vueTableAccession - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableAccession: function(_, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, accession, ["id", "accession_id", "collectors_name", "collectors_initials", "sampling_number", "catalog_number", "institution_deposited", "collection_name", "collection_acronym", "identified_by", "abundance", "habitat", "observations", "family", "genus", "species", "subspecies", "variety", "race", "form", "taxon_id", "collection_deposit", "collect_number", "collect_source", "collected_other", "habit", "local_name", "locationId"]);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
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