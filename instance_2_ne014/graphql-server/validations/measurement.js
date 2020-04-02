// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(measurement) {

    measurement.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "measurement_id": {
                "type": ["string", "null"]
            },
            "name": {
                "type": ["string", "null"]
            },
            "method": {
                "type": ["string", "null"]
            },
            "reference": {
                "type": ["string", "null"]
            },
            "reference_link": {
                "type": ["string", "null"]
            },
            "value": {
                "type": ["number", "null"]
            },
            "unit": {
                "type": ["string", "null"]
            },
            "short_name": {
                "type": ["string", "null"]
            },
            "comments": {
                "type": ["string", "null"]
            },
            "field_unit_id": {
                "type": ["integer", "null"]
            },
            "individual_id": {
                "type": ["string", "null"]
            },
            "accessionId": {
                "type": ["string", "null"]
            }
        }
    }

    measurement.prototype.asyncValidate = ajv.compile(
        measurement.prototype.validatorSchema
    )

    measurement.prototype.validateForCreate = async function(record) {
        return await measurement.prototype.asyncValidate(record)
    }

    measurement.prototype.validateForUpdate = async function(record) {
        return await measurement.prototype.asyncValidate(record)
    }

    measurement.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return measurement
}