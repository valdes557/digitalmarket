import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Package, Download, Heart, Settings } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { useAuthStore } from '../../stores/authStore';

const menuItems = [
  { path: '/account/profile', icon: User, title: 'Mon profil', desc: 'Gérer mes informations' },
  { path: '/account/orders', icon: Package, title: 'Mes commandes', desc: 'Historique des achats' },
  { path: '/account/downloads', icon: Download, title: 'Téléchargements', desc: 'Mes fichiers' },
  { path: '/account/wishlist', icon: Heart, title: 'Favoris', desc: 'Produits sauvegardés' },
];

export default function AccountPage() {
  const { user } = useAuthStore();

  return (
    <>
      <Helmet><title>Mon compte - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Bonjour, {user?.first_name} !</h1>
        <p className="text-muted-foreground mb-8">Gérez votre compte et vos achats.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:shadow-lg hover:border-primary transition-all h-full">
                <CardContent className="p-6">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
