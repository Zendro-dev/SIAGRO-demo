const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://localhost:3030/graphql";
const iriRegex = new RegExp('gef');

module.exports = class LOCATION_GEF {

    static get adapterName() {
        return 'LOCATION_GEF';
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
            readOneLocation
            {
              readOneLocation(locationId:"${iri}")
              { 
                locationId 
                country 
                state 
                municipality 
                locality 
                latitude 
                longitude 
                altitude 
                natural_area 
                natural_area_name 
                georeference_method 
                georeference_source 
                datum 
                vegetation 
                stoniness 
                sewer 
                topography 
                slope 
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
                return res.data.data.readOneLocation;
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
      query countLocations($search: searchLocationInput){
        countLocations(search: $search)
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
                return res.data.data.countLocations;
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
        let query = `query locationsConnection($search: searchLocationInput $pagination: paginationCursorInput $order: [orderLocationInput]){
      locationsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  locationId  country
         state
         municipality
         locality
         latitude
         longitude
         altitude
         natural_area
         natural_area_name
         georeference_method
         georeference_source
         datum
         vegetation
         stoniness
         sewer
         topography
         slope
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
                return res.data.data.locationsConnection;
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
        mutation addLocation(
          $locationId:ID!  
          $country:String
          $state:String
          $municipality:String
          $locality:String
          $latitude:Float
          $longitude:Float
          $altitude:Float
          $natural_area:String
          $natural_area_name:String
          $georeference_method:String
          $georeference_source:String
          $datum:String
          $vegetation:String
          $stoniness:String
          $sewer:String
          $topography:String
          $slope:Float 
          $addAccessions:[ID]
 
        ){
          addLocation( 
          locationId:$locationId  
          country:$country
          state:$state
          municipality:$municipality
          locality:$locality
          latitude:$latitude
          longitude:$longitude
          altitude:$altitude
          natural_area:$natural_area
          natural_area_name:$natural_area_name
          georeference_method:$georeference_method
          georeference_source:$georeference_source
          datum:$datum
          vegetation:$vegetation
          stoniness:$stoniness
          sewer:$sewer
          topography:$topography
          slope:$slope   addAccessions:$addAccessions){
            locationId 
            country
            state
            municipality
            locality
            latitude
            longitude
            altitude
            natural_area
            natural_area_name
            georeference_method
            georeference_source
            datum
            vegetation
            stoniness
            sewer
            topography
            slope
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
                return res.data.data.addLocation;
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
            deleteLocation{ 
              deleteLocation(
                locationId: "${id}" )}`;

        /**
         * Debug
         */
        console.log("\nquery: gql:\n", query, "\nvariables: \n");

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.deleteLocation;
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
            updateLocation(
              $locationId:ID! 
              $country:String 
              $state:String 
              $municipality:String 
              $locality:String 
              $latitude:Float 
              $longitude:Float 
              $altitude:Float 
              $natural_area:String 
              $natural_area_name:String 
              $georeference_method:String 
              $georeference_source:String 
              $datum:String 
              $vegetation:String 
              $stoniness:String 
              $sewer:String 
              $topography:String 
              $slope:Float    
              $addAccessions:[ID] 
              $removeAccessions:[ID] 
            ){
              updateLocation(
                locationId:$locationId 
                country:$country 
                state:$state 
                municipality:$municipality 
                locality:$locality 
                latitude:$latitude 
                longitude:$longitude 
                altitude:$altitude 
                natural_area:$natural_area 
                natural_area_name:$natural_area_name 
                georeference_method:$georeference_method 
                georeference_source:$georeference_source 
                datum:$datum 
                vegetation:$vegetation 
                stoniness:$stoniness 
                sewer:$sewer 
                topography:$topography 
                slope:$slope    
                addAccessions:$addAccessions 
                removeAccessions:$removeAccessions 
              ){
                locationId 
                country 
                state 
                municipality 
                locality 
                latitude 
                longitude 
                altitude 
                natural_area 
                natural_area_name 
                georeference_method 
                georeference_source 
                datum 
                vegetation 
                stoniness 
                sewer 
                topography 
                slope 
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
                return res.data.data.updateLocation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static bulkAddCsv(context) {
        throw new Error("Location.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplateLocation }`;
        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.csvTableTemplateLocation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
}