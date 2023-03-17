import liff from '@line/liff';
import userEndpoint from 'src/api/userEndpoint';
import { dispatch } from 'src/redux/store';
import { finishWaiting, startWaiting } from 'src/redux/uiSlice';

export const getUserProfile = async () => await liff.getProfile();

export const getPredictOfUser = async (id: string) => {
  try {
    dispatch(startWaiting());
    const res = await userEndpoint.getUserIdPredict(id);

    return res.data;
  } finally {
    dispatch(finishWaiting());
  }
};
