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
        return queryInterface.createTable('measurements', {

                measurement_id: {
                    type: Sequelize[dict['String']],
                    primaryKey: true
                },

                createdAt: {
                    type: Sequelize.DATE
                },

                updatedAt: {
                    type: Sequelize.DATE
                },

                name: {
                    type: Sequelize[dict['String']]
                },
                method: {
                    type: Sequelize[dict['String']]
                },
                reference: {
                    type: Sequelize[dict['String']]
                },
                reference_link: {
                    type: Sequelize[dict['String']]
                },
                value: {
                    type: Sequelize[dict['Float']]
                },
                unit: {
                    type: Sequelize[dict['String']]
                },
                short_name: {
                    type: Sequelize[dict['String']]
                },
                comments: {
                    type: Sequelize[dict['String']]
                },
                field_unit_id: {
                    type: Sequelize[dict['Int']]
                },
                individual_id: {
                    type: Sequelize[dict['String']]
                },
                accessionId: {
                    type: Sequelize[dict['String']]
                }

            }).then(() => {
                queryInterface.addIndex('measurements', ['individual_id'])
            })
            .then(() => {
                queryInterface.addIndex('measurements', ['accessionId'])
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
        return queryInterface.dropTable('measurements');
    }

};