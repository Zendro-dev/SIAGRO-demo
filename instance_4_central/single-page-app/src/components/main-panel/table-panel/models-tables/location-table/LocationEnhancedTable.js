import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changesCompleted, clearChanges } from '../../../../../store/actions'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import api from '../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../utils'
import LocationEnhancedTableHead from './components/LocationEnhancedTableHead'
import LocationEnhancedTableToolbar from './components/LocationEnhancedTableToolbar'
import LocationCreatePanel from './components/location-create-panel/LocationCreatePanel'
import LocationUpdatePanel from './components/location-update-panel/LocationUpdatePanel'
import LocationDetailPanel from './components/location-detail-panel/LocationDetailPanel'
import LocationDeleteConfirmationDialog from './components/LocationDeleteConfirmationDialog'
import LocationUploadFileDialog from './components/LocationUploadFileDialog'
import LocationCursorPagination from './components/LocationCursorPagination'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Delete from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import SeeInfo from '@material-ui/icons/VisibilityTwoTone';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(7),
    },
    paper: {
        overflowX: 'auto',
    },
    tableWrapper: {
      height: '64vh',
      maxHeight: '64vh',
      overflow: 'auto',
      position: 'relative',
    },
    loading: {
      height: '64vh',
      maxHeight: '64vh',
    },
    noData: {
      height: '64vh',
      maxHeight: '64vh',
    },
    iconSee: {
      '&:hover': {
        color: '#3f51b5'
      }
    },
    iconEdit: {
      '&:hover': {
        color: '#3f51b5'
      }
    },
    iconDelete: {
      '&:hover': {
        color: '#f50057'
      }
    },
    notiErrorActionText: {
      color: '#eba0a0',
    },
    tableBackdrop: {
      WebkitTapHighlightColor: 'transparent',
      minWidth: '100%',
      minHeight: '100%'
    },
    tableBackdropContent: {
      width: '100%',
      height: '100%'
    },
}));

export default function LocationEnhancedTable(props) {
  const classes = useStyles();
  const { permissions } = props;
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('locationId');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isOnApiRequest, setIsOnApiRequest] = useState(false);
  const [dataTrigger, setDataTrigger] = useState(false);
  const isPendingApiRequestRef = useRef(false);
  const isOnApiRequestRef = useRef(false);
  const isGettingFirstDataRef = useRef(true);
  const pageRef = useRef(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageInfo = useRef({startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false});
  const isForwardPagination = useRef(true);
  const isCursorPaginating = useRef(false);
  const includeCursor = useRef(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState(undefined);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(undefined);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const [deleteConfirmationItem, setDeleteConfirmationItem] = useState(undefined);
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false);

  const cancelablePromises = useRef([]);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl)
  const changes = useSelector(state => state.changes);
  const dispatch = useDispatch();

  const actionText = useRef(null);
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

  //table w&h
  const tref = useRef(null);
  const [tw, setTw] = useState('100%');
  const [th, setTh] = useState('100%');

  //table wrapper scroll left position
  const twref = useRef(null);
  const [tscl, setTscl] = useState(0);

  /**
    * getData
    * 
    * Get @items and @count from GrahpQL Server.
    * Uses current state properties to fill query request.
    * Updates state to inform new @items and @count retreived.
    * 
    */
  const getData = useCallback(() => {
    updateSizes();
    isOnApiRequestRef.current = true;
    setIsOnApiRequest(true);
    Boolean(dataTrigger); //avoid warning

    /*
      API Request: countItems
    */
    let cancelableApiReq = makeCancelable(api.location.getCountItems(graphqlServerUrl, search));
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
          }
          //save response data
          var newCount = response.data.data.countLocations;


          /*
            API Request: items
          */
          let variables = {
            pagination: {
              after: isForwardPagination.current ? pageInfo.current.endCursor : null,
              before: !isForwardPagination.current ? pageInfo.current.startCursor : null,
              first: isForwardPagination.current ? rowsPerPage : null,
              last: !isForwardPagination.current ? rowsPerPage : null,
              includeCursor: includeCursor.current,
            }
          };
          let cancelableApiReqB = makeCancelable(api.location.getItemsConnection(
            graphqlServerUrl,
            search,
            orderBy,
            order,
            variables
          ));
          cancelablePromises.current.push(cancelableApiReqB);
          cancelableApiReqB
            .promise
            .then(response => {
              //delete from cancelables
              cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReqB), 1);
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
                    action: action.current,
                  });
                  console.log("Errors: ", response.data.errors);
                }
                //save response data
                let its = response.data.data.locationsConnection.edges.map(o => o.node);
                let pi = response.data.data.locationsConnection.pageInfo;
                
                /*
                  Check: empty page
                */
                if( its.length === 0 && pi&&pi.hasPreviousPage ) 
                {
                  //configure
                  isOnApiRequestRef.current = false;
                  isCursorPaginating.current = false;
                  isForwardPagination.current = false;
                  setIsOnApiRequest(false);
                  
                  //reload
                  setDataTrigger(prevDataTrigger => !prevDataTrigger);
                  return;
                }//else

                //update pageInfo
                pageInfo.current = pi;
                setHasPreviousPage(pageInfo.current.hasPreviousPage);
                setHasNextPage(pageInfo.current.hasNextPage);
                
                //ok
                setCount((newCount&&typeof newCount==='number') ? newCount : 0);
                setItems(its&&Array.isArray(its) ? its : []);
                isOnApiRequestRef.current = false;
                isCursorPaginating.current = false;
                includeCursor.current = false;
                setIsOnApiRequest(false);
                return;

              } else { //error: bad response on getItems()
                actionText.current = t('modelPanels.gotIt', "Got it");
                enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
                  variant: 'error',
                  preventDuplicate: false,
                  persist: true,
                  action: action.current,
                });
                console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
                //update pageInfo
                pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                setHasPreviousPage(pageInfo.current.hasPreviousPage);
                setHasNextPage(pageInfo.current.hasNextPage);
                setCount(0);
                setItems([]);
                isOnApiRequestRef.current = false;
                isCursorPaginating.current = false;
                includeCursor.current = false;
                setIsOnApiRequest(false);
                return;
              }
            })
            .catch(({isCanceled, ...err}) => { //error: on getItems()
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
                //update pageInfo
                pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                setHasPreviousPage(pageInfo.current.hasPreviousPage);
                setHasNextPage(pageInfo.current.hasNextPage);
                setCount(0);
                setItems([]);
                isOnApiRequestRef.current = false;
                isCursorPaginating.current = false;
                includeCursor.current = false;
                setIsOnApiRequest(false);
                return;
              }
            });
          return;
        } else { //error: bad response on getCountItems()
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
          //update pageInfo
          pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
          setHasPreviousPage(pageInfo.current.hasPreviousPage);
          setHasNextPage(pageInfo.current.hasNextPage);
          setCount(0);
          setItems([]);
          isOnApiRequestRef.current = false;
          isCursorPaginating.current = false;
          includeCursor.current = false;
          setIsOnApiRequest(false);
          return;
        }
      })
      .catch(({isCanceled, ...err}) => { //error: on getCountItems()
        if(isCanceled) {
          return;
        }
        else {
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", err);
          //update pageInfo
          pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
          setHasPreviousPage(pageInfo.current.hasPreviousPage);
          setHasNextPage(pageInfo.current.hasNextPage);
          setCount(0);
          setItems([]);
          isOnApiRequestRef.current = false;
          isCursorPaginating.current = false;
          includeCursor.current = false;
          setIsOnApiRequest(false);
          return;
        }
    });
  }, [graphqlServerUrl, enqueueSnackbar, t, dataTrigger, search, orderBy, order, rowsPerPage]);

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isOnApiRequestRef.current) {
      getData();
    } 
    else { 
      isPendingApiRequestRef.current = true; 
    }
  }, [getData]);

  useEffect(() => {
    if(changes&&changes.changesCompleted) {
      //if there were changes
      if(changes.models&&
          (Object.keys(changes.models).length>0)) {
            //strict contention
            if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
              //configure
              isForwardPagination.current = true;
              pageInfo.current.endCursor = pageInfo.current.startCursor;
              includeCursor.current = true;
              //reload
              setDataTrigger(prevDataTrigger => !prevDataTrigger);
            }
      }
      //clear changes state
      dispatch(clearChanges());
    }
  }, [changes, dispatch]);

  useEffect(() => {
    //return if this flag is set
    if(isGettingFirstDataRef.current) { 
      isGettingFirstDataRef.current = false; 
      return; 
    } 
    else {
      //get data from the new page
      pageRef.current = page;
      if (!isOnApiRequestRef.current) {
        setDataTrigger(prevDataTrigger => !prevDataTrigger); 
      } 
      else { 
        isPendingApiRequestRef.current = true; 
      }
    }
  }, [page]);

  useEffect(() => {      
    if (!isOnApiRequest && isPendingApiRequestRef.current) {
      isPendingApiRequestRef.current = false;
      //configure
      isForwardPagination.current = true;
      pageInfo.current.endCursor = pageInfo.current.startCursor;
      includeCursor.current = true;
      //reload    
      setDataTrigger(prevDataTrigger => !prevDataTrigger);
    }
    updateSizes();
  }, [isOnApiRequest]);

  useEffect(() => {
    if (updateItem !== undefined) {
      setUpdateDialogOpen(true);
    }
  }, [updateItem]);

  useEffect(() => {
    if (detailItem !== undefined) {
      setDetailDialogOpen(true);
    }
  }, [detailItem]);

  useEffect(() => {
    if (deleteConfirmationItem !== undefined) {
      setDeleteConfirmationDialogOpen(true);
    }
  }, [deleteConfirmationItem]);

  function doDelete(event, item) {
    //variables
    let variables = {};

    //set locationId (internalId)
    variables.locationId = item.locationId;

    /*
      API Request: deleteItem
    */
    let cancelableApiReq = makeCancelable(api.location.deleteItem(graphqlServerUrl, variables));
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
          }
          reloadData();
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
          reloadData();
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
          reloadData();
          return;
        }
      });
  }

  function getCsvTemplate() {
    /*
      API Request: deleteItem
    */
    let cancelableApiReq = makeCancelable(api.location.tableTemplate(graphqlServerUrl));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check response
        if(
          response.data &&
          response.data.data &&
          response.data.data.csvTableTemplateLocation        ) {
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
            enqueueSnackbar( t('modelPanels.messages.msg7', "Template downloaded successfully."), {
              variant: 'success',
              preventDuplicate: false,
              persist: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            });
            //download
            let file = response.data.data.csvTableTemplateLocation.join("\n");
            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "location-template.csv");
            document.body.appendChild(link);
            link.click();
          }
          return;

        } else { //error: bad response on tableTemplate()
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
      .catch(({isCanceled, ...err}) => { //error: on tableTemplate()
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

  function resetPageRefs() {
    isForwardPagination.current = true;
    pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
    setHasPreviousPage(pageInfo.current.hasPreviousPage);
    setHasNextPage(pageInfo.current.hasNextPage);
    includeCursor.current = false;
    pageRef.current = 0;
  }

  function reloadData() {
    //configure
    isForwardPagination.current = true;
    pageInfo.current.endCursor = pageInfo.current.startCursor;
    includeCursor.current = true;
    //reload    
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  }

function resetReloadData() {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    resetPageRefs();
    isCursorPaginating.current = true;
    //reload
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  }


  function updateSizes() {
    //update tw & th & tscl
    if(tref.current) {
      let w = tref.current.clientWidth;
      let h = tref.current.clientHeight;
      setTw(w);
      setTh(h);
    } else {
      setTw('100%');
      setTh('100%');
    }

    if(twref.current) {
      let l = twref.current.scrollLeft;
      setTscl(l);
    } else {
      setTscl(0);
    }
  }

  /**
   * Handlers
   */

  /*
   * Search handlers
   */
  const handleSearchEnter = text => {
    if(text !== search)
    {
      resetPageRefs();
      if(page !== 0) {
        isGettingFirstDataRef.current = true; //avoids to get data on [page] effect
        setPage(0);
      }
      setSearch(text);
    }
  };

  /*
   * Sort handlers
   */
  const handleRequestSort = (event, property) => {
    resetPageRefs();
    if(page !== 0) {
      isGettingFirstDataRef.current = true; //avoids to get data on [page] effect
      setPage(0);
    }

    const isDesc = (order === 'desc');
    setOrder(isDesc ? 'asc' : 'desc');

    if (orderBy !== property) {
      setOrderBy(property);
    }
  };

  /*
   * Pagination handlers
   */

  const handleChangeRowsPerPage = event => {
    if(event.target.value !== rowsPerPage)
    {
      resetPageRefs();
      if(page !== 0) {
        isGettingFirstDataRef.current = true; //avoids to get data on [page] effect
        setPage(0);
      }
      setRowsPerPage(parseInt(event.target.value, 10));
    }
  };

  const handleReloadClick = (event) => {
    resetReloadData();
  };

  const handleFirstPageButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = true;
    pageInfo.current.endCursor = null;

    //reload
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };

  const handleLastPageButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = false;
    pageInfo.current.startCursor = null;

    //reload
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };

  const handleNextButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = true;

    //reload
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };

  const handleBackButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = false;

    //reload
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };

  /**
   * Detail-Panel handlers
   */
  const handleClickOnRow = (event, item) => {
    setDetailItem(item);
  };

  const handleDetailDialogClose = (event) => {
    dispatch(changesCompleted());
    delayedCloseDetailPanel(event, 500);
  }

  const delayedCloseDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setDetailDialogOpen(false);
        setDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  /**
   * Create-Panel handlers
   */
  const handleCreateClicked = (event) => {
    setCreateDialogOpen(true);
  }

  const handleCreateDialogClose = (event, status, newItem) => {
    dispatch(changesCompleted());
    delayedCloseCreatePanel(event, 500);
    if(status) {
      reloadData();
    }
  }

  const delayedCloseCreatePanel = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setCreateDialogOpen(false);
        resolve("ok");
      }, ms);
    });
  };

  /**
   * Update-Panel handlers
   */
  const handleUpdateClicked = (event, item) => {
    setUpdateItem(item);
  }

  const handleUpdateDialogClose = (event, status, oldItem, newItem) => {
    dispatch(changesCompleted());
    delayedCloseUpdatePanel(event, 500);
    if(status) {
      reloadData();
    }
  }

  const delayedCloseUpdatePanel = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setUpdateDialogOpen(false);
        setUpdateItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  /**
   * Delete-Panel handlers
   */
  const handleDeleteClicked = (event, item) => {
    setDeleteConfirmationItem(item);
  }

  const handleDeleteConfirmationAccept = (event, item) => {
    dispatch(changesCompleted());
    doDelete(event, item);
    delayedCloseDeleteConfirmation(event, 500);
  }

  const handleDeleteConfirmationReject = (event) => {
    dispatch(changesCompleted());
    delayedCloseDeleteConfirmation(event, 500);
  }

  const delayedCloseDeleteConfirmation = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  /**
   * Bulk Upload-Dialog handlers
   */
  const handleBulkImportClicked = (event) => {
    setUploadFileDialogOpen(true);
  }

  const handleBulkUploadCancel = (event) => {
    delayedCloseBulkUploadDialog(event, 500);
  }

  const handleBulkUploadDone = (event) => {
    delayedCloseBulkUploadDialog(event, 500);
    reloadData();
  }

  const delayedCloseBulkUploadDialog = async (event, ms) => {
    await new Promise(resolve => {
      //set timeout
      window.setTimeout(function() {
        setUploadFileDialogOpen(false);
        resolve("ok");
      }, ms);
    });
  };

  /*
   * Download CSV Template handlers
   */
  const handleCsvTemplateClicked = (event) => {
    getCsvTemplate();
  }

  return (
    <div className={classes.root}>
      {
        /* acl check */
        (permissions&&permissions.location&&Array.isArray(permissions.location)
        &&(permissions.location.includes('read') || permissions.location.includes('*')))
        &&(
          <Grid container justify='center'>
            <Grid item xs={12} md={11}>
              <Paper className={classes.paper}>

                {/* Toolbar */}
                <LocationEnhancedTableToolbar
                  permissions={permissions}
                  search={search}
                  onSearchEnter={handleSearchEnter}
                  onReloadClick={handleReloadClick}
                  handleAddClicked={handleCreateClicked}
                  handleBulkImportClicked={handleBulkImportClicked}
                  handleCsvTemplateClicked={handleCsvTemplateClicked}
                />

                {/* Table components*/}
                <div className={classes.tableWrapper} ref={twref}>

                  {/* Table backdrop */}
                  <Fade in={(isOnApiRequest)}>
                    <Box
                      className={classes.tableBackdrop}
                      bgcolor='rgba(255, 255, 255, 0.4)'
                      width={isOnApiRequest?tw:0}
                      height={isOnApiRequest?th:0}
                      p={0}
                      position="absolute"
                      top={0}
                      left={0}
                      zIndex="modal"
                    />
                  </Fade>

                  {/* Progress indicator */}
                  <Fade
                    in={(isOnApiRequest)}
                  >
                    <Box
                      className={classes.tableBackdrop}
                      bgcolor='rgba(255, 255, 255, 0.0)'
                      width={isOnApiRequest?'100%':0}
                      height={isOnApiRequest?'100%':0}
                      p={0}
                      position="absolute"
                      top={0}
                      left={tscl}
                      zIndex="modal"
                    >
                      <Grid container className={classes.tableBackdropContent} justify='center' alignContent='center' alignItems='center'>
                        <Grid item>
                          <CircularProgress color="primary" disableShrink={true} />
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>

                  {/* No-data message */}
                  <Fade
                    in={(!isOnApiRequest && count === 0)}
                  >
                    <Box
                      className={classes.tableBackdrop}
                      bgcolor='rgba(255, 255, 255, 0.0)'
                      width={(!isOnApiRequest && count === 0)?'100%':0}
                      height={(!isOnApiRequest && count === 0)?'100%':0}
                      p={0}
                      position="absolute"
                      top={0}
                      left={tscl}
                      zIndex="modal"
                    >
                      <Grid container className={classes.tableBackdropContent} justify='center' alignContent='center' alignItems='center'>
                        <Grid item>
                          <Typography variant="body1" >{ t('modelPanels.noData') }</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>

                  {/* Table */}
                  <Table stickyHeader size='small' ref={tref}>

                    {/* Table Head */}
                    <LocationEnhancedTableHead
                      permissions={permissions}
                      order={order}
                      orderBy={orderBy}
                      rowCount={count}
                      onRequestSort={handleRequestSort}
                    />

                    {/* Table Body */}
                    <Fade
                      in={(!isOnApiRequest && count > 0)}
                    >
                      <TableBody>
                        {
                          items.map((item, index) => {
                            return ([
                              /*
                                Table Row
                              */
                              <TableRow
                                hover
                                onClick={event => handleClickOnRow(event, item)}
                                role="checkbox"
                                tabIndex={-1}
                                key={item.locationId}
                              >

                                {/* SeeInfo icon */}
                                <TableCell padding="checkbox">
                                  <Tooltip title={ t('modelPanels.viewDetails') }>
                                    <IconButton
                                      color="default"
                                      onClick={event => {
                                        event.stopPropagation();
                                        handleClickOnRow(event, item);
                                      }}
                                    >
                                      <SeeInfo fontSize="small" className={classes.iconSee}/>
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>

                                {/*
                                  Actions:
                                  - Edit
                                  - Delete
                                */}

                                {/* Item fields */}

                                {/* LocationId */}
                                <TableCell
                                  key='locationId'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.locationId!==null)?item.locationId:'')}
                                </TableCell>

                                {/* Country */}
                                <TableCell
                                  key='country'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.country!==null)?item.country:'')}
                                </TableCell>

                                {/* State */}
                                <TableCell
                                  key='state'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.state!==null)?item.state:'')}
                                </TableCell>

                                {/* Municipality */}
                                <TableCell
                                  key='municipality'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.municipality!==null)?item.municipality:'')}
                                </TableCell>

                                {/* Locality */}
                                <TableCell
                                  key='locality'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.locality!==null)?item.locality:'')}
                                </TableCell>

                                {/* Latitude */}
                                <TableCell
                                  key='latitude'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.latitude!==null)?item.latitude:'')}
                                </TableCell>

                                {/* Longitude */}
                                <TableCell
                                  key='longitude'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.longitude!==null)?item.longitude:'')}
                                </TableCell>

                                {/* Altitude */}
                                <TableCell
                                  key='altitude'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.altitude!==null)?item.altitude:'')}
                                </TableCell>

                                {/* Natural_area */}
                                <TableCell
                                  key='natural_area'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.natural_area!==null)?item.natural_area:'')}
                                </TableCell>

                                {/* Natural_area_name */}
                                <TableCell
                                  key='natural_area_name'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.natural_area_name!==null)?item.natural_area_name:'')}
                                </TableCell>

                                {/* Georeference_method */}
                                <TableCell
                                  key='georeference_method'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.georeference_method!==null)?item.georeference_method:'')}
                                </TableCell>

                                {/* Georeference_source */}
                                <TableCell
                                  key='georeference_source'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.georeference_source!==null)?item.georeference_source:'')}
                                </TableCell>

                                {/* Datum */}
                                <TableCell
                                  key='datum'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.datum!==null)?item.datum:'')}
                                </TableCell>

                                {/* Vegetation */}
                                <TableCell
                                  key='vegetation'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.vegetation!==null)?item.vegetation:'')}
                                </TableCell>

                                {/* Stoniness */}
                                <TableCell
                                  key='stoniness'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.stoniness!==null)?item.stoniness:'')}
                                </TableCell>

                                {/* Sewer */}
                                <TableCell
                                  key='sewer'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.sewer!==null)?item.sewer:'')}
                                </TableCell>

                                {/* Topography */}
                                <TableCell
                                  key='topography'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.topography!==null)?item.topography:'')}
                                </TableCell>

                                {/* Slope */}
                                <TableCell
                                  key='slope'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.slope!==null)?item.slope:'')}
                                </TableCell>

                              </TableRow>,
                            ]);
                          })
                        }
                      </TableBody>
                    </Fade>
                  </Table>
                </div>

                {/*
                  Pagination
                */}
                <LocationCursorPagination
                  count={count}
                  rowsPerPageOptions={(count <=10) ? [] : (count <=50) ? [5, 10, 25, 50] : [5, 10, 25, 50, 100]}
                  rowsPerPage={rowsPerPage}
                  labelRowsPerPage = { t('modelPanels.rows') }
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  handleFirstPageButtonClick={handleFirstPageButtonClick}
                  handleLastPageButtonClick={handleLastPageButtonClick}
                  handleNextButtonClick={handleNextButtonClick}
                  handleBackButtonClick={handleBackButtonClick}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </Paper>
            </Grid>
          </Grid>
        )
      }

      {/* Dialog: Create Panel */}
      {(createDialogOpen) && (
        <LocationCreatePanel
          permissions={permissions}
          handleClose={handleCreateDialogClose}
        />
      )}

      {/* Dialog: Update Panel */}
      {(updateDialogOpen) && (
        <LocationUpdatePanel
          permissions={permissions}
          item={updateItem}
          handleClose={handleUpdateDialogClose}
        />
      )}

      {/* Dialog: Detail Panel */}
      {(detailDialogOpen) && (
        <LocationDetailPanel
          permissions={permissions}
          item={detailItem}
          dialog={true}
          handleClose={handleDetailDialogClose}
        />
      )}

      {/* Dialog: Delete Confirmation */}
      {(deleteConfirmationDialogOpen) && (
        <LocationDeleteConfirmationDialog
          permissions={permissions}
          item={deleteConfirmationItem}
          handleAccept={handleDeleteConfirmationAccept}
          handleReject={handleDeleteConfirmationReject}
        />
      )}

      {/* Dialog: Upload File */}
      {(uploadFileDialogOpen) && (
        <LocationUploadFileDialog
          handleCancel={handleBulkUploadCancel}
          handleDone={handleBulkUploadDone}
        />
      )}
    </div>
  );
}

LocationEnhancedTable.propTypes = {
  permissions: PropTypes.object,
};
