import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { modelChange } from '../../../../../../../store/actions'
import PropTypes from 'prop-types';
import api from '../../../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../../../utils'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import AccessionAttributesPage from './components/accession-attributes-page/AccessionAttributesPage'
import AccessionAssociationsPage from './components/accession-associations-page/AccessionAssociationsPage'
import AccessionUpdatePanel from '../accession-update-panel/AccessionUpdatePanel'
import AccessionDeleteConfirmationDialog from '../AccessionDeleteConfirmationDialog'
import IndividualDetailPanel from '../../../individual-table/components/individual-detail-panel/IndividualDetailPanel'
import LocationDetailPanel from '../../../location-table/components/location-detail-panel/LocationDetailPanel'
import MeasurementDetailPanel from '../../../measurement-table/components/measurement-detail-panel/MeasurementDetailPanel'
import TaxonDetailPanel from '../../../taxon-table/components/taxon-detail-panel/TaxonDetailPanel'
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import Delete from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import DeletedWarning from '@material-ui/icons/DeleteForeverOutlined';
import UpdateOk from '@material-ui/icons/CheckCircleOutlined';
import { red, green } from '@material-ui/core/colors';

const appBarHeight = 72;

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 450,
    minHeight: 1200,
    paddingTop: theme.spacing(1),
  },
  appBar: {
    height: appBarHeight,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  warningCard: {
    width: '100%',
    minHeight: 130,
  },
  divider: {
    marginTop: theme.spacing(2),
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccessionDetailPanel(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    permissions, 
    item,
    dialog,
    handleClose,
  } = props;
  
  const [open, setOpen] = useState(true);
  const [itemState, setItemState] = useState(item);
  const [valueOkStates, setValueOkStates] = useState(getInitialValueOkStates(item));
  const lastFetchTime = useRef(Date.now());

  const [updated, setUpdated] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState(undefined);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const [deleteConfirmationItem, setDeleteConfirmationItem] = useState(undefined);

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
  const isCanceling = useRef(false);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl);
  const lastModelChanged = useSelector(state => state.changes.lastModelChanged);
  const lastChangeTimestamp = useSelector(state => state.changes.lastChangeTimestamp);
  const dispatch = useDispatch();

  const actionText = useRef(null);
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

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
     * - replace item
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
      lastModelChanged.Accession[String(itemState.accession_id)]) {
          
        //updated item
        if(lastModelChanged.Accession[String(itemState.accession_id)].op === "update"&&
            lastModelChanged.Accession[String(itemState.accession_id)].newItem) {
              //replace item
              setItemState(lastModelChanged.Accession[String(itemState.accession_id)].newItem);
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.Accession[String(itemState.accession_id)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, itemState.accession_id]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);
  
  useEffect(() => {
    if(individualDetailItem !== undefined) {
      setIndividualDetailDialogOpen(true);
    }
  }, [individualDetailItem]);

  useEffect(() => {
    if(locationDetailItem !== undefined) {
      setLocationDetailDialogOpen(true);
    }
  }, [locationDetailItem]);

  useEffect(() => {
    if(measurementDetailItem !== undefined) {
      setMeasurementDetailDialogOpen(true);
    }
  }, [measurementDetailItem]);

  useEffect(() => {
    if(taxonDetailItem !== undefined) {
      setTaxonDetailDialogOpen(true);
    }
  }, [taxonDetailItem]);


  useEffect(() => {
    if(updateItem !== undefined) {
      setUpdateDialogOpen(true);
    }
  }, [updateItem]);

  useEffect(() => {
    if(deleteConfirmationItem !== undefined) {
      setDeleteConfirmationDialogOpen(true);
    }
  }, [deleteConfirmationItem]);

  useEffect(() => {
    if(itemState) {
      setValueOkStates(getInitialValueOkStates(itemState));
    }
    lastFetchTime.current = Date.now();
  }, [itemState]);

  function doDelete(event, item) {
    //variables
    let variables = {};


    /*
      API Request: deleteItem
    */
    let cancelableApiReq = makeCancelable(api.accession.deleteItem(graphqlServerUrl, variables));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check response
        if(
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
              action: action.current,
            });
            console.log("Errors: ", response.data.errors);
          }else {

            //ok
            enqueueSnackbar( t('modelPanels.messages.msg4', "Record deleted successfully."), {
              variant: 'success',
              preventDuplicate: false,
              persist: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            });
            onSuccessDelete(event, item);
          }
          return;

        } else { //error: bad response on deleteItem()
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
          return;
        }
      })
      .catch(({isCanceled, ...err}) => { //error: on deleteItem()
        if(isCanceled) {
          return;
        } else {
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", err);
          return;
        }
      });
  }

  function getInitialValueOkStates(item) {
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

  const handleCancel = (event) => {
    setOpen(false);
    handleClose(event);
  }

  const handleUpdateClicked = (event, item) => {
    setOpen(false);
    delayedOpenUpdatePanel(event, item, 50);
  }

  const delayedOpenUpdatePanel = async (event, item, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setUpdateItem(item);
        resolve("ok");
      }, ms);
    });
  };

  const handleUpdateDialogClose = (event, status, item, newItem, changedAssociations) => {
    if(status) {
      dispatch(modelChange('Accession', 'update', item, newItem, changedAssociations))
    }
    delayedCloseUpdatePanel(event, 500);
  }

  const delayedCloseUpdatePanel = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setUpdateDialogOpen(false);
        setUpdateItem(undefined);
        handleClose(event);
        resolve("ok");
      }, ms);
    });
  };

  const handleDeleteClicked = (event, item) => {
    setDeleteConfirmationItem(item);
  }

  const handleDeleteConfirmationAccept = (event, item) => {
    setOpen(false);
    doDelete(event, item);
  }

  const onSuccessDelete = (event, item) => {
    dispatch(modelChange('Accession', 'delete', item, null))
    delayedCloseDeleteConfirmationAccept(event, 500);
  }

  const delayedCloseDeleteConfirmationAccept = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationItem(undefined);
        handleClose(event);
        resolve("ok");
      }, ms);
    });
  };

  const handleDeleteConfirmationReject = (event) => {
    delayedCloseDeleteConfirmationReject(event, 500);
  }

  const delayedCloseDeleteConfirmationReject = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationItem(undefined);
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

  return (
    <div>
      {/* Dialog Mode */}
      {(dialog !== undefined && dialog === true) && (
        
        <Dialog fullScreen open={open} TransitionComponent={Transition}
          onClose={(event) => {
            if(!isCanceling.current){
              isCanceling.current = true;
              handleCancel(event);
            }
          }}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <Tooltip title={ t('modelPanels.close') }>
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
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" className={classes.title}>
                { t('modelPanels.detailOf') +  ": Accession | accession_id: " + itemState.accession_id}
              </Typography>
              {/*
                Actions:
                - Edit
                - Delete
              */}
            </Toolbar>
          </AppBar>
          <Toolbar className={classes.appBar}/>

          <div className={classes.root}>
            <Grid container justify='center' alignItems='flex-start' alignContent='flex-start' spacing={0}>

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
                          <UpdateOk style={{ color: green[700] }} />
                        }
                        title={ t('modelPanels.updatedWarning', "This item was updated elsewhere.") }
                        subheader="Updated"
                      />
                      <CardActions>
                        <Button size="small" color="primary" onClick={()=>{setUpdated(false)}}>
                          Got it
                        </Button>
                      </CardActions>
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

              <Grid item xs={12} sm={11} md={10} lg={9} xl={8}>
                <Divider className={classes.divider} />
                <Grid container justify='flex-start'>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      { t('modelPanels.attributes') }
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                {/* Attributes Page */}
                <AccessionAttributesPage
                  item={itemState}
                  valueOkStates={valueOkStates}
                />
              </Grid>

              <Grid item xs={12} sm={11} md={10} lg={9} xl={8}>
                <Divider />
                <Grid container justify='flex-start'>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      { t('modelPanels.associations') }
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
    
              <Grid item xs={12}>
                {/* Associations Page */}
                <AccessionAssociationsPage
                  item={itemState}
                  deleted={deleted}
                  handleClickOnIndividualRow={handleClickOnIndividualRow}
                  handleClickOnLocationRow={handleClickOnLocationRow}
                  handleClickOnMeasurementRow={handleClickOnMeasurementRow}
                  handleClickOnTaxonRow={handleClickOnTaxonRow}
                />
              </Grid>
            </Grid>
          </div>
        </Dialog>
      )}

      {/* No-Dialog Mode */}
      {(dialog !== undefined && dialog === false) && (
    
        <div className={classes.root}>
          <Grid container justify='center' alignItems='flex-start' alignContent='flex-start' spacing={0}>

            <Grid item xs={12}>
              {/* Attributes Page */}
              <AccessionAttributesPage
                item={itemState}
                valueOkStates={valueOkStates}
              />
            </Grid>
  
            <Grid item xs={12}>
              {/* Associations Page */}
              <AccessionAssociationsPage
                item={itemState}
                deleted={deleted}
                handleClickOnIndividualRow={handleClickOnIndividualRow}
                handleClickOnLocationRow={handleClickOnLocationRow}
                handleClickOnMeasurementRow={handleClickOnMeasurementRow}
                handleClickOnTaxonRow={handleClickOnTaxonRow}
              />
            </Grid>

          </Grid>
        </div>
      )}

      {/* Dialog: Update Panel */}
      {(updateDialogOpen) && (
        <AccessionUpdatePanel
          permissions={permissions}
          item={updateItem}
          handleClose={handleUpdateDialogClose}
        />
      )}

      {/* Dialog: Delete Confirmation */}
      {(deleteConfirmationDialogOpen) && (
        <AccessionDeleteConfirmationDialog
          permissions={permissions}
          item={deleteConfirmationItem}
          handleAccept={handleDeleteConfirmationAccept}
          handleReject={handleDeleteConfirmationReject}
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
  );
}
AccessionDetailPanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  dialog: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};