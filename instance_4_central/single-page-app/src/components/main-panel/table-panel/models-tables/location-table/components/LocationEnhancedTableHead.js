import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function LocationEnhancedTableHead(props) {
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
          key='locationId'
          align='left'
          padding="default"
          sortDirection={orderBy === 'locationId' ? order : false}
        >
          {/* locationId */}
          <TableSortLabel
              active={orderBy === 'locationId'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'locationId')}}
          >
            <Typography color="inherit" variant="caption">
              locationId
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='country'
          align='left'
          padding="default"
          sortDirection={orderBy === 'country' ? order : false}
        >
          {/* country */}
          <TableSortLabel
              active={orderBy === 'country'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'country')}}
          >
            <Typography color="inherit" variant="caption">
              country
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='state'
          align='left'
          padding="default"
          sortDirection={orderBy === 'state' ? order : false}
        >
          {/* state */}
          <TableSortLabel
              active={orderBy === 'state'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'state')}}
          >
            <Typography color="inherit" variant="caption">
              state
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='municipality'
          align='left'
          padding="default"
          sortDirection={orderBy === 'municipality' ? order : false}
        >
          {/* municipality */}
          <TableSortLabel
              active={orderBy === 'municipality'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'municipality')}}
          >
            <Typography color="inherit" variant="caption">
              municipality
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='locality'
          align='left'
          padding="default"
          sortDirection={orderBy === 'locality' ? order : false}
        >
          {/* locality */}
          <TableSortLabel
              active={orderBy === 'locality'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'locality')}}
          >
            <Typography color="inherit" variant="caption">
              locality
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='latitude'
          align='right'
          padding="default"
          sortDirection={orderBy === 'latitude' ? order : false}
        >
          {/* latitude */}
          <TableSortLabel
              active={orderBy === 'latitude'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'latitude')}}
          >
            <Typography color="inherit" variant="caption">
              latitude
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='longitude'
          align='right'
          padding="default"
          sortDirection={orderBy === 'longitude' ? order : false}
        >
          {/* longitude */}
          <TableSortLabel
              active={orderBy === 'longitude'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'longitude')}}
          >
            <Typography color="inherit" variant="caption">
              longitude
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='altitude'
          align='right'
          padding="default"
          sortDirection={orderBy === 'altitude' ? order : false}
        >
          {/* altitude */}
          <TableSortLabel
              active={orderBy === 'altitude'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'altitude')}}
          >
            <Typography color="inherit" variant="caption">
              altitude
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='natural_area'
          align='left'
          padding="default"
          sortDirection={orderBy === 'natural_area' ? order : false}
        >
          {/* natural_area */}
          <TableSortLabel
              active={orderBy === 'natural_area'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'natural_area')}}
          >
            <Typography color="inherit" variant="caption">
              natural_area
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='natural_area_name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'natural_area_name' ? order : false}
        >
          {/* natural_area_name */}
          <TableSortLabel
              active={orderBy === 'natural_area_name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'natural_area_name')}}
          >
            <Typography color="inherit" variant="caption">
              natural_area_name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='georeference_method'
          align='left'
          padding="default"
          sortDirection={orderBy === 'georeference_method' ? order : false}
        >
          {/* georeference_method */}
          <TableSortLabel
              active={orderBy === 'georeference_method'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'georeference_method')}}
          >
            <Typography color="inherit" variant="caption">
              georeference_method
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='georeference_source'
          align='left'
          padding="default"
          sortDirection={orderBy === 'georeference_source' ? order : false}
        >
          {/* georeference_source */}
          <TableSortLabel
              active={orderBy === 'georeference_source'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'georeference_source')}}
          >
            <Typography color="inherit" variant="caption">
              georeference_source
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='datum'
          align='left'
          padding="default"
          sortDirection={orderBy === 'datum' ? order : false}
        >
          {/* datum */}
          <TableSortLabel
              active={orderBy === 'datum'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'datum')}}
          >
            <Typography color="inherit" variant="caption">
              datum
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='vegetation'
          align='left'
          padding="default"
          sortDirection={orderBy === 'vegetation' ? order : false}
        >
          {/* vegetation */}
          <TableSortLabel
              active={orderBy === 'vegetation'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'vegetation')}}
          >
            <Typography color="inherit" variant="caption">
              vegetation
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='stoniness'
          align='left'
          padding="default"
          sortDirection={orderBy === 'stoniness' ? order : false}
        >
          {/* stoniness */}
          <TableSortLabel
              active={orderBy === 'stoniness'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'stoniness')}}
          >
            <Typography color="inherit" variant="caption">
              stoniness
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='sewer'
          align='left'
          padding="default"
          sortDirection={orderBy === 'sewer' ? order : false}
        >
          {/* sewer */}
          <TableSortLabel
              active={orderBy === 'sewer'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'sewer')}}
          >
            <Typography color="inherit" variant="caption">
              sewer
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='topography'
          align='left'
          padding="default"
          sortDirection={orderBy === 'topography' ? order : false}
        >
          {/* topography */}
          <TableSortLabel
              active={orderBy === 'topography'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'topography')}}
          >
            <Typography color="inherit" variant="caption">
              topography
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='slope'
          align='right'
          padding="default"
          sortDirection={orderBy === 'slope' ? order : false}
        >
          {/* slope */}
          <TableSortLabel
              active={orderBy === 'slope'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'slope')}}
          >
            <Typography color="inherit" variant="caption">
              slope
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
LocationEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};