import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckIcon from '@material-ui/icons/Check';
import "moment/locale/es.js";
import "moment/locale/de.js";

const useStyles = makeStyles(theme => ({
  input: {
    margin: theme.spacing(0),
  },
}));

export default function TimeField(props) {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const {
    itemKey,
    name,
    label,
    text,
    valueOk,
    autoFocus,
  } = props;

  function getInitialSelectedDate() {
    moment.locale(i18n.language);
    
    if(text !== undefined && text !== null && typeof text === 'string' && text.trim() !== '') {
      
      let m = moment(text, "HH:mm:ss.SSSZ");
      if(m.isValid()) {
        return m;
        
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils} locale={i18n.language}>
        <KeyboardTimePicker
          className={classes.input}
          id={"time-field-"+itemKey+'-'+name}
          label={label}
          format="HH:mm:ss.SSS"
          ampm={true}
          value={getInitialSelectedDate()}
          views={['hours', 'minutes', 'seconds']}
          margin="normal"
          variant="inline"
          inputVariant="outlined"
          autoFocus={autoFocus!==undefined&&autoFocus===true ? true : false}
          autoOk={true}
          InputProps={{
            startAdornment:
              <InputAdornment position="start">
                {(valueOk!==undefined&&valueOk===1) ? <CheckIcon color="primary" fontSize="small" /> : ''}
              </InputAdornment>,
              readOnly: true
          }}
          onChange={()=>{/** do nothing */}}
        />
    </MuiPickersUtilsProvider>
  );
}
TimeField.propTypes = {
  itemKey: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.string,
  valueOk: PropTypes.number.isRequired,
  autoFocus: PropTypes.bool,
};