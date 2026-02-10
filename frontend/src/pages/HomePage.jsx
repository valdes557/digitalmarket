import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, FileText, Music, Video, Image, Code, Palette, 
  TrendingUp, Shield, Download, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI, bannersAPI } from '../lib/api';
import { useThemeStore } from '../stores/themeStore';

const features = [
  { icon: Shield, title: 'Paiements sécurisés', desc: 'Mobile Money & Carte bancaire' },
  { icon: Download, title: 'Téléchargement instantané', desc: 'Accès immédiat après achat' },
  { icon: TrendingUp, title: 'Vendeurs vérifiés', desc: 'Tous nos vendeurs sont validés' },
  { icon: Zap, title: 'Support réactif', desc: 'Assistance disponible 24/7' },
];

const categoryIcons = {
  'documents-textes': FileText,
  'audio': Music,
  'videos': Video,
  'images-graphisme': Image,
  'logiciels-code': Code,
  'assets-creatifs': Palette,
};

export default function HomePage() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured(8).then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll({ parent: 'null' }).then(res => res.data),
  });

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannersAPI.getActive().then(res => res.data),
  });

  const heroBanner = banners?.find(b => b.position === 'home_hero');

  return (
    <>
      <Helmet>
        <title>DigitalMarket - Marketplace Produits Digitaux</title>
        <meta name="description" content="Achetez et vendez des produits digitaux : ebooks, templates, musiques, vidéos, scripts et plus encore." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        {heroBanner?.image && (
          <img src={heroBanner.image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
        )}
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              La marketplace des créateurs numériques africains
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/80">
              {heroBanner?.subtitle || 'Achetez et vendez des ebooks, templates, musiques, vidéos, scripts et bien plus encore.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                  Explorer les produits
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/become-vendor">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                  Devenir vendeur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Catégories</h2>
              <p className="text-muted-foreground">Explorez nos différentes catégories de produits</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((cat) => {
              const Icon = categoryIcons[cat.slug] || FileText;
              return (
                <Link key={cat.id} to={`/category/${cat.slug}`}>
                  <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.product_count || 0} produits</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produits populaires</h2>
              <p className="text-muted-foreground">Découvrez nos meilleures ventes</p>
            </div>
            <Link to="/products?sort=popular">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-6 bg-muted rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary overflow-hidden">
            <CardContent className="p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Vendez vos créations digitales
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers de créateurs qui vendent leurs produits numériques. Commission de seulement 10%.
              </p>
              <Link to="/become-vendor">
                <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                  Commencer à vendre
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
