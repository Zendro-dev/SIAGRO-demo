import React from 'react';
import PropTypes from 'prop-types';
import MeasurementsToAddTransferView from './measurements-to-add-transfer-view/MeasurementsToAddTransferView'
import MeasurementsToRemoveTransferView from './measurements-to-remove-transfer-view/MeasurementsToRemoveTransferView'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
}));

export default function MeasurementsTransferLists(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    item,
    idsToAdd,
    idsToRemove,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleTransferToRemove,
    handleUntransferFromRemove,
    handleClickOnMeasurementRow,
  } = props;
  
  return (
    <div>
      <Fade in={true} timeout={500}>
        <Grid
          className={classes.root} 
          container 
          justify='center'
          alignItems='flex-start'
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
                  <b>{ 'Accession.' }</b>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MeasurementsToAddTransferView
              item={item}
              idsToAdd={idsToAdd}
              handleTransfer={handleTransferToAdd}
              handleUntransfer={handleUntransferFromAdd}
              handleClickOnMeasurementRow={handleClickOnMeasurementRow}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
            <Grid container justify='flex-start'>
              <Grid item>
                <Typography variant="body2" display='inline'>
                  { t('modelPanels.toRemoveHelperA', "Please select ") }
                </Typography>
                <Typography variant="body2" display='inline'>
                  <b>{  t('modelPanels.theRecords', "the records ") }</b>
                </Typography>
                <Typography variant="body2" display='inline'>
                  { t('modelPanels.toRemoveHelperB', " that you no longer want to be associated with this ") }
                </Typography>
                <Typography variant="body2" display='inline'>
                  <b>{ 'Accession.' }</b>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MeasurementsToRemoveTransferView
              item={item}
              idsToRemove={idsToRemove}
              handleTransfer={handleTransferToRemove}
              handleUntransfer={handleUntransferFromRemove}
              handleClickOnMeasurementRow={handleClickOnMeasurementRow}
            />
          </Grid>

        </Grid>
      </Fade>
    </div>
  );
}
MeasurementsTransferLists.propTypes = {
  item: PropTypes.object.isRequired,
  idsToAdd: PropTypes.array.isRequired,
  idsToRemove: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleTransferToRemove: PropTypes.func.isRequired,
  handleUntransferFromRemove: PropTypes.func.isRequired,
  handleClickOnMeasurementRow: PropTypes.func.isRequired,    
};