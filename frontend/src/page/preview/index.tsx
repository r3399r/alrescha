import liff from '@line/liff';
import { useEffect, useState } from 'react';
import { GetUserIdPredictResponse } from 'src/model/Api';
import { getPredictOfUser, getUserProfile } from 'src/service/previewService';
import Photo from './Photo';

const Preview = () => {
  const [userId, setUserId] = useState<string>();
  const [results, setResults] = useState<GetUserIdPredictResponse>();

  useEffect(() => {
    document.title = '瀏覽照片';
    liff.ready.then(getUserProfile).then((res) => {
      setUserId(res.userId);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    getPredictOfUser(userId).then((res) => {
      setResults(res);
    });
  }, [userId]);

  return (
    <div className="mt-[10px] mx-[15px]">
      {results?.map((v) => (
        <Photo key={v.id} before={v.before} after={v.after} />
      ))}
    </div>
  );
};

export default Preview;
