import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { blogAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';

export default function AdminBlog() {
  const { data } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => blogAPI.getPosts({ limit: 50 }).then(res => res.data),
  });

  return (
    <>
      <Helmet><title>Blog - Admin - DigitalMarket</title></Helmet>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Articles de blog</h1>
          <Button><Plus className="w-4 h-4 mr-2" /> Nouvel article</Button>
        </div>

        <div className="space-y-4">
          {data?.posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-24 h-16 rounded bg-muted overflow-hidden shrink-0">
                  <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(post.published_at || post.created_at)}</p>
                </div>
                <Badge variant={post.status === 'published' ? 'success' : 'secondary'}>{post.status}</Badge>
                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
