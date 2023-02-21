import { Profile } from '@liff/get-profile';
import liff from '@line/liff';
import { useEffect, useState } from 'react';

const Upload = () => {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    liff.ready.then(() => liff.getProfile()).then((res) => setProfile(res));
  }, []);

  return <>Hello {profile?.displayName}</>;
};

export default Upload;
