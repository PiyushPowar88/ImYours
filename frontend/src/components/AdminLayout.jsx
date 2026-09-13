import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/slots', label: 'Slots' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/forms', label: 'Form Builder' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <aside className="w-56 border-r border-gray-100 bg-white p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}