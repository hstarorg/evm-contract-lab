import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';

import { MainLayout } from './layouts/MainLayout';

import GameLobby from './pages/GameLobby';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/lobby" replace />,
      },
      {
        path: 'lobby',
        element: <GameLobby />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

// create the router instance
export const router = createBrowserRouter(routes);
