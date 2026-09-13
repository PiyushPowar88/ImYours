import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo variant="dark" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2">
                    Admin
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2">
                    My Bookings
                  </Link>
                )}
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2">
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    My Bookings
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-primary-600 font-medium rounded-lg hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-primary-600 font-medium rounded-lg hover:bg-gray-50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}