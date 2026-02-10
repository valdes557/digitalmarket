import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, Heart, Star, Download, Eye, Clock, FileText, 
  ChevronRight, User, Check, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { productsAPI } from '../lib/api';
import { formatPrice, formatDate, getInitials, formatFileSize } from '../lib/utils';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem, hasItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.getBySlug(slug).then(res => res.data),
  });

  const inCart = product ? hasItem(product.id) : false;

  const handleAddToCart = () => {
    if (inCart) {
      toast.error('Produit déjà dans le panier');
      return;
    }
    addItem(product);
    toast.success('Ajouté au panier');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-10 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Produit non trouvé</h1>
        <p className="text-muted-foreground mb-4">Ce produit n'existe pas ou n'est plus disponible.</p>
        <Link to="/products">
          <Button>Voir tous les produits</Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <>
      <Helmet>
        <title>{product.name} - DigitalMarket</title>
        <meta name="description" content={product.short_description || product.name} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-primary">Produits</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${product.category_slug}`} className="hover:text-primary">
            {product.category_name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={product.thumbnail || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.previews?.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.previews.slice(0, 4).map((preview, i) => (
                  <div key={i} className="aspect-video bg-muted rounded overflow-hidden cursor-pointer hover:opacity-80">
                    <img src={preview.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <Badge variant="secondary" className="mb-4">{product.category_name}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* Rating & Stats */}
            <div className="flex items-center gap-4 mb-6 text-sm">
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.rating_count} avis)</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{product.view_count} vues</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="w-4 h-4" />
                <span>{product.sales_count} ventes</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {hasDiscount ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary">{formatPrice(product.sale_price)}</span>
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge variant="destructive">
                    -{Math.round((1 - product.sale_price / product.price) * 100)}%
                  </Badge>
                </div>
              ) : (
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Short description */}
            <p className="text-muted-foreground mb-6">{product.short_description}</p>

            {/* Files info */}
            {product.files?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Fichiers inclus :</h3>
                <div className="space-y-2">
                  {product.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{file.file_name}</span>
                      <span className="text-muted-foreground">({formatFileSize(file.file_size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={inCart}>
                {inCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" /> Dans le panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" /> Ajouter au panier
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Vendor */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.store_logo} />
                    <AvatarFallback>{getInitials(product.store_name, '')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link to={`/store/${product.store_slug}`} className="font-semibold hover:text-primary">
                      {product.store_name}
                    </Link>
                    {product.vendor_rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {product.vendor_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <Link to={`/store/${product.store_slug}`}>
                    <Button variant="outline" size="sm">Voir la boutique</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({product.rating_count || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6 prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>{getInitials(review.first_name, review.last_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.first_name} {review.last_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
                                  />
                                ))}
                              </div>
                              <span>{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        {review.title && <p className="font-medium mb-1">{review.title}</p>}
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucun avis pour le moment.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
