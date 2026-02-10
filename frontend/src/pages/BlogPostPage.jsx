import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { blogAPI } from '../lib/api';
import { formatDate } from '../lib/utils';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogAPI.getBySlug(slug).then(res => res.data),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8">Chargement...</div>;

  return (
    <>
      <Helmet><title>{post?.title} - Blog - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au blog
        </Link>
        <article>
          {post?.featured_image && (
            <img src={post.featured_image} alt={post.title} className="w-full aspect-video object-cover rounded-lg mb-8" />
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post?.published_at)}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post?.author_name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">{post?.title}</h1>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post?.content }} />
        </article>
      </div>
    </>
  );
}
