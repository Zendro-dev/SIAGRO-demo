// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(accession) {

    accession.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "accession_id": {
                "type": ["string", "null"]
            },
            "collectors_name": {
                "type": ["string", "null"]
            },
            "collectors_initials": {
                "type": ["string", "null"]
            },
            "sampling_date": {
                "anyOf": [{
                    "isoDate": true
                }, {
                    "type": "null"
                }]
            },
            "sampling_number": {
                "type": ["string", "null"]
            },
            "catalog_number": {
                "type": ["string", "null"]
            },
            "institution_deposited": {
                "type": ["string", "null"]
            },
            "collection_name": {
                "type": ["string", "null"]
            },
            "collection_acronym": {
                "type": ["string", "null"]
            },
            "identified_by": {
                "type": ["string", "null"]
            },
            "identification_date": {
                "anyOf": [{
                    "isoDate": true
                }, {
                    "type": "null"
                }]
            },
            "abundance": {
                "type": ["string", "null"]
            },
            "habitat": {
                "type": ["string", "null"]
            },
            "observations": {
                "type": ["string", "null"]
            },
            "family": {
                "type": ["string", "null"]
            },
            "genus": {
                "type": ["string", "null"]
            },
            "species": {
                "type": ["string", "null"]
            },
            "subspecies": {
                "type": ["string", "null"]
            },
            "variety": {
                "type": ["string", "null"]
            },
            "race": {
                "type": ["string", "null"]
            },
            "form": {
                "type": ["string", "null"]
            },
            "taxon_id": {
                "type": ["string", "null"]
            },
            "collection_deposit": {
                "type": ["string", "null"]
            },
            "collect_number": {
                "type": ["string", "null"]
            },
            "collect_source": {
                "type": ["string", "null"]
            },
            "collected_seeds": {
                "type": ["integer", "null"]
            },
            "collected_plants": {
                "type": ["integer", "null"]
            },
            "collected_other": {
                "type": ["string", "null"]
            },
            "habit": {
                "type": ["string", "null"]
            },
            "local_name": {
                "type": ["string", "null"]
            },
            "locationId": {
                "type": ["string", "null"]
            }
        }
    }

    accession.prototype.asyncValidate = ajv.compile(
        accession.prototype.validatorSchema
    )

    accession.prototype.validateForCreate = async function(record) {
        return await accession.prototype.asyncValidate(record)
    }

    accession.prototype.validateForUpdate = async function(record) {
        return await accession.prototype.asyncValidate(record)
    }

    accession.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return accession
}