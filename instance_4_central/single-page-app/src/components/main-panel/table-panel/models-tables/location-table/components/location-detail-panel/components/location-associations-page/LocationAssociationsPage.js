import React from 'react';
import PropTypes from 'prop-types';
import AccessionsCompactView from './accessions-compact-view/AccessionsCompactView'
import LocationAssociationsMenuTabs from './LocationAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: `calc(57vh + 84px)`,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function LocationAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnAccessionRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('accessions');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <LocationAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Accessions Compact View */}
        {(associationSelected === 'accessions') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <AccessionsCompactView
              item={item}
              handleClickOnAccessionRow={handleClickOnAccessionRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
LocationAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnAccessionRow: PropTypes.func.isRequired, 
};
