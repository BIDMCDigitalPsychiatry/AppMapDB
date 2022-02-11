import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import { Typography } from '@mui/material';

export interface TablePlaceholderProps {
  name?: string;
  tab?: string;
  placeholder?: string; //optional placeholder text
  renderPlaceholder?: (props: TablePlaceholderProps) => React.Component;
  primary?: string;
  secondary?: string;
  classes?: any;
}

const TablePlaceholder = (props: TablePlaceholderProps) => {
  const { primary, secondary, renderPlaceholder } = props;

  return renderPlaceholder ? (
    renderPlaceholder(props)
  ) : (
    <>
      {primary && (
        <Typography color='textSecondary' variant='subtitle1' style={{ padding: 16 }} align='center'>
          {primary}
        </Typography>
      )}
      {secondary && (
        <Typography color='textSecondary' variant='body1' style={{ padding: 16 }} align='center'>
          {secondary}
        </Typography>
      )}
    </>
  );
};

const mapStateToProps = (state: AppState, ownProp: TablePlaceholderProps): TablePlaceholderProps => {
  const { name, placeholder } = ownProp;
  const table = state.table[name];
  const primary = ownProp.primary || `No ${name}`;
  const secondary = ownProp.secondary || placeholder;
  return {
    ...ownProp,
    tab: table && table.tab && table.tab,
    primary,
    secondary
  };
};

export default connect(mapStateToProps)(TablePlaceholder as any) as any;
