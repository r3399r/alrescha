import { Route, Routes } from 'react-router-dom';
import Preview from './page/preview';
import Quota from './page/quota';
import Setting from './page/setting';
import User from './page/user';

const AppRoutes = () => (
  <Routes>
    <Route path={'setting'} element={<Setting />} />
    <Route path={'preview'} element={<Preview />} />
    <Route path={'quota'} element={<Quota />} />
    <Route path={'user'} element={<User />} />
  </Routes>
);

export default AppRoutes;
