import accessionQueries from './accession'
import individualQueries from './individual'
import locationQueries from './location'
import measurementQueries from './measurement'
import role_to_userQueries from './role_to_user'
import taxonQueries from './taxon'
import roleQueries from './role'
import userQueries from './user'

export default {
  accession: accessionQueries,
  individual: individualQueries,
  location: locationQueries,
  measurement: measurementQueries,
  role_to_user: role_to_userQueries,
  taxon: taxonQueries,
  role: roleQueries,
  user: userQueries,
}
