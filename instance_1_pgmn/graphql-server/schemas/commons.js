module.exports = `

  enum Operator{
    like
    or
    and
    eq
    between
    in
    gt
    gte
    lt
    lte
    ne
    regexp
    notRegexp
  }

  enum Order{
    DESC
    ASC
  }

  input typeValue{
    type: String
    value: String!
  }

  input paginationInput{
    limit: Int
    offset: Int
  }

  input paginationCursorInput{
    first: Int
    last: Int
    after: String
    before: String
    includeCursor: Boolean
  }

  type pageInfo{
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  scalar Date
  scalar Time
  scalar DateTime
`;