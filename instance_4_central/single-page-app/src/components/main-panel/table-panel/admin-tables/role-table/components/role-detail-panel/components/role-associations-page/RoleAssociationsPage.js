import React from 'react';
import PropTypes from 'prop-types';
import UsersCompactView from './users-compact-view/UsersCompactView'
import RoleAssociationsMenuTabs from './RoleAssociationsMenuTabs'
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

export default function RoleAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnUserRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('users');

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
          <RoleAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Users Compact View */}
        {(associationSelected === 'users') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <UsersCompactView
              item={item}
              handleClickOnUserRow={handleClickOnUserRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
RoleAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnUserRow: PropTypes.func.isRequired, 
};
