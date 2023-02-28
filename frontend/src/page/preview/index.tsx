import liff from '@line/liff';
import { useEffect, useState } from 'react';
import predictEndpoint from 'src/api/predictEndpoint';
import { getUserProfile } from 'src/service/previewService';

const Preview = () => {
  const [befores, setBefores] = useState<string[]>();
  const [afters, setAfters] = useState<string[]>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    liff.ready.then(getUserProfile).then((res) => {
      setUserId(res.userId);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    predictEndpoint.getPredict(userId).then((res) => {
      setBefores(res.data.filter((o) => o.includes('before')));
      setAfters(res.data.filter((o) => o.includes('after')));
    });
  }, [userId]);

  return (
    <div className="flex flex-wrap">
      <div className="w-1/2">Before</div>
      <div className="w-1/2">After</div>
      <div className="w-1/2">
        {befores?.map((v, i) => (
          <img key={i} src={v} />
        ))}
      </div>
      <div className="w-1/2">
        {afters?.map((v, i) => (
          <img key={i} src={v} />
        ))}
      </div>
    </div>
  );
};

export default Preview;
