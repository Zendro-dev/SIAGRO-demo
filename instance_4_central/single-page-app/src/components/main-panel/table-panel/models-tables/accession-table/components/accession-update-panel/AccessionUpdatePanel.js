import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import SaveIcon from '@material-ui/icons/Save';
import DeletedWarning from '@material-ui/icons/DeleteForeverOutlined';
import UpdateWarning from '@material-ui/icons/ErrorOutline';
import { amber, red } from '@material-ui/core/colors';

const debounceTimeout = 700;
const appBarHeight = 64;

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 450,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  warningCard: {
    width: '100%',
    minHeight: 130,
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

export default function AccessionUpdatePanel(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    permissions,
 
    item,
    handleClose,
  } = props;
  
  const [open, setOpen] = useState(true);
  const [tabsValue, setTabsValue] = useState(0);
  const [valueOkStates, setValueOkStates] = useState(getInitialValueOkStates());
  const lastFetchTime = useRef(Date.now());
    const [foreignKeys, setForeignKeys] = useState(getInitialForeignKeys());
  
  const [updated, setUpdated] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationAcceptText, setConfirmationAcceptText] = useState('');
  const [confirmationRejectText, setConfirmationRejectText] = useState('');

  const handleAccept = useRef(undefined);
  const handleReject = useRef(undefined);

  const values = useRef(getInitialValues());
  const valuesOkRefs = useRef(getInitialValueOkStates());
  const changedAssociations = useRef({});
  
  const [individualsIdsToAddState, setIndividualsIdsToAddState] = useState([]);
  const individualsIdsToAdd = useRef([]);
  const [individualsIdsToRemoveState, setIndividualsIdsToRemoveState] = useState([]);
  const individualsIdsToRemove = useRef([]);
  const locationIdsToAdd = useRef((item.location&& item.location.locationId) ? [item.location.locationId] : []);
  const [locationIdsToAddState, setLocationIdsToAddState] = useState((item.location&& item.location.locationId) ? [item.location.locationId] : []);
  const [measurementsIdsToAddState, setMeasurementsIdsToAddState] = useState([]);
  const measurementsIdsToAdd = useRef([]);
  const [measurementsIdsToRemoveState, setMeasurementsIdsToRemoveState] = useState([]);
  const measurementsIdsToRemove = useRef([]);
  const taxonIdsToAdd = useRef((item.taxon&& item.taxon.id) ? [item.taxon.id] : []);
  const [taxonIdsToAddState, setTaxonIdsToAddState] = useState((item.taxon&& item.taxon.id) ? [item.taxon.id] : []);

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

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl)
  const lastModelChanged = useSelector(state => state.changes.lastModelChanged);
  const lastChangeTimestamp = useSelector(state => state.changes.lastChangeTimestamp);

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
    /*
     * Handle changes 
     */
    
    /*
     * Checks
     */
    if(!lastModelChanged) {
      return;
    }
    if(!lastChangeTimestamp || !lastFetchTime.current) {
      return;
    }
    let isNewChange = (lastFetchTime.current<lastChangeTimestamp);
    if(!isNewChange) {
      return;
    }

    /*
     * Update timestamps
     */
    lastFetchTime.current = Date.now();
    
    /*
     * Case 1: 
     * This item was updated, either in his attributes or in his associations, or was deleted.
     * 
     * Conditions:
     * A: the item was modified.
     * B: the item was deleted.
     * 
     * Actions:
     * if A:
     * - set 'updated' alert
     * - return
     * 
     * if B:
     * - set 'deleted' alert
     * - return
     */

    //check if this.item changed
    if(lastModelChanged&&
      lastModelChanged.Accession&&
      lastModelChanged.Accession[String(item.accession_id)]) {

        //updated item
        if(lastModelChanged.Accession[String(item.accession_id)].op === "update"&&
            lastModelChanged.Accession[String(item.accession_id)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.Accession[String(item.accession_id)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.accession_id]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

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

    initialValues.accession_id = item.accession_id;
    initialValues.collectors_name = item.collectors_name;
    initialValues.collectors_initials = item.collectors_initials;
    initialValues.sampling_date = item.sampling_date;
    initialValues.sampling_number = item.sampling_number;
    initialValues.catalog_number = item.catalog_number;
    initialValues.institution_deposited = item.institution_deposited;
    initialValues.collection_name = item.collection_name;
    initialValues.collection_acronym = item.collection_acronym;
    initialValues.identified_by = item.identified_by;
    initialValues.identification_date = item.identification_date;
    initialValues.abundance = item.abundance;
    initialValues.habitat = item.habitat;
    initialValues.observations = item.observations;
    initialValues.family = item.family;
    initialValues.genus = item.genus;
    initialValues.species = item.species;
    initialValues.subspecies = item.subspecies;
    initialValues.variety = item.variety;
    initialValues.race = item.race;
    initialValues.form = item.form;
    initialValues.taxon_id = item.taxon_id;
    initialValues.collection_deposit = item.collection_deposit;
    initialValues.collect_number = item.collect_number;
    initialValues.collect_source = item.collect_source;
    initialValues.collected_seeds = item.collected_seeds;
    initialValues.collected_plants = item.collected_plants;
    initialValues.collected_other = item.collected_other;
    initialValues.habit = item.habit;
    initialValues.local_name = item.local_name;
    initialValues.locationId = item.locationId;

    return initialValues;
  }

  function getInitialForeignKeys() {
    let initialForeignKeys = {};
    
    initialForeignKeys.taxon_id = item.taxon_id;
    initialForeignKeys.locationId = item.locationId;

    return initialForeignKeys;
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

  initialValueOkStates.accession_id = (item.accession_id!==null ? 1 : 0);
  initialValueOkStates.collectors_name = (item.collectors_name!==null ? 1 : 0);
  initialValueOkStates.collectors_initials = (item.collectors_initials!==null ? 1 : 0);
  initialValueOkStates.sampling_date = (item.sampling_date!==null ? 1 : 0);
  initialValueOkStates.sampling_number = (item.sampling_number!==null ? 1 : 0);
  initialValueOkStates.catalog_number = (item.catalog_number!==null ? 1 : 0);
  initialValueOkStates.institution_deposited = (item.institution_deposited!==null ? 1 : 0);
  initialValueOkStates.collection_name = (item.collection_name!==null ? 1 : 0);
  initialValueOkStates.collection_acronym = (item.collection_acronym!==null ? 1 : 0);
  initialValueOkStates.identified_by = (item.identified_by!==null ? 1 : 0);
  initialValueOkStates.identification_date = (item.identification_date!==null ? 1 : 0);
  initialValueOkStates.abundance = (item.abundance!==null ? 1 : 0);
  initialValueOkStates.habitat = (item.habitat!==null ? 1 : 0);
  initialValueOkStates.observations = (item.observations!==null ? 1 : 0);
  initialValueOkStates.family = (item.family!==null ? 1 : 0);
  initialValueOkStates.genus = (item.genus!==null ? 1 : 0);
  initialValueOkStates.species = (item.species!==null ? 1 : 0);
  initialValueOkStates.subspecies = (item.subspecies!==null ? 1 : 0);
  initialValueOkStates.variety = (item.variety!==null ? 1 : 0);
  initialValueOkStates.race = (item.race!==null ? 1 : 0);
  initialValueOkStates.form = (item.form!==null ? 1 : 0);
    initialValueOkStates.taxon_id = -2; //FK
  initialValueOkStates.collection_deposit = (item.collection_deposit!==null ? 1 : 0);
  initialValueOkStates.collect_number = (item.collect_number!==null ? 1 : 0);
  initialValueOkStates.collect_source = (item.collect_source!==null ? 1 : 0);
  initialValueOkStates.collected_seeds = (item.collected_seeds!==null ? 1 : 0);
  initialValueOkStates.collected_plants = (item.collected_plants!==null ? 1 : 0);
  initialValueOkStates.collected_other = (item.collected_other!==null ? 1 : 0);
  initialValueOkStates.habit = (item.habit!==null ? 1 : 0);
  initialValueOkStates.local_name = (item.local_name!==null ? 1 : 0);
    initialValueOkStates.locationId = -2; //FK

    return initialValueOkStates;
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

  function areThereChangedFields() {
    if(values.current.accession_id !== item.accession_id) { return true;}
    if(values.current.collectors_name !== item.collectors_name) { return true;}
    if(values.current.collectors_initials !== item.collectors_initials) { return true;}
    if(values.current.sampling_date !== item.sampling_date) { return true;}
    if(values.current.sampling_number !== item.sampling_number) { return true;}
    if(values.current.catalog_number !== item.catalog_number) { return true;}
    if(values.current.institution_deposited !== item.institution_deposited) { return true;}
    if(values.current.collection_name !== item.collection_name) { return true;}
    if(values.current.collection_acronym !== item.collection_acronym) { return true;}
    if(values.current.identified_by !== item.identified_by) { return true;}
    if(values.current.identification_date !== item.identification_date) { return true;}
    if(values.current.abundance !== item.abundance) { return true;}
    if(values.current.habitat !== item.habitat) { return true;}
    if(values.current.observations !== item.observations) { return true;}
    if(values.current.family !== item.family) { return true;}
    if(values.current.genus !== item.genus) { return true;}
    if(values.current.species !== item.species) { return true;}
    if(values.current.subspecies !== item.subspecies) { return true;}
    if(values.current.variety !== item.variety) { return true;}
    if(values.current.race !== item.race) { return true;}
    if(values.current.form !== item.form) { return true;}
    if(values.current.taxon_id !== item.taxon_id) { return true;}
    if(values.current.collection_deposit !== item.collection_deposit) { return true;}
    if(values.current.collect_number !== item.collect_number) { return true;}
    if(values.current.collect_source !== item.collect_source) { return true;}
    if(Number(values.current.collected_seeds) !== Number(item.collected_seeds)) { return true;}
    if(Number(values.current.collected_plants) !== Number(item.collected_plants)) { return true;}
    if(values.current.collected_other !== item.collected_other) { return true;}
    if(values.current.habit !== item.habit) { return true;}
    if(values.current.local_name !== item.local_name) { return true;}
    if(values.current.locationId !== item.locationId) { return true;}
    return false;
  }

  function setAddRemoveLocation(variables) {
    //data to notify changes
    changedAssociations.current.location = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.location&&item.location.locationId) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(locationIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.location.locationId!== locationIdsToAdd.current[0]) {
          //set id to add
          variables.addLocation = locationIdsToAdd.current[0];
          
          changedAssociations.current.location.added = true;
          changedAssociations.current.location.idsAdded = locationIdsToAdd.current;
          changedAssociations.current.location.removed = true;
          changedAssociations.current.location.idsRemoved = [item.location.locationId];
        } else {
          /*
           * Case I.a.2: The ID on toAdd list es equal to the current associated ID.
           */
          //do nothing here (nothing changes).
        }
      } else {
        /*
         * Case I.b: The toAdd list is empty (current association removed).
         */
        //set id to remove
        variables.removeLocation = item.location.locationId;
        
        changedAssociations.current.location.removed = true;
        changedAssociations.current.location.idsRemoved = [item.location.locationId];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(locationIdsToAdd.current.length>0) {
        //set id to add
        variables.addLocation = locationIdsToAdd.current[0];
        
        changedAssociations.current.location.added = true;
        changedAssociations.current.location.idsAdded = locationIdsToAdd.current;
      } else {
        /*
         * Case II.b: The toAdd list is empty.
         */
        //do nothing here (nothing changes).
      }
    }
  }
  function setAddRemoveTaxon(variables) {
    //data to notify changes
    changedAssociations.current.taxon = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.taxon&&item.taxon.id) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(taxonIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.taxon.id!== taxonIdsToAdd.current[0]) {
          //set id to add
          variables.addTaxon = taxonIdsToAdd.current[0];
          
          changedAssociations.current.taxon.added = true;
          changedAssociations.current.taxon.idsAdded = taxonIdsToAdd.current;
          changedAssociations.current.taxon.removed = true;
          changedAssociations.current.taxon.idsRemoved = [item.taxon.id];
        } else {
          /*
           * Case I.a.2: The ID on toAdd list es equal to the current associated ID.
           */
          //do nothing here (nothing changes).
        }
      } else {
        /*
         * Case I.b: The toAdd list is empty (current association removed).
         */
        //set id to remove
        variables.removeTaxon = item.taxon.id;
        
        changedAssociations.current.taxon.removed = true;
        changedAssociations.current.taxon.idsRemoved = [item.taxon.id];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(taxonIdsToAdd.current.length>0) {
        //set id to add
        variables.addTaxon = taxonIdsToAdd.current[0];
        
        changedAssociations.current.taxon.added = true;
        changedAssociations.current.taxon.idsAdded = taxonIdsToAdd.current;
      } else {
        /*
         * Case II.b: The toAdd list is empty.
         */
        //do nothing here (nothing changes).
      }
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

    //add & remove: to_one's
    setAddRemoveLocation(variables);
    setAddRemoveTaxon(variables);

    //add & remove: to_many's
    //data to notify changes
    changedAssociations.current.individuals = {added: false, removed: false};
    
    if(individualsIdsToAdd.current.length>0) {
      variables.addIndividuals = individualsIdsToAdd.current;
      
      changedAssociations.current.individuals.added = true;
      changedAssociations.current.individuals.idsAdded = individualsIdsToAdd.current;
    }
    if(individualsIdsToRemove.current.length>0) {
      variables.removeIndividuals = individualsIdsToRemove.current;
      
      changedAssociations.current.individuals.removed = true;
      changedAssociations.current.individuals.idsRemoved = individualsIdsToRemove.current;
    }
    //data to notify changes
    changedAssociations.current.measurements = {added: false, removed: false};
    
    if(measurementsIdsToAdd.current.length>0) {
      variables.addMeasurements = measurementsIdsToAdd.current;
      
      changedAssociations.current.measurements.added = true;
      changedAssociations.current.measurements.idsAdded = measurementsIdsToAdd.current;
    }
    if(measurementsIdsToRemove.current.length>0) {
      variables.removeMeasurements = measurementsIdsToRemove.current;
      
      changedAssociations.current.measurements.removed = true;
      changedAssociations.current.measurements.idsRemoved = measurementsIdsToRemove.current;
    }

    /*
      API Request: updateItem
    */
    let cancelableApiReq = makeCancelable(api.accession.updateItem(graphqlServerUrl, variables));
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
            enqueueSnackbar( t('modelPanels.messages.msg5', "Record updated successfully."), {
              variant: 'success',
              preventDuplicate: false,
              persist: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            });
            onClose(event, true, response.data.data.updateAccession);
          }
          return;

        } else { //error: bad response on updateItem()
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
      .catch(({isCanceled, ...err}) => { //error: on updateItem()
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
    if(areThereChangedFields()) {
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
    handleClose(event, status, item, newItem, changedAssociations.current);
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
        individualsIdsToAdd.current.push(itemId);
        setIndividualsIdsToAddState(individualsIdsToAdd.current);
        break;
      case 'location':
        locationIdsToAdd.current = [];
        locationIdsToAdd.current.push(itemId);
        setLocationIdsToAddState(locationIdsToAdd.current);
        handleSetValue(itemId, 1, 'locationId');
        setForeignKeys({...foreignKeys, locationId: itemId});
        break;
      case 'measurements':
        measurementsIdsToAdd.current.push(itemId);
        setMeasurementsIdsToAddState(measurementsIdsToAdd.current);
        break;
      case 'taxon':
        taxonIdsToAdd.current = [];
        taxonIdsToAdd.current.push(itemId);
        setTaxonIdsToAddState(taxonIdsToAdd.current);
        handleSetValue(itemId, 1, 'taxon_id');
        setForeignKeys({...foreignKeys, taxon_id: itemId});
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'individuals') {
      for(let i=0; i<individualsIdsToAdd.current.length; ++i)
      {
        if(individualsIdsToAdd.current[i] === itemId) {
          individualsIdsToAdd.current.splice(i, 1);
          setIndividualsIdsToAddState(individualsIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'individuals'
    if(associationKey === 'location') {
      locationIdsToAdd.current = [];
      setLocationIdsToAddState([]);
      handleSetValue(null, 0, 'locationId');
      setForeignKeys({...foreignKeys, locationId: null});
      return;
    }//end: case 'location'
    if(associationKey === 'measurements') {
      for(let i=0; i<measurementsIdsToAdd.current.length; ++i)
      {
        if(measurementsIdsToAdd.current[i] === itemId) {
          measurementsIdsToAdd.current.splice(i, 1);
          setMeasurementsIdsToAddState(measurementsIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'measurements'
    if(associationKey === 'taxon') {
      taxonIdsToAdd.current = [];
      setTaxonIdsToAddState([]);
      handleSetValue(null, 0, 'taxon_id');
      setForeignKeys({...foreignKeys, taxon_id: null});
      return;
    }//end: case 'taxon'
  }

  const handleTransferToRemove = (associationKey, itemId) => {
    switch(associationKey) {
      case 'individuals':
        individualsIdsToRemove.current.push(itemId);
        setIndividualsIdsToRemoveState(individualsIdsToRemove.current);
        break;
      case 'measurements':
        measurementsIdsToRemove.current.push(itemId);
        setMeasurementsIdsToRemoveState(measurementsIdsToRemove.current);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromRemove =(associationKey, itemId) => {
    if(associationKey === 'individuals') {
      for(let i=0; i<individualsIdsToRemove.current.length; ++i)
      {
        if(individualsIdsToRemove.current[i] === itemId) {
          individualsIdsToRemove.current.splice(i, 1);
          setIndividualsIdsToRemoveState(individualsIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'individuals'
    if(associationKey === 'measurements') {
      for(let i=0; i<measurementsIdsToRemove.current.length; ++i)
      {
        if(measurementsIdsToRemove.current[i] === itemId) {
          measurementsIdsToRemove.current.splice(i, 1);
          setMeasurementsIdsToRemoveState(measurementsIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'measurements'
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
            { t('modelPanels.editing') +  ": Accession | accession_id: " + item.accession_id}
          </Typography>
          
          {(!deleted)&&(
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
          )}

        </Toolbar>
      </AppBar>
      <Toolbar/>

      <div className={classes.root}>
        <Grid container justify='center' alignItems='flex-start' alignContent='flex-start'>

          <Grid item xs={12}>
            {/* Delete warning */}
            <Box
              width="100%"
              p={0}
              position="fixed"
              top={appBarHeight}
              left={0}
              zIndex="speedDial"
            >
              <Collapse in={deleted}>
                <Card className={classes.warningCard} square={true}>
                  <CardHeader
                    avatar={
                      <DeletedWarning style={{ color: red[700] }} />
                    }
                    title={ t('modelPanels.deletedWarning', "This item no longer exists. It was deleted elsewhere.") }
                    subheader="Deleted"
                  />
                </Card>
              </Collapse>
            </Box>
          </Grid>
  
          <Grid item xs={12}>
            {/* Update warning */}
            <Box
              width="100%"
              p={0}
              position="fixed"
              top={appBarHeight}
              left={0}
              zIndex="speedDial"
            >
              <Collapse in={updated}>
                <Card className={classes.warningCard} square={true}>
                  <CardHeader
                    avatar={
                      <UpdateWarning style={{ color: amber[700] }} />
                    }
                    title={ t('modelPanels.updatedWarning', "This item was updated elsewhere.") }
                    subheader="Updated"
                  />
                </Card>
              </Collapse>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={updated||deleted}>
              <Card className={classes.warningCard} square={true} elevation={0}>
              </Card>
            </Collapse>
          </Grid>
            
          {/* TabsA: Menú */}
          <Grid item xs={12}>
            <AccessionTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <AccessionAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <AccessionAssociationsPage
              hidden={tabsValue !== 1 || deleted}
              item={item}
              individualsIdsToAdd={individualsIdsToAddState}
              individualsIdsToRemove={individualsIdsToRemoveState}
              locationIdsToAdd={locationIdsToAddState}
              measurementsIdsToAdd={measurementsIdsToAddState}
              measurementsIdsToRemove={measurementsIdsToRemoveState}
              taxonIdsToAdd={taxonIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleTransferToRemove={handleTransferToRemove}
              handleUntransferFromRemove={handleUntransferFromRemove}
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
AccessionUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
