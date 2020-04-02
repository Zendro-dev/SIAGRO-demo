module.exports = `
  type Location{
    """
    @original-field
    """
    locationId: ID

    """
    @original-field
    
    """
    country: String

    """
    @original-field
    
    """
    state: String

    """
    @original-field
    
    """
    municipality: String

    """
    @original-field
    
    """
    locality: String

    """
    @original-field
    
    """
    latitude: Float

    """
    @original-field
    
    """
    longitude: Float

    """
    @original-field
    
    """
    altitude: Float

    """
    @original-field
    
    """
    natural_area: String

    """
    @original-field
    
    """
    natural_area_name: String

    """
    @original-field
    
    """
    georeference_method: String

    """
    @original-field
    
    """
    georeference_source: String

    """
    @original-field
    
    """
    datum: String

    """
    @original-field
    
    """
    vegetation: String

    """
    @original-field
    
    """
    stoniness: String

    """
    @original-field
    
    """
    sewer: String

    """
    @original-field
    
    """
    topography: String

    """
    @original-field
    
    """
    slope: Float

      
    """
    @search-request
    """
    accessionsFilter(search: searchAccessionInput, order: [ orderAccessionInput ], pagination: paginationInput): [Accession]


    """
    @search-request
    """
    accessionsConnection(search: searchAccessionInput, order: [ orderAccessionInput ], pagination: paginationCursorInput): AccessionConnection

    """
    @count-request
    """
    countFilteredAccessions(search: searchAccessionInput) : Int
  }

type LocationConnection{
  edges: [LocationEdge]
  pageInfo: pageInfo!
}

type LocationEdge{
  cursor: String!
  node: Location!
}

  type VueTableLocation{
    data : [Location]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum LocationField {
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

  input searchLocationInput {
    field: LocationField
    value: typeValue
    operator: Operator
    search: [searchLocationInput]
  }

  input orderLocationInput{
    field: LocationField
    order: Order
  }

  type Query {
    locations(search: searchLocationInput, order: [ orderLocationInput ], pagination: paginationInput ): [Location]
    readOneLocation(locationId: ID!): Location
    countLocations(search: searchLocationInput ): Int
    vueTableLocation : VueTableLocation    csvTableTemplateLocation: [String]

    locationsConnection(search:searchLocationInput, order: [ orderLocationInput ], pagination: paginationCursorInput ): LocationConnection
  }

    type Mutation {
    addLocation(locationId: ID!, country: String, state: String, municipality: String, locality: String, latitude: Float, longitude: Float, altitude: Float, natural_area: String, natural_area_name: String, georeference_method: String, georeference_source: String, datum: String, vegetation: String, stoniness: String, sewer: String, topography: String, slope: Float  , addAccessions:[ID] ): Location!
    updateLocation(locationId: ID!, country: String, state: String, municipality: String, locality: String, latitude: Float, longitude: Float, altitude: Float, natural_area: String, natural_area_name: String, georeference_method: String, georeference_source: String, datum: String, vegetation: String, stoniness: String, sewer: String, topography: String, slope: Float  , addAccessions:[ID], removeAccessions:[ID] ): Location!
  deleteLocation(locationId: ID!): String!
  bulkAddLocationCsv: [Location] }

`;