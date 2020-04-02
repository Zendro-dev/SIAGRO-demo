'use strict';
const dict = require('../utils/graphql-sequelize-types');

/**
 * @module - Migrations to create and to undo a table correpondant to a sequelize model.
 */
module.exports = {

    /**
     * up - Creates a table with the fields specified in the the createTable function.
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was created successfully, rejected otherwise.
     */
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('locations', {

            locationId: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            country: {
                type: Sequelize[dict['String']]
            },
            state: {
                type: Sequelize[dict['String']]
            },
            municipality: {
                type: Sequelize[dict['String']]
            },
            locality: {
                type: Sequelize[dict['String']]
            },
            latitude: {
                type: Sequelize[dict['Float']]
            },
            longitude: {
                type: Sequelize[dict['Float']]
            },
            altitude: {
                type: Sequelize[dict['Float']]
            },
            natural_area: {
                type: Sequelize[dict['String']]
            },
            natural_area_name: {
                type: Sequelize[dict['String']]
            },
            georeference_method: {
                type: Sequelize[dict['String']]
            },
            georeference_source: {
                type: Sequelize[dict['String']]
            },
            datum: {
                type: Sequelize[dict['String']]
            },
            vegetation: {
                type: Sequelize[dict['String']]
            },
            stoniness: {
                type: Sequelize[dict['String']]
            },
            sewer: {
                type: Sequelize[dict['String']]
            },
            topography: {
                type: Sequelize[dict['String']]
            },
            slope: {
                type: Sequelize[dict['Float']]
            }

        });
    },

    /**
     * down - Deletes a table.
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was deleted successfully, rejected otherwise.
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('locations');
    }

};