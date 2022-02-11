import { Button } from '@mui/material';

const SharedButton = ({ Icon, label, disabled, color, ...props }) => {
  return (
    <Button
      size='large'
      // colors are messed up, MUI v5 supports color = 'error', so this will be fixed once the project is updated
      style={{ width: 184, color: color === 'error' && 'white', background: color === 'error' ? (disabled ? 'lightgrey' : 'red') : undefined }}
      variant='contained'
      color={color}
      disabled={disabled}
      {...props}
    >
      {<Icon style={{ marginRight: 8 }} />}
      {label}
    </Button>
  );
};

export default SharedButton;
