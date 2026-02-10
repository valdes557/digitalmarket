import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { blogAPI } from '../lib/api';
import { formatDate } from '../lib/utils';

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => blogAPI.getPosts({ limit: 12 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Blog - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.posts?.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-video bg-muted">
                  <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">{formatDate(post.published_at)}</p>
                  <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
