import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { vendorsAPI } from '../lib/api';
import { getInitials, formatPrice } from '../lib/utils';

export default function VendorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsAPI.getAll({ limit: 20 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Vendeurs - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Nos vendeurs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.vendors?.map((vendor) => (
            <Link key={vendor.id} to={`/store/${vendor.store_slug}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={vendor.store_logo} />
                    <AvatarFallback>{getInitials(vendor.store_name, '')}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">{vendor.store_name}</h3>
                  {vendor.rating > 0 && (
                    <div className="flex items-center justify-center gap-1 text-sm mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{vendor.total_products} produits</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
