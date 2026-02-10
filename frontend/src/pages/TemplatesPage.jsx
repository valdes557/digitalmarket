import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../components/ui/card';
import { templatesAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function TemplatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.getAll({ limit: 20 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Templates - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Templates</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Card key={i} className="animate-pulse h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.templates?.map((template) => (
              <Link key={template.id} to={`/templates/${template.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted">
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-primary font-bold">{formatPrice(template.sale_price || template.price)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
