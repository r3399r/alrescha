import { GetUserIdPredictResponse, GetUserIdResponse } from 'src/model/Api';
import http from 'src/util/http';

const getUserId = async (id: string) => await http.get<GetUserIdResponse>(`user/${id}`);

const getUserIdPredict = async (id: string) =>
  await http.get<GetUserIdPredictResponse>(`user/${id}/predict`);

export default { getUserId, getUserIdPredict };
