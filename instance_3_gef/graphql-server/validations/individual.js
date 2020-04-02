// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(individual) {

    individual.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "name": {
                "type": ["string", "null"]
            },
            "origin": {
                "type": ["string", "null"]
            },
            "description": {
                "type": ["string", "null"]
            },
            "accessionId": {
                "type": ["string", "null"]
            },
            "genotypeId": {
                "type": ["integer", "null"]
            },
            "field_unit_id": {
                "type": ["integer", "null"]
            }
        }
    }

    individual.prototype.asyncValidate = ajv.compile(
        individual.prototype.validatorSchema
    )

    individual.prototype.validateForCreate = async function(record) {
        return await individual.prototype.asyncValidate(record)
    }

    individual.prototype.validateForUpdate = async function(record) {
        return await individual.prototype.asyncValidate(record)
    }

    individual.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return individual
}