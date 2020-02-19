import React from 'react';
import { Grid, Collapse, Tooltip, Typography } from '@material-ui/core';
import Text from '../DialogField/Text';
import { isActive, isHidden, getValue } from './helpers';
import { debugSettings, checkEmpty } from '../../../helpers';

const getColumnFields = (fields, columns, index) => {
  const numFields = fields.length;
  const numCols = columns;
  const numColsField = Math.ceil(numFields / numCols);
  const startIndex = numColsField * index;
  const endIndex = Math.min(startIndex + numColsField - 1, numFields - 1);
  return fields.filter((f, i) => i >= startIndex && i <= endIndex);
};

export const MapField = ({ Field, style, active, xs = 12, values, mapField, fullWidth, ...f }) => {
  const collapse = isActive({ active }, values);

  const item = Field ? <Field {...mapField(f)} values={values} /> : checkEmpty(f.id) ? undefined : <Text {...mapField(f)} />;

  const { id, container, object } = f; // InputProps causes circular reference error for some reason, so remove it before stringify
  const value = getValue(f, values);

  const wrappeditem = (
    <Tooltip
      title={
        <>
          <Typography>Value: {typeof value === 'object' ? JSON.stringify(value) : value}</Typography>
          <Typography>{JSON.stringify({ id, container, object })}</Typography>
        </>
      }
    >
      <div>{item}</div>
    </Tooltip>
  );
  const Item = debugSettings.debugfieldonhover ? wrappeditem : item;

  return (
    <Grid key={`${f.id}`} item style={style} xs={fullWidth ? 12 : (xs as any)}>
      {collapse !== undefined ? <Collapse in={collapse}>{Item}</Collapse> : Item}
    </Grid>
  );
};

const Fields = ({ fields, mapField, values, fullWidth = false, columns = 1, minColumnWidth = 250, maxColumnWidth = 250 }) =>
  columns > 1 ? (
    <Grid key='column-container' item xs={12} container spacing={2} justify='center'>
      {Array.from(Array(columns).keys()).map(i => (
        <Grid key={i} item xs={fullWidth ? 12 : true} style={fullWidth ? {} : { minWidth: minColumnWidth, maxWidth: maxColumnWidth }}>
          <Grid container>
            <Fields
              fields={getColumnFields(fields, columns, i)}
              mapField={mapField}
              values={values}
              fullWidth={false}
              columns={1}
              minColumnWidth={minColumnWidth}
              maxColumnWidth={maxColumnWidth}
            />
          </Grid>
        </Grid>
      ))}
    </Grid>
  ) : (
    fields.filter(f => !isHidden(f, values)).map((props, i) => <MapField key={i} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />)
  );

export const InjectField = ({ values, mapField, fullWidth, fields, id, object = undefined, container = undefined, ...other }) => {
  const f = fields.find(
    f => f.id === id && (object !== undefined ? f.object === object : true) && (container !== undefined ? f.container === container : true)
  );
  return !f || isHidden(f, values) ? <></> : <MapField {...f} {...other} values={values} mapField={mapField} fullWidth={fullWidth} />;
};

export default Fields;
