export default function getAttributes(filterName) {
  switch(filterName) {
    case 'accession':
      return {
        "accession_id": "String",
        "collectors_name": "String",
        "collectors_initials": "String",
        "sampling_date": "Date",
        "sampling_number": "String",
        "catalog_number": "String",
        "institution_deposited": "String",
        "collection_name": "String",
        "collection_acronym": "String",
        "identified_by": "String",
        "identification_date": "Date",
        "abundance": "String",
        "habitat": "String",
        "observations": "String",
        "family": "String",
        "genus": "String",
        "species": "String",
        "subspecies": "String",
        "variety": "String",
        "race": "String",
        "form": "String",
        "taxon_id": "String",
        "collection_deposit": "String",
        "collect_number": "String",
        "collect_source": "String",
        "collected_seeds": "Int",
        "collected_plants": "Int",
        "collected_other": "String",
        "habit": "String",
        "local_name": "String",
        "locationId": "String",
      };
    case 'individual':
      return {
        "name": "String",
        "origin": "String",
        "description": "String",
        "accessionId": "String",
        "genotypeId": "Int",
        "field_unit_id": "Int",
      };
    case 'location':
      return {
        "locationId": "String",
        "country": "String",
        "state": "String",
        "municipality": "String",
        "locality": "String",
        "latitude": "Float",
        "longitude": "Float",
        "altitude": "Float",
        "natural_area": "String",
        "natural_area_name": "String",
        "georeference_method": "String",
        "georeference_source": "String",
        "datum": "String",
        "vegetation": "String",
        "stoniness": "String",
        "sewer": "String",
        "topography": "String",
        "slope": "Float",
      };
    case 'measurement':
      return {
        "measurement_id": "String",
        "name": "String",
        "method": "String",
        "reference": "String",
        "reference_link": "String",
        "value": "Float",
        "unit": "String",
        "short_name": "String",
        "comments": "String",
        "field_unit_id": "Int",
        "individual_id": "String",
        "accessionId": "String",
      };
    case 'role_to_user':
      return {
        "id": "Int",
        "userId": "Int",
        "roleId": "Int",
      };
    case 'taxon':
      return {
        "id": "String",
        "taxon": "String",
        "categoria": "String",
        "estatus": "String",
        "nombreAutoridad": "String",
        "citaNomenclatural": "String",
        "fuente": "String",
        "ambiente": "String",
        "grupoSNIB": "String",
        "categoriaResidencia": "String",
        "nom": "String",
        "cites": "String",
        "iucn": "String",
        "prioritarias": "String",
        "endemismo": "String",
      };
    case 'role':
      return {
        "id": "Int",
        "name": "String",
        "description": "String",
    };
    case 'user':
      return {
        "id": "Int",
        "email": "String",
        "password": "String",
    };

    default:
      return {};
  }
}