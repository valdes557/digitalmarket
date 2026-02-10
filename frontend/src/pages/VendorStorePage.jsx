import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import ProductCard from '../components/ProductCard';
import { vendorsAPI } from '../lib/api';
import { getInitials } from '../lib/utils';

export default function VendorStorePage() {
  const { slug } = useParams();
  
  const { data: vendor } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => vendorsAPI.getBySlug(slug).then(res => res.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['vendor-products', slug],
    queryFn: () => vendorsAPI.getProducts(slug, { limit: 20 }).then(res => res.data),
    enabled: !!slug,
  });

  return (
    <>
      <Helmet><title>{vendor?.store_name || 'Boutique'} - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6 flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={vendor?.store_logo} />
              <AvatarFallback>{getInitials(vendor?.store_name || '', '')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-2">{vendor?.store_name}</h1>
              {vendor?.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
              )}
              <p className="text-muted-foreground">{vendor?.store_description}</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Produits ({productsData?.pagination?.total || 0})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsData?.products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
