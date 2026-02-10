import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { adminAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function AdminVendors() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: () => adminAPI.getAllVendors({ limit: 50 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Vendeurs - Admin - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Vendeurs</h1>
        {isLoading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse h-20" />)}</div>
        ) : (
          <div className="space-y-4">
            {data?.vendors?.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                    <img src={vendor.store_logo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{vendor.store_name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(vendor.total_sales)}</p>
                    <p className="text-sm text-muted-foreground">{vendor.total_products} produits</p>
                  </div>
                  <Badge variant={vendor.status === 'approved' ? 'success' : 'secondary'}>{vendor.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
