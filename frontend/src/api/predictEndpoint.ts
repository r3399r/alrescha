import { PostPredictRequest } from 'src/model/Api';
import { ReplicateResponse } from 'src/model/Replicate';
import http from 'src/util/http';

const postPredict = async (data: PostPredictRequest, userId: string) =>
  await http.post<ReplicateResponse>('predict', {
    data,
    params: { userId },
  });

const getPredict = async (userId: string) =>
  await http.get<string[]>('predict', { params: { userId } });

export default { postPredict, getPredict };
