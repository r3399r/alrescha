import { Profile } from '@liff/get-profile';
import liff from '@line/liff';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Button from 'src/component/Button';
import Divider from 'src/component/Divider';
import Input from 'src/component/Input';
import Slider from 'src/component/Slider';
import Switch from 'src/component/Switch';
import IcDelete from 'src/image/ic-delete.svg';
import { getUserInfo } from 'src/service/uploadService';

const Upload = () => {
  const [profile, setProfile] = useState<Profile>();
  const [fileList, setFileList] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fidelity, setFidelity] = useState<string>('0.7');
  const [bgEnhance, setBgEnhance] = useState<boolean>(true);
  const [faceUpsample, setFaceUpsample] = useState<boolean>(true);
  const [upscale, setUpscale] = useState<string>('1');

  useEffect(() => {
    liff.ready.then(getUserInfo).then((res) => {
      setProfile(res.profile);
    });
    document.title = '上傳圖片';
  }, []);

  const onDelete = (i: number) => () => {
    const tmp = [...fileList];
    tmp.splice(i, 1);
    setFileList(tmp);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFileList(Array.from(e.target.files));
  };

  return (
    <div className="mx-[15px] mt-[10px]">
      <div className="text-[14px]">
        <div>
          <span className="text-blue">{profile?.displayName}</span> 的免費運算額度還有{' '}
          <span className="text-blue">600</span> 秒
        </div>
        <div>
          批次上傳照片數量上限：<span className="text-blue">10</span> 張
        </div>
      </div>
      {fileList.length === 0 && (
        <>
          <div className="mt-10 text-center">
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              上傳照片
            </Button>
          </div>
          <input
            type="file"
            onChange={handleChange}
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg"
            multiple
          />
        </>
      )}
      {fileList.length > 0 && (
        <div>
          <div className="overflow-x-scroll whitespace-nowrap mt-[10px] pb-10 scrollbar-hide">
            {fileList.map((file, i) => (
              <div className="inline-block h-[260px] mr-[10px] relative overflow-hidden" key={i}>
                <img className="h-full max-w-none" src={URL.createObjectURL(file)} />
                <img
                  className="absolute right-[10px] bottom-[10px] cursor-pointer"
                  src={IcDelete}
                  onClick={onDelete(i)}
                />
              </div>
            ))}
          </div>
          <Divider />
          <div className="text-xl font-bold mt-[30px]">修圖設定</div>
          <div className="text-[14px] mt-6 font-bold">保真度</div>
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
          <div className="text-[14px] mt-6 font-bold">背景增強</div>
          <div className="flex items-center">
            <div className="flex-1 text-grey-600 text-[12px] leading-[18px]">
              運用 Real-ESRGAN 來增強背景
            </div>
            <Switch checked={bgEnhance} onChange={(e) => setBgEnhance(e.target.checked)} />
          </div>
          <div className="text-[14px] mt-6 font-bold">臉部上取樣</div>
          <div className="flex items-center">
            <div className="flex-1 text-grey-600 text-[12px] leading-[18px]">提高臉部解析度</div>
            <Switch checked={faceUpsample} onChange={(e) => setFaceUpsample(e.target.checked)} />
          </div>
          <div className="text-[14px] mt-6 font-bold">圖片放大</div>
          <div className="flex items-center">
            <div className="flex-1 text-grey-600 text-[12px] leading-[18px]">
              圖片長寬放大為原始圖片的倍數
            </div>
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
            <Button appearance="secondary" type="button">
              送出
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
