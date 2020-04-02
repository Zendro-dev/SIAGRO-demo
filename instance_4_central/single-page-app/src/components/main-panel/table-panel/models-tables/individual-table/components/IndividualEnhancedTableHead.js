import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function IndividualEnhancedTableHead(props) {
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

        {/* 
          Headers 
        */}


        <TableCell
          key='name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'name' ? order : false}
        >
          {/* name */}
          <TableSortLabel
              active={orderBy === 'name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'name')}}
          >
            <Typography color="inherit" variant="caption">
              name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='origin'
          align='left'
          padding="default"
          sortDirection={orderBy === 'origin' ? order : false}
        >
          {/* origin */}
          <TableSortLabel
              active={orderBy === 'origin'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'origin')}}
          >
            <Typography color="inherit" variant="caption">
              origin
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='description'
          align='left'
          padding="default"
          sortDirection={orderBy === 'description' ? order : false}
        >
          {/* description */}
          <TableSortLabel
              active={orderBy === 'description'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'description')}}
          >
            <Typography color="inherit" variant="caption">
              description
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='accessionId'
          align='left'
          padding="default"
          sortDirection={orderBy === 'accessionId' ? order : false}
        >
          {/* accessionId */}
          <TableSortLabel
              active={orderBy === 'accessionId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'accessionId')}}
          >
            <Typography color="inherit" variant="caption">
              accessionId
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='genotypeId'
          align='right'
          padding="default"
          sortDirection={orderBy === 'genotypeId' ? order : false}
        >
          {/* genotypeId */}
          <TableSortLabel
              active={orderBy === 'genotypeId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'genotypeId')}}
          >
            <Typography color="inherit" variant="caption">
              genotypeId
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='field_unit_id'
          align='right'
          padding="default"
          sortDirection={orderBy === 'field_unit_id' ? order : false}
        >
          {/* field_unit_id */}
          <TableSortLabel
              active={orderBy === 'field_unit_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'field_unit_id')}}
          >
            <Typography color="inherit" variant="caption">
              field_unit_id
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
IndividualEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};