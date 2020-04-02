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

export default function TaxonAttributesFormView(props) {
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
                    { t('modelPanels.model') + ': Taxon' }
                </Typography>
              }
              subheader={getItemsOk()+' / 15 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>

          <Card className={classes.card}>
            {/* 
              Fields 
            */}

        

            {/* id */}
            <CardContent key='id' className={classes.cardContent} >
              <StringField
                itemKey='id'
                name='id'
                label='id'
                text={item.id}
                valueOk={valueOkStates.id}
                autoFocus={true}
              />
            </CardContent>

            {/* taxon */}
            <CardContent key='taxon' className={classes.cardContent} >
              <StringField
                itemKey='taxon'
                name='taxon'
                label='taxon'
                text={item.taxon}
                valueOk={valueOkStates.taxon}
              />
            </CardContent>

            {/* categoria */}
            <CardContent key='categoria' className={classes.cardContent} >
              <StringField
                itemKey='categoria'
                name='categoria'
                label='categoria'
                text={item.categoria}
                valueOk={valueOkStates.categoria}
              />
            </CardContent>

            {/* estatus */}
            <CardContent key='estatus' className={classes.cardContent} >
              <StringField
                itemKey='estatus'
                name='estatus'
                label='estatus'
                text={item.estatus}
                valueOk={valueOkStates.estatus}
              />
            </CardContent>

            {/* nombreAutoridad */}
            <CardContent key='nombreAutoridad' className={classes.cardContent} >
              <StringField
                itemKey='nombreAutoridad'
                name='nombreAutoridad'
                label='nombreAutoridad'
                text={item.nombreAutoridad}
                valueOk={valueOkStates.nombreAutoridad}
              />
            </CardContent>

            {/* citaNomenclatural */}
            <CardContent key='citaNomenclatural' className={classes.cardContent} >
              <StringField
                itemKey='citaNomenclatural'
                name='citaNomenclatural'
                label='citaNomenclatural'
                text={item.citaNomenclatural}
                valueOk={valueOkStates.citaNomenclatural}
              />
            </CardContent>

            {/* fuente */}
            <CardContent key='fuente' className={classes.cardContent} >
              <StringField
                itemKey='fuente'
                name='fuente'
                label='fuente'
                text={item.fuente}
                valueOk={valueOkStates.fuente}
              />
            </CardContent>

            {/* ambiente */}
            <CardContent key='ambiente' className={classes.cardContent} >
              <StringField
                itemKey='ambiente'
                name='ambiente'
                label='ambiente'
                text={item.ambiente}
                valueOk={valueOkStates.ambiente}
              />
            </CardContent>

            {/* grupoSNIB */}
            <CardContent key='grupoSNIB' className={classes.cardContent} >
              <StringField
                itemKey='grupoSNIB'
                name='grupoSNIB'
                label='grupoSNIB'
                text={item.grupoSNIB}
                valueOk={valueOkStates.grupoSNIB}
              />
            </CardContent>

            {/* categoriaResidencia */}
            <CardContent key='categoriaResidencia' className={classes.cardContent} >
              <StringField
                itemKey='categoriaResidencia'
                name='categoriaResidencia'
                label='categoriaResidencia'
                text={item.categoriaResidencia}
                valueOk={valueOkStates.categoriaResidencia}
              />
            </CardContent>

            {/* nom */}
            <CardContent key='nom' className={classes.cardContent} >
              <StringField
                itemKey='nom'
                name='nom'
                label='nom'
                text={item.nom}
                valueOk={valueOkStates.nom}
              />
            </CardContent>

            {/* cites */}
            <CardContent key='cites' className={classes.cardContent} >
              <StringField
                itemKey='cites'
                name='cites'
                label='cites'
                text={item.cites}
                valueOk={valueOkStates.cites}
              />
            </CardContent>

            {/* iucn */}
            <CardContent key='iucn' className={classes.cardContent} >
              <StringField
                itemKey='iucn'
                name='iucn'
                label='iucn'
                text={item.iucn}
                valueOk={valueOkStates.iucn}
              />
            </CardContent>

            {/* prioritarias */}
            <CardContent key='prioritarias' className={classes.cardContent} >
              <StringField
                itemKey='prioritarias'
                name='prioritarias'
                label='prioritarias'
                text={item.prioritarias}
                valueOk={valueOkStates.prioritarias}
              />
            </CardContent>

            {/* endemismo */}
            <CardContent key='endemismo' className={classes.cardContent} >
              <StringField
                itemKey='endemismo'
                name='endemismo'
                label='endemismo'
                text={item.endemismo}
                valueOk={valueOkStates.endemismo}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
TaxonAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
};