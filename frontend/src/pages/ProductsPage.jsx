import { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../lib/api';

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'rating', label: 'Mieux notés' },
];

const productTypes = [
  { value: 'all', label: 'Tous les types' },
  { value: 'document', label: 'Documents' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Vidéo' },
  { value: 'image', label: 'Images' },
  { value: 'software', label: 'Logiciels' },
  { value: 'asset', label: 'Assets' },
];

export default function ProductsPage() {
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'newest';
  const type = searchParams.get('type') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1', sort: 'newest', type: 'all' });
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll({ parent: 'null' }).then(res => res.data),
  });

  const { data: currentCategory } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => categoriesAPI.getBySlug(categorySlug).then(res => res.data),
    enabled: !!categorySlug,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, sort, type, minPrice, maxPrice, category: categorySlug }],
    queryFn: () => productsAPI.getAll({
      page,
      limit: 12,
      sort,
      type: type === 'all' ? undefined : type,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      category: categorySlug || undefined,
    }).then(res => res.data),
  });

  const hasFilters = (type && type !== 'all') || minPrice || maxPrice;

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory.name} - ` : ''}Produits - DigitalMarket</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentCategory ? currentCategory.name : 'Tous les produits'}
          </h1>
          <p className="text-muted-foreground">
            {data?.pagination?.total || 0} produits trouvés
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardContent className="p-4 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Catégories</h3>
                  <div className="space-y-2">
                    {categories?.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={categorySlug === cat.slug ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => window.location.href = `/category/${cat.slug}`}
                      >
                        {cat.name}
                        <Badge variant="secondary" className="ml-auto">{cat.product_count || 0}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Type filter */}
                <div>
                  <h3 className="font-semibold mb-3">Type de produit</h3>
                  <Select value={type} onValueChange={(v) => updateParams('type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price range */}
                <div>
                  <h3 className="font-semibold mb-3">Prix (FCFA)</h3>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => updateParams('minPrice', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => updateParams('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {hasFilters && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
              </Button>

              <div className="flex items-center gap-4 ml-auto">
                <Select value={sort} onValueChange={(v) => updateParams('sort', v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data?.products?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => updateParams('page', String(page - 1))}
                    >
                      Précédent
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} sur {data.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= data.pagination.pages}
                      onClick={() => updateParams('page', String(page + 1))}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos filtres ou votre recherche.
                  </p>
                  <Button onClick={clearFilters}>Réinitialiser les filtres</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
