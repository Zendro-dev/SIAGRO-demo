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

import IntField from './components/IntField'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    maxHeight: '57vh',
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
  ibox: {
    padding: theme.spacing(2),
  },
}));

export default function IndividualAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { item, valueOkStates } = props;

  function getItemsOk() {
    let countOk=0;
    let a = Object.entries(valueOkStates);
    for( let i=0; i<a.length; ++i ) {
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
                    { t('modelPanels.model') + ': Individual' }
                </Typography>
              }
              subheader={getItemsOk()+' / 5 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>

          <Card className={classes.card}>
            {/* 
              Fields 
            */}

        

            {/* name */}
            <CardContent key='name' className={classes.cardContent} >
              <StringField
                itemKey='name'
                name='name'
                label='name'
                text={item.name}
                valueOk={valueOkStates.name}
                autoFocus={true}
              />
            </CardContent>

            {/* origin */}
            <CardContent key='origin' className={classes.cardContent} >
              <StringField
                itemKey='origin'
                name='origin'
                label='origin'
                text={item.origin}
                valueOk={valueOkStates.origin}
              />
            </CardContent>

            {/* description */}
            <CardContent key='description' className={classes.cardContent} >
              <StringField
                itemKey='description'
                name='description'
                label='description'
                text={item.description}
                valueOk={valueOkStates.description}
              />
            </CardContent>

            {/* genotypeId */}
            <CardContent key='genotypeId' className={classes.cardContent} >
              <IntField
                itemKey='genotypeId'
                name='genotypeId'
                label='genotypeId'
                text={item.genotypeId}
                isForeignKey={false}
                valueOk={valueOkStates.genotypeId}
              />
            </CardContent>

            {/* field_unit_id */}
            <CardContent key='field_unit_id' className={classes.cardContent} >
              <IntField
                itemKey='field_unit_id'
                name='field_unit_id'
                label='field_unit_id'
                text={item.field_unit_id}
                isForeignKey={false}
                valueOk={valueOkStates.field_unit_id}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
IndividualAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
};