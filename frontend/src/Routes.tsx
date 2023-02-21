import { Route, Routes } from 'react-router-dom';
import Preview from './page/preview';
import Upload from './page/upload';
import User from './page/user';

const AppRoutes = () => (
  <Routes>
    <Route path={'upload'} element={<Upload />} />
    <Route path={'preview'} element={<Preview />} />
    <Route path={'user'} element={<User />} />
  </Routes>
);

export default AppRoutes;
