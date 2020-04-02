import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Attributes from '@material-ui/icons/HdrWeakTwoTone';


import StringField from './components/StringField'

import DateField from './components/DateField'

import IntField from './components/IntField'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
  card: {
    margin: theme.spacing(0),
    maxHeight: '70vh',
    overflow: 'auto',
  },
  cardB: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
  },
  cardContent: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(5),
    minWidth: 200,
  },
}));

export default function AccessionAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { valueOkStates,
          handleSetValue,
        } = props;

  function getItemsOk() {
    let countOk=0;
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 1) {
        countOk++;
      }
    }
    return countOk;
  }

  return (
    <div className={classes.root}>
      <Grid container justify='center'>
        <Grid item xs={12}>

          <Card className={classes.cardB} elevation={0}>
            {/* Header */}
            <CardHeader
              avatar={
                <Attributes color="primary" fontSize="small" />
              }
              title={
                <Typography variant="h6">
                    { t('modelPanels.model') + ': Accession' }
                </Typography>
              }
              subheader={getItemsOk()+' / 31 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>
            
          <Card className={classes.card}>
            {/* 
              Fields 
            */}

            {/* accession_id */}
            <CardContent key='accession_id' className={classes.cardContent} >
              <StringField
                itemKey='accession_id'
                name='accession_id'
                label='accession_id'
                valueOk={valueOkStates.accession_id}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collectors_name */}
            <CardContent key='collectors_name' className={classes.cardContent} >
              <StringField
                itemKey='collectors_name'
                name='collectors_name'
                label='collectors_name'
                valueOk={valueOkStates.collectors_name}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collectors_initials */}
            <CardContent key='collectors_initials' className={classes.cardContent} >
              <StringField
                itemKey='collectors_initials'
                name='collectors_initials'
                label='collectors_initials'
                valueOk={valueOkStates.collectors_initials}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* sampling_date */}
            <CardContent key='sampling_date' className={classes.cardContent} >
              <DateField
                itemKey='sampling_date'
                name='sampling_date'
                label='sampling_date'
                valueOk={valueOkStates.sampling_date}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* sampling_number */}
            <CardContent key='sampling_number' className={classes.cardContent} >
              <StringField
                itemKey='sampling_number'
                name='sampling_number'
                label='sampling_number'
                valueOk={valueOkStates.sampling_number}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* catalog_number */}
            <CardContent key='catalog_number' className={classes.cardContent} >
              <StringField
                itemKey='catalog_number'
                name='catalog_number'
                label='catalog_number'
                valueOk={valueOkStates.catalog_number}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* institution_deposited */}
            <CardContent key='institution_deposited' className={classes.cardContent} >
              <StringField
                itemKey='institution_deposited'
                name='institution_deposited'
                label='institution_deposited'
                valueOk={valueOkStates.institution_deposited}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collection_name */}
            <CardContent key='collection_name' className={classes.cardContent} >
              <StringField
                itemKey='collection_name'
                name='collection_name'
                label='collection_name'
                valueOk={valueOkStates.collection_name}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collection_acronym */}
            <CardContent key='collection_acronym' className={classes.cardContent} >
              <StringField
                itemKey='collection_acronym'
                name='collection_acronym'
                label='collection_acronym'
                valueOk={valueOkStates.collection_acronym}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* identified_by */}
            <CardContent key='identified_by' className={classes.cardContent} >
              <StringField
                itemKey='identified_by'
                name='identified_by'
                label='identified_by'
                valueOk={valueOkStates.identified_by}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* identification_date */}
            <CardContent key='identification_date' className={classes.cardContent} >
              <DateField
                itemKey='identification_date'
                name='identification_date'
                label='identification_date'
                valueOk={valueOkStates.identification_date}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* abundance */}
            <CardContent key='abundance' className={classes.cardContent} >
              <StringField
                itemKey='abundance'
                name='abundance'
                label='abundance'
                valueOk={valueOkStates.abundance}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* habitat */}
            <CardContent key='habitat' className={classes.cardContent} >
              <StringField
                itemKey='habitat'
                name='habitat'
                label='habitat'
                valueOk={valueOkStates.habitat}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* observations */}
            <CardContent key='observations' className={classes.cardContent} >
              <StringField
                itemKey='observations'
                name='observations'
                label='observations'
                valueOk={valueOkStates.observations}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* family */}
            <CardContent key='family' className={classes.cardContent} >
              <StringField
                itemKey='family'
                name='family'
                label='family'
                valueOk={valueOkStates.family}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* genus */}
            <CardContent key='genus' className={classes.cardContent} >
              <StringField
                itemKey='genus'
                name='genus'
                label='genus'
                valueOk={valueOkStates.genus}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* species */}
            <CardContent key='species' className={classes.cardContent} >
              <StringField
                itemKey='species'
                name='species'
                label='species'
                valueOk={valueOkStates.species}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* subspecies */}
            <CardContent key='subspecies' className={classes.cardContent} >
              <StringField
                itemKey='subspecies'
                name='subspecies'
                label='subspecies'
                valueOk={valueOkStates.subspecies}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* variety */}
            <CardContent key='variety' className={classes.cardContent} >
              <StringField
                itemKey='variety'
                name='variety'
                label='variety'
                valueOk={valueOkStates.variety}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* race */}
            <CardContent key='race' className={classes.cardContent} >
              <StringField
                itemKey='race'
                name='race'
                label='race'
                valueOk={valueOkStates.race}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* form */}
            <CardContent key='form' className={classes.cardContent} >
              <StringField
                itemKey='form'
                name='form'
                label='form'
                valueOk={valueOkStates.form}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collection_deposit */}
            <CardContent key='collection_deposit' className={classes.cardContent} >
              <StringField
                itemKey='collection_deposit'
                name='collection_deposit'
                label='collection_deposit'
                valueOk={valueOkStates.collection_deposit}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collect_number */}
            <CardContent key='collect_number' className={classes.cardContent} >
              <StringField
                itemKey='collect_number'
                name='collect_number'
                label='collect_number'
                valueOk={valueOkStates.collect_number}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collect_source */}
            <CardContent key='collect_source' className={classes.cardContent} >
              <StringField
                itemKey='collect_source'
                name='collect_source'
                label='collect_source'
                valueOk={valueOkStates.collect_source}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collected_seeds */}
            <CardContent key='collected_seeds' className={classes.cardContent} >
              <IntField
                itemKey='collected_seeds'
                name='collected_seeds'
                label='collected_seeds'
                valueOk={valueOkStates.collected_seeds}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collected_plants */}
            <CardContent key='collected_plants' className={classes.cardContent} >
              <IntField
                itemKey='collected_plants'
                name='collected_plants'
                label='collected_plants'
                valueOk={valueOkStates.collected_plants}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* collected_other */}
            <CardContent key='collected_other' className={classes.cardContent} >
              <StringField
                itemKey='collected_other'
                name='collected_other'
                label='collected_other'
                valueOk={valueOkStates.collected_other}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* habit */}
            <CardContent key='habit' className={classes.cardContent} >
              <StringField
                itemKey='habit'
                name='habit'
                label='habit'
                valueOk={valueOkStates.habit}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* local_name */}
            <CardContent key='local_name' className={classes.cardContent} >
              <StringField
                itemKey='local_name'
                name='local_name'
                label='local_name'
                valueOk={valueOkStates.local_name}
                handleSetValue={handleSetValue}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
AccessionAttributesFormView.propTypes = {
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};