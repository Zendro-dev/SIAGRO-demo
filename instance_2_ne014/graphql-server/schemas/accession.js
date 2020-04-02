module.exports = `
  type Accession{
    """
    @original-field
    """
    accession_id: ID

    """
    @original-field
    
    """
    collectors_name: String

    """
    @original-field
    
    """
    collectors_initials: String

    """
    @original-field
    
    """
    sampling_date: Date

    """
    @original-field
    
    """
    sampling_number: String

    """
    @original-field
    
    """
    catalog_number: String

    """
    @original-field
    
    """
    institution_deposited: String

    """
    @original-field
    
    """
    collection_name: String

    """
    @original-field
    
    """
    collection_acronym: String

    """
    @original-field
    
    """
    identified_by: String

    """
    @original-field
    
    """
    identification_date: Date

    """
    @original-field
    
    """
    abundance: String

    """
    @original-field
    
    """
    habitat: String

    """
    @original-field
    
    """
    observations: String

    """
    @original-field
    
    """
    family: String

    """
    @original-field
    
    """
    genus: String

    """
    @original-field
    
    """
    species: String

    """
    @original-field
    
    """
    subspecies: String

    """
    @original-field
    
    """
    variety: String

    """
    @original-field
    
    """
    race: String

    """
    @original-field
    
    """
    form: String

    """
    @original-field
    
    """
    taxon_id: String

    """
    @original-field
    
    """
    collection_deposit: String

    """
    @original-field
    
    """
    collect_number: String

    """
    @original-field
    
    """
    collect_source: String

    """
    @original-field
    
    """
    collected_seeds: Int

    """
    @original-field
    
    """
    collected_plants: Int

    """
    @original-field
    
    """
    collected_other: String

    """
    @original-field
    
    """
    habit: String

    """
    @original-field
    
    """
    local_name: String

    """
    @original-field
    
    """
    locationId: String

    taxon(search: searchTaxonInput): Taxon
  location(search: searchLocationInput): Location
    
    """
    @search-request
    """
    individualsFilter(search: searchIndividualInput, order: [ orderIndividualInput ], pagination: paginationInput): [Individual]


    """
    @search-request
    """
    individualsConnection(search: searchIndividualInput, order: [ orderIndividualInput ], pagination: paginationCursorInput): IndividualConnection

    """
    @count-request
    """
    countFilteredIndividuals(search: searchIndividualInput) : Int
  
    """
    @search-request
    """
    measurementsFilter(search: searchMeasurementInput, order: [ orderMeasurementInput ], pagination: paginationInput): [Measurement]


    """
    @search-request
    """
    measurementsConnection(search: searchMeasurementInput, order: [ orderMeasurementInput ], pagination: paginationCursorInput): MeasurementConnection

    """
    @count-request
    """
    countFilteredMeasurements(search: searchMeasurementInput) : Int
  }

type AccessionConnection{
  edges: [AccessionEdge]
  pageInfo: pageInfo!
}

type AccessionEdge{
  cursor: String!
  node: Accession!
}

  type VueTableAccession{
    data : [Accession]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum AccessionField {
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

  input searchAccessionInput {
    field: AccessionField
    value: typeValue
    operator: Operator
    excludeAdapterNames: [String]
    search: [searchAccessionInput]
  }

  input orderAccessionInput{
    field: AccessionField
    order: Order
  }

  type Query {
    accessions(search: searchAccessionInput, order: [ orderAccessionInput ], pagination: paginationInput ): [Accession]
    readOneAccession(accession_id: ID!): Accession
    countAccessions(search: searchAccessionInput ): Int
    vueTableAccession : VueTableAccession    csvTableTemplateAccession: [String]

    accessionsConnection(search:searchAccessionInput, order: [ orderAccessionInput ], pagination: paginationCursorInput ): AccessionConnection
  }

    type Mutation {
    addAccession(accession_id: ID!, collectors_name: String, collectors_initials: String, sampling_date: Date, sampling_number: String, catalog_number: String, institution_deposited: String, collection_name: String, collection_acronym: String, identified_by: String, identification_date: Date, abundance: String, habitat: String, observations: String, family: String, genus: String, species: String, subspecies: String, variety: String, race: String, form: String, collection_deposit: String, collect_number: String, collect_source: String, collected_seeds: Int, collected_plants: Int, collected_other: String, habit: String, local_name: String , addTaxon:ID, addLocation:ID , addIndividuals:[ID], addMeasurements:[ID] ): Accession!
    updateAccession(accession_id: ID!, collectors_name: String, collectors_initials: String, sampling_date: Date, sampling_number: String, catalog_number: String, institution_deposited: String, collection_name: String, collection_acronym: String, identified_by: String, identification_date: Date, abundance: String, habitat: String, observations: String, family: String, genus: String, species: String, subspecies: String, variety: String, race: String, form: String, collection_deposit: String, collect_number: String, collect_source: String, collected_seeds: Int, collected_plants: Int, collected_other: String, habit: String, local_name: String , addTaxon:ID, removeTaxon:ID , addLocation:ID, removeLocation:ID  , addIndividuals:[ID], removeIndividuals:[ID] , addMeasurements:[ID], removeMeasurements:[ID] ): Accession!
  deleteAccession(accession_id: ID!): String!
  bulkAddAccessionCsv: [Accession] }

`;