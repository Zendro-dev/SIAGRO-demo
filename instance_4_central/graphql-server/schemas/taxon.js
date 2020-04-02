module.exports = `
  type Taxon{
    """
    @original-field
    """
    id: ID

    """
    @original-field
    
    """
    taxon: String

    """
    @original-field
    
    """
    categoria: String

    """
    @original-field
    
    """
    estatus: String

    """
    @original-field
    
    """
    nombreAutoridad: String

    """
    @original-field
    
    """
    citaNomenclatural: String

    """
    @original-field
    
    """
    fuente: String

    """
    @original-field
    
    """
    ambiente: String

    """
    @original-field
    
    """
    grupoSNIB: String

    """
    @original-field
    
    """
    categoriaResidencia: String

    """
    @original-field
    
    """
    nom: String

    """
    @original-field
    
    """
    cites: String

    """
    @original-field
    
    """
    iucn: String

    """
    @original-field
    
    """
    prioritarias: String

    """
    @original-field
    
    """
    endemismo: String

      
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

type TaxonConnection{
  edges: [TaxonEdge]
  pageInfo: pageInfo!
}

type TaxonEdge{
  cursor: String!
  node: Taxon!
}

  type VueTableTaxon{
    data : [Taxon]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum TaxonField {
    id
    taxon
    categoria
    estatus
    nombreAutoridad
    citaNomenclatural
    fuente
    ambiente
    grupoSNIB
    categoriaResidencia
    nom
    cites
    iucn
    prioritarias
    endemismo
  }

  input searchTaxonInput {
    field: TaxonField
    value: typeValue
    operator: Operator
    search: [searchTaxonInput]
  }

  input orderTaxonInput{
    field: TaxonField
    order: Order
  }

  type Query {
    taxons(search: searchTaxonInput, order: [ orderTaxonInput ], pagination: paginationInput ): [Taxon]
    readOneTaxon(id: ID!): Taxon
    countTaxons(search: searchTaxonInput ): Int
    vueTableTaxon : VueTableTaxon    csvTableTemplateTaxon: [String]

    taxonsConnection(search:searchTaxonInput, order: [ orderTaxonInput ], pagination: paginationCursorInput ): TaxonConnection
  }

    type Mutation {
    addTaxon(id: ID!, taxon: String, categoria: String, estatus: String, nombreAutoridad: String, citaNomenclatural: String, fuente: String, ambiente: String, grupoSNIB: String, categoriaResidencia: String, nom: String, cites: String, iucn: String, prioritarias: String, endemismo: String  , addAccessions:[ID] ): Taxon!
    updateTaxon(id: ID!, taxon: String, categoria: String, estatus: String, nombreAutoridad: String, citaNomenclatural: String, fuente: String, ambiente: String, grupoSNIB: String, categoriaResidencia: String, nom: String, cites: String, iucn: String, prioritarias: String, endemismo: String  , addAccessions:[ID], removeAccessions:[ID] ): Taxon!
  deleteTaxon(id: ID!): String!
  bulkAddTaxonCsv: [Taxon] }

`;