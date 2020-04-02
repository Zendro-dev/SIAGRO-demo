import React from 'react';
import PropTypes from 'prop-types';
import IndividualsCompactView from './individuals-compact-view/IndividualsCompactView'
import LocationCompactView from './location-compact-view/LocationCompactView'
import MeasurementsCompactView from './measurements-compact-view/MeasurementsCompactView'
import TaxonCompactView from './taxon-compact-view/TaxonCompactView'
import AccessionAssociationsMenuTabs from './AccessionAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: `calc(57vh + 84px)`,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function AccessionAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnIndividualRow,
    handleClickOnLocationRow,
    handleClickOnMeasurementRow,
    handleClickOnTaxonRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('individuals');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <AccessionAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Individuals Compact View */}
        {(associationSelected === 'individuals') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <IndividualsCompactView
              item={item}
              handleClickOnIndividualRow={handleClickOnIndividualRow}
            />
          </Grid>
        )}
        {/* Location Compact View */}
        {(associationSelected === 'location') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <LocationCompactView
              item={item}
              handleClickOnLocationRow={handleClickOnLocationRow}
            />
          </Grid>
        )}
        {/* Measurements Compact View */}
        {(associationSelected === 'measurements') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <MeasurementsCompactView
              item={item}
              handleClickOnMeasurementRow={handleClickOnMeasurementRow}
            />
          </Grid>
        )}
        {/* Taxon Compact View */}
        {(associationSelected === 'taxon') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <TaxonCompactView
              item={item}
              handleClickOnTaxonRow={handleClickOnTaxonRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
AccessionAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnIndividualRow: PropTypes.func.isRequired, 
  handleClickOnLocationRow: PropTypes.func.isRequired, 
  handleClickOnMeasurementRow: PropTypes.func.isRequired, 
  handleClickOnTaxonRow: PropTypes.func.isRequired, 
};
