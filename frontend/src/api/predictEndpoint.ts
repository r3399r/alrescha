import http from 'src/celestial-ui/util/http';

const predict = async (data: { image: string }) => {
  await http.post('predict', { data });
};

export default { predict };
