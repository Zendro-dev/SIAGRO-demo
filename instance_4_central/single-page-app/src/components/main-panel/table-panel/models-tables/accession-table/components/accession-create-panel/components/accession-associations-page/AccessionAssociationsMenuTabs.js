import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export default function AccessionAssociationsMenuTabs(props) {
  const {
    associationSelected,
    handleClick,
  } = props;

  return (
    <div>
      <Tabs
        value={associationSelected}
        onChange={handleClick}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab key='individuals' label='Individuals' value='individuals' />
        <Tab key='location' label='Location' value='location' />
        <Tab key='measurements' label='Measurements' value='measurements' />
        <Tab key='taxon' label='Taxon' value='taxon' />
      </Tabs>
    </div>
  );
}
AccessionAssociationsMenuTabs.propTypes = {
  associationSelected: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};