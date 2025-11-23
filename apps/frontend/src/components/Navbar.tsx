import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/login', label: 'Inloggen' },
  { to: '/register', label: 'Registreren' },
  { to: '/app', label: 'Dashboard' },
  { to: '/settings', label: 'Instellingen' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg text-gradient">InfraImpact</span>
          <span className="text-sm text-gray-500">LCA-platform</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-2 py-1 rounded-lg ${isActive || pathname === item.to ? 'text-brand-green font-semibold' : 'text-gray-700 hover:text-brand-green'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
