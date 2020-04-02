import React from 'react';
import PropTypes from 'prop-types';
import AccessionCompactView from './accession-compact-view/AccessionCompactView'
import MeasurementsCompactView from './measurements-compact-view/MeasurementsCompactView'
import IndividualAssociationsMenuTabs from './IndividualAssociationsMenuTabs'
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

export default function IndividualAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnAccessionRow,
    handleClickOnMeasurementRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('accession');

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
          <IndividualAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Accession Compact View */}
        {(associationSelected === 'accession') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <AccessionCompactView
              item={item}
              handleClickOnAccessionRow={handleClickOnAccessionRow}
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

      </Grid>
    </Fade>
  );
}
IndividualAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnAccessionRow: PropTypes.func.isRequired, 
  handleClickOnMeasurementRow: PropTypes.func.isRequired, 
};
