'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const searchArg = require('../utils/search-argument');
const globals = require('../config/globals');
const validatorUtil = require('../utils/validatorUtil');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuidv4 = require('uuidv4');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const moment = require('moment');
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Individual',
    storageType: 'sql',
    attributes: {
        name: 'String',
        origin: 'String',
        description: 'String',
        accessionId: 'String',
        genotypeId: 'Int',
        field_unit_id: 'Int'
    },
    associations: {
        accession: {
            type: 'to_one',
            target: 'Accession',
            targetKey: 'accessionId',
            keyIn: 'Individual',
            targetStorageType: 'sql',
            label: 'accession_id',
            sublabel: 'institution_deposited',
            name: 'accession',
            name_lc: 'accession',
            name_cp: 'Accession',
            target_lc: 'accession',
            target_lc_pl: 'accessions',
            target_pl: 'Accessions',
            target_cp: 'Accession',
            target_cp_pl: 'Accessions',
            keyIn_lc: 'individual'
        },
        measurements: {
            type: 'to_many',
            target: 'Measurement',
            targetKey: 'individual_id',
            keyIn: 'Measurement',
            targetStorageType: 'sql',
            label: 'name',
            name: 'measurements',
            name_lc: 'measurements',
            name_cp: 'Measurements',
            target_lc: 'measurement',
            target_lc_pl: 'measurements',
            target_pl: 'Measurements',
            target_cp: 'Measurement',
            target_cp_pl: 'Measurements',
            keyIn_lc: 'measurement'
        }
    },
    internalId: 'name',
    id: {
        name: 'name',
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

module.exports = class Individual extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            name: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },
            origin: {
                type: Sequelize[dict['String']]
            },
            description: {
                type: Sequelize[dict['String']]
            },
            accessionId: {
                type: Sequelize[dict['String']]
            },
            genotypeId: {
                type: Sequelize[dict['Int']]
            },
            field_unit_id: {
                type: Sequelize[dict['Int']]
            }


        }, {
            modelName: "individual",
            tableName: "individuals",
            sequelize
        });
    }

    static associate(models) {
        Individual.belongsTo(models.accession, {
            as: 'accession',
            foreignKey: 'accessionId'
        });
        Individual.hasMany(models.measurement, {
            as: 'measurements',
            foreignKey: 'individual_id'
        });
    }

    static readById(id) {
        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return Individual.findOne(options);
    }

    static countRecords(search) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
    }

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["name", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(`Request of total individuals exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
            }
            return super.findAll(options);
        });
    }

    static readAllCursor(search, order, pagination) {
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
                }).includes("name")) {
                options['order'] = [...options['order'], ...[
                    ["name", "ASC"]
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
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "name", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "name", pagination.includeCursor)
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
                    throw new Error(`Request of total individuals exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
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
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        let promises_associations = [];
                        if (input.addMeasurements) {
                            //let wrong_ids =  await helper.checkExistence(input.addMeasurements, models.measurement);
                            //if(wrong_ids.length > 0){
                            //    throw new Error(`Ids ${wrong_ids.join(",")} in model measurement were not found.`);
                            //}else{
                            promises_associations.push(item.setMeasurements(input.addMeasurements, {
                                transaction: t
                            }));
                            //}
                        }

                        if (input.addAccession) {
                            //let wrong_ids =  await helper.checkExistence(input.addAccession, models.accession);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model accession were not found.`);
                            //}else{
                            promises_associations.push(item.setAccession(input.addAccession, {
                                transaction: t
                            }));
                            //}
                        }
                        return Promise.all(promises_associations).then(() => {
                            return item
                        });
                    });

                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static deleteOne(id) {
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

                        if (input.addMeasurements) {
                            //let wrong_ids =  await helper.checkExistence(input.addMeasurements, models.measurement);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model measurement were not found.`);
                            //}else{
                            promises_associations.push(updated.addMeasurements(input.addMeasurements, {
                                transaction: t
                            }));
                            //}
                        }

                        if (input.removeMeasurements) {
                            //let ids_associated = await item.getMeasurements().map(t => `${t[models.measurement.idAttribute()]}`);
                            //await helper.asyncForEach(input.removeMeasurements, id =>{
                            //  if(!ids_associated.includes(id)){
                            //    throw new Error(`The association with id ${id} that you're trying to remove desn't exists`);
                            //  }
                            //});
                            promises_associations.push(updated.removeMeasurements(input.removeMeasurements, {
                                transaction: t
                            }));
                        }
                        if (input.addAccession) {
                            //let wrong_ids =  await helper.checkExistence(input.addAccession, models.accession);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model accession were not found.`);
                            //}else{
                            promises_associations.push(updated.setAccession(input.addAccession, {
                                transaction: t
                            }));
                            //}
                        } else if (input.addAccession === null) {
                            promises_associations.push(updated.setAccession(input.addAccession, {
                                transaction: t
                            }));
                        }

                        if (input.removeAccession) {
                            let accession = await item.getAccession();
                            if (accession && input.removeAccession === `${accession[models.accession.idAttribute()]}`) {
                                promises_associations.push(updated.setAccession(null, {
                                    transaction: t
                                }));
                            } else {
                                throw new Error("The association you're trying to remove it doesn't exists");
                            }
                        }

                        return Promise.all(promises_associations).then(() => {
                            return updated;
                        });
                    });





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
        return helper.csvTableTemplate(Individual);
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

    accessionImpl(search) {
        if (search === undefined) {
            return models.accession.readById(this.accessionId);
        } else {
            let id_search = {
                "field": models.accession.idAttribute(),
                "value": {
                    "value": this.accessionId
                },
                "operator": "eq"
            }

            let ext_search = {
                "operator": "and",
                "search": [id_search, search]
            }

            return models.accession.readAll(ext_search)
                .then(found => {
                    if (found) {
                        return found[0]
                    }
                    return found;
                });

        }
    }




    async _removeMeasurements(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.measurement.readById(id);
            await record.set_individual_id(null);
        });
    }

    async _addMeasurements(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.measurement.readById(id);
            await record.set_individual_id(this.getIdValue());
        });
    }

    measurementsFilterImpl({
        search,
        order,
        pagination
    }) {
        if (search === undefined) {
            return models.measurement.readAll({
                "field": "individual_id",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination);
        } else {
            return models.measurement.readAll({
                "operator": "and",
                "search": [{
                    "field": "individual_id",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination)
        }
    }

    countFilteredMeasurementsImpl({
        search
    }) {

        if (search === undefined) {
            return models.measurement.countRecords({
                "field": "individual_id",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            });
        } else {
            return models.measurement.countRecords({
                "operator": "and",
                "search": [{
                    "field": "individual_id",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            })
        }

    }

    measurementsConnectionImpl({
        search,
        order,
        pagination
    }) {
        if (search === undefined) {
            return models.measurement.readAllCursor({
                "field": "individual_id",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination);
        } else {
            return models.measurement.readAllCursor({
                "operator": "and",
                "search": [{
                    "field": "individual_id",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination)
        }
    }




    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Individual.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Individual.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Individual.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Individual.idAttribute()]
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
        let attributes = Object.keys(Individual.definition.attributes);
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