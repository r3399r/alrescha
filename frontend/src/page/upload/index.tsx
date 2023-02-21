import { Profile } from '@liff/get-profile';
import liff from '@line/liff';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import predictEndpoint from 'src/api/predictEndpoint';
import { file2Base64 } from 'src/util/fileConverter';

const Upload = () => {
  const [profile, setProfile] = useState<Profile>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    liff.ready.then(() => liff.getProfile()).then((res) => setProfile(res));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.files[0]);
      file2Base64(e.target.files[0]).then((file: string) => {
        predictEndpoint.predict({ image: file });
      });
    }
  };

  return (
    <>
      <div>Hello {profile?.displayName}</div>
      <div>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          上傳照片
        </button>
      </div>
      <input
        type="file"
        onChange={handleChange}
        ref={fileInputRef}
        className="hidden"
        accept="image/png,image/jpeg"
      />
    </>
  );
};

export default Upload;
