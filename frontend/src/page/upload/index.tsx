import { Profile } from '@liff/get-profile';
import liff from '@line/liff';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { getUserInfo, startPredict } from 'src/service/uploadService';

const Upload = () => {
  const [profile, setProfile] = useState<Profile>();
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    liff.ready.then(getUserInfo).then((res) => {
      setProfile(res.profile);
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && profile)
      startPredict(e.target.files, profile.userId).then(() => setSuccess(true));
  };

  return (
    <>
      <div>Hello {profile?.displayName}</div>
      <div>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          上傳照片
        </button>
      </div>
      {success && <div>上傳成功！</div>}
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
