import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">DigitalMarket</span>
          </Link>
          <Outlet />
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-white text-center">
          <h2 className="text-4xl font-bold mb-6">
            La marketplace des produits digitaux
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Achetez et vendez des ebooks, templates, musiques, vidéos, scripts et bien plus encore.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-white/70">Produits</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/70">Vendeurs</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-white/70">Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
