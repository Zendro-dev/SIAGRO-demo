const _ = require('lodash');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const validatorUtil = require('../utils/validatorUtil');
const helper = require('../utils/helper');
const searchArg = require('../utils/search-argument');
const path = require('path');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const os = require('os');
const uuidv4 = require('uuidv4');
const models = require(path.join(__dirname, '..', 'models_index.js'));

const remoteCenzontleURL = "http://localhost:4050/graphql";
const iriRegex = new RegExp('NE014');

// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Measurement',
    storageType: 'sql-adapter',
    adapterName: 'MEASUREMENT_YOLANDAPROJECT',
    regex: 'NE014',
    url: 'http://localhost:4050/graphql',
    attributes: {
        measurement_id: 'String',
        name: 'String',
        method: 'String',
        reference: 'String',
        reference_link: 'String',
        value: 'Float',
        unit: 'String',
        short_name: 'String',
        comments: 'String',
        field_unit_id: 'Int',
        individual_id: 'String',
        accessionId: 'String'
    },
    associations: {
        individual: {
            type: 'to_one',
            target: 'Individual',
            targetKey: 'individual_id',
            keyIn: 'Measurement',
            targetStorageType: 'sql',
            label: 'name',
            name: 'individual',
            name_lc: 'individual',
            name_cp: 'Individual',
            target_lc: 'individual',
            target_lc_pl: 'individuals',
            target_pl: 'Individuals',
            target_cp: 'Individual',
            target_cp_pl: 'Individuals',
            keyIn_lc: 'measurement'
        },
        accession: {
            type: 'to_one',
            target: 'Accession',
            targetKey: 'accessionId',
            keyIn: 'Measurement',
            targetStorageType: 'sql',
            label: 'accession_id',
            name: 'accession',
            name_lc: 'accession',
            name_cp: 'Accession',
            target_lc: 'accession',
            target_lc_pl: 'accessions',
            target_pl: 'Accessions',
            target_cp: 'Accession',
            target_cp_pl: 'Accessions',
            keyIn_lc: 'measurement'
        }
    },
    internalId: 'measurement_id',
    id: {
        name: 'measurement_id',
        type: 'String'
    }
};

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */

module.exports = class MEASUREMENT_YOLANDAPROJECT extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            measurement_id: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },
            name: {
                type: Sequelize[dict['String']]
            },
            method: {
                type: Sequelize[dict['String']]
            },
            reference: {
                type: Sequelize[dict['String']]
            },
            reference_link: {
                type: Sequelize[dict['String']]
            },
            value: {
                type: Sequelize[dict['Float']]
            },
            unit: {
                type: Sequelize[dict['String']]
            },
            short_name: {
                type: Sequelize[dict['String']]
            },
            comments: {
                type: Sequelize[dict['String']]
            },
            field_unit_id: {
                type: Sequelize[dict['Int']]
            },
            individual_id: {
                type: Sequelize[dict['String']]
            },
            accessionId: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "measurement",
            tableName: "measurements",
            sequelize
        });
    }

    static get adapterName() {
        return 'MEASUREMENT_YOLANDAPROJECT';
    }

    static get adapterType() {
        return 'sql-adapter';
    }

    static recognizeId(iri) {
        return iriRegex.test(iri);
    }

    static readById(id) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: readById \nid: ", id);


        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return MEASUREMENT_YOLANDAPROJECT.findOne(options);
    }

    static countRecords(search) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: countRecords: search: ", search);
        let options = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {
            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
    }

    static readAllCursor(search, order, pagination) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: readAllCursor: search: ", search, "  order: ", order, "  pagination: ", pagination);

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {
            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        /*
         * Count
         */
        return super.count(options).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("measurement_id")) {
                options['order'] = [...options['order'], ...[
                    ["measurement_id", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "measurement_id", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "measurement_id", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = {
                ...options['where']
            };
            /*
             *  Count (with only where-options)
             */
            return super.count(woptions).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }
                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(`Request of total measurements exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
                }

                /*
                 * Get records
                 */
                return super.findAll(options).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    static addOne(input) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: addOne: \n- input: ", input);

        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        let promises_associations = [];
                        return Promise.all(promises_associations).then(() => {
                            return item
                        });
                    });

                    if (input.addIndividual) {
                        //let wrong_ids =  await helper.checkExistence(input.addIndividual, models.individual);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                        //}else{
                        await result._addIndividual(input.addIndividual);
                        //}
                    }
                    if (input.addAccession) {
                        //let wrong_ids =  await helper.checkExistence(input.addAccession, models.accession);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model accession were not found.`);
                        //}else{
                        await result._addAccession(input.addAccession);
                        //}
                    }
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static deleteOne(id) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: deleteOne: id: ", id);

        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(`Record with ID = ${id} not exist`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }

    static updateOne(input) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: updateOne: input: ", input);

        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                        let promises_associations = [];
                        let item = await super.findByPk(input[this.idAttribute()], {
                            transaction: t
                        });
                        let updated = await item.update(input, {
                            transaction: t
                        });
                        return Promise.all(promises_associations).then(() => {
                            return updated;
                        });
                    });

                    if (input.addIndividual) {
                        //let wrong_ids =  await helper.checkExistence(input.addIndividual, models.individual);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                        //}else{
                        await result._addIndividual(input.addIndividual);
                        //}
                    }

                    if (input.removeIndividual) {
                        //let individual = await result.individualImpl();
                        //if(individual && input.removeIndividual === `${individual[models.individual.idAttribute()]}`){
                        await result._removeIndividual(input.removeIndividual);
                        //}
                        //else{
                        //  throw new Error("The association you're trying to remove it doesn't exists");
                        //}
                    }
                    if (input.addAccession) {
                        //let wrong_ids =  await helper.checkExistence(input.addAccession, models.accession);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model accession were not found.`);
                        //}else{
                        await result._addAccession(input.addAccession);
                        //}
                    }

                    if (input.removeAccession) {
                        //let accession = await result.accessionImpl();
                        //if(accession && input.removeAccession === `${accession[models.accession.idAttribute()]}`){
                        await result._removeAccession(input.removeAccession);
                        //}
                        //else{
                        //  throw new Error("The association you're trying to remove it doesn't exists");
                        //}
                    }




                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static bulkAddCsv(context) {

        let delim = context.request.body.delim;
        let cols = context.request.body.cols;
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        context.request.files.csv_file.mv(tmpFile).then(() => {

            fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
                try {
                    console.log(`Sending ${addedZipFilePath} to the user.`);

                    let attach = [];
                    attach.push({
                        filename: path.basename("added_data.zip"),
                        path: addedZipFilePath
                    });

                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add',
                        'Your data has been successfully added to the database.',
                        attach).then(function(info) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(info);
                    }).catch(function(err) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.error(err);
                    });

                } catch (error) {
                    console.error(error.message);
                }

                fs.unlinkSync(tmpFile);
            }).catch((error) => {
                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add', `${error.message}`).then(function(info) {
                    console.error(info);
                }).catch(function(err) {
                    console.error(err);
                });

                fs.unlinkSync(tmpFile);
            });

        }).catch((error) => {
            throw new Error(error);
        });
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Measurement);
    }


    set_individual_id(value) {
        this.individual_id = value;
        return super.save();
    }

    _addIndividual(id) {
        return this.set_individual_id(id);
    }

    _removeIndividual(id) {
        return this.set_individual_id(null);
    }

    set_accessionId(value) {
        this.accessionId = value;
        return super.save();
    }

    _addAccession(id) {
        return this.set_accessionId(id);
    }

    _removeAccession(id) {
        return this.set_accessionId(null);
    }





    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return MEASUREMENT_YOLANDAPROJECT.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return MEASUREMENT_YOLANDAPROJECT.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Measurement.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[MEASUREMENT_YOLANDAPROJECT.idAttribute()]
    }

    static get definition() {
        return definition;
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(MEASUREMENT_YOLANDAPROJECT.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

}