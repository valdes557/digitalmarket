import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { userAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem, hasItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const inCart = hasItem(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCart) {
      toast.error('Produit déjà dans le panier');
      return;
    }

    addItem(product);
    toast.success('Ajouté au panier');
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      await userAPI.addToWishlist(product.id);
      toast.success('Ajouté aux favoris');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
  };

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.thumbnail || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-primary">Populaire</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">-{discountPercent}%</Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleAddToWishlist}>
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>

          {/* Category */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              {product.category_name}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Vendor */}
          <p className="text-xs text-muted-foreground mb-1">{product.store_name}</p>
          
          {/* Title */}
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating & Stats */}
          <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{product.view_count}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
