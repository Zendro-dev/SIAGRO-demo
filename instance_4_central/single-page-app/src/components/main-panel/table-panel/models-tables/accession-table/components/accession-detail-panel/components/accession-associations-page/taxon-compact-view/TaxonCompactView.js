import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import api from '../../../../../../../../../../requests/requests.index.js';
import { makeCancelable } from '../../../../../../../../../../utils'
import TaxonCompactViewToolbar from './components/TaxonCompactViewToolbar';
import TaxonCompactViewCursorPagination from './components/TaxonCompactViewCursorPagination';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minWidth: 200,
  },
  card: {
    margin: theme.spacing(1),
    height: 'auto',
    maxHeight: `calc(64vh + 52px)`,
    overflow: 'auto',
    position: "relative",
  },
  listBox: {
    height: 'auto',
    minHeight: 82,
    maxHeight: '33vh',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  noDataBox: {
    width: "100%",
    height: 'auto',
    minHeight: 82,
    maxHeight: '33vh',
  },
  loadingBox: {
    width: "100%",
    height: '100%',
    maxHeight: '33vh',
  },
  row: {
    maxHeight: 70,
  },
  id: {
    width: 50,
  },
  dividerV: {
    height: 50,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  notiErrorActionText: {
    color: '#eba0a0',
  },
}));

export default function TaxonCompactView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    item,
    handleClickOnTaxonRow,
  } = props;

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [isOnApiRequest, setIsOnApiRequest] = useState(false);
  const [isCountReady, setIsCountReady] = useState(false);
  const [areItemsReady, setAreItemsReady] = useState(false);
  const [dataTrigger, setDataTrigger] = useState(false);
  const isPendingApiRequestRef = useRef(false);
  const isOnApiRequestRef = useRef(false);
  const isGettingFirstDataRef = useRef(true);
  const pageRef = useRef(0);
  const lastFetchTime = useRef(null);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageInfo = useRef({startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false});
  const isForwardPagination = useRef(true);
  const isCursorPaginating = useRef(false);
  const includeCursor = useRef(false);

  const cancelablePromises = useRef([]);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl)
  const lastModelChanged = useSelector(state => state.changes.lastModelChanged);
  const lastChangeTimestamp = useSelector(state => state.changes.lastChangeTimestamp);

  const actionText = useRef(null);
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

  const lref = useRef(null);
  const [lh, setLh] = useState(82);

  /**
   * getData
   * 
   * Get @items and @count from GrahpQL Server.
   * Uses current state properties to fill query request.
   * Updates state to inform new @items and @count retreived.
   * 
   */
  const getData = useCallback(() => {
    isOnApiRequestRef.current = true;
    setIsOnApiRequest(true);
    Boolean(dataTrigger); //avoid warning

    /*
      API Request: TaxonFilter
    */
    let label = 'scientificName';
    let sublabel = 'taxonRank';
    let variables = {
      pagination: {
        after: isForwardPagination.current ? pageInfo.current.endCursor : null,
        before: !isForwardPagination.current ? pageInfo.current.startCursor : null,
        first: isForwardPagination.current ? rowsPerPage : null,
        last: !isForwardPagination.current ? rowsPerPage : null,
        includeCursor: includeCursor.current,
      }
    };
    let cancelableApiReq = makeCancelable(api.accession.getTaxonConnection(
      graphqlServerUrl, 
      item.accession_id,
      label,
      sublabel,
      search,
      variables
    ));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
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
 
          let it = response.data.data.readOneAccession.taxon;

          //ok
          setCount((it&&typeof it==='object') ? 1 : 0);
          setItems((it&&typeof it==='object') ? [it] : []);
          isOnApiRequestRef.current = false;
          isCursorPaginating.current = false;
          includeCursor.current = false;
          setIsOnApiRequest(false);
          return;

        } else { //error: bad response on getAssociationFilter()
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
      .catch(({isCanceled, ...err}) => { //error: on getAssociationFilter()
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
  }, [graphqlServerUrl, enqueueSnackbar, t, dataTrigger, item.accession_id, search, rowsPerPage]);

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
     * The peer relation 'accessions' for this item was updated.
     * That is to say that this current item was associated or dis-associated with some 'Taxon',
     * but this action happened on the peer relation 'accessions'.
     * 
     * Conditions:
     * A: the current item 'internalId' attribute is in the removedIds of the updated 'Taxon'.
     * B: the current item 'internalId' attribute is in the addedIds of the updated 'Taxon'.
     * 
     * Actions:
     * if A:
     * - reload table.
     * - return
     * 
     * else if B:
     * - reload table.
     * - return
     */
    if(lastModelChanged.Taxon) {
      let oens = Object.entries(lastModelChanged.Taxon);
      oens.forEach( (entry) => {
        if(entry[1].changedAssociations&&
          entry[1].changedAssociations.accessions) {

            //case A: this item was removed from peer relation.
            if(entry[1].changedAssociations.accessions.removed) {
              let idsRemoved = entry[1].changedAssociations.accessions.idsRemoved;
              if(idsRemoved) {
                let iof = idsRemoved.indexOf(item.accession_id);
                if(iof !== -1) {
                  //reload
                  updateHeights();
                  //strict contention
                  if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
                    //configure
                    isForwardPagination.current = true;
                    pageInfo.current.endCursor = pageInfo.current.startCursor;
                    includeCursor.current = true;
                    //reload
                    setDataTrigger(prevDataTrigger => !prevDataTrigger);
                  }
                  return;
                }
              }
            }//end: case A

            //case B: this item was added on peer relation.
            if(entry[1].changedAssociations.accessions.added) {
              let idsAdded = entry[1].changedAssociations.accessions.idsAdded;
              if(idsAdded) {
                let iof = idsAdded.indexOf(item.accession_id);
                if(iof !== -1) {
                  //reload
                  updateHeights();
                  //strict contention
                  if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
                    //configure
                    isForwardPagination.current = true;
                    pageInfo.current.endCursor = pageInfo.current.startCursor;
                    includeCursor.current = true;
                    //reload
                    setDataTrigger(prevDataTrigger => !prevDataTrigger);
                  }
                  return;
                }
              }
            }//end: case B
        }
      })
    }//end: Case 1

    /*
     * Case 2: 
     * The attributes of some 'Taxon' were modified or the item was deleted.
     * 
     * Conditions:
     * A: the item was modified and is currently displayed in the list.
     * B: the item was deleted and is currently displayed the  list.
     * 
     * Actions:
     * if A:
     * - update the list with the new item.
     * - return
     * 
     * if B:
     * - reload table.
     * - return
     */
    if(lastModelChanged.Taxon) {

      let oens = Object.entries(lastModelChanged.Taxon);
      oens.forEach( (entry) => {
        
        //case A: updated
        if(entry[1].op === "update"&&entry[1].newItem) {
          let idUpdated = entry[1].item.id;
          
          //lookup item on table
          let nitemsA = Array.from(items);
          let iofA = nitemsA.findIndex((item) => item.id===idUpdated);
          if(iofA !== -1) {
            //set new item
            nitemsA[iofA] = entry[1].newItem;
            setItems(nitemsA);
          }
        }

        //case B: deleted
        if(entry[1].op === "delete") {
          let idRemoved = entry[1].item.id;

          //lookup item on table
          let iofA = items.findIndex((item) => item.id===idRemoved);
          if(iofA !== -1) {
            //reload
            updateHeights();
            //strict contention
            if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
              //configure
              isForwardPagination.current = true;
              pageInfo.current.endCursor = pageInfo.current.startCursor;
              includeCursor.current = true;
              //reload
              setDataTrigger(prevDataTrigger => !prevDataTrigger);
            }

            return;
          }
        }
      });
    }//end: Case 2
  }, [lastModelChanged, lastChangeTimestamp, items, item.accession_id]);

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
    updateHeights();
  }, [isOnApiRequest]);

  useEffect(() => {
    if(Array.isArray(items) && items.length > 0) { 
      setAreItemsReady(true); 
    } else { 
      setAreItemsReady(false); 
    }
    lastFetchTime.current = Date.now();
  }, [items]);

  useEffect(() => {
    if(count === 0) {
      setIsCountReady(false);

    } else {
      setIsCountReady(true);
    }
  }, [count]);

  function updateHeights() {
    if(lref.current) {
      let h =lref.current.clientHeight;
      setLh(h);
    }
  }

  function resetPageRefs() {
    isForwardPagination.current = true;
    pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
    setHasPreviousPage(pageInfo.current.hasPreviousPage);
    setHasNextPage(pageInfo.current.hasNextPage);
    includeCursor.current = false;
    pageRef.current = 0;
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

  /**
   * Handlers
   */

  /*
   * Search handlers
   */
  const handleSearchEnter = text => {
    updateHeights();

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
   * Items handlers
   */

  const handleRowClicked = (event, item) => {
    handleClickOnTaxonRow(event, item);
  }

  return (
    <div className={classes.root}>
      <Grid container>
        {/*
          * Compact List
          */}
        <Grid item xs={12} >
          {(item!==undefined) && (
            <Card className={classes.card}>

              {/* Toolbar */}
              <TaxonCompactViewToolbar 
                title={'Taxon'}
                search={search}
                onSearchEnter={handleSearchEnter}
                onReloadClick={handleReloadClick}
              />

              {/* Case: no data */}
              {(!isOnApiRequest && (!areItemsReady || !isCountReady)) && (
                /* Label */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Grid className={classes.noDataBox} container justify="center" alignItems="center">
                          <Grid item>
                            <Typography variant="body1" >{ t('modelPanels.noData') }</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Case: data ready */}
              {(!isOnApiRequest && areItemsReady && isCountReady) && (
              
                /* List */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <Box className={classes.listBox} ref={lref}>
                    <List dense component="div" role="list" >
                      {items.map(it => {
                        let key = it.id;
                        let label = it.scientificName;
                        let sublabel = it.taxonRank;
       
                        return (
                          <ListItem key={key} 
                            role="listitem" 
                            button 
                            className={classes.row}
                            onClick={(event) => {
                              handleRowClicked(event, it);
                            }}
                          >
                            <Grid container justify='center' alignItems='center'>
                              <Grid item xs={12}>
                                <Grid container justify='flex-start' alignItems='center' wrap='nowrap'>
                                  
                                  {/* accession_id*/}
                                  <Grid item>
                                    <Typography className={classes.id} variant="caption" display="block" noWrap={true}>{it.id}</Typography>
                                  </Grid>

                                  {/* Divider */}
                                  <Grid item>
                                    <Divider className={classes.dividerV} orientation="vertical" />
                                  </Grid>

                                  <Grid item xs={10}>

                                    {/* Label */}
                                    {(label !== undefined && label !== null) && (
                                      <Typography variant="body1" display="block" noWrap={true}>{label}</Typography>
                                    )}
                                    
                                    {/* Sublabel */}
                                    {(sublabel !== undefined && sublabel !== null) && (
                                      <Typography variant="caption" display="block" color='textSecondary' noWrap={true}>{sublabel}<b></b> </Typography>
                                    )}
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </ListItem>
                        );
                      })}
                      <ListItem />
                    </List>
                  </Box>
                </Fade>
              )}
              {/* Case: loading */}
              {(isOnApiRequest) && (
                /* Progress */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Box height={lh}>
                          <Grid container className={classes.loadingBox} justify="center" alignItems="center">
                            <Grid item>
                              <CircularProgress color='primary' disableShrink />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Pagination */}
              {(false) && (
                
                <TaxonCompactViewCursorPagination
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
              )}
            </Card>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
TaxonCompactView.propTypes = {
  item: PropTypes.object.isRequired,
  handleClickOnTaxonRow: PropTypes.func,
};