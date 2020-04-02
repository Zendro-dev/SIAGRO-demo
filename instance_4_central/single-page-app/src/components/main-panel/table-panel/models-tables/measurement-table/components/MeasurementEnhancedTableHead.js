import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function MeasurementEnhancedTableHead(props) {
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
          key='measurement_id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'measurement_id' ? order : false}
        >
          {/* measurement_id */}
          <TableSortLabel
              active={orderBy === 'measurement_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'measurement_id')}}
          >
            <Typography color="inherit" variant="caption">
              measurement_id
            </Typography>
          </TableSortLabel>
        </TableCell>

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
          key='method'
          align='left'
          padding="default"
          sortDirection={orderBy === 'method' ? order : false}
        >
          {/* method */}
          <TableSortLabel
              active={orderBy === 'method'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'method')}}
          >
            <Typography color="inherit" variant="caption">
              method
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='reference'
          align='left'
          padding="default"
          sortDirection={orderBy === 'reference' ? order : false}
        >
          {/* reference */}
          <TableSortLabel
              active={orderBy === 'reference'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'reference')}}
          >
            <Typography color="inherit" variant="caption">
              reference
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='reference_link'
          align='left'
          padding="default"
          sortDirection={orderBy === 'reference_link' ? order : false}
        >
          {/* reference_link */}
          <TableSortLabel
              active={orderBy === 'reference_link'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'reference_link')}}
          >
            <Typography color="inherit" variant="caption">
              reference_link
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='value'
          align='right'
          padding="default"
          sortDirection={orderBy === 'value' ? order : false}
        >
          {/* value */}
          <TableSortLabel
              active={orderBy === 'value'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'value')}}
          >
            <Typography color="inherit" variant="caption">
              value
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='unit'
          align='left'
          padding="default"
          sortDirection={orderBy === 'unit' ? order : false}
        >
          {/* unit */}
          <TableSortLabel
              active={orderBy === 'unit'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'unit')}}
          >
            <Typography color="inherit" variant="caption">
              unit
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='short_name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'short_name' ? order : false}
        >
          {/* short_name */}
          <TableSortLabel
              active={orderBy === 'short_name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'short_name')}}
          >
            <Typography color="inherit" variant="caption">
              short_name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='comments'
          align='left'
          padding="default"
          sortDirection={orderBy === 'comments' ? order : false}
        >
          {/* comments */}
          <TableSortLabel
              active={orderBy === 'comments'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'comments')}}
          >
            <Typography color="inherit" variant="caption">
              comments
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

        <TableCell
          key='individual_id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'individual_id' ? order : false}
        >
          {/* individual_id */}
          <TableSortLabel
              active={orderBy === 'individual_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'individual_id')}}
          >
            <Typography color="inherit" variant="caption">
              individual_id
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

      </TableRow>
    </TableHead>
  );
}
MeasurementEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};