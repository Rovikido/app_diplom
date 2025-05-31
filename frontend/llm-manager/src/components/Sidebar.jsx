import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Globe, Box, FileText} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: <Home />,
      to: '/home',
      label: 'Home',
      isActive: currentPath === '/' || currentPath === '/home',
    },
    {
      icon: <Globe />,
      to: '/community',
      label: 'Community',
      isActive: currentPath === '/community',
    },
    {
      icon: <Box />,
      to: '/models',
      label: 'Models',
      isActive: currentPath === '/models',
    },
  ];

  return (
    <div className="w-16 h-full rounded-xl bg-gray-200 shadow border border-gray-300 border-r flex flex-col items-center justify-between py-4">
      <div className="space-y-4">
        {navItems.map(({ icon, to, label, isActive }) => (
          <Link key={label} to={to}>
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-300 text-blue-800'
                  : 'text-blue-500 hover:bg-blue-100 hover:text-black'
              }`}
            >
              {React.cloneElement(icon, { className: 'w-6 h-6' })}
              <span className="text-xs font-medium mt-1">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <a
        href="http://127.0.0.1:8000/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:bg-blue-100 hover:text-black p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200"
      >
        <FileText className="w-6 h-6" />
        <span className="text-xs font-medium mt-1">SwaggerUI</span>
      </a>
    </div>
  );
};

export default Sidebar;
