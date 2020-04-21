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
    model: 'Accession',
    storageType: 'sql',
    attributes: {
        accession_id: 'String',
        collectors_name: 'String',
        collectors_initials: 'String',
        sampling_date: 'Date',
        sampling_number: 'String',
        catalog_number: 'String',
        institution_deposited: 'String',
        collection_name: 'String',
        collection_acronym: 'String',
        identified_by: 'String',
        identification_date: 'Date',
        abundance: 'String',
        habitat: 'String',
        observations: 'String',
        family: 'String',
        genus: 'String',
        species: 'String',
        subspecies: 'String',
        variety: 'String',
        race: 'String',
        form: 'String',
        taxon_id: 'String',
        collection_deposit: 'String',
        collect_number: 'String',
        collect_source: 'String',
        collected_seeds: 'Int',
        collected_plants: 'Int',
        collected_other: 'String',
        habit: 'String',
        local_name: 'String',
        locationId: 'String'
    },
    associations: {
        individuals: {
            type: 'to_many',
            target: 'Individual',
            targetKey: 'accessionId',
            keyIn: 'Individual',
            targetStorageType: 'sql',
            label: 'name',
            name: 'individuals',
            name_lc: 'individuals',
            name_cp: 'Individuals',
            target_lc: 'individual',
            target_lc_pl: 'individuals',
            target_pl: 'Individuals',
            target_cp: 'Individual',
            target_cp_pl: 'Individuals',
            keyIn_lc: 'individual'
        },
        taxon: {
            type: 'to_one',
            target: 'Taxon',
            targetKey: 'taxon_id',
            keyIn: 'Accession',
            targetStorageType: 'webservice',
            label: 'scientificName',
            sublabel: 'taxonRank',
            name: 'taxon',
            name_lc: 'taxon',
            name_cp: 'Taxon',
            target_lc: 'taxon',
            target_lc_pl: 'taxons',
            target_pl: 'Taxons',
            target_cp: 'Taxon',
            target_cp_pl: 'Taxons',
            keyIn_lc: 'accession'
        },
        location: {
            type: 'to_one',
            target: 'Location',
            targetKey: 'locationId',
            keyIn: 'Accession',
            targetStorageType: 'sql',
            label: 'country',
            sublabel: 'state',
            name: 'location',
            name_lc: 'location',
            name_cp: 'Location',
            target_lc: 'location',
            target_lc_pl: 'locations',
            target_pl: 'Locations',
            target_cp: 'Location',
            target_cp_pl: 'Locations',
            keyIn_lc: 'accession'
        },
        measurements: {
            type: 'to_many',
            target: 'Measurement',
            targetKey: 'accessionId',
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
    internalId: 'accession_id',
    id: {
        name: 'accession_id',
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

module.exports = class Accession extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            accession_id: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },
            collectors_name: {
                type: Sequelize[dict['String']]
            },
            collectors_initials: {
                type: Sequelize[dict['String']]
            },
            sampling_date: {
                type: Sequelize[dict['Date']]
            },
            sampling_number: {
                type: Sequelize[dict['String']]
            },
            catalog_number: {
                type: Sequelize[dict['String']]
            },
            institution_deposited: {
                type: Sequelize[dict['String']]
            },
            collection_name: {
                type: Sequelize[dict['String']]
            },
            collection_acronym: {
                type: Sequelize[dict['String']]
            },
            identified_by: {
                type: Sequelize[dict['String']]
            },
            identification_date: {
                type: Sequelize[dict['Date']]
            },
            abundance: {
                type: Sequelize[dict['String']]
            },
            habitat: {
                type: Sequelize[dict['String']]
            },
            observations: {
                type: Sequelize[dict['String']]
            },
            family: {
                type: Sequelize[dict['String']]
            },
            genus: {
                type: Sequelize[dict['String']]
            },
            species: {
                type: Sequelize[dict['String']]
            },
            subspecies: {
                type: Sequelize[dict['String']]
            },
            variety: {
                type: Sequelize[dict['String']]
            },
            race: {
                type: Sequelize[dict['String']]
            },
            form: {
                type: Sequelize[dict['String']]
            },
            taxon_id: {
                type: Sequelize[dict['String']]
            },
            collection_deposit: {
                type: Sequelize[dict['String']]
            },
            collect_number: {
                type: Sequelize[dict['String']]
            },
            collect_source: {
                type: Sequelize[dict['String']]
            },
            collected_seeds: {
                type: Sequelize[dict['Int']]
            },
            collected_plants: {
                type: Sequelize[dict['Int']]
            },
            collected_other: {
                type: Sequelize[dict['String']]
            },
            habit: {
                type: Sequelize[dict['String']]
            },
            local_name: {
                type: Sequelize[dict['String']]
            },
            locationId: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "accession",
            tableName: "accessions",
            sequelize
        });
    }

    static associate(models) {
        Accession.belongsTo(models.location, {
            as: 'location',
            foreignKey: 'locationId'
        });
        Accession.hasMany(models.individual, {
            as: 'individuals',
            foreignKey: 'accessionId'
        });
        Accession.hasMany(models.measurement, {
            as: 'measurements',
            foreignKey: 'accessionId'
        });
    }

    static readById(id) {
        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return Accession.findOne(options);
    }

    static countRecords(search) {
        let options = {};
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

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

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
                    ["accession_id", "ASC"]
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
                throw new Error(`Request of total accessions exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
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
                }).includes("accession_id")) {
                options['order'] = [...options['order'], ...[
                    ["accession_id", "ASC"]
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
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "accession_id", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "accession_id", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = { ...options['where']
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
                    throw new Error(`Request of total accessions exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
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
                        if (input.addIndividuals) {
                            //let wrong_ids =  await helper.checkExistence(input.addIndividuals, models.individual);
                            //if(wrong_ids.length > 0){
                            //    throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                            //}else{
                            promises_associations.push(item.setIndividuals(input.addIndividuals, {
                                transaction: t
                            }));
                            //}
                        }
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

                        if (input.addLocation) {
                            //let wrong_ids =  await helper.checkExistence(input.addLocation, models.location);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model location were not found.`);
                            //}else{
                            promises_associations.push(item.setLocation(input.addLocation, {
                                transaction: t
                            }));
                            //}
                        }
                        return Promise.all(promises_associations).then(() => {
                            return item
                        });
                    });

                    if (input.addTaxon) {
                        //let wrong_ids =  await helper.checkExistence(input.addTaxon, models.taxon);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model taxon were not found.`);
                        //}else{
                        await result._addTaxon(input.addTaxon);
                        //}
                    }
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

                        if (input.addIndividuals) {
                            //let wrong_ids =  await helper.checkExistence(input.addIndividuals, models.individual);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                            //}else{
                            promises_associations.push(updated.addIndividuals(input.addIndividuals, {
                                transaction: t
                            }));
                            //}
                        }

                        if (input.removeIndividuals) {
                            //let ids_associated = await item.getIndividuals().map(t => `${t[models.individual.idAttribute()]}`);
                            //await helper.asyncForEach(input.removeIndividuals, id =>{
                            //  if(!ids_associated.includes(id)){
                            //    throw new Error(`The association with id ${id} that you're trying to remove desn't exists`);
                            //  }
                            //});
                            promises_associations.push(updated.removeIndividuals(input.removeIndividuals, {
                                transaction: t
                            }));
                        }

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
                        if (input.addLocation) {
                            //let wrong_ids =  await helper.checkExistence(input.addLocation, models.location);
                            //if(wrong_ids.length > 0){
                            //  throw new Error(`Ids ${wrong_ids.join(",")} in model location were not found.`);
                            //}else{
                            promises_associations.push(updated.setLocation(input.addLocation, {
                                transaction: t
                            }));
                            //}
                        } else if (input.addLocation === null) {
                            promises_associations.push(updated.setLocation(input.addLocation, {
                                transaction: t
                            }));
                        }

                        if (input.removeLocation) {
                            let location = await item.getLocation();
                            if (location && input.removeLocation === `${location[models.location.idAttribute()]}`) {
                                promises_associations.push(updated.setLocation(null, {
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

                    if (input.addTaxon) {
                        let wrong_ids = await helper.checkExistence(input.addTaxon, models.taxon);
                        if (wrong_ids.length > 0) {
                            throw new Error(`Ids ${wrong_ids.join(",")} in model taxon were not found.`);
                        } else {
                            await result._addTaxon(input.addTaxon);
                        }
                    }

                    if (input.removeTaxon) {
                        //let taxon = await result.taxonImpl();
                        //if(taxon && input.removeTaxon === `${taxon[models.taxon.idAttribute()]}`){
                        await result._removeTaxon(input.removeTaxon);
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
        return helper.csvTableTemplate(Accession);
    }


    set_taxon_id(value) {
        this.taxon_id = value;
        return super.save();
    }


    _addTaxon(id) {
        return this.set_taxon_id(id);
    }

    _removeTaxon(id) {
        return this.set_taxon_id(null);
    }

    taxonImpl(search) {
        if (search === undefined) {
            return models.taxon.readById(this.taxon_id);
        } else {

            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.taxon.idAttribute(),
                "value": {
                    "value": this.taxon_id
                },
                "operator": "eq"
            });

            return models.taxon.readAll(nsearch)
                .then(found => {
                    if (found) {
                        return found[0]
                    }
                    return found;
                });

        }
    }

    set_locationId(value) {
        this.locationId = value;
        return super.save();
    }


    _addLocation(id) {
        return this.set_locationId(id);
    }

    _removeLocation(id) {
        return this.set_locationId(null);
    }

    locationImpl(search) {
        if (search === undefined) {
            return models.location.readById(this.locationId);
        } else {

            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.location.idAttribute(),
                "value": {
                    "value": this.locationId
                },
                "operator": "eq"
            });

            return models.location.readAll(nsearch)
                .then(found => {
                    if (found) {
                        return found[0]
                    }
                    return found;
                });

        }
    }




    async _removeIndividuals(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.individual.readById(id);
            await record.set_accessionId(null);
        });
    }

    async _addIndividuals(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.individual.readById(id);
            await record.set_accessionId(this.getIdValue());
        });
    }

    individualsFilterImpl({
        search,
        order,
        pagination
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.individual.readAll(nsearch, order, pagination);
    }

    countFilteredIndividualsImpl({
        search
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.individual.countRecords(nsearch);
    }

    individualsConnectionImpl({
        search,
        order,
        pagination
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.individual.readAllCursor(nsearch, order, pagination);
    }

    async _removeMeasurements(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.measurement.readById(id);
            await record.set_accessionId(null);
        });
    }

    async _addMeasurements(ids) {
        await helper.asyncForEach(ids, async id => {
            let record = await models.measurement.readById(id);
            await record.set_accessionId(this.getIdValue());
        });
    }

    measurementsFilterImpl({
        search,
        order,
        pagination
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.measurement.readAll(nsearch, order, pagination);
    }

    countFilteredMeasurementsImpl({
        search
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.measurement.countRecords(nsearch);
    }

    measurementsConnectionImpl({
        search,
        order,
        pagination
    }) {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accessionId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return models.measurement.readAllCursor(nsearch, order, pagination);
    }




    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return Accession.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Accession.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Accession.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Accession.idAttribute()]
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
        let attributes = Object.keys(Accession.definition.attributes);
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

    static async countAllAssociatedRecords(id, context ){

      let accession = await this.readById(id);
      //check that record actually exists
      if (accession === null) throw new Error(`Record with ID = ${id} does not exist`);

      let promises_to_many = [];
      let promises_to_one = [];
      promises_to_many.push( accession.individualsConnection({}) );
      promises_to_many.push( accession.measurementsConnection({}) );
      promises_to_one.push( accession.location({}) );


      let result_to_many = await Promise.all( promises_to_many);
      let result_to_one = await Promise.all(promises_to_one);

      //filter the associations with at least one item associated
      let get_to_many_associated = result_to_many.filter( (r, index) => r !== null && typeof r === 'object' && r.hasOwnProperty('edges') && r.edges.length > 0 ).map( r => r.edges.length );
      let get_to_one_associated = result_to_one.filter( (r, index) => r !== null );

      let total_count = get_to_one_associated.length + get_to_many_associated.reduce( (accumulator, current_val )=> accumulator + current_val ,  0 );

      return total_count;
    }

    static async validForDeletion(id, context){
      if( await this.countAllAssociatedRecords(id, context) > 0 ){
        throw new Error(`Accession with accession_id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
      }

      return true;
    }

}
