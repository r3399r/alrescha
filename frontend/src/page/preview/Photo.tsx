import classNames from 'classnames';
import { useState } from 'react';
import H4 from 'src/component/typography/H4';
import Loading from './Loading';

type Props = {
  before: string | null;
  after: string | null;
};

const Photo = ({ before, after }: Props) => {
  const [tab, setTab] = useState<number>(1);

  return (
    <div>
      <div className="flex">
        <H4
          className={classNames('mx-5 py-[15px] border-b-[3px] mb-[10px] cursor-pointer', {
            'text-grey-500 border-white': tab !== 0,
            'border-black': tab === 0,
          })}
          onClick={() => setTab(0)}
        >
          原始圖片
        </H4>
        <H4
          className={classNames('mx-5 py-[15px] border-b-[3px] mb-[10px] cursor-pointer', {
            ['text-grey-500 border-white']: tab !== 1,
            'border-black': tab === 1,
          })}
          onClick={() => setTab(1)}
        >
          修圖後
        </H4>
      </div>
      {tab === 0 && (before ? <img src={before} className="w-full" /> : <Loading />)}
      {tab === 1 && (after ? <img src={after} className="w-full" /> : <Loading />)}
    </div>
  );
};

export default Photo;
