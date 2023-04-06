import liff from '@line/liff';
import userEndpoint from 'src/api/userEndpoint';
import { PutUserIdRequest } from 'src/model/Api';
import { dispatch } from 'src/redux/store';
import { finishWaiting, startWaiting } from 'src/redux/uiSlice';

export const getUserInfo = async () => {
  try {
    dispatch(startWaiting());
    const profile = await liff.getProfile();
    const res = await userEndpoint.getUserId(profile.userId);

    return res.data;
  } finally {
    dispatch(finishWaiting());
  }
};

export const updateUserSetting = async (data: PutUserIdRequest) => {
  try {
    dispatch(startWaiting());
    const profile = await liff.getProfile();
    await userEndpoint.putUserId(profile.userId, data);
  } finally {
    dispatch(finishWaiting());
  }
};
