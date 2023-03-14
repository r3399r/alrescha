import liff from '@line/liff';
import { useEffect, useState } from 'react';
import { getUserProfile } from 'src/service/previewService';
import Photo from './Photo';

const Preview = () => {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    liff.ready.then(getUserProfile).then((res) => {
      setUserId(res.userId);
    });
    document.title = '預覽圖片';
  }, []);

  useEffect(() => {
    if (!userId) return;
    // predictEndpoint.getPredict(userId).then((res) => {
    //   setBefores(res.data.filter((o) => o.includes('before')));
    //   setAfters(res.data.filter((o) => o.includes('after')));
    // });
  }, [userId]);

  return (
    <div className="mt-[10px] mx-[15px]">
      <Photo />
    </div>
  );
};

export default Preview;
