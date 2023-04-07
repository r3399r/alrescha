import userEndpoint from 'src/api/userEndpoint';
import { dispatch } from 'src/redux/store';
import { finishWaiting, startWaiting } from 'src/redux/uiSlice';

export const getUserList = async () => {
  try {
    dispatch(startWaiting());
    const res = await userEndpoint.getUser();

    return res.data;
  } finally {
    dispatch(finishWaiting());
  }
};

export const addQuotaToUser = async (id: string, quota: number, code: string) => {
  try {
    dispatch(startWaiting());
    const res = await userEndpoint.putUserIdQuota(id, { addQuota: quota, code });

    return res.data;
  } finally {
    dispatch(finishWaiting());
  }
};
