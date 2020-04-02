const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://instance_3_gef_sdb_science_db_graphql_server_1:3003/graphql";
const iriRegex = new RegExp('gef');

module.exports = class MEASUREMENT_GEF {

    static get adapterName() {
        return 'MEASUREMENT_GEF';
    }

    static get adapterType() {
        return 'cenzontle-webservice-adapter';
    }

    static recognizeId(iri) {
        return iriRegex.test(iri);
    }

    static readById(iri) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: readById \niri: ", iri, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        let query = `
          query 
            readOneMeasurement
            {
              readOneMeasurement(measurement_id:"${iri}")
              { 
                measurement_id 
                name 
                method 
                reference 
                reference_link 
                value 
                unit 
                short_name 
                comments 
                field_unit_id 
                individual_id 
                accessionId 
              }
            }`;

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: gql:\n");

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.readOneMeasurement;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static countRecords(search) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: countRecords \nsearch: ", search, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        let query = `
      query countMeasurements($search: searchMeasurementInput){
        countMeasurements(search: $search)
      }`

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: gql:\n", {
            search: search
        });

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.countMeasurements;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static readAllCursor(search, order, pagination) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: readAllCursor \search: ", search, "\norder: ", order, "\npagination: ", pagination, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }
        let query = `query measurementsConnection($search: searchMeasurementInput $pagination: paginationCursorInput $order: [orderMeasurementInput]){
      measurementsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  measurement_id  name
         method
         reference
         reference_link
         value
         unit
         short_name
         comments
         field_unit_id
         individual_id
         accessionId
        } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }`

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: gql:\n", {
            search: search,
            order: order,
            pagination: pagination
        });

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.measurementsConnection;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static addOne(input) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: addOne \ninput: ", input, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        let query = `
        mutation addMeasurement(
          $measurement_id:ID!  
          $name:String
          $method:String
          $reference:String
          $reference_link:String
          $value:Float
          $unit:String
          $short_name:String
          $comments:String
          $field_unit_id:Int 
          $addIndividual:ID 
          $addAccession:ID 
        ){
          addMeasurement( 
          measurement_id:$measurement_id  
          name:$name
          method:$method
          reference:$reference
          reference_link:$reference_link
          value:$value
          unit:$unit
          short_name:$short_name
          comments:$comments
          field_unit_id:$field_unit_id  
          addIndividual:$addIndividual 
          addAccession:$addAccession ){
            measurement_id 
            name
            method
            reference
            reference_link
            value
            unit
            short_name
            comments
            field_unit_id
            individual_id
            accessionId
          }
        }`;

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: gql:\n", input);

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.addMeasurement;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static deleteOne(id) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: deleteOne \nid: ", id, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        let query = `
          mutation 
            deleteMeasurement{ 
              deleteMeasurement(
                measurement_id: "${id}" )}`;

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: \n");

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.deleteMeasurement;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static updateOne(input) {
        /**
         * Debug
         */
        console.log("-@@@------ adapter: (", this.adapterType, ") : ", this.adapterName, "\n- on: updateOne \ninput: ", input, "\nremoteCenzontleURL: ", remoteCenzontleURL);

        let query = `
          mutation 
            updateMeasurement(
              $measurement_id:ID! 
              $name:String 
              $method:String 
              $reference:String 
              $reference_link:String 
              $value:Float 
              $unit:String 
              $short_name:String 
              $comments:String 
              $field_unit_id:Int  
              $addIndividual:ID 
              $removeIndividual:ID
              $addAccession:ID 
              $removeAccession:ID  
            ){
              updateMeasurement(
                measurement_id:$measurement_id 
                name:$name 
                method:$method 
                reference:$reference 
                reference_link:$reference_link 
                value:$value 
                unit:$unit 
                short_name:$short_name 
                comments:$comments 
                field_unit_id:$field_unit_id   
                addIndividual:$addIndividual 
                removeIndividual:$removeIndividual  
                addAccession:$addAccession 
                removeAccession:$removeAccession  
              ){
                measurement_id 
                name 
                method 
                reference 
                reference_link 
                value 
                unit 
                short_name 
                comments 
                field_unit_id 
                individual_id 
                accessionId 
              }
            }`

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: gql:\n", input);

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.updateMeasurement;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static bulkAddCsv(context) {
        throw new Error("Measurement.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplateMeasurement }`;
        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.csvTableTemplateMeasurement;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
}