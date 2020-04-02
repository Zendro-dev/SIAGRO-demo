// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(location) {

    location.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "locationId": {
                "type": ["string", "null"]
            },
            "country": {
                "type": ["string", "null"]
            },
            "state": {
                "type": ["string", "null"]
            },
            "municipality": {
                "type": ["string", "null"]
            },
            "locality": {
                "type": ["string", "null"]
            },
            "latitude": {
                "type": ["number", "null"]
            },
            "longitude": {
                "type": ["number", "null"]
            },
            "altitude": {
                "type": ["number", "null"]
            },
            "natural_area": {
                "type": ["string", "null"]
            },
            "natural_area_name": {
                "type": ["string", "null"]
            },
            "georeference_method": {
                "type": ["string", "null"]
            },
            "georeference_source": {
                "type": ["string", "null"]
            },
            "datum": {
                "type": ["string", "null"]
            },
            "vegetation": {
                "type": ["string", "null"]
            },
            "stoniness": {
                "type": ["string", "null"]
            },
            "sewer": {
                "type": ["string", "null"]
            },
            "topography": {
                "type": ["string", "null"]
            },
            "slope": {
                "type": ["number", "null"]
            }
        }
    }

    location.prototype.asyncValidate = ajv.compile(
        location.prototype.validatorSchema
    )

    location.prototype.validateForCreate = async function(record) {
        return await location.prototype.asyncValidate(record)
    }

    location.prototype.validateForUpdate = async function(record) {
        return await location.prototype.asyncValidate(record)
    }

    location.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return location
}