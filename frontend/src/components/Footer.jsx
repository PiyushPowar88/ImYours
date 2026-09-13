import { Link } from 'react-router-dom';
import Logo from './Logo';
import { siteConfig } from '../config/siteConfig';

export default function Footer() {
  return (
    <footer className="bg-primary-600 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Logo variant="light" />
            <p className="text-primary-100 text-sm mt-3 max-w-xs">{siteConfig.tagline}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li><Link to="/" className="hover:text-white transition">Available Sessions</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white">Support</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li>
                <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-white transition">
                  {siteConfig.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center sm:text-left">
          <p className="text-primary-200 text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}