import classNames from 'classnames';
import { useState } from 'react';
import Loading from './Loading';

const Photo = () => {
  const [tab, setTab] = useState<number>(1);

  return (
    <div>
      <div className="flex">
        <div
          className={classNames('mx-5 py-[15px] border-b-[3px] mb-[10px] cursor-pointer', {
            'text-grey-500 border-white': tab !== 0,
            'border-black': tab === 0,
          })}
          onClick={() => setTab(0)}
        >
          原始圖片
        </div>
        <div
          className={classNames('mx-5 py-[15px] border-b-[3px] mb-[10px] cursor-pointer', {
            ['text-grey-500 border-white']: tab !== 1,
            'border-black': tab === 1,
          })}
          onClick={() => setTab(1)}
        >
          修圖後
        </div>
      </div>
      {tab === 0 && <img src="https://avatars.githubusercontent.com/u/8167063?s=96&v=4" />}
      {tab === 1 && <Loading />}
    </div>
  );
};

export default Photo;
