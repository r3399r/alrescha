import liff from '@line/liff';
import { useEffect, useState } from 'react';
import Button from 'src/component/Button';
import Input from 'src/component/Input';
import Slider from 'src/component/Slider';
import Switch from 'src/component/Switch';
import Body from 'src/component/typography/Body';
import H3 from 'src/component/typography/H3';
import H5 from 'src/component/typography/H5';
import { getUserInfo, updateUserSetting } from 'src/service/settingService';

const Setting = () => {
  const [fidelity, setFidelity] = useState<string>();
  const [bgEnhance, setBgEnhance] = useState<boolean>();
  const [faceUpsample, setFaceUpsample] = useState<boolean>();
  const [upscale, setUpscale] = useState<string>();

  useEffect(() => {
    document.title = '參數設定';
    liff.ready.then(getUserInfo).then((res) => {
      setFidelity(String(res.codeformerFidelity));
      setBgEnhance(res.backgroundEnhance);
      setFaceUpsample(res.faceUpsample);
      setUpscale(String(res.upscale));
    });
  }, []);

  const onSubmit = () => {
    if (
      fidelity === undefined ||
      isNaN(Number(fidelity)) ||
      bgEnhance === undefined ||
      faceUpsample === undefined ||
      upscale === undefined
    )
      return;
    let tempFidelity = Number(fidelity);
    if (Number(fidelity) > 1) {
      setFidelity('1');
      tempFidelity = 1;
    } else if (Number(fidelity) < 0) {
      setFidelity('0');
      tempFidelity = 0;
    }
    updateUserSetting({
      codeformerFidelity: tempFidelity,
      backgroundEnhance: bgEnhance,
      faceUpsample: faceUpsample,
      upscale: Number(upscale),
    }).then(() => liff.closeWindow());
  };

  if (
    fidelity === undefined ||
    bgEnhance === undefined ||
    faceUpsample === undefined ||
    upscale === undefined
  )
    return <></>;

  return (
    <div className="mx-[15px] mt-[10px]">
      <H3 className="mt-[30px]">修圖設定</H3>
      <H5 className="mt-6">保真度</H5>
      <div className="flex gap-10">
        <Slider
          value={Number(fidelity)}
          onChange={(e, value) => setFidelity(typeof value === 'number' ? value.toString() : '0')}
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
      <Body className="text-grey-600 mt-[5px]">
        Balance the quality (lower number) and fidelity (higher number). (maximum: 1)
      </Body>
      <H5 className="mt-6">背景增強</H5>
      <div className="flex items-center">
        <Body size="s" className="flex-1 text-grey-600">
          運用 Real-ESRGAN 來增強背景
        </Body>
        <Switch checked={bgEnhance} onChange={(e) => setBgEnhance(e.target.checked)} />
      </div>
      <H5 className="mt-6">臉部上取樣</H5>
      <div className="flex items-center">
        <Body size="s" className="flex-1 text-grey-600">
          提高臉部解析度
        </Body>
        <Switch checked={faceUpsample} onChange={(e) => setFaceUpsample(e.target.checked)} />
      </div>
      <H5 className="mt-6">圖片放大</H5>
      <div className="flex items-center">
        <Body size="s" className="flex-1 text-grey-600">
          圖片長寬放大為原始圖片的倍數
        </Body>
        <Input
          className="w-[40px]"
          value={upscale}
          onChange={(e) => setUpscale(e.target.value)}
          inputMode="numeric"
        />
      </div>
      <div className="flex justify-center gap-5 mt-6 mb-9">
        <Button type="button" onClick={() => liff.closeWindow()}>
          取消
        </Button>
        <Button appearance="secondary" type="button" onClick={onSubmit}>
          送出
        </Button>
      </div>
    </div>
  );
};

export default Setting;
