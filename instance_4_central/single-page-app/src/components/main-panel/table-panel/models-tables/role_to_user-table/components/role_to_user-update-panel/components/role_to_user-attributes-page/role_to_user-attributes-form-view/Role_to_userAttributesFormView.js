import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Attributes from '@material-ui/icons/HdrWeakTwoTone';


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

export default function RoleToUserAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { item, 
          valueOkStates,
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
                    { t('modelPanels.model') + ': Role_to_user' }
                </Typography>
              }
              subheader={getItemsOk()+' / 2 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>

          <Card className={classes.card}>
            {/* 
              Fields 
            */}

            {/* id*/}
            <CardContent key='id' className={classes.cardContent}>
              <Typography variant="h6" display="inline">id:</Typography>
              <Typography variant="h6" display="inline" color="textSecondary">&nbsp;{item.id}</Typography>
            </CardContent>
            

            {/* userId */}
            <CardContent key='userId' className={classes.cardContent} >
              <IntField
                itemKey='userId'
                name='userId'
                label='userId'
                text={item.userId}
                valueOk={valueOkStates.userId}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* roleId */}
            <CardContent key='roleId' className={classes.cardContent} >
              <IntField
                itemKey='roleId'
                name='roleId'
                label='roleId'
                text={item.roleId}
                valueOk={valueOkStates.roleId}
                handleSetValue={handleSetValue}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
RoleToUserAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};

