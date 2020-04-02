import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MeasurementAttributesPage from './components/measurement-attributes-page/MeasurementAttributesPage'
import MeasurementAssociationsPage from './components/measurement-associations-page/MeasurementAssociationsPage'
import MeasurementTabsA from './components/MeasurementTabsA'
import MeasurementConfirmationDialog from './components/MeasurementConfirmationDialog'
import AccessionDetailPanel from '../../../accession-table/components/accession-detail-panel/AccessionDetailPanel'
import IndividualDetailPanel from '../../../individual-table/components/individual-detail-panel/IndividualDetailPanel'
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

export default function MeasurementUpdatePanel(props) {
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
  
  const accessionIdsToAdd = useRef((item.accession&& item.accession.accession_id) ? [item.accession.accession_id] : []);
  const [accessionIdsToAddState, setAccessionIdsToAddState] = useState((item.accession&& item.accession.accession_id) ? [item.accession.accession_id] : []);
  const individualIdsToAdd = useRef((item.individual&& item.individual.name) ? [item.individual.name] : []);
  const [individualIdsToAddState, setIndividualIdsToAddState] = useState((item.individual&& item.individual.name) ? [item.individual.name] : []);

  const [accessionDetailDialogOpen, setAccessionDetailDialogOpen] = useState(false);
  const [accessionDetailItem, setAccessionDetailItem] = useState(undefined);
  const [individualDetailDialogOpen, setIndividualDetailDialogOpen] = useState(false);
  const [individualDetailItem, setIndividualDetailItem] = useState(undefined);

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
      lastModelChanged.Measurement&&
      lastModelChanged.Measurement[String(item.measurement_id)]) {

        //updated item
        if(lastModelChanged.Measurement[String(item.measurement_id)].op === "update"&&
            lastModelChanged.Measurement[String(item.measurement_id)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.Measurement[String(item.measurement_id)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.measurement_id]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

  useEffect(() => {
    if (accessionDetailItem !== undefined) {
      setAccessionDetailDialogOpen(true);
    }
  }, [accessionDetailItem]);
  useEffect(() => {
    if (individualDetailItem !== undefined) {
      setIndividualDetailDialogOpen(true);
    }
  }, [individualDetailItem]);

  function getInitialValues() {
    let initialValues = {};

    initialValues.measurement_id = item.measurement_id;
    initialValues.name = item.name;
    initialValues.method = item.method;
    initialValues.reference = item.reference;
    initialValues.reference_link = item.reference_link;
    initialValues.value = item.value;
    initialValues.unit = item.unit;
    initialValues.short_name = item.short_name;
    initialValues.comments = item.comments;
    initialValues.field_unit_id = item.field_unit_id;
    initialValues.individual_id = item.individual_id;
    initialValues.accessionId = item.accessionId;

    return initialValues;
  }

  function getInitialForeignKeys() {
    let initialForeignKeys = {};
    
    initialForeignKeys.individual_id = item.individual_id;
    initialForeignKeys.accessionId = item.accessionId;

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

  initialValueOkStates.measurement_id = (item.measurement_id!==null ? 1 : 0);
  initialValueOkStates.name = (item.name!==null ? 1 : 0);
  initialValueOkStates.method = (item.method!==null ? 1 : 0);
  initialValueOkStates.reference = (item.reference!==null ? 1 : 0);
  initialValueOkStates.reference_link = (item.reference_link!==null ? 1 : 0);
  initialValueOkStates.value = (item.value!==null ? 1 : 0);
  initialValueOkStates.unit = (item.unit!==null ? 1 : 0);
  initialValueOkStates.short_name = (item.short_name!==null ? 1 : 0);
  initialValueOkStates.comments = (item.comments!==null ? 1 : 0);
  initialValueOkStates.field_unit_id = (item.field_unit_id!==null ? 1 : 0);
    initialValueOkStates.individual_id = -2; //FK
    initialValueOkStates.accessionId = -2; //FK

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
    if(values.current.measurement_id !== item.measurement_id) { return true;}
    if(values.current.name !== item.name) { return true;}
    if(values.current.method !== item.method) { return true;}
    if(values.current.reference !== item.reference) { return true;}
    if(values.current.reference_link !== item.reference_link) { return true;}
    if(values.current.value !== item.value) { return true;}
    if(values.current.unit !== item.unit) { return true;}
    if(values.current.short_name !== item.short_name) { return true;}
    if(values.current.comments !== item.comments) { return true;}
    if(Number(values.current.field_unit_id) !== Number(item.field_unit_id)) { return true;}
    if(values.current.individual_id !== item.individual_id) { return true;}
    if(values.current.accessionId !== item.accessionId) { return true;}
    return false;
  }

  function setAddRemoveAccession(variables) {
    //data to notify changes
    changedAssociations.current.accession = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.accession&&item.accession.accession_id) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(accessionIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.accession.accession_id!== accessionIdsToAdd.current[0]) {
          //set id to add
          variables.addAccession = accessionIdsToAdd.current[0];
          
          changedAssociations.current.accession.added = true;
          changedAssociations.current.accession.idsAdded = accessionIdsToAdd.current;
          changedAssociations.current.accession.removed = true;
          changedAssociations.current.accession.idsRemoved = [item.accession.accession_id];
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
        variables.removeAccession = item.accession.accession_id;
        
        changedAssociations.current.accession.removed = true;
        changedAssociations.current.accession.idsRemoved = [item.accession.accession_id];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(accessionIdsToAdd.current.length>0) {
        //set id to add
        variables.addAccession = accessionIdsToAdd.current[0];
        
        changedAssociations.current.accession.added = true;
        changedAssociations.current.accession.idsAdded = accessionIdsToAdd.current;
      } else {
        /*
         * Case II.b: The toAdd list is empty.
         */
        //do nothing here (nothing changes).
      }
    }
  }
  function setAddRemoveIndividual(variables) {
    //data to notify changes
    changedAssociations.current.individual = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.individual&&item.individual.name) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(individualIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.individual.name!== individualIdsToAdd.current[0]) {
          //set id to add
          variables.addIndividual = individualIdsToAdd.current[0];
          
          changedAssociations.current.individual.added = true;
          changedAssociations.current.individual.idsAdded = individualIdsToAdd.current;
          changedAssociations.current.individual.removed = true;
          changedAssociations.current.individual.idsRemoved = [item.individual.name];
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
        variables.removeIndividual = item.individual.name;
        
        changedAssociations.current.individual.removed = true;
        changedAssociations.current.individual.idsRemoved = [item.individual.name];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(individualIdsToAdd.current.length>0) {
        //set id to add
        variables.addIndividual = individualIdsToAdd.current[0];
        
        changedAssociations.current.individual.added = true;
        changedAssociations.current.individual.idsAdded = individualIdsToAdd.current;
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
    delete variables.individual_id;
    delete variables.accessionId;

    //add & remove: to_one's
    setAddRemoveAccession(variables);
    setAddRemoveIndividual(variables);

    //add & remove: to_many's

    /*
      API Request: updateItem
    */
    let cancelableApiReq = makeCancelable(api.measurement.updateItem(graphqlServerUrl, variables));
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
            onClose(event, true, response.data.data.updateMeasurement);
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
      case 'accession':
        accessionIdsToAdd.current = [];
        accessionIdsToAdd.current.push(itemId);
        setAccessionIdsToAddState(accessionIdsToAdd.current);
        handleSetValue(itemId, 1, 'accessionId');
        setForeignKeys({...foreignKeys, accessionId: itemId});
        break;
      case 'individual':
        individualIdsToAdd.current = [];
        individualIdsToAdd.current.push(itemId);
        setIndividualIdsToAddState(individualIdsToAdd.current);
        handleSetValue(itemId, 1, 'individual_id');
        setForeignKeys({...foreignKeys, individual_id: itemId});
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'accession') {
      accessionIdsToAdd.current = [];
      setAccessionIdsToAddState([]);
      handleSetValue(null, 0, 'accessionId');
      setForeignKeys({...foreignKeys, accessionId: null});
      return;
    }//end: case 'accession'
    if(associationKey === 'individual') {
      individualIdsToAdd.current = [];
      setIndividualIdsToAddState([]);
      handleSetValue(null, 0, 'individual_id');
      setForeignKeys({...foreignKeys, individual_id: null});
      return;
    }//end: case 'individual'
  }


  const handleClickOnAccessionRow = (event, item) => {
    setAccessionDetailItem(item);
  };

  const handleAccessionDetailDialogClose = (event) => {
    delayedCloseAccessionDetailPanel(event, 500);
  }

  const delayedCloseAccessionDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setAccessionDetailDialogOpen(false);
        setAccessionDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

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
            { t('modelPanels.editing') +  ": Measurement | measurement_id: " + item.measurement_id}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " measurement" }>
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
            <MeasurementTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <MeasurementAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <MeasurementAssociationsPage
              hidden={tabsValue !== 1 || deleted}
              item={item}
              accessionIdsToAdd={accessionIdsToAddState}
              individualIdsToAdd={individualIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleClickOnAccessionRow={handleClickOnAccessionRow}
              handleClickOnIndividualRow={handleClickOnIndividualRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <MeasurementConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Accession Detail Panel */}
        {(accessionDetailDialogOpen) && (
          <AccessionDetailPanel
            permissions={permissions}
            item={accessionDetailItem}
            dialog={true}
            handleClose={handleAccessionDetailDialogClose}
          />
        )}
        {/* Dialog: Individual Detail Panel */}
        {(individualDetailDialogOpen) && (
          <IndividualDetailPanel
            permissions={permissions}
            item={individualDetailItem}
            dialog={true}
            handleClose={handleIndividualDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
MeasurementUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
