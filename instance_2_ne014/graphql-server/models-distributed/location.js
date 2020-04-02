const _ = require('lodash');
const path = require('path');
const adapters = require('../adapters/index');
const globals = require('../config/globals');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));

const definition = {
    model: 'Location',
    storageType: 'distributed-data-model',
    registry: [
        'LOCATION_YOLANDAPROJECT',
        'LOCATION_PGMN'
    ],
    attributes: {
        locationId: 'String',
        country: 'String',
        state: 'String',
        municipality: 'String',
        locality: 'String',
        latitude: 'Float',
        longitude: 'Float',
        altitude: 'Float',
        natural_area: 'String',
        natural_area_name: 'String',
        georeference_method: 'String',
        georeference_source: 'String',
        datum: 'String',
        vegetation: 'String',
        stoniness: 'String',
        sewer: 'String',
        topography: 'String',
        slope: 'Float'
    },
    associations: {
        accessions: {
            type: 'to_many',
            target: 'Accession',
            targetKey: 'locationId',
            keyIn: 'Accession',
            targetStorageType: 'distributed-data-model',
            label: 'accession_id',
            sublabel: 'institution_deposited',
            name: 'accessions',
            name_lc: 'accessions',
            name_cp: 'Accessions',
            target_lc: 'accession',
            target_lc_pl: 'accessions',
            target_pl: 'Accessions',
            target_cp: 'Accession',
            target_cp_pl: 'Accessions',
            keyIn_lc: 'accession'
        }
    },
    internalId: 'locationId',
    id: {
        name: 'locationId',
        type: 'String'
    }
};

let registry = ["LOCATION_YOLANDAPROJECT", "LOCATION_PGMN"];

module.exports = class Location {

    /**
     * constructor - Creates an instance of the model
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        locationId,
        country,
        state,
        municipality,
        locality,
        latitude,
        longitude,
        altitude,
        natural_area,
        natural_area_name,
        georeference_method,
        georeference_source,
        datum,
        vegetation,
        stoniness,
        sewer,
        topography,
        slope
    }) {
        this.locationId = locationId;
        this.country = country;
        this.state = state;
        this.municipality = municipality;
        this.locality = locality;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.natural_area = natural_area;
        this.natural_area_name = natural_area_name;
        this.georeference_method = georeference_method;
        this.georeference_source = georeference_source;
        this.datum = datum;
        this.vegetation = vegetation;
        this.stoniness = stoniness;
        this.sewer = sewer;
        this.topography = topography;
        this.slope = slope;
    }

    static get name() {
        return "location";
    }

    /**
     * registeredAdapters - Returns an object which has a key for each
     * adapter on adapter/index.js. Each key of the object will have 
     *
     * @return {string}     baseUrl from request.
     */
    static get registeredAdapters() {
        return ["LOCATION_YOLANDAPROJECT", "LOCATION_PGMN"].reduce((a, c) => {
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

            return adapters[responsibleAdapter[0]].readById(id).then(result => new Location(result));
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
                        field: "locationId",
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
        let attributes = Object.keys(Location.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }





    countFilteredAccessionsImpl({
        search
    }) {

        if (search === undefined) {
            return models.accession.countRecords({
                "field": "locationId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            });
        } else {
            return models.accession.countRecords({
                "operator": "and",
                "search": [{
                    "field": "locationId",
                    "value": {
                        "value": this.getIdValue()
                    },
                    "operator": "eq"
                }, search]
            })
        }
    }

    accessionsConnectionImpl({
        search,
        order,
        pagination,
        authorizedAdapters
    }) {
        if (search === undefined) {
            return models.accession.readAllCursor({
                "field": "locationId",
                "value": {
                    "value": this.getIdValue()
                },
                "operator": "eq"
            }, order, pagination, authorizedAdapters);
        } else {
            return models.accession.readAllCursor({
                "operator": "and",
                "search": [{
                    "field": "locationId",
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
        let internalId = Location.definition.id.name;
        return internalId;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return Location.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of Location.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[Location.idAttribute()]
    }

    static assertInputHasId(input) {
        if (!input.locationId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'locationId'.`);
        }
        return true;
    }

    static addOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.locationId);

        /**
         * Debug
         */
        console.log("-@@---- ddm.addOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].addOne(input).then(result => new Location(result));
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
        let responsibleAdapter = this.adapterForIri(input.locationId);

        /**
         * Debug
         */
        console.log("-@@---- ddm.updateOne: \nresponsibleAdapter: ", responsibleAdapter);

        return adapters[responsibleAdapter].updateOne(input).then(result => new Location(result));
    }

    static bulkAddCsv(context) {
        throw new Error("Location.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(Location);
    }
}