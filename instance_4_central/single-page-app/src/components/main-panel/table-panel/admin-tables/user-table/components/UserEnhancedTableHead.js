import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function UserEnhancedTableHead(props) {
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
          (permissions&&permissions.user&&Array.isArray(permissions.user)
          &&(permissions.user.includes('update') || permissions.user.includes('delete') || permissions.user.includes('*')))
          &&(
            <TableCell 
              padding="checkbox" 
              align='center' 
              size='small' 
              colSpan={
                0 +
                ((permissions.user.includes('update') || permissions.user.includes('*')) ? 1 : 0) 
                +
                ((permissions.user.includes('delete') || permissions.user.includes('*')) ? 1 : 0)
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
          key='email'
          align='left'
          padding="default"
          sortDirection={orderBy === 'email' ? order : false}
        >
          {/* email */}
          <TableSortLabel
              active={orderBy === 'email'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'email')}}
          >
            <Typography color="inherit" variant="caption">
              email
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='password'
          align='left'
          padding="default"
          sortDirection={orderBy === 'password' ? order : false}
        >
          {/* password */}
          <TableSortLabel
              active={orderBy === 'password'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'password')}}
          >
            <Typography color="inherit" variant="caption">
              password
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
UserEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};