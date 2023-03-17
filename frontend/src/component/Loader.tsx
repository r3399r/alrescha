import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';

const Loader = () => {
  const { workload } = useSelector((rootState: RootState) => rootState.ui);

  return (
    <Backdrop open={workload > 0} classes={{ root: 'z-[1400]' }}>
      <CircularProgress classes={{ root: '!text-white' }} />
    </Backdrop>
  );
};

export default Loader;
