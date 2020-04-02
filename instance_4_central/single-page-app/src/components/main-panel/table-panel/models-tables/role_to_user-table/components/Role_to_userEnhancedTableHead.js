import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function RoleToUserEnhancedTableHead(props) {
  const { t } = useTranslation();
  const {
    permissions,
    order,
    orderBy,
    onRequestSort
  } = props;

  return (
    <TableHead>
      <TableRow>

        {/* See-info icon */}
        <TableCell padding="checkbox" />

        {/* Actions */}
        {
          /* acl check */
          (permissions&&permissions.role_to_user&&Array.isArray(permissions.role_to_user)
          &&(permissions.role_to_user.includes('update') || permissions.role_to_user.includes('delete') || permissions.role_to_user.includes('*')))
          &&(
            <TableCell 
              padding="checkbox" 
              align='center' 
              size='small' 
              colSpan={
                0 +
                ((permissions.role_to_user.includes('update') || permissions.role_to_user.includes('*')) ? 1 : 0) 
                +
                ((permissions.role_to_user.includes('delete') || permissions.role_to_user.includes('*')) ? 1 : 0)
              }
            >
              <Typography color="inherit" variant="caption">
                { t('modelPanels.actions') }
              </Typography>
            </TableCell>
          )
        }

        {/* 
          Headers 
        */}

        {/* id*/}
        <TableCell
          key='id'
          align='left'
          padding="checkbox"
          sortDirection={orderBy === 'id' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'id'}
            direction={order}
            onClick={(event) => { onRequestSort(event, 'id') }}
          >
            <Typography color="inherit" variant="caption">
              id            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='userId'
          align='right'
          padding="default"
          sortDirection={orderBy === 'userId' ? order : false}
        >
          {/* userId */}
          <TableSortLabel
              active={orderBy === 'userId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'userId')}}
          >
            <Typography color="inherit" variant="caption">
              userId
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='roleId'
          align='right'
          padding="default"
          sortDirection={orderBy === 'roleId' ? order : false}
        >
          {/* roleId */}
          <TableSortLabel
              active={orderBy === 'roleId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'roleId')}}
          >
            <Typography color="inherit" variant="caption">
              roleId
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
RoleToUserEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};