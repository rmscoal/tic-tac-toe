import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import LoginView from '../view/Login/Login';
import Landing from '../view/Landing/Landing';
import BaseAuthenticated from '../view/Authenticated/Base';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/home" element={<BaseAuthenticated />} />
    </Route>
  )
);

export default router;
