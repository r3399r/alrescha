import { useEffect, useState } from 'react';
import predictEndpoint from 'src/api/predictEndpoint';

const Preview = () => {
  const [befores, setBefores] = useState<string[]>();
  const [afters, setAfters] = useState<string[]>();

  useEffect(() => {
    predictEndpoint.getPredict().then((res) => {
      setBefores(res.data.filter((o) => o.includes('before')));
      setAfters(res.data.filter((o) => o.includes('after')));
    });
  }, []);

  return (
    <div className="flex">
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
