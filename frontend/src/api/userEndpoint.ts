import { GetUserIdResponse } from 'src/model/Api';
import http from 'src/util/http';

const getUserId = async (id: string) => await http.get<GetUserIdResponse>(`user/${id}`);

export default { getUserId };
