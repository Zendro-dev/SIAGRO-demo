import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function AccessionEnhancedTableHead(props) {
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
          key='accession_id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'accession_id' ? order : false}
        >
          {/* accession_id */}
          <TableSortLabel
              active={orderBy === 'accession_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'accession_id')}}
          >
            <Typography color="inherit" variant="caption">
              accession_id
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collectors_name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collectors_name' ? order : false}
        >
          {/* collectors_name */}
          <TableSortLabel
              active={orderBy === 'collectors_name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collectors_name')}}
          >
            <Typography color="inherit" variant="caption">
              collectors_name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collectors_initials'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collectors_initials' ? order : false}
        >
          {/* collectors_initials */}
          <TableSortLabel
              active={orderBy === 'collectors_initials'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collectors_initials')}}
          >
            <Typography color="inherit" variant="caption">
              collectors_initials
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='sampling_date'
          align='left'
          padding="default"
          sortDirection={orderBy === 'sampling_date' ? order : false}
        >
          {/* sampling_date */}
          <TableSortLabel
              active={orderBy === 'sampling_date'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'sampling_date')}}
          >
            <Typography color="inherit" variant="caption">
              sampling_date
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='sampling_number'
          align='left'
          padding="default"
          sortDirection={orderBy === 'sampling_number' ? order : false}
        >
          {/* sampling_number */}
          <TableSortLabel
              active={orderBy === 'sampling_number'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'sampling_number')}}
          >
            <Typography color="inherit" variant="caption">
              sampling_number
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='catalog_number'
          align='left'
          padding="default"
          sortDirection={orderBy === 'catalog_number' ? order : false}
        >
          {/* catalog_number */}
          <TableSortLabel
              active={orderBy === 'catalog_number'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'catalog_number')}}
          >
            <Typography color="inherit" variant="caption">
              catalog_number
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='institution_deposited'
          align='left'
          padding="default"
          sortDirection={orderBy === 'institution_deposited' ? order : false}
        >
          {/* institution_deposited */}
          <TableSortLabel
              active={orderBy === 'institution_deposited'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'institution_deposited')}}
          >
            <Typography color="inherit" variant="caption">
              institution_deposited
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collection_name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collection_name' ? order : false}
        >
          {/* collection_name */}
          <TableSortLabel
              active={orderBy === 'collection_name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collection_name')}}
          >
            <Typography color="inherit" variant="caption">
              collection_name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collection_acronym'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collection_acronym' ? order : false}
        >
          {/* collection_acronym */}
          <TableSortLabel
              active={orderBy === 'collection_acronym'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collection_acronym')}}
          >
            <Typography color="inherit" variant="caption">
              collection_acronym
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='identified_by'
          align='left'
          padding="default"
          sortDirection={orderBy === 'identified_by' ? order : false}
        >
          {/* identified_by */}
          <TableSortLabel
              active={orderBy === 'identified_by'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'identified_by')}}
          >
            <Typography color="inherit" variant="caption">
              identified_by
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='identification_date'
          align='left'
          padding="default"
          sortDirection={orderBy === 'identification_date' ? order : false}
        >
          {/* identification_date */}
          <TableSortLabel
              active={orderBy === 'identification_date'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'identification_date')}}
          >
            <Typography color="inherit" variant="caption">
              identification_date
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='abundance'
          align='left'
          padding="default"
          sortDirection={orderBy === 'abundance' ? order : false}
        >
          {/* abundance */}
          <TableSortLabel
              active={orderBy === 'abundance'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'abundance')}}
          >
            <Typography color="inherit" variant="caption">
              abundance
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='habitat'
          align='left'
          padding="default"
          sortDirection={orderBy === 'habitat' ? order : false}
        >
          {/* habitat */}
          <TableSortLabel
              active={orderBy === 'habitat'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'habitat')}}
          >
            <Typography color="inherit" variant="caption">
              habitat
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='observations'
          align='left'
          padding="default"
          sortDirection={orderBy === 'observations' ? order : false}
        >
          {/* observations */}
          <TableSortLabel
              active={orderBy === 'observations'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'observations')}}
          >
            <Typography color="inherit" variant="caption">
              observations
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='family'
          align='left'
          padding="default"
          sortDirection={orderBy === 'family' ? order : false}
        >
          {/* family */}
          <TableSortLabel
              active={orderBy === 'family'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'family')}}
          >
            <Typography color="inherit" variant="caption">
              family
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='genus'
          align='left'
          padding="default"
          sortDirection={orderBy === 'genus' ? order : false}
        >
          {/* genus */}
          <TableSortLabel
              active={orderBy === 'genus'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'genus')}}
          >
            <Typography color="inherit" variant="caption">
              genus
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='species'
          align='left'
          padding="default"
          sortDirection={orderBy === 'species' ? order : false}
        >
          {/* species */}
          <TableSortLabel
              active={orderBy === 'species'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'species')}}
          >
            <Typography color="inherit" variant="caption">
              species
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='subspecies'
          align='left'
          padding="default"
          sortDirection={orderBy === 'subspecies' ? order : false}
        >
          {/* subspecies */}
          <TableSortLabel
              active={orderBy === 'subspecies'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'subspecies')}}
          >
            <Typography color="inherit" variant="caption">
              subspecies
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='variety'
          align='left'
          padding="default"
          sortDirection={orderBy === 'variety' ? order : false}
        >
          {/* variety */}
          <TableSortLabel
              active={orderBy === 'variety'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'variety')}}
          >
            <Typography color="inherit" variant="caption">
              variety
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='race'
          align='left'
          padding="default"
          sortDirection={orderBy === 'race' ? order : false}
        >
          {/* race */}
          <TableSortLabel
              active={orderBy === 'race'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'race')}}
          >
            <Typography color="inherit" variant="caption">
              race
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='form'
          align='left'
          padding="default"
          sortDirection={orderBy === 'form' ? order : false}
        >
          {/* form */}
          <TableSortLabel
              active={orderBy === 'form'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'form')}}
          >
            <Typography color="inherit" variant="caption">
              form
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='taxon_id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'taxon_id' ? order : false}
        >
          {/* taxon_id */}
          <TableSortLabel
              active={orderBy === 'taxon_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'taxon_id')}}
          >
            <Typography color="inherit" variant="caption">
              taxon_id
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collection_deposit'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collection_deposit' ? order : false}
        >
          {/* collection_deposit */}
          <TableSortLabel
              active={orderBy === 'collection_deposit'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collection_deposit')}}
          >
            <Typography color="inherit" variant="caption">
              collection_deposit
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collect_number'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collect_number' ? order : false}
        >
          {/* collect_number */}
          <TableSortLabel
              active={orderBy === 'collect_number'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collect_number')}}
          >
            <Typography color="inherit" variant="caption">
              collect_number
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collect_source'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collect_source' ? order : false}
        >
          {/* collect_source */}
          <TableSortLabel
              active={orderBy === 'collect_source'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collect_source')}}
          >
            <Typography color="inherit" variant="caption">
              collect_source
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collected_seeds'
          align='right'
          padding="default"
          sortDirection={orderBy === 'collected_seeds' ? order : false}
        >
          {/* collected_seeds */}
          <TableSortLabel
              active={orderBy === 'collected_seeds'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collected_seeds')}}
          >
            <Typography color="inherit" variant="caption">
              collected_seeds
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collected_plants'
          align='right'
          padding="default"
          sortDirection={orderBy === 'collected_plants' ? order : false}
        >
          {/* collected_plants */}
          <TableSortLabel
              active={orderBy === 'collected_plants'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collected_plants')}}
          >
            <Typography color="inherit" variant="caption">
              collected_plants
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='collected_other'
          align='left'
          padding="default"
          sortDirection={orderBy === 'collected_other' ? order : false}
        >
          {/* collected_other */}
          <TableSortLabel
              active={orderBy === 'collected_other'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'collected_other')}}
          >
            <Typography color="inherit" variant="caption">
              collected_other
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='habit'
          align='left'
          padding="default"
          sortDirection={orderBy === 'habit' ? order : false}
        >
          {/* habit */}
          <TableSortLabel
              active={orderBy === 'habit'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'habit')}}
          >
            <Typography color="inherit" variant="caption">
              habit
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='local_name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'local_name' ? order : false}
        >
          {/* local_name */}
          <TableSortLabel
              active={orderBy === 'local_name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'local_name')}}
          >
            <Typography color="inherit" variant="caption">
              local_name
            </Typography>
          </TableSortLabel>
        </TableCell>

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

      </TableRow>
    </TableHead>
  );
}
AccessionEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};