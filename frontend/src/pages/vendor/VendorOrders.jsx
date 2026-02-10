import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../../components/ui/card';
import { vendorsAPI } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';

export default function VendorOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => vendorsAPI.getMyOrders({ limit: 50 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Mes ventes - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Mes ventes</h1>
        {isLoading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse h-20" />)}</div>
        ) : data?.orders?.length > 0 ? (
          <div className="space-y-4">
            {data.orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
                    <img src={order.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{order.product_name}</p>
                    <p className="text-sm text-muted-foreground">{order.order_number} • {formatDate(order.order_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(order.vendor_amount)}</p>
                    <p className="text-xs text-muted-foreground">Votre part (90%)</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground">Aucune vente pour le moment</CardContent></Card>
        )}
      </div>
    </>
  );
}
