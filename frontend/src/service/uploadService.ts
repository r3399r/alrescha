import liff from '@line/liff';
import predictEndpoint from 'src/api/predictEndpoint';
import { ReplicateResponse } from 'src/model/Replicate';
import { file2Base64 } from 'src/util/fileConverter';

export const getUserInfo = async () => {
  const profile = await liff.getProfile();
  const token = liff.getAccessToken() ?? 'xx';

  return { profile, token };
};

export const startPredict = async (files: FileList, userId: string) => {
  const results: ReplicateResponse[] = [];
  for (const f of files) {
    const base64 = await file2Base64(f);
    const res = await predictEndpoint.postPredict({ image: base64 }, userId);
    results.push(res.data);
  }

  return results;
};
