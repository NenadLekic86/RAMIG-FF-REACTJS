import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout.tsx';
import Explore from './routes/explore/Explore.tsx';
import Profile from './routes/profile/Profile.tsx';
import MyProfile from './routes/profile/my-profile/MyProfile.tsx';
import Markets from './routes/profile/markets/Markets.tsx';
import Accounts from './routes/profile/accounts/Accounts.tsx';
import Points from './routes/profile/points/Points.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Explore /> },
      {
        path: 'profile',
        element: <Profile />,
        children: [
          { index: true, element: <MyProfile /> },
          { path: 'markets', element: <Markets /> },
          { path: 'accounts', element: <Accounts /> },
          { path: 'points', element: <Points /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}