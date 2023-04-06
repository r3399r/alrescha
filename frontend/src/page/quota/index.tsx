import { useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Body from 'src/component/typography/Body';
import H3 from 'src/component/typography/H3';
import IcCopy from 'src/image/ic-copy.svg';
import IcNotice from 'src/image/ic-notice.svg';

const Quota = () => {
  useEffect(() => {
    document.title = '購買額度';
  }, []);

  return (
    <div className="mt-[30px] mx-[15px]">
      <div className="font-bold text-2xl mb-5 text-center">1 元 XX 秒</div>
      <div className="h-[2px] w-[40px] mx-auto bg-black" />
      <H3 className="mt-[54px] mb-[10px]">銀行轉帳</H3>
      <div className="flex gap-[10px] items-center">
        <Body>
          請匯款至帳號 <span className="text-blue">台新銀行 (812) 2888-10-0549290-4</span>
        </Body>
        <CopyToClipboard text="2888-10-0549290-4">
          <img src={IcCopy} />
        </CopyToClipboard>
      </div>
      <H3 className="mt-10 mb-[10px]">Line Pay Money</H3>
      <div className="flex gap-[10px] items-center">
        <Body>
          轉帳代碼 <span className="text-blue">28380017062</span>
        </Body>
        <CopyToClipboard text="28380017062">
          <img src={IcCopy} />
        </CopyToClipboard>
      </div>
      <div className="mt-10 p-[15px] flex gap-[5px] items-center bg-grey-200">
        <img src={IcNotice} />
        <Body>匯款完成後請主動聯繫管理員進行對帳。</Body>
      </div>
    </div>
  );
};

export default Quota;
