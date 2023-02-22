import http from 'src/celestial-ui/util/http';

const postPredict = async (data: { image: string }) => await http.post('predict', { data });

const getPredict = async () => await http.get<string[]>('predict');

export default { postPredict, getPredict };
