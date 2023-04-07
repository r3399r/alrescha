import { styled } from '@mui/material/styles';
import MuiSwitch, { SwitchProps } from '@mui/material/Switch';

const Switch = styled((props: SwitchProps) => (
  <MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(() => ({
  width: 54,
  height: 28,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 4,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(26px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#000',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#cccccc',
    opacity: 1,
  },
}));

export default Switch;
