import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changesCompleted, clearChanges } from '../../../../../store/actions'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import moment from "moment";
import PropTypes from 'prop-types';
import api from '../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../utils'
import AccessionEnhancedTableHead from './components/AccessionEnhancedTableHead'
import AccessionEnhancedTableToolbar from './components/AccessionEnhancedTableToolbar'
import AccessionCreatePanel from './components/accession-create-panel/AccessionCreatePanel'
import AccessionUpdatePanel from './components/accession-update-panel/AccessionUpdatePanel'
import AccessionDetailPanel from './components/accession-detail-panel/AccessionDetailPanel'
import AccessionDeleteConfirmationDialog from './components/AccessionDeleteConfirmationDialog'
import AccessionUploadFileDialog from './components/AccessionUploadFileDialog'
import AccessionCursorPagination from './components/AccessionCursorPagination'
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

export default function AccessionEnhancedTable(props) {
  const classes = useStyles();
  const { permissions } = props;
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('accession_id');
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
    let cancelableApiReq = makeCancelable(api.accession.getCountItems(graphqlServerUrl, search));
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
          var newCount = response.data.data.countAccessions;


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
          let cancelableApiReqB = makeCancelable(api.accession.getItemsConnection(
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
                let its = response.data.data.accessionsConnection.edges.map(o => o.node);
                let pi = response.data.data.accessionsConnection.pageInfo;
                
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

    //set accession_id (internalId)
    variables.accession_id = item.accession_id;

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
    let cancelableApiReq = makeCancelable(api.accession.tableTemplate(graphqlServerUrl));
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
          response.data.data.csvTableTemplateAccession        ) {
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
            let file = response.data.data.csvTableTemplateAccession.join("\n");
            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "accession-template.csv");
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
        (permissions&&permissions.accession&&Array.isArray(permissions.accession)
        &&(permissions.accession.includes('read') || permissions.accession.includes('*')))
        &&(
          <Grid container justify='center'>
            <Grid item xs={12} md={11}>
              <Paper className={classes.paper}>

                {/* Toolbar */}
                <AccessionEnhancedTableToolbar
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
                    <AccessionEnhancedTableHead
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
                                key={item.accession_id}
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

                                {/* Accession_id */}
                                <TableCell
                                  key='accession_id'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.accession_id!==null)?item.accession_id:'')}
                                </TableCell>

                                {/* Collectors_name */}
                                <TableCell
                                  key='collectors_name'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collectors_name!==null)?item.collectors_name:'')}
                                </TableCell>

                                {/* Collectors_initials */}
                                <TableCell
                                  key='collectors_initials'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collectors_initials!==null)?item.collectors_initials:'')}
                                </TableCell>

                                {/* Sampling_date */}
                                <TableCell
                                  key='sampling_date'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.sampling_date!==null)?moment(item.sampling_date, "YYYY-MM-DD").format("YYYY-MM-DD"):'')}
                                </TableCell>

                                {/* Sampling_number */}
                                <TableCell
                                  key='sampling_number'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.sampling_number!==null)?item.sampling_number:'')}
                                </TableCell>

                                {/* Catalog_number */}
                                <TableCell
                                  key='catalog_number'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.catalog_number!==null)?item.catalog_number:'')}
                                </TableCell>

                                {/* Institution_deposited */}
                                <TableCell
                                  key='institution_deposited'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.institution_deposited!==null)?item.institution_deposited:'')}
                                </TableCell>

                                {/* Collection_name */}
                                <TableCell
                                  key='collection_name'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collection_name!==null)?item.collection_name:'')}
                                </TableCell>

                                {/* Collection_acronym */}
                                <TableCell
                                  key='collection_acronym'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collection_acronym!==null)?item.collection_acronym:'')}
                                </TableCell>

                                {/* Identified_by */}
                                <TableCell
                                  key='identified_by'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.identified_by!==null)?item.identified_by:'')}
                                </TableCell>

                                {/* Identification_date */}
                                <TableCell
                                  key='identification_date'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.identification_date!==null)?moment(item.identification_date, "YYYY-MM-DD").format("YYYY-MM-DD"):'')}
                                </TableCell>

                                {/* Abundance */}
                                <TableCell
                                  key='abundance'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.abundance!==null)?item.abundance:'')}
                                </TableCell>

                                {/* Habitat */}
                                <TableCell
                                  key='habitat'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.habitat!==null)?item.habitat:'')}
                                </TableCell>

                                {/* Observations */}
                                <TableCell
                                  key='observations'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.observations!==null)?item.observations:'')}
                                </TableCell>

                                {/* Family */}
                                <TableCell
                                  key='family'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.family!==null)?item.family:'')}
                                </TableCell>

                                {/* Genus */}
                                <TableCell
                                  key='genus'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.genus!==null)?item.genus:'')}
                                </TableCell>

                                {/* Species */}
                                <TableCell
                                  key='species'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.species!==null)?item.species:'')}
                                </TableCell>

                                {/* Subspecies */}
                                <TableCell
                                  key='subspecies'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.subspecies!==null)?item.subspecies:'')}
                                </TableCell>

                                {/* Variety */}
                                <TableCell
                                  key='variety'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.variety!==null)?item.variety:'')}
                                </TableCell>

                                {/* Race */}
                                <TableCell
                                  key='race'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.race!==null)?item.race:'')}
                                </TableCell>

                                {/* Form */}
                                <TableCell
                                  key='form'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.form!==null)?item.form:'')}
                                </TableCell>

                                {/* Taxon_id */}
                                <TableCell
                                  key='taxon_id'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.taxon_id!==null)?item.taxon_id:'')}
                                </TableCell>

                                {/* Collection_deposit */}
                                <TableCell
                                  key='collection_deposit'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collection_deposit!==null)?item.collection_deposit:'')}
                                </TableCell>

                                {/* Collect_number */}
                                <TableCell
                                  key='collect_number'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collect_number!==null)?item.collect_number:'')}
                                </TableCell>

                                {/* Collect_source */}
                                <TableCell
                                  key='collect_source'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collect_source!==null)?item.collect_source:'')}
                                </TableCell>

                                {/* Collected_seeds */}
                                <TableCell
                                  key='collected_seeds'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.collected_seeds!==null)?item.collected_seeds:'')}
                                </TableCell>

                                {/* Collected_plants */}
                                <TableCell
                                  key='collected_plants'
                                  align='right'
                                  padding="default"
                                >
                                  {String((item.collected_plants!==null)?item.collected_plants:'')}
                                </TableCell>

                                {/* Collected_other */}
                                <TableCell
                                  key='collected_other'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.collected_other!==null)?item.collected_other:'')}
                                </TableCell>

                                {/* Habit */}
                                <TableCell
                                  key='habit'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.habit!==null)?item.habit:'')}
                                </TableCell>

                                {/* Local_name */}
                                <TableCell
                                  key='local_name'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.local_name!==null)?item.local_name:'')}
                                </TableCell>

                                {/* LocationId */}
                                <TableCell
                                  key='locationId'
                                  align='left'
                                  padding="default"
                                >
                                  {String((item.locationId!==null)?item.locationId:'')}
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
                <AccessionCursorPagination
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
        <AccessionCreatePanel
          permissions={permissions}
          handleClose={handleCreateDialogClose}
        />
      )}

      {/* Dialog: Update Panel */}
      {(updateDialogOpen) && (
        <AccessionUpdatePanel
          permissions={permissions}
          item={updateItem}
          handleClose={handleUpdateDialogClose}
        />
      )}

      {/* Dialog: Detail Panel */}
      {(detailDialogOpen) && (
        <AccessionDetailPanel
          permissions={permissions}
          item={detailItem}
          dialog={true}
          handleClose={handleDetailDialogClose}
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

      {/* Dialog: Upload File */}
      {(uploadFileDialogOpen) && (
        <AccessionUploadFileDialog
          handleCancel={handleBulkUploadCancel}
          handleDone={handleBulkUploadDone}
        />
      )}
    </div>
  );
}

AccessionEnhancedTable.propTypes = {
  permissions: PropTypes.object,
};
