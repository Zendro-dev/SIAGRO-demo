import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import AccessionAttributesPage from './components/accession-attributes-page/AccessionAttributesPage'
import AccessionAssociationsPage from './components/accession-associations-page/AccessionAssociationsPage'
import AccessionTabsA from './components/AccessionTabsA'
import AccessionConfirmationDialog from './components/AccessionConfirmationDialog'
import IndividualDetailPanel from '../../../individual-table/components/individual-detail-panel/IndividualDetailPanel'
import LocationDetailPanel from '../../../location-table/components/location-detail-panel/LocationDetailPanel'
import MeasurementDetailPanel from '../../../measurement-table/components/measurement-detail-panel/MeasurementDetailPanel'
import TaxonDetailPanel from '../../../taxon-table/components/taxon-detail-panel/TaxonDetailPanel'
import api from '../../../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../../../utils'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import SaveIcon from '@material-ui/icons/Save';

const debounceTimeout = 700;

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 450,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  tabsA: {
    backgroundColor: "#ffffff",
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: -26+3,
    right: 10,
    margin: '0 auto',
  },
  notiErrorActionText: {
    color: '#eba0a0',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccessionCreatePanel(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    permissions,
    handleClose,
  } = props;

  const [open, setOpen] = useState(true);
  const [tabsValue, setTabsValue] = useState(0);
  const [valueOkStates, setValueOkStates] = useState(getInitialValueOkStates());
  const [foreignKeys, setForeignKeys] = useState({});

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationAcceptText, setConfirmationAcceptText] = useState('');
  const [confirmationRejectText, setConfirmationRejectText] = useState('');

  const handleAccept = useRef(undefined);
  const handleReject = useRef(undefined);

  const values = useRef(getInitialValues());
  const valuesOkRefs = useRef(getInitialValueOkStates());

  const [individualsIdsToAddState, setIndividualsIdsToAddState] = useState([]);
  const individualsIdsToAdd = useRef([]);
  const [locationIdsToAddState, setLocationIdsToAddState] = useState([]);
  const locationIdsToAdd = useRef([]);
  const [measurementsIdsToAddState, setMeasurementsIdsToAddState] = useState([]);
  const measurementsIdsToAdd = useRef([]);
  const [taxonIdsToAddState, setTaxonIdsToAddState] = useState([]);
  const taxonIdsToAdd = useRef([]);

  const [individualDetailDialogOpen, setIndividualDetailDialogOpen] = useState(false);
  const [individualDetailItem, setIndividualDetailItem] = useState(undefined);
  const [locationDetailDialogOpen, setLocationDetailDialogOpen] = useState(false);
  const [locationDetailItem, setLocationDetailItem] = useState(undefined);
  const [measurementDetailDialogOpen, setMeasurementDetailDialogOpen] = useState(false);
  const [measurementDetailItem, setMeasurementDetailItem] = useState(undefined);
  const [taxonDetailDialogOpen, setTaxonDetailDialogOpen] = useState(false);
  const [taxonDetailItem, setTaxonDetailItem] = useState(undefined);

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isSaving = useRef(false);
  const isCanceling = useRef(false);
  const isClosing = useRef(false);
  const isDebouncingTabsChange = useRef(false);
  const currentTabValue = useRef(tabsValue);
  const lastTabValue = useRef(tabsValue);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl);

  const actionText = useRef(null);
  const action = (key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  );

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);
  
  useEffect(() => {
    if (individualDetailItem !== undefined) {
      setIndividualDetailDialogOpen(true);
    }
  }, [individualDetailItem]);

  useEffect(() => {
    if (locationDetailItem !== undefined) {
      setLocationDetailDialogOpen(true);
    }
  }, [locationDetailItem]);

  useEffect(() => {
    if (measurementDetailItem !== undefined) {
      setMeasurementDetailDialogOpen(true);
    }
  }, [measurementDetailItem]);

  useEffect(() => {
    if (taxonDetailItem !== undefined) {
      setTaxonDetailDialogOpen(true);
    }
  }, [taxonDetailItem]);


  function getInitialValues() {
    let initialValues = {};
    
    initialValues.accession_id = null;
    initialValues.collectors_name = null;
    initialValues.collectors_initials = null;
    initialValues.sampling_date = null;
    initialValues.sampling_number = null;
    initialValues.catalog_number = null;
    initialValues.institution_deposited = null;
    initialValues.collection_name = null;
    initialValues.collection_acronym = null;
    initialValues.identified_by = null;
    initialValues.identification_date = null;
    initialValues.abundance = null;
    initialValues.habitat = null;
    initialValues.observations = null;
    initialValues.family = null;
    initialValues.genus = null;
    initialValues.species = null;
    initialValues.subspecies = null;
    initialValues.variety = null;
    initialValues.race = null;
    initialValues.form = null;
    initialValues.taxon_id = null;
    initialValues.collection_deposit = null;
    initialValues.collect_number = null;
    initialValues.collect_source = null;
    initialValues.collected_seeds = null;
    initialValues.collected_plants = null;
    initialValues.collected_other = null;
    initialValues.habit = null;
    initialValues.local_name = null;
    initialValues.locationId = null;

    return initialValues;
  }

  function getInitialValueOkStates() {
    /*
      status codes:
        1: acceptable
        0: unknown/not tested yet (this is set on initial render)/empty
       -1: not acceptable
       -2: foreing key
    */
    let initialValueOkStates = {};

    initialValueOkStates.accession_id = 0;
    initialValueOkStates.collectors_name = 0;
    initialValueOkStates.collectors_initials = 0;
    initialValueOkStates.sampling_date = 0;
    initialValueOkStates.sampling_number = 0;
    initialValueOkStates.catalog_number = 0;
    initialValueOkStates.institution_deposited = 0;
    initialValueOkStates.collection_name = 0;
    initialValueOkStates.collection_acronym = 0;
    initialValueOkStates.identified_by = 0;
    initialValueOkStates.identification_date = 0;
    initialValueOkStates.abundance = 0;
    initialValueOkStates.habitat = 0;
    initialValueOkStates.observations = 0;
    initialValueOkStates.family = 0;
    initialValueOkStates.genus = 0;
    initialValueOkStates.species = 0;
    initialValueOkStates.subspecies = 0;
    initialValueOkStates.variety = 0;
    initialValueOkStates.race = 0;
    initialValueOkStates.form = 0;
    initialValueOkStates.taxon_id = -2; //FK
    initialValueOkStates.collection_deposit = 0;
    initialValueOkStates.collect_number = 0;
    initialValueOkStates.collect_source = 0;
    initialValueOkStates.collected_seeds = 0;
    initialValueOkStates.collected_plants = 0;
    initialValueOkStates.collected_other = 0;
    initialValueOkStates.habit = 0;
    initialValueOkStates.local_name = 0;
    initialValueOkStates.locationId = -2; //FK

    return initialValueOkStates;
  }

  function areThereAcceptableFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 1) {
        return true;
      }
    }
    return false;
  }

  function areThereNotAcceptableFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === -1) {
        return true;
      }
    }
    return false;
  }

  function areThereIncompleteFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 0) {
        return true;
      }
    }
    return false;
  }

  function setAddLocation(variables) {
    if(locationIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addLocation = locationIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }
  function setAddTaxon(variables) {
    if(taxonIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addTaxon = taxonIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }

  function doSave(event) {
    /*
      Variables setup
    */
    //variables
    let keys = Object.keys(values.current);
    let variables = {};

    //attributes
    for(let i=0; i<keys.length; i++) {
      if(valuesOkRefs.current[keys[i]] !== -1) {
        variables[keys[i]] = values.current[keys[i]];
      }
    }

    //delete: fk's
    delete variables.taxon_id;
    delete variables.locationId;

    //add: to_one's
    setAddLocation(variables);
    setAddTaxon(variables);
    
    //add: to_many's
    variables.addIndividuals = individualsIdsToAdd.current;
    variables.addMeasurements = measurementsIdsToAdd.current;

    /*
      API Request: createItem
    */
    let cancelableApiReq = makeCancelable(api.accession.createItem(graphqlServerUrl, variables));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check response
        if (
          response.data &&
          response.data.data
        ) {
          //notify graphql errors
          if(response.data.errors) {
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action,
            });
            console.log("Errors: ", response.data.errors);
          } else {

            //ok
            enqueueSnackbar( t('modelPanels.messages.msg6', "Record created successfully."), {
              variant: 'success',
              preventDuplicate: false,
              persist: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            });
            onClose(event, true, response.data.data.addAccession);
          }
          return;

        } else { //error: bad response on createItem()
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action,
          });
          console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
          
          //reset contention flags
          isSaving.current = false;
          isClosing.current = false;
          return;
        }
      })
      .catch(({isCanceled, ...err}) => { //error: on createItem()
        if(isCanceled) {
          return;
        } else {
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action,
          });
          console.log("Error: ", err);

          //reset contention flags
          isSaving.current = false;
          isClosing.current = false;
          return;
        }
      });
  }

  const handleTabsChange = (event, newValue) => {
    //save last value
    lastTabValue.current = newValue;
    
    if(!isDebouncingTabsChange.current){
      //set last value
      currentTabValue.current = newValue;
      setTabsValue(newValue);

      //debounce
      isDebouncingTabsChange.current = true;
      let cancelableTimer = startTimerToDebounceTabsChange();
      cancelablePromises.current.push(cancelableTimer);
      cancelableTimer
        .promise
        .then(() => {
          //clear flag
          isDebouncingTabsChange.current = false;
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableTimer), 1);
          //check
          if(lastTabValue.current !== currentTabValue.current){
            setTabsValue(lastTabValue.current);
            currentTabValue.current = lastTabValue.current;
          }
        })
        .catch(() => {
          return;
        })
    }
  };

  const handleSetValue = (value, status, key) => {
    values.current[key] = value;
    if(status !== valuesOkRefs.current[key]) {
      valuesOkRefs.current[key] = status;
      setValueOkStates({...valuesOkRefs.current});
    }
  }

  const handleSave = (event) => {
    if(areThereNotAcceptableFields()) {
      setConfirmationTitle( t('modelPanels.invalidFields', "Some fields are not valid") );
      setConfirmationText( t('modelPanels.invalidFieldsB', "To continue, please correct these fields.") );
      setConfirmationAcceptText("");
      setConfirmationRejectText( t('modelPanels.updateAccept', "I UNDERSTAND"));
      handleAccept.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      handleReject.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      setConfirmationOpen(true);
      return;
    }

    if(areThereIncompleteFields()) {
      setConfirmationTitle( t('modelPanels.incompleteFields', "Some fields are empty") );
      setConfirmationText( t('modelPanels.incompleteFieldsB', "Do you want to continue anyway?") );
      setConfirmationAcceptText( t('modelPanels.saveIncompleteAccept', "YES, SAVE") );
      setConfirmationRejectText( t('modelPanels.saveIncompleteReject', "DON'T SAVE YET") );
      handleAccept.current = () => {
        if(!isClosing.current) {
          isClosing.current = true;
          doSave(event);
          setConfirmationOpen(false);
        }
      }
      handleReject.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      setConfirmationOpen(true);
    } else {
      doSave(event);
    }
  }

  const handleCancel = (event) => {
    if(areThereAcceptableFields()) {
      setConfirmationTitle( t('modelPanels.cancelChanges', "The edited information has not been saved") );
      setConfirmationText( t('modelPanels.cancelChangesB', "Some fields have been edited, if you continue without save, the changes will be lost, you want to continue?") );
      setConfirmationAcceptText( t('modelPanels.cancelChangesAccept', "YES, EXIT") );
      setConfirmationRejectText( t('modelPanels.cancelChangesReject', "STAY") );
      handleAccept.current = () => {
        if(!isClosing.current) {
          isClosing.current = true;
          setConfirmationOpen(false);
          onClose(event, false, null);
        }
      }
      handleReject.current = () => {
        isCanceling.current = false;
        setConfirmationOpen(false);
      }
        setConfirmationOpen(true);
        return;
    } else {
      onClose(event, false, null);
    }
  }

  const onClose = (event, status, newItem) => {
    setOpen(false);
    handleClose(event, status, newItem);
  }

  const handleConfirmationAccept = (event) => {
    handleAccept.current();
  }

  const handleConfirmationReject = (event) => {
    handleReject.current();
  }
  
  const handleTransferToAdd = (associationKey, itemId) => {
    switch(associationKey) {
      case 'individuals':
        if(individualsIdsToAdd.current.indexOf(itemId) === -1) {
          individualsIdsToAdd.current.push(itemId);
          setIndividualsIdsToAddState(individualsIdsToAdd.current);
        }
        break;
      case 'location':
        if(locationIdsToAdd.current.indexOf(itemId) === -1) {
          locationIdsToAdd.current = [];
          locationIdsToAdd.current.push(itemId);
          setLocationIdsToAddState(locationIdsToAdd.current);
          handleSetValue(itemId, 1, 'locationId');
          setForeignKeys({...foreignKeys, locationId: itemId});
        }
        break;
      case 'measurements':
        if(measurementsIdsToAdd.current.indexOf(itemId) === -1) {
          measurementsIdsToAdd.current.push(itemId);
          setMeasurementsIdsToAddState(measurementsIdsToAdd.current);
        }
        break;
      case 'taxon':
        if(taxonIdsToAdd.current.indexOf(itemId) === -1) {
          taxonIdsToAdd.current = [];
          taxonIdsToAdd.current.push(itemId);
          setTaxonIdsToAddState(taxonIdsToAdd.current);
          handleSetValue(itemId, 1, 'taxon_id');
          setForeignKeys({...foreignKeys, taxon_id: itemId});
        }
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'individuals') {
      let iof = individualsIdsToAdd.current.indexOf(itemId);
      if(iof !== -1) {
        individualsIdsToAdd.current.splice(iof, 1);
      }
      return;
    }//end: case 'individuals'
    if(associationKey === 'location') {
      if(locationIdsToAdd.current.length > 0) {
        locationIdsToAdd.current = [];
        setLocationIdsToAddState([]);
        handleSetValue(null, 0, 'locationId');
        setForeignKeys({...foreignKeys, locationId: null});
      }
      return;
    }//end: case 'location'
    if(associationKey === 'measurements') {
      let iof = measurementsIdsToAdd.current.indexOf(itemId);
      if(iof !== -1) {
        measurementsIdsToAdd.current.splice(iof, 1);
      }
      return;
    }//end: case 'measurements'
    if(associationKey === 'taxon') {
      if(taxonIdsToAdd.current.length > 0) {
        taxonIdsToAdd.current = [];
        setTaxonIdsToAddState([]);
        handleSetValue(null, 0, 'taxon_id');
        setForeignKeys({...foreignKeys, taxon_id: null});
      }
      return;
    }//end: case 'taxon'
  }

  const handleClickOnIndividualRow = (event, item) => {
    setIndividualDetailItem(item);
  };

  const handleIndividualDetailDialogClose = (event) => {
    delayedCloseIndividualDetailPanel(event, 500);
  }

  const delayedCloseIndividualDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setIndividualDetailDialogOpen(false);
        setIndividualDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnLocationRow = (event, item) => {
    setLocationDetailItem(item);
  };

  const handleLocationDetailDialogClose = (event) => {
    delayedCloseLocationDetailPanel(event, 500);
  }

  const delayedCloseLocationDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setLocationDetailDialogOpen(false);
        setLocationDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnMeasurementRow = (event, item) => {
    setMeasurementDetailItem(item);
  };

  const handleMeasurementDetailDialogClose = (event) => {
    delayedCloseMeasurementDetailPanel(event, 500);
  }

  const delayedCloseMeasurementDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setMeasurementDetailDialogOpen(false);
        setMeasurementDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnTaxonRow = (event, item) => {
    setTaxonDetailItem(item);
  };

  const handleTaxonDetailDialogClose = (event) => {
    delayedCloseTaxonDetailPanel(event, 500);
  }

  const delayedCloseTaxonDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setTaxonDetailDialogOpen(false);
        setTaxonDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const startTimerToDebounceTabsChange = () => {
    return makeCancelable( new Promise(resolve => {
      window.setTimeout(function() { 
        resolve(); 
      }, debounceTimeout);
    }));
  };

  return (
    
    <Dialog fullScreen open={open} TransitionComponent={Transition}
      onClose={(event) => {
        if(!isCanceling.current){
          isCanceling.current = true;
          handleCancel(event);
        }
      }}
    >
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Tooltip title={ t('modelPanels.cancel') }>
            <IconButton 
              edge="start" 
              color="inherit"
              onClick={(event) => {
                if(!isCanceling.current){
                  isCanceling.current = true;
                  handleCancel(event);
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" className={classes.title}>
            {t('modelPanels.new') + ' Accession'}
          </Typography>
          <Tooltip title={ t('modelPanels.save') + " accession" }>
            <Fab 
              color="secondary" 
              className={classes.fabButton}
              onClick={(event) => {
                if(!isSaving.current){
                  isSaving.current = true;
                  handleSave(event);
                }
              }}
            >
              <SaveIcon />
            </Fab>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <div className={classes.root}>
        <Grid container justify='center' alignItems='flex-start' alignContent='flex-start'>
          <Grid item xs={12}>  
            {/* TabsA: Menú */}
            <div className={classes.tabsA}>
              <AccessionTabsA
                value={tabsValue}
                handleChange={handleTabsChange}
              />
            </div>
          </Grid>

          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <AccessionAttributesPage
              hidden={tabsValue !== 0}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <AccessionAssociationsPage
              hidden={tabsValue !== 1}
              individualsIdsToAdd={individualsIdsToAddState}
              locationIdsToAdd={locationIdsToAddState}
              measurementsIdsToAdd={measurementsIdsToAddState}
              taxonIdsToAdd={taxonIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleClickOnIndividualRow={handleClickOnIndividualRow}
              handleClickOnLocationRow={handleClickOnLocationRow}
              handleClickOnMeasurementRow={handleClickOnMeasurementRow}
              handleClickOnTaxonRow={handleClickOnTaxonRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <AccessionConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Individual Detail Panel */}
        {(individualDetailDialogOpen) && (
          <IndividualDetailPanel
            permissions={permissions}
            item={individualDetailItem}
            dialog={true}
            handleClose={handleIndividualDetailDialogClose}
          />
        )}
        {/* Dialog: Location Detail Panel */}
        {(locationDetailDialogOpen) && (
          <LocationDetailPanel
            permissions={permissions}
            item={locationDetailItem}
            dialog={true}
            handleClose={handleLocationDetailDialogClose}
          />
        )}
        {/* Dialog: Measurement Detail Panel */}
        {(measurementDetailDialogOpen) && (
          <MeasurementDetailPanel
            permissions={permissions}
            item={measurementDetailItem}
            dialog={true}
            handleClose={handleMeasurementDetailDialogClose}
          />
        )}
        {/* Dialog: Taxon Detail Panel */}
        {(taxonDetailDialogOpen) && (
          <TaxonDetailPanel
            permissions={permissions}
            item={taxonDetailItem}
            dialog={true}
            handleClose={handleTaxonDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
AccessionCreatePanel.propTypes = {
  permissions: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
};