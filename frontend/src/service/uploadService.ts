import liff from '@line/liff';
import predictEndpoint from 'src/api/predictEndpoint';
import userEndpoint from 'src/api/userEndpoint';
import { dispatch } from 'src/redux/store';
import { finishWaiting, startWaiting } from 'src/redux/uiSlice';
import { file2Base64 } from 'src/util/fileConverter';

export const getUserInfo = async () => {
  try {
    dispatch(startWaiting());
    const profile = await liff.getProfile();
    const token = liff.getAccessToken() ?? 'xx';
    const os = liff.getOS();

    const res = await userEndpoint.getUserId(profile.userId);

    return { profile, token, os, quota: res.data.quota, count: res.data.count };
  } finally {
    dispatch(finishWaiting());
  }
};

export const startPredict = async (
  files: File[],
  userId: string,
  codeformerFidelity: number,
  backgroundEnhance: boolean,
  faceUpsample: boolean,
  upscale: number,
) => {
  try {
    dispatch(startWaiting());
    const images = await Promise.all(files.map((v) => file2Base64(v)));
    await predictEndpoint.postPredict({
      images,
      userId,
      codeformerFidelity,
      backgroundEnhance,
      faceUpsample,
      upscale,
    });
  } finally {
    dispatch(finishWaiting());
  }
};
