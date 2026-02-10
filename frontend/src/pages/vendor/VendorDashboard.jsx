import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { vendorsAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorsAPI.getDashboard().then(res => res.data),
  });

  const stats = [
    { title: 'Revenus totaux', value: formatPrice(data?.stats?.totalRevenue || 0), icon: DollarSign, color: 'text-green-500' },
    { title: 'Ventes', value: data?.stats?.totalSales || 0, icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Produits', value: data?.vendor?.total_products || 0, icon: Package, color: 'text-purple-500' },
    { title: 'Solde disponible', value: formatPrice(data?.stats?.availableBalance || 0), icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <>
      <Helmet><title>Tableau de bord vendeur - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Ventes récentes</CardTitle></CardHeader>
            <CardContent>
              {data?.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {data.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{order.product_name}</p>
                        <p className="text-sm text-muted-foreground">{order.order_number}</p>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(order.vendor_amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune vente récente</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Produits populaires</CardTitle></CardHeader>
            <CardContent>
              {data?.topProducts?.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                        <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales_count} ventes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun produit</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
