import React from 'react';
import { 
  Switch,
  Route
} from 'react-router-dom'
import PropTypes from 'prop-types';

import AccessionTable from './models-tables/accession-table/AccessionEnhancedTable'
import IndividualTable from './models-tables/individual-table/IndividualEnhancedTable'
import LocationTable from './models-tables/location-table/LocationEnhancedTable'
import MeasurementTable from './models-tables/measurement-table/MeasurementEnhancedTable'
import RoleToUserTable from './models-tables/role_to_user-table/Role_to_userEnhancedTable'
import TaxonTable from './models-tables/taxon-table/TaxonEnhancedTable'
import RoleTable from './admin-tables/role-table/RoleEnhancedTable'
import UserTable from './admin-tables/user-table/UserEnhancedTable'
import NotFoundSection from '../pages/NotFoundSectionPage'
import NoPermissionSectionPage from '../pages/NoPermissionSectionPage'

export default function TablesSwitch(props) {
  const { permissions } = props;

  return (
    
    <Switch>

        {/* Models */}
        <Route exact path="/main/model/accession" 
          render={
            /* acl check */
            (permissions&&permissions.accession&&Array.isArray(permissions.accession)
            &&(permissions.accession.includes('read') || permissions.accession.includes('*')))
            ? ((props) => <AccessionTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/model/individual" 
          render={
            /* acl check */
            (permissions&&permissions.individual&&Array.isArray(permissions.individual)
            &&(permissions.individual.includes('read') || permissions.individual.includes('*')))
            ? ((props) => <IndividualTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/model/location" 
          render={
            /* acl check */
            (permissions&&permissions.location&&Array.isArray(permissions.location)
            &&(permissions.location.includes('read') || permissions.location.includes('*')))
            ? ((props) => <LocationTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/model/measurement" 
          render={
            /* acl check */
            (permissions&&permissions.measurement&&Array.isArray(permissions.measurement)
            &&(permissions.measurement.includes('read') || permissions.measurement.includes('*')))
            ? ((props) => <MeasurementTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/model/role_to_user" 
          render={
            /* acl check */
            (permissions&&permissions.role_to_user&&Array.isArray(permissions.role_to_user)
            &&(permissions.role_to_user.includes('read') || permissions.role_to_user.includes('*')))
            ? ((props) => <RoleToUserTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/model/taxon" 
          render={
            /* acl check */
            (permissions&&permissions.taxon&&Array.isArray(permissions.taxon)
            &&(permissions.taxon.includes('read') || permissions.taxon.includes('*')))
            ? ((props) => <TaxonTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />

        {/* Admin models */}
        <Route exact path="/main/admin/role" 
          render={
            /* acl check */
            (permissions&&permissions.role&&Array.isArray(permissions.role)
            &&(permissions.role.includes('read') || permissions.role.includes('*')))
            ? ((props) => <RoleTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />
        <Route exact path="/main/admin/user" 
          render={
            /* acl check */
            (permissions&&permissions.user&&Array.isArray(permissions.user)
            &&(permissions.user.includes('read') || permissions.user.includes('*')))
            ? ((props) => <UserTable {...props} permissions={permissions}/>) : (NoPermissionSectionPage)
        } />

        {/* Default */}
        <Route path="/main/" component={NotFoundSection} />

    </Switch>
  );
}

TablesSwitch.propTypes = {
  permissions: PropTypes.object,
};
