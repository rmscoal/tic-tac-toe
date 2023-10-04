import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import LoginView from '../view/Login/Login';
import Landing from '../view/Landing/Landing';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginView />} />
    </Route>
  )
);

export default router;
