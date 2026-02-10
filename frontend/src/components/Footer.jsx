import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">DigitalMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La marketplace des produits digitaux. Achetez et vendez des ebooks, templates, musiques, vidéos et plus encore.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Produits */}
          <div>
            <h4 className="font-semibold mb-4">Produits</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/documents-textes" className="text-muted-foreground hover:text-primary">Documents & Textes</Link></li>
              <li><Link to="/category/audio" className="text-muted-foreground hover:text-primary">Audio</Link></li>
              <li><Link to="/category/videos" className="text-muted-foreground hover:text-primary">Vidéos</Link></li>
              <li><Link to="/category/images-graphisme" className="text-muted-foreground hover:text-primary">Images & Graphisme</Link></li>
              <li><Link to="/category/logiciels-code" className="text-muted-foreground hover:text-primary">Logiciels & Code</Link></li>
              <li><Link to="/templates" className="text-muted-foreground hover:text-primary">Templates</Link></li>
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="font-semibold mb-4">Liens utiles</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">À propos</Link></li>
              <li><Link to="/become-vendor" className="text-muted-foreground hover:text-primary">Devenir vendeur</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez nos dernières offres et nouveautés directement dans votre boîte mail.
            </p>
            <form className="space-y-2">
              <div className="flex gap-2">
                <Input type="email" placeholder="Votre email" className="flex-1" />
                <Button type="submit" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DigitalMarket. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary">Conditions d'utilisation</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary">Politique de confidentialité</Link>
            <Link to="/legal" className="text-muted-foreground hover:text-primary">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
