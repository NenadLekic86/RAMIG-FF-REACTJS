import { NavLink, Outlet } from 'react-router-dom';
export default function Profile() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 border-b border-neutral-800">
        <NavLink to="accounts" className="px-3 py-2">Accounts</NavLink>
        <NavLink to="points" className="px-3 py-2">Points</NavLink>
      </div>
      <Outlet />
    </div>
  );
}