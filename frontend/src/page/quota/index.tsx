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
      <div className="font-bold text-2xl mb-5 text-center">20 秒 / 1 元</div>
      <div className="h-[2px] w-[40px] mx-auto bg-black" />
      <H3 className="mt-[54px] mb-[10px]">銀行轉帳</H3>
      <div className="flex gap-[10px] items-center">
        <Body size="l">
          請匯款至 <span className="text-blue">中國信託 (822) 716-54025598-4</span>
        </Body>
        <CopyToClipboard text="716540255984">
          <img src={IcCopy} />
        </CopyToClipboard>
      </div>
      <H3 className="mt-10 mb-[10px]">Line Pay Money</H3>
      <div className="flex gap-[10px] items-center">
        <Body size="l">
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
