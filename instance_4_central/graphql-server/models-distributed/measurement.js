const _ = require('lodash');
const path = require('path');
const adapters = require('../adapters/index');
const globals = require('../config/globals');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));

const definition = {
    model: 'Measurement',
    storageType: 'distributed-data-model',
    registry: [
        'MEASUREMENT_YOLANDAPROJECT',
        'MEASUREMENT_PGMN',
        'MEASUREMENT_GEF'
    ],
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

let registry = ["MEASUREMENT_YOLANDAPROJECT", "MEASUREMENT_PGMN", "MEASUREMENT_GEF"];

module.exports = class Measurement {

    /**
     * constructor - Creates an instance of the model
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        measurement_id,
        name,
        method,
        reference,
        reference_link,
        value,
        unit,
        short_name,
        comments,
        field_unit_id,
        individual_id,
        accessionId
    }) {
        this.measurement_id = measurement_id;
        this.name = name;
        this.method = method;
        this.reference = reference;
        this.reference_link = reference_link;
        this.value = value;
        this.unit = unit;
        this.short_name = short_name;
        this.comments = comments;
        this.field_unit_id = field_unit_id;
        this.individual_id = individual_id;
        this.accessionId = accessionId;
    }

    static get name() {
        return "measurement";
    }

    /**
     * registeredAdapters - Returns an object which has a key for each
     * adapter on adapter/index.js. Each key of the object will have 
     *
     * @return {string}     baseUrl from request.
     */
    static get registeredAdapters() {
        return ["MEASUREMENT_YOLANDAPROJECT", "MEASUREMENT_PGMN", "MEASUREMENT_GEF"].reduce((a, c) => {
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

            return adapters[responsibleAdapter[0]].readById(id).then(result => new Measurement(result));
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
                        field: "measurement_id",
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
        let attributes = Object.keys(Measurement.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }


    async set_individual_id(value) {
        let input = {
            [Measurement.idAttribute()]: this.getIdValue(),
            "addIndividual": value
        };

        return await Measurement.updateOne(input);
    }

    individualImpl(search) {
        if (search === undefined) {
            return models.individual.readById(this.individual_id);
        } else if (this.individual_id !== null) {
            let id_search = {
                "field": models.individual.idAttribute(),
                "value": {
                    "value": this.individual_id
                },
                "operator": "eq"
            }

            let ext_search = {
                "operator": "and",
                "search": [id_search, search]
            }

            return models.individual.readAllCursor(ext_search)
                .then(found => {
                    if (found.edges.length > 0) {
                        return found.edges[0].node;
                    }
                    return null;
                });
        }
    }

    async set_accessionId(value) {
        let input = {
            [Measurement.idAttribute()]: this.getIdValue(),
            "addAccession": value
        };

        return await Measurement.updateOne(input);
    }

    accessionImpl(search) {
        if (search === undefined) {
            return models.accession.readById(this.accessionId);
        } else if (this.accessionId !== null) {
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

            return models.accession.readAllCursor(ext_search)
                .then(found => {
                    if (found.edges.length > 0) {
                        return found.edges[0].node;
                    }
                    return null;
                });
        }
    }





    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        let internalId = Measurement.definition.id.name;
        return internalId;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Measurement.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Measurement.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Measurement.idAttribute()]
    }

    static assertInputHasId(input) {
        if (!input.measurement_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'measurement_id'.`);
        }
        return true;
    }

    static addOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.measurement_id);

        /**
         * Debug
         */
        console.log("-@@---- ddm.addOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].addOne(input).then(result => new Measurement(result));
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
        let responsibleAdapter = this.adapterForIri(input.measurement_id);

        /**
         * Debug
         */
        console.log("-@@---- ddm.updateOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].updateOne(input).then(result => new Measurement(result));
    }

    static bulkAddCsv(context) {
        throw new Error("Measurement.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Measurement);
    }
}