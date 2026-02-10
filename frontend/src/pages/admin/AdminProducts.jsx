import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { adminAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: () => adminAPI.getPendingProducts({ limit: 50 }).then(res => res.data),
  });

  const handleStatus = async (id, status) => {
    try {
      await adminAPI.updateProductStatus(id, { status });
      toast.success(`Produit ${status === 'published' ? 'approuvé' : 'rejeté'}`);
      queryClient.invalidateQueries(['admin-pending-products']);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <>
      <Helmet><title>Produits - Admin - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Produits en attente</h1>
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
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.store_name} • {product.category_name}</p>
                    <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStatus(product.id, 'published')}>
                      <Check className="w-4 h-4 mr-1" /> Approuver
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleStatus(product.id, 'rejected')}>
                      <X className="w-4 h-4 mr-1" /> Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun produit en attente</CardContent></Card>
        )}
      </div>
    </>
  );
}
