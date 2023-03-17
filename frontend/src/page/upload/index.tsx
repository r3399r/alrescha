import { Profile } from '@liff/get-profile';
import liff from '@line/liff';
import classNames from 'classnames';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'src/component/Button';
import Divider from 'src/component/Divider';
import Input from 'src/component/Input';
import Slider from 'src/component/Slider';
import Switch from 'src/component/Switch';
import Body from 'src/component/typography/Body';
import H3 from 'src/component/typography/H3';
import H5 from 'src/component/typography/H5';
import IcAdd from 'src/image/ic-add.svg';
import IcDelete from 'src/image/ic-delete.svg';
import { getUserInfo, startPredict } from 'src/service/uploadService';

const Upload = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>();
  const [quota, setQuota] = useState<number>();
  const [count, setCount] = useState<number>();
  const [os, setOs] = useState<'ios' | 'android' | 'web' | undefined>();
  const [fileList, setFileList] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fidelity, setFidelity] = useState<string>('0.7');
  const [bgEnhance, setBgEnhance] = useState<boolean>(true);
  const [faceUpsample, setFaceUpsample] = useState<boolean>(true);
  const [upscale, setUpscale] = useState<string>('1');

  useEffect(() => {
    liff.ready.then(getUserInfo).then((res) => {
      setProfile(res.profile);
      setOs(res.os);
      setQuota(res.quota);
      setCount(res.count);
    });
    document.title = '上傳圖片';
  }, []);

  const onDelete = (i: number) => () => {
    const tmp = [...fileList];
    tmp.splice(i, 1);
    setFileList(tmp);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && count) {
      const newFiles = [...fileList, ...Array.from(e.target.files)];
      if (newFiles.length > count) setFileList(newFiles.slice(0, 10));
      else setFileList(newFiles);
    }
  };

  const onSend = () => {
    if (profile === undefined) return;
    startPredict(
      fileList,
      profile.userId,
      Number(fidelity),
      bgEnhance,
      faceUpsample,
      Number(upscale),
    ).then(() => navigate('/preview'));
  };

  if (profile === undefined) return <div />;

  return (
    <div className="mx-[15px] mt-[10px]">
      <div className="text-[14px]">
        <Body>
          <span className="text-blue">{profile.displayName}</span> 的免費運算額度還有{' '}
          <span
            className={classNames({
              'text-blue': quota && quota > 0,
              'text-red': quota && quota <= 0,
            })}
          >
            {quota}
          </span>{' '}
          秒
        </Body>
        <Body>
          批次上傳照片數量上限：<span className="text-blue">{count}</span> 張
          {fileList.length > 0 && (
            <span>
              ，目前已上傳 <span className="text-blue">{fileList.length}</span> 張
            </span>
          )}
        </Body>
      </div>
      {fileList.length === 0 && (
        <div className="mt-10 text-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={quota !== undefined && quota <= 0}
          >
            上傳照片
          </Button>
        </div>
      )}
      {fileList.length > 0 && (
        <>
          <div className="overflow-x-scroll whitespace-nowrap mt-[10px] pb-10 scrollbar-hide">
            {fileList.map((file, i) => (
              <div className="inline-block h-[260px] mr-[10px] relative" key={i}>
                <img className="h-full max-w-none" src={URL.createObjectURL(file)} />
                <img
                  className="absolute right-[10px] bottom-[10px] cursor-pointer"
                  src={IcDelete}
                  onClick={onDelete(i)}
                />
              </div>
            ))}
            {fileList.length < 10 && (
              <div
                className="inline-block h-[260px] w-[70px] mr-[10px] bg-grey-200 relative p-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={IcAdd} className="absolute top-[112px]" />
              </div>
            )}
          </div>
          <Divider />
          <H3 className="mt-[30px]">修圖設定</H3>
          <H5 className="mt-6">保真度</H5>
          <div className="flex gap-10">
            <Slider
              value={Number(fidelity)}
              onChange={(e, value) =>
                setFidelity(typeof value === 'number' ? value.toString() : '0')
              }
              step={0.01}
              min={0}
              max={1}
            />
            <Input
              className="w-[56px]"
              value={fidelity}
              onChange={(e) => setFidelity(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="text-grey-600 text-[12px] leading-[18px] mt-[5px]">
            Balance the quality (lower number) and fidelity (higher number). (maximum: 1)
          </div>
          <H5 className="mt-6">背景增強</H5>
          <div className="flex items-center">
            <Body size="s" className="flex-1 text-grey-600">
              運用 Real-ESRGAN 來增強背景
            </Body>
            <Switch checked={bgEnhance} onChange={(e) => setBgEnhance(e.target.checked)} />
          </div>
          <H5 className="mt-6">臉部上取樣</H5>
          <div className="flex items-center">
            <Body className="flex-1 text-grey-600">提高臉部解析度</Body>
            <Switch checked={faceUpsample} onChange={(e) => setFaceUpsample(e.target.checked)} />
          </div>
          <H5 className="mt-6">圖片放大</H5>
          <div className="flex items-center">
            <Body className="flex-1 text-grey-600">圖片長寬放大為原始圖片的倍數</Body>
            <Input
              className="w-[40px]"
              value={upscale}
              onChange={(e) => setUpscale(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="flex justify-center gap-5 mt-6 mb-9">
            <Button type="button" onClick={() => setFileList([])}>
              重置
            </Button>
            <Button appearance="secondary" type="button" onClick={onSend}>
              送出
            </Button>
          </div>
        </>
      )}
      <input
        type="file"
        onChange={handleChange}
        ref={fileInputRef}
        className="hidden"
        accept="image/png,image/jpeg"
        multiple={os !== 'android'}
      />
    </div>
  );
};

export default Upload;
