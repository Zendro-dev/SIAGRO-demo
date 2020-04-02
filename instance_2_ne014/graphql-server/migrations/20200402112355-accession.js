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
        return queryInterface.createTable('accessions', {

            accession_id: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
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
        return queryInterface.dropTable('accessions');
    }

};