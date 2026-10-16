import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import { Typography } from '@mui/material';
import { useT } from '../../../i18n';

export interface TablePlaceholderProps {
  name?: string;
  tab?: string;
  placeholder?: string; //optional placeholder text
  renderPlaceholder?: (props: TablePlaceholderProps) => React.Component;
  primary?: string;
  secondary?: string;
  classes?: any;
}

const TablePlaceholder = (Props: TablePlaceholderProps) => {
  const t = useT();
  // Default primary text is built here (not in mapStateToProps) so it can be translated
  const props = { ...Props, primary: Props.primary ? t(Props.primary) : t('No {{name}}', { name: t(Props.name) }), secondary: t(Props.secondary) };
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
  const primary = ownProp.primary;
  const secondary = ownProp.secondary || placeholder;
  return {
    ...ownProp,
    tab: table && table.tab && table.tab,
    primary,
    secondary
  };
};

export default connect(mapStateToProps)(TablePlaceholder as any) as any;
