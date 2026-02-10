import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../lib/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => productsAPI.search({ q: query, limit: 20 }).then(res => res.data),
    enabled: query.length >= 2,
  });

  return (
    <>
      <Helmet><title>Recherche: {query} - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Résultats pour "{query}"</h1>
        <p className="text-muted-foreground mb-8">{data?.pagination?.total || 0} résultats trouvés</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse h-64" />)}
          </div>
        ) : data?.products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground">Essayez avec d'autres mots-clés.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
