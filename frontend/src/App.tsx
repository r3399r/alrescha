import liff from '@line/liff';
import { useEffect } from 'react';
import Routes from './Routes';

function App() {
  useEffect(() => {
    liff.init({
      liffId: import.meta.env.VITE_LIFF_ID,
    });
  }, []);

  return (
    <>
      <Routes />
    </>
  );
}

export default App;
