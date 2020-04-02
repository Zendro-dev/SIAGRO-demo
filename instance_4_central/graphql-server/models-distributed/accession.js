const _ = require('lodash');
const path = require('path');
const adapters = require('../adapters/index');
const globals = require('../config/globals');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));

const definition = {
    model: 'Accession',
    storageType: 'distributed-data-model',
    registry: [
        'ACCESSION_YOLANDAPROJECT',
        'ACCESSION_PGMN',
        'ACCESSION_GEF'
    ],
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
            targetStorageType: 'distributed-data-model',
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

let registry = ["ACCESSION_YOLANDAPROJECT", "ACCESSION_PGMN", "ACCESSION_GEF"];

module.exports = class Accession {

    /**
     * constructor - Creates an instance of the model
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        accession_id,
        collectors_name,
        collectors_initials,
        sampling_date,
        sampling_number,
        catalog_number,
        institution_deposited,
        collection_name,
        collection_acronym,
        identified_by,
        identification_date,
        abundance,
        habitat,
        observations,
        family,
        genus,
        species,
        subspecies,
        variety,
        race,
        form,
        taxon_id,
        collection_deposit,
        collect_number,
        collect_source,
        collected_seeds,
        collected_plants,
        collected_other,
        habit,
        local_name,
        locationId
    }) {
        this.accession_id = accession_id;
        this.collectors_name = collectors_name;
        this.collectors_initials = collectors_initials;
        this.sampling_date = sampling_date;
        this.sampling_number = sampling_number;
        this.catalog_number = catalog_number;
        this.institution_deposited = institution_deposited;
        this.collection_name = collection_name;
        this.collection_acronym = collection_acronym;
        this.identified_by = identified_by;
        this.identification_date = identification_date;
        this.abundance = abundance;
        this.habitat = habitat;
        this.observations = observations;
        this.family = family;
        this.genus = genus;
        this.species = species;
        this.subspecies = subspecies;
        this.variety = variety;
        this.race = race;
        this.form = form;
        this.taxon_id = taxon_id;
        this.collection_deposit = collection_deposit;
        this.collect_number = collect_number;
        this.collect_source = collect_source;
        this.collected_seeds = collected_seeds;
        this.collected_plants = collected_plants;
        this.collected_other = collected_other;
        this.habit = habit;
        this.local_name = local_name;
        this.locationId = locationId;
    }

    static get name() {
        return "accession";
    }

    /**
     * registeredAdapters - Returns an object which has a key for each
     * adapter on adapter/index.js. Each key of the object will have 
     *
     * @return {string}     baseUrl from request.
     */
    static get registeredAdapters() {
        return ["ACCESSION_YOLANDAPROJECT", "ACCESSION_PGMN", "ACCESSION_GEF"].reduce((a, c) => {
            a[c] = adapters[c];
            return a;
        }, {});
    }

    static adapterForIri(iri) {
        let responsibleAdapter = registry.filter(adapter => adapters[adapter].recognizeId(iri));
        if (responsibleAdapter.length > 1) {
            throw new Error("IRI has no unique match");
        } else if (responsibleAdapter.length === 0) {
            throw new Error("IRI has no match WS");
        }
        return responsibleAdapter[0];
    }

    static readById(id) {
        /**
         * Debug
         */
        console.log("-@@---- ddm.readById \nid: ", id);

        if (id !== null) {
            let responsibleAdapter = registry.filter(adapter => adapters[adapter].recognizeId(id));

            if (responsibleAdapter.length > 1) {
                throw new Error("IRI has no unique match");
            } else if (responsibleAdapter.length === 0) {
                throw new Error("IRI has no match WS");
            }

            return adapters[responsibleAdapter[0]].readById(id).then(result => new Accession(result));
        }
    }

    static countRecords(search, authorizedAdapters) {
        /**
         * Debug
         */
        console.log("-@@---- ddm.countRecords");

        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined: 
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         * 
         *    if authorizedAdapters is not defined: 
         *      - called internally 
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter: 
             *      resolve with current parameters.
             *   
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                case 'generic-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.countRecords(nsearch).catch(benignErrors => benignErrors);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.countRecords(search).catch(benignErrors => benignErrors);

                case 'default':
                    throw new Error(`Adapter type: '${adapter.adapterType}' is not supported`);
            }
        });

        return Promise.all(promises).then(results => {
            return results.reduce((total, current) => {
                //check if current is Error
                if (current instanceof Error) {
                    total.errors.push(current);
                }
                //check current result
                else if (current) {
                    total.sum += current;
                }
                return total;
            }, {
                sum: 0,
                errors: []
            });
        });
    }

    static readAllCursor(search, order, pagination, authorizedAdapters) {
        /**
         * Debug
         */
        console.log("-@@---- ddm.readAllCursor");

        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined: 
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         * 
         *    if authorizedAdapters is not defined: 
         *      - called internally 
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter: 
             *      resolve with current parameters.
             *   
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                case 'generic-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.readAllCursor(nsearch, order, pagination).catch(benignErrors => benignErrors);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.readAllCursor(search, order, pagination).catch(benignErrors => benignErrors);

                case 'default':
                    throw new Error(`Adapter type '${adapter.adapterType}' is not supported`);
            }
        });
        let someHasNextPage = false;
        let someHasPreviousPage = false;
        return Promise.all(promises)
            //phase 1: reduce
            .then(results => {
                /**
                 * Debug
                 */
                console.log("@@---------- phase1:\n", "\n results[", typeof results, "]", "\n---------- @@@");

                return results.reduce((total, current) => {
                    //check if current is Error
                    if (current instanceof Error) {
                        total.errors.push(current);
                    }
                    //check current
                    else if (current && current.pageInfo && current.edges) {
                        someHasNextPage |= current.pageInfo.hasNextPage;
                        someHasPreviousPage |= current.pageInfo.hasPreviousPage;
                        total.nodes = total.nodes.concat(current.edges.map(e => e.node));
                    }
                    return total;
                }, {
                    nodes: [],
                    errors: []
                });
            })
            //phase 2: order & paginate
            .then(nodesAndErrors => {
                /**
                 * Debug
                 */
                console.log("@@---------- phase2:\n", "\n nodes[", typeof nodesAndErrors.nodes, "]", "\n---------- @@@");

                let nodes = nodesAndErrors.nodes;
                let errors = nodesAndErrors.errors;

                if (order === undefined) {
                    order = [{
                        field: "accession_id",
                        order: 'ASC'
                    }];
                }
                if (pagination === undefined) {
                    pagination = {
                        first: Math.min(globals.LIMIT_RECORDS, nodes.length)
                    }
                }

                let ordered_records = helper.orderRecords(nodes, order);
                let paginated_records = [];

                if (isForwardPagination) {
                    paginated_records = helper.paginateRecordsCursor(ordered_records, pagination.first);
                } else {
                    paginated_records = helper.paginateRecordsBefore(ordered_records, pagination.last);
                }

                let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
                let hasPreviousPage = ordered_records.length > pagination.last || someHasPreviousPage;

                let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage);
                graphQLConnection['errors'] = errors;
                return graphQLConnection;
            });
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


    async set_taxon_id(value) {
        let input = {
            [Accession.idAttribute()]: this.getIdValue(),
            "addTaxon": value
        };

        return await Accession.updateOne(input);
    }

    taxonImpl(search) {
        if (search === undefined) {
            return models.taxon.readById(this.taxon_id);
        } else if (this.taxon_id !== null) {
            let id_search = {
                "field": models.taxon.idAttribute(),
                "value": {
                    "value": this.taxon_id
                },
                "operator": "eq"
            }

            let ext_search = {
                "operator": "and",
                "search": [id_search, search]
            }

            return models.taxon.readAllCursor(ext_search)
                .then(found => {
                    if (found.edges.length > 0) {
                        return found.edges[0].node;
                    }
                    return null;
                });
        }
    }

    async set_locationId(value) {
        let input = {
            [Accession.idAttribute()]: this.getIdValue(),
            "addLocation": value
        };

        return await Accession.updateOne(input);
    }

    locationImpl(search) {
        if (search === undefined) {
            return models.location.readById(this.locationId);
        } else if (this.locationId !== null) {
            let id_search = {
                "field": models.location.idAttribute(),
                "value": {
                    "value": this.locationId
                },
                "operator": "eq"
            }

            let ext_search = {
                "operator": "and",
                "search": [id_search, search]
            }

            return models.location.readAllCursor(ext_search)
                .then(found => {
                    if (found.edges.length > 0) {
                        return found.edges[0].node;
                    }
                    return null;
                });
        }
    }




    countFilteredIndividualsImpl({
        search
    }) {

        if (search === undefined) {
            return models.individual.countRecords({
                "field": "accessionId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            });
        } else {
            return models.individual.countRecords({
                "operator": "and",
                "search": [{
                    "field": "accessionId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            })
        }
    }

    individualsConnectionImpl({
        search,
        order,
        pagination,
        authorizedAdapters
    }) {
        if (search === undefined) {
            return models.individual.readAllCursor({
                "field": "accessionId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination, authorizedAdapters);
        } else {
            return models.individual.readAllCursor({
                "operator": "and",
                "search": [{
                    "field": "accessionId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination, authorizedAdapters)
        }
    }

    countFilteredMeasurementsImpl({
        search
    }) {

        if (search === undefined) {
            return models.measurement.countRecords({
                "field": "accessionId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            });
        } else {
            return models.measurement.countRecords({
                "operator": "and",
                "search": [{
                    "field": "accessionId",
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
        pagination,
        authorizedAdapters
    }) {
        if (search === undefined) {
            return models.measurement.readAllCursor({
                "field": "accessionId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination, authorizedAdapters);
        } else {
            return models.measurement.readAllCursor({
                "operator": "and",
                "search": [{
                    "field": "accessionId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            }, order, pagination, authorizedAdapters)
        }
    }


    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        let internalId = Accession.definition.id.name;
        return internalId;
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

    static assertInputHasId(input) {
        if (!input.accession_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'accession_id'.`);
        }
        return true;
    }

    static addOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.accession_id);

        /**
         * Debug
         */
        console.log("-@@---- ddm.addOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].addOne(input).then(result => new Accession(result));
    }

    static deleteOne(id) {
        let responsibleAdapter = this.adapterForIri(id);

        /**
         * Debug
         */
        console.log("-@@---- ddm.deleteOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].deleteOne(id);
    }

    static updateOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.accession_id);

        /**
         * Debug
         */
        console.log("-@@---- ddm.updateOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].updateOne(input).then(result => new Accession(result));
    }

    static bulkAddCsv(context) {
        throw new Error("Accession.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Accession);
    }
}