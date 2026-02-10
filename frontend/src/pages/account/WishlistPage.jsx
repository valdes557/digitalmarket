import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import ProductCard from '../../components/ProductCard';
import { userAPI } from '../../lib/api';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userAPI.getWishlist().then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Favoris - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse h-64" />)}
          </div>
        ) : wishlist?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p>Aucun produit dans vos favoris.</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
