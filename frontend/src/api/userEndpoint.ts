import {
  GetUserIdPredictResponse,
  GetUserIdResponse,
  GetUserResponse,
  PutUserIdQuotaRequest,
  PutUserIdQuotaResponse,
  PutUserIdRequest,
} from 'src/model/Api';
import http from 'src/util/http';

const getUser = async () => await http.get<GetUserResponse>('user');

const getUserId = async (id: string) => await http.get<GetUserIdResponse>(`user/${id}`);

const getUserIdPredict = async (id: string) =>
  await http.get<GetUserIdPredictResponse>(`user/${id}/predict`);

const putUserId = async (id: string, data: PutUserIdRequest) =>
  await http.put<void, PutUserIdRequest>(`user/${id}`, { data });

const putUserIdQuota = async (id: string, data: PutUserIdQuotaRequest) =>
  await http.put<PutUserIdQuotaResponse, PutUserIdQuotaRequest>(`user/${id}/quota`, { data });

export default { getUser, getUserId, getUserIdPredict, putUserId, putUserIdQuota };
