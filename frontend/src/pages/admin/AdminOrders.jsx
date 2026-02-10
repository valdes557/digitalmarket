import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { adminAPI } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';

export default function AdminOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminAPI.getAllOrders({ limit: 50 }).then(res => res.data),
  });

  const statusColors = { pending: 'secondary', completed: 'success', failed: 'destructive' };

  return (
    <>
      <Helmet><title>Commandes - Admin - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Commandes</h1>
        {isLoading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse h-20" />)}</div>
        ) : (
          <div className="space-y-4">
            {data?.orders?.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.first_name} {order.last_name} • {order.email}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">Commission: {formatPrice(order.commission_amount)}</p>
                  </div>
                  <Badge variant={statusColors[order.payment_status]}>{order.payment_status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
