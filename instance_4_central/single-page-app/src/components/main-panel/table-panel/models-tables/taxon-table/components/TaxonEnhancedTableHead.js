import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

export default function TaxonEnhancedTableHead(props) {
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
          (permissions&&permissions.taxon&&Array.isArray(permissions.taxon)
          &&(permissions.taxon.includes('update') || permissions.taxon.includes('delete') || permissions.taxon.includes('*')))
          &&(
            <TableCell 
              padding="checkbox" 
              align='center' 
              size='small' 
              colSpan={
                0 +
                ((permissions.taxon.includes('update') || permissions.taxon.includes('*')) ? 1 : 0) 
                +
                ((permissions.taxon.includes('delete') || permissions.taxon.includes('*')) ? 1 : 0)
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


        <TableCell
          key='id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'id' ? order : false}
        >
          {/* id */}
          <TableSortLabel
              active={orderBy === 'id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'id')}}
          >
            <Typography color="inherit" variant="caption">
              id
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='taxon'
          align='left'
          padding="default"
          sortDirection={orderBy === 'taxon' ? order : false}
        >
          {/* taxon */}
          <TableSortLabel
              active={orderBy === 'taxon'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'taxon')}}
          >
            <Typography color="inherit" variant="caption">
              taxon
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='categoria'
          align='left'
          padding="default"
          sortDirection={orderBy === 'categoria' ? order : false}
        >
          {/* categoria */}
          <TableSortLabel
              active={orderBy === 'categoria'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'categoria')}}
          >
            <Typography color="inherit" variant="caption">
              categoria
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='estatus'
          align='left'
          padding="default"
          sortDirection={orderBy === 'estatus' ? order : false}
        >
          {/* estatus */}
          <TableSortLabel
              active={orderBy === 'estatus'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'estatus')}}
          >
            <Typography color="inherit" variant="caption">
              estatus
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='nombreAutoridad'
          align='left'
          padding="default"
          sortDirection={orderBy === 'nombreAutoridad' ? order : false}
        >
          {/* nombreAutoridad */}
          <TableSortLabel
              active={orderBy === 'nombreAutoridad'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'nombreAutoridad')}}
          >
            <Typography color="inherit" variant="caption">
              nombreAutoridad
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='citaNomenclatural'
          align='left'
          padding="default"
          sortDirection={orderBy === 'citaNomenclatural' ? order : false}
        >
          {/* citaNomenclatural */}
          <TableSortLabel
              active={orderBy === 'citaNomenclatural'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'citaNomenclatural')}}
          >
            <Typography color="inherit" variant="caption">
              citaNomenclatural
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='fuente'
          align='left'
          padding="default"
          sortDirection={orderBy === 'fuente' ? order : false}
        >
          {/* fuente */}
          <TableSortLabel
              active={orderBy === 'fuente'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'fuente')}}
          >
            <Typography color="inherit" variant="caption">
              fuente
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='ambiente'
          align='left'
          padding="default"
          sortDirection={orderBy === 'ambiente' ? order : false}
        >
          {/* ambiente */}
          <TableSortLabel
              active={orderBy === 'ambiente'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'ambiente')}}
          >
            <Typography color="inherit" variant="caption">
              ambiente
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='grupoSNIB'
          align='left'
          padding="default"
          sortDirection={orderBy === 'grupoSNIB' ? order : false}
        >
          {/* grupoSNIB */}
          <TableSortLabel
              active={orderBy === 'grupoSNIB'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'grupoSNIB')}}
          >
            <Typography color="inherit" variant="caption">
              grupoSNIB
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='categoriaResidencia'
          align='left'
          padding="default"
          sortDirection={orderBy === 'categoriaResidencia' ? order : false}
        >
          {/* categoriaResidencia */}
          <TableSortLabel
              active={orderBy === 'categoriaResidencia'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'categoriaResidencia')}}
          >
            <Typography color="inherit" variant="caption">
              categoriaResidencia
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='nom'
          align='left'
          padding="default"
          sortDirection={orderBy === 'nom' ? order : false}
        >
          {/* nom */}
          <TableSortLabel
              active={orderBy === 'nom'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'nom')}}
          >
            <Typography color="inherit" variant="caption">
              nom
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='cites'
          align='left'
          padding="default"
          sortDirection={orderBy === 'cites' ? order : false}
        >
          {/* cites */}
          <TableSortLabel
              active={orderBy === 'cites'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'cites')}}
          >
            <Typography color="inherit" variant="caption">
              cites
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='iucn'
          align='left'
          padding="default"
          sortDirection={orderBy === 'iucn' ? order : false}
        >
          {/* iucn */}
          <TableSortLabel
              active={orderBy === 'iucn'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'iucn')}}
          >
            <Typography color="inherit" variant="caption">
              iucn
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='prioritarias'
          align='left'
          padding="default"
          sortDirection={orderBy === 'prioritarias' ? order : false}
        >
          {/* prioritarias */}
          <TableSortLabel
              active={orderBy === 'prioritarias'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'prioritarias')}}
          >
            <Typography color="inherit" variant="caption">
              prioritarias
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='endemismo'
          align='left'
          padding="default"
          sortDirection={orderBy === 'endemismo' ? order : false}
        >
          {/* endemismo */}
          <TableSortLabel
              active={orderBy === 'endemismo'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'endemismo')}}
          >
            <Typography color="inherit" variant="caption">
              endemismo
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
TaxonEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};