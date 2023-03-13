import MuiSlider, { SliderProps } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const Slider = styled((props: SliderProps) => <MuiSlider {...props} />)(() => ({
  color: '#cccccc',
  height: 4,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#000',
  },
}));

export default Slider;
