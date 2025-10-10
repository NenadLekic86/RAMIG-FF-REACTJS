import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout.tsx';
import Explore from './routes/explore/Explore.tsx';
import Terminal from './routes/terminal/Terminal.tsx';
import Profile from './routes/profile/Profile.tsx';
import Accounts from './routes/profile/accounts/Accounts.tsx';
import Points from './routes/profile/points/Points.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Explore /> },
      { path: 'terminal/:marketId', element: <Terminal /> },
      {
        path: 'profile',
        element: <Profile />,
        children: [
          { index: true, element: <Accounts /> },
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