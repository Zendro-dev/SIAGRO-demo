import React, { useRef, useEffect } from 'react';
import { makeCancelable } from '../../../../../../../../../utils'
import PropTypes from 'prop-types';
import AccessionTransferLists from './accession-transfer-lists/AccessionTransferLists'
import IndividualTransferLists from './individual-transfer-lists/IndividualTransferLists'
import MeasurementAssociationsMenuTabs from './MeasurementAssociationsMenuTabs'
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

export default function MeasurementAssociationsPage(props) {
  const classes = useStyles();
  const {
    hidden,
    item,
    accessionIdsToAdd,
    individualIdsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleClickOnAccessionRow,
    handleClickOnIndividualRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('accession');

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
            <MeasurementAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* Accession Transfer Lists */}
          {(associationSelected === 'accession') && (
            <Grid item xs={12} sm={10} md={9}>
              <AccessionTransferLists
                item={item}
                idsToAdd={accessionIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnAccessionRow={handleClickOnAccessionRow}
              />
            </Grid>
          )}
          {/* Individual Transfer Lists */}
          {(associationSelected === 'individual') && (
            <Grid item xs={12} sm={10} md={9}>
              <IndividualTransferLists
                item={item}
                idsToAdd={individualIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnIndividualRow={handleClickOnIndividualRow}
              />
            </Grid>
          )}

        </Grid>
      </Fade>
    </div>
  );
}
MeasurementAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  accessionIdsToAdd: PropTypes.array.isRequired,
  individualIdsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleClickOnAccessionRow: PropTypes.func.isRequired,
  handleClickOnIndividualRow: PropTypes.func.isRequired,
};