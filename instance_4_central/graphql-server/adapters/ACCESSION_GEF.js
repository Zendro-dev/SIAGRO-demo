const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://instance_3_gef_sdb_science_db_graphql_server_1:3003/graphql";
const iriRegex = new RegExp('gef');

module.exports = class ACCESSION_GEF {

    static get adapterName() {
        return 'ACCESSION_GEF';
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
            readOneAccession
            {
              readOneAccession(accession_id:"${iri}")
              { 
                accession_id 
                collectors_name 
                collectors_initials 
                sampling_date 
                sampling_number 
                catalog_number 
                institution_deposited 
                collection_name 
                collection_acronym 
                identified_by 
                identification_date 
                abundance 
                habitat 
                observations 
                family 
                genus 
                species 
                subspecies 
                variety 
                race 
                form 
                taxon_id 
                collection_deposit 
                collect_number 
                collect_source 
                collected_seeds 
                collected_plants 
                collected_other 
                habit 
                local_name 
                locationId 
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
                return res.data.data.readOneAccession;
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
      query countAccessions($search: searchAccessionInput){
        countAccessions(search: $search)
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
                return res.data.data.countAccessions;
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
        let query = `query accessionsConnection($search: searchAccessionInput $pagination: paginationCursorInput $order: [orderAccessionInput]){
      accessionsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  accession_id  collectors_name
         collectors_initials
         sampling_date
         sampling_number
         catalog_number
         institution_deposited
         collection_name
         collection_acronym
         identified_by
         identification_date
         abundance
         habitat
         observations
         family
         genus
         species
         subspecies
         variety
         race
         form
         taxon_id
         collection_deposit
         collect_number
         collect_source
         collected_seeds
         collected_plants
         collected_other
         habit
         local_name
         locationId
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
                return res.data.data.accessionsConnection;
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
        mutation addAccession(
          $accession_id:ID!  
          $collectors_name:String
          $collectors_initials:String
          $sampling_date:Date
          $sampling_number:String
          $catalog_number:String
          $institution_deposited:String
          $collection_name:String
          $collection_acronym:String
          $identified_by:String
          $identification_date:Date
          $abundance:String
          $habitat:String
          $observations:String
          $family:String
          $genus:String
          $species:String
          $subspecies:String
          $variety:String
          $race:String
          $form:String
          $collection_deposit:String
          $collect_number:String
          $collect_source:String
          $collected_seeds:Int
          $collected_plants:Int
          $collected_other:String
          $habit:String
          $local_name:String 
          $addTaxon:ID 
          $addLocation:ID 
          $addIndividuals:[ID]
 
          $addMeasurements:[ID]
 
        ){
          addAccession( 
          accession_id:$accession_id  
          collectors_name:$collectors_name
          collectors_initials:$collectors_initials
          sampling_date:$sampling_date
          sampling_number:$sampling_number
          catalog_number:$catalog_number
          institution_deposited:$institution_deposited
          collection_name:$collection_name
          collection_acronym:$collection_acronym
          identified_by:$identified_by
          identification_date:$identification_date
          abundance:$abundance
          habitat:$habitat
          observations:$observations
          family:$family
          genus:$genus
          species:$species
          subspecies:$subspecies
          variety:$variety
          race:$race
          form:$form
          collection_deposit:$collection_deposit
          collect_number:$collect_number
          collect_source:$collect_source
          collected_seeds:$collected_seeds
          collected_plants:$collected_plants
          collected_other:$collected_other
          habit:$habit
          local_name:$local_name  
          addTaxon:$addTaxon 
          addLocation:$addLocation  addIndividuals:$addIndividuals addMeasurements:$addMeasurements){
            accession_id 
            collectors_name
            collectors_initials
            sampling_date
            sampling_number
            catalog_number
            institution_deposited
            collection_name
            collection_acronym
            identified_by
            identification_date
            abundance
            habitat
            observations
            family
            genus
            species
            subspecies
            variety
            race
            form
            taxon_id
            collection_deposit
            collect_number
            collect_source
            collected_seeds
            collected_plants
            collected_other
            habit
            local_name
            locationId
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
                return res.data.data.addAccession;
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
            deleteAccession{ 
              deleteAccession(
                accession_id: "${id}" )}`;

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: \n");

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.deleteAccession;
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
            updateAccession(
              $accession_id:ID! 
              $collectors_name:String 
              $collectors_initials:String 
              $sampling_date:Date 
              $sampling_number:String 
              $catalog_number:String 
              $institution_deposited:String 
              $collection_name:String 
              $collection_acronym:String 
              $identified_by:String 
              $identification_date:Date 
              $abundance:String 
              $habitat:String 
              $observations:String 
              $family:String 
              $genus:String 
              $species:String 
              $subspecies:String 
              $variety:String 
              $race:String 
              $form:String 
              $collection_deposit:String 
              $collect_number:String 
              $collect_source:String 
              $collected_seeds:Int 
              $collected_plants:Int 
              $collected_other:String 
              $habit:String 
              $local_name:String  
              $addTaxon:ID 
              $removeTaxon:ID
              $addLocation:ID 
              $removeLocation:ID  
              $addIndividuals:[ID] 
              $removeIndividuals:[ID] 
              $addMeasurements:[ID] 
              $removeMeasurements:[ID] 
            ){
              updateAccession(
                accession_id:$accession_id 
                collectors_name:$collectors_name 
                collectors_initials:$collectors_initials 
                sampling_date:$sampling_date 
                sampling_number:$sampling_number 
                catalog_number:$catalog_number 
                institution_deposited:$institution_deposited 
                collection_name:$collection_name 
                collection_acronym:$collection_acronym 
                identified_by:$identified_by 
                identification_date:$identification_date 
                abundance:$abundance 
                habitat:$habitat 
                observations:$observations 
                family:$family 
                genus:$genus 
                species:$species 
                subspecies:$subspecies 
                variety:$variety 
                race:$race 
                form:$form 
                collection_deposit:$collection_deposit 
                collect_number:$collect_number 
                collect_source:$collect_source 
                collected_seeds:$collected_seeds 
                collected_plants:$collected_plants 
                collected_other:$collected_other 
                habit:$habit 
                local_name:$local_name   
                addTaxon:$addTaxon 
                removeTaxon:$removeTaxon  
                addLocation:$addLocation 
                removeLocation:$removeLocation   
                addIndividuals:$addIndividuals 
                removeIndividuals:$removeIndividuals  
                addMeasurements:$addMeasurements 
                removeMeasurements:$removeMeasurements 
              ){
                accession_id 
                collectors_name 
                collectors_initials 
                sampling_date 
                sampling_number 
                catalog_number 
                institution_deposited 
                collection_name 
                collection_acronym 
                identified_by 
                identification_date 
                abundance 
                habitat 
                observations 
                family 
                genus 
                species 
                subspecies 
                variety 
                race 
                form 
                taxon_id 
                collection_deposit 
                collect_number 
                collect_source 
                collected_seeds 
                collected_plants 
                collected_other 
                habit 
                local_name 
                locationId 
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
                return res.data.data.updateAccession;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static bulkAddCsv(context) {
        throw new Error("Accession.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplateAccession }`;
        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.csvTableTemplateAccession;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
}