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
    model: 'Accession',
    storageType: 'sql-adapter',
    adapterName: 'ACCESSION_YOLANDAPROJECT',
    regex: 'NE014',
    url: 'http://localhost:4050/graphql',
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

module.exports = class ACCESSION_YOLANDAPROJECT extends Sequelize.Model {

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

    static get adapterName() {
        return 'ACCESSION_YOLANDAPROJECT';
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
        return ACCESSION_YOLANDAPROJECT.findOne(options);
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

                    if (input.addTaxon) {
                        //let wrong_ids =  await helper.checkExistence(input.addTaxon, models.taxon);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model taxon were not found.`);
                        //}else{
                        await result._addTaxon(input.addTaxon);
                        //}
                    }
                    if (input.addLocation) {
                        //let wrong_ids =  await helper.checkExistence(input.addLocation, models.location);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model location were not found.`);
                        //}else{
                        await result._addLocation(input.addLocation);
                        //}
                    }
                    if (input.addIndividuals) {
                        //let wrong_ids =  await helper.checkExistence(input.addIndividuals, models.individual);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                        //}else{
                        await result._addIndividuals(input.addIndividuals);
                        //}
                    }
                    if (input.addMeasurements) {
                        //let wrong_ids =  await helper.checkExistence(input.addMeasurements, models.measurement);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model measurement were not found.`);
                        //}else{
                        await result._addMeasurements(input.addMeasurements);
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

                    if (input.addTaxon) {
                        //let wrong_ids =  await helper.checkExistence(input.addTaxon, models.taxon);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model taxon were not found.`);
                        //}else{
                        await result._addTaxon(input.addTaxon);
                        //}
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
                    if (input.addLocation) {
                        //let wrong_ids =  await helper.checkExistence(input.addLocation, models.location);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model location were not found.`);
                        //}else{
                        await result._addLocation(input.addLocation);
                        //}
                    }

                    if (input.removeLocation) {
                        //let location = await result.locationImpl();
                        //if(location && input.removeLocation === `${location[models.location.idAttribute()]}`){
                        await result._removeLocation(input.removeLocation);
                        //}
                        //else{
                        //  throw new Error("The association you're trying to remove it doesn't exists");
                        //}
                    }


                    if (input.addIndividuals) {
                        //let wrong_ids =  await helper.checkExistence(input.addIndividuals, models.individual);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model individual were not found.`);
                        //}else{
                        await result._addIndividuals(input.addIndividuals);
                        //}
                    }

                    if (input.removeIndividuals) {
                        //let ids_associated = await result.individualsImpl().map(t => `${t[models.individual.idAttribute()]}`);
                        //await helper.asyncForEach(input.removeIndividuals, async id =>{
                        //  if(!ids_associated.includes(id)){
                        //    throw new Error(`The association with id ${id} that you're trying to remove desn't exist`);
                        //  }
                        //});
                        await result._removeIndividuals(input.removeIndividuals);
                    }
                    if (input.addMeasurements) {
                        //let wrong_ids =  await helper.checkExistence(input.addMeasurements, models.measurement);
                        //if(wrong_ids.length > 0){
                        //  throw new Error(`Ids ${wrong_ids.join(",")} in model measurement were not found.`);
                        //}else{
                        await result._addMeasurements(input.addMeasurements);
                        //}
                    }

                    if (input.removeMeasurements) {
                        //let ids_associated = await result.measurementsImpl().map(t => `${t[models.measurement.idAttribute()]}`);
                        //await helper.asyncForEach(input.removeMeasurements, async id =>{
                        //  if(!ids_associated.includes(id)){
                        //    throw new Error(`The association with id ${id} that you're trying to remove desn't exist`);
                        //  }
                        //});
                        await result._removeMeasurements(input.removeMeasurements);
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



    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return ACCESSION_YOLANDAPROJECT.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return ACCESSION_YOLANDAPROJECT.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Accession.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[ACCESSION_YOLANDAPROJECT.idAttribute()]
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
        let attributes = Object.keys(ACCESSION_YOLANDAPROJECT.definition.attributes);
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