import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Package } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ordersAPI } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.getMyOrders({ limit: 20 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Mes commandes - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-32" />)}</div>
        ) : data?.orders?.length > 0 ? (
          <div className="space-y-4">
            {data.orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Commande {order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <Badge variant={order.payment_status === 'completed' ? 'success' : 'secondary'}>
                      {order.payment_status === 'completed' ? 'Payée' : order.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{order.items?.length || 0} produit(s)</p>
                    <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p>Aucune commande pour le moment.</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
