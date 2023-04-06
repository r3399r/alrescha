import { GetUserIdPredictResponse, GetUserIdResponse, PutUserIdRequest } from 'src/model/Api';
import http from 'src/util/http';

const getUserId = async (id: string) => await http.get<GetUserIdResponse>(`user/${id}`);

const getUserIdPredict = async (id: string) =>
  await http.get<GetUserIdPredictResponse>(`user/${id}/predict`);

const putUserId = async (id: string, data: PutUserIdRequest) =>
  await http.put<PutUserIdRequest>(`user/${id}`, { data });

export default { getUserId, getUserIdPredict, putUserId };
