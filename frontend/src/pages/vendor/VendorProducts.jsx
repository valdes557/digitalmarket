import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { vendorsAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function VendorProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorsAPI.getMyProducts({ limit: 50 }).then(res => res.data),
  });

  const statusColors = {
    published: 'success', pending: 'warning', draft: 'secondary', rejected: 'destructive'
  };

  return (
    <>
      <Helmet><title>Mes produits - DigitalMarket</title></Helmet>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes produits</h1>
          <Link to="/vendor/products/new">
            <Button><Plus className="w-4 h-4 mr-2" /> Nouveau produit</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-24" />)}</div>
        ) : data?.products?.length > 0 ? (
          <div className="space-y-4">
            {data.products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded bg-muted overflow-hidden shrink-0">
                    <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusColors[product.status]}>{product.status}</Badge>
                      <span className="text-primary font-bold">{formatPrice(product.sale_price || product.price)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/vendor/products/${product.id}/edit`}>
                      <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun produit</p>
            <Link to="/vendor/products/new"><Button>Créer mon premier produit</Button></Link>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
