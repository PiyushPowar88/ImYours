// import { Link } from 'react-router-dom';
// import { siteConfig } from '../config/siteConfig';

// export default function Logo({ variant = 'dark', className = '' }) {
//   const isLight = variant === 'light';

//   return (
//     <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
//       <div
//         className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0
//           ${isLight ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'}`}
//       >
//         {siteConfig.name.charAt(0)}
//       </div>
//       <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-white' : 'text-primary-600'}`}>
//         {siteConfig.name}
//       </span>
//     </Link>
//   );
// }



import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export default function Logo({ variant = 'dark', className = '' }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img
        src="/logo.PNG"
        alt={siteConfig.name}
        className="h-14 w-auto object-contain"
      />
    </Link>
  );
}