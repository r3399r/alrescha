import { PostPredictRequest } from 'src/model/Api';
import http from 'src/util/http';

const postPredict = async (data: PostPredictRequest) =>
  await http.post<void>('predict', {
    data,
  });

const getPredict = async (userId: string) =>
  await http.get<string[]>('predict', { params: { userId } });

export default { postPredict, getPredict };
