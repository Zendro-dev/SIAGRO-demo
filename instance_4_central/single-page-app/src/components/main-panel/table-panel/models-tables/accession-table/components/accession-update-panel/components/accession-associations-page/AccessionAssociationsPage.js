import React, { useRef, useEffect } from 'react';
import { makeCancelable } from '../../../../../../../../../utils'
import PropTypes from 'prop-types';
import IndividualsTransferLists from './individuals-transfer-lists/IndividualsTransferLists'
import LocationTransferLists from './location-transfer-lists/LocationTransferLists'
import MeasurementsTransferLists from './measurements-transfer-lists/MeasurementsTransferLists'
import TaxonTransferLists from './taxon-transfer-lists/TaxonTransferLists'
import AccessionAssociationsMenuTabs from './AccessionAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const debounceTimeout = 700;

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: 1200,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function AccessionAssociationsPage(props) {
  const classes = useStyles();
  const {
    hidden,
    item,
    individualsIdsToAdd,
    individualsIdsToRemove,
    locationIdsToAdd,
    measurementsIdsToAdd,
    measurementsIdsToRemove,
    taxonIdsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleTransferToRemove,
    handleUntransferFromRemove,
    handleClickOnIndividualRow,
    handleClickOnLocationRow,
    handleClickOnMeasurementRow,
    handleClickOnTaxonRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('individuals');

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isDebouncingAssociationClick = useRef(false);
  const currentAssociationSelected = useRef(associationSelected);
  const lastAssociationSelected = useRef(associationSelected);

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);

  const handleAssociationClick = (event, newValue) => {
    //save last value
    lastAssociationSelected.current = newValue;

    if(!isDebouncingAssociationClick.current){
      //set last value
      currentAssociationSelected.current = newValue;
      setAssociationSelected(newValue);

      //debounce
      isDebouncingAssociationClick.current = true;
      let cancelableTimer = startTimerToDebounceAssociationClick();
      cancelablePromises.current.push(cancelableTimer);
      cancelableTimer
        .promise
        .then(() => {
          //clear flag
          isDebouncingAssociationClick.current = false;
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableTimer), 1);
          //check
          if(lastAssociationSelected.current !== currentAssociationSelected.current){
            setAssociationSelected(lastAssociationSelected.current);
            currentAssociationSelected.current = lastAssociationSelected.current;
          }
        })
        .catch(() => {
          return;
        })
    }
  };
  
  const startTimerToDebounceAssociationClick = () => {
    return makeCancelable( new Promise(resolve => {
      window.setTimeout(function() { 
        resolve(); 
      }, debounceTimeout);
    }));
  };

  return (
    <div hidden={hidden}>
      <Fade in={!hidden} timeout={500}>
        <Grid
          className={classes.root} 
          container 
          justify='center'
          alignItems='flex-start'
          alignContent='flex-start'
          spacing={0}
        > 

          {/* Menu Tabs: Associations */}
          <Grid item xs={12} sm={10} md={9} className={classes.menu}>
            <AccessionAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* Individuals Transfer Lists */}
          {(associationSelected === 'individuals') && (
            <Grid item xs={12} sm={10} md={9}>
              <IndividualsTransferLists
                item={item}
                idsToAdd={individualsIdsToAdd}
                idsToRemove={individualsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnIndividualRow={handleClickOnIndividualRow}
              />
            </Grid>
          )}
          {/* Location Transfer Lists */}
          {(associationSelected === 'location') && (
            <Grid item xs={12} sm={10} md={9}>
              <LocationTransferLists
                item={item}
                idsToAdd={locationIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnLocationRow={handleClickOnLocationRow}
              />
            </Grid>
          )}
          {/* Measurements Transfer Lists */}
          {(associationSelected === 'measurements') && (
            <Grid item xs={12} sm={10} md={9}>
              <MeasurementsTransferLists
                item={item}
                idsToAdd={measurementsIdsToAdd}
                idsToRemove={measurementsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnMeasurementRow={handleClickOnMeasurementRow}
              />
            </Grid>
          )}
          {/* Taxon Transfer Lists */}
          {(associationSelected === 'taxon') && (
            <Grid item xs={12} sm={10} md={9}>
              <TaxonTransferLists
                item={item}
                idsToAdd={taxonIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnTaxonRow={handleClickOnTaxonRow}
              />
            </Grid>
          )}

        </Grid>
      </Fade>
    </div>
  );
}
AccessionAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  individualsIdsToAdd: PropTypes.array.isRequired,
  individualsIdsToRemove: PropTypes.array.isRequired,
  locationIdsToAdd: PropTypes.array.isRequired,
  measurementsIdsToAdd: PropTypes.array.isRequired,
  measurementsIdsToRemove: PropTypes.array.isRequired,
  taxonIdsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleTransferToRemove: PropTypes.func.isRequired,
  handleUntransferFromRemove: PropTypes.func.isRequired,
  handleClickOnIndividualRow: PropTypes.func.isRequired,
  handleClickOnLocationRow: PropTypes.func.isRequired,
  handleClickOnMeasurementRow: PropTypes.func.isRequired,
  handleClickOnTaxonRow: PropTypes.func.isRequired,
};