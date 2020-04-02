import React from 'react';
import PropTypes from 'prop-types';
import AccessionsToAddTransferView from './accessions-to-add-transfer-view/AccessionsToAddTransferView'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
}));

export default function AccessionsTransferLists(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    idsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleClickOnAccessionRow,
  } = props;
  
  return (
    <div>
      <Fade in={true} timeout={500}>
        <Grid
          className={classes.root} 
          container 
          justify='center'
          alignItems='flex-start'
          alignContent='flex-start'
          spacing={2}
        > 
          <Grid item xs={12}>
            <Grid container justify='flex-start'>
              <Grid item>
                <Typography variant="body2" display='inline'>
                  { t('modelPanels.toAddHelperA', "Please select ") }
                </Typography>
                <Typography variant="body2" display='inline'>
                  <b>{  t('modelPanels.theRecords', "the records ") }</b>
                </Typography>
                <Typography variant="body2" display='inline'>
                  { t('modelPanels.toAddHelperB', " that you want to be associated with this ") }
                </Typography>
                <Typography variant="body2" display='inline'>
                  <b>{ 'Taxon.' }</b>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <AccessionsToAddTransferView
              idsToAdd={idsToAdd}
              handleTransfer={handleTransferToAdd}
              handleUntransfer={handleUntransferFromAdd}
              handleClickOnAccessionRow={handleClickOnAccessionRow}
            />
          </Grid>

        </Grid>
      </Fade>
    </div>
  );
}
AccessionsTransferLists.propTypes = {
  idsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleClickOnAccessionRow: PropTypes.func.isRequired,
};