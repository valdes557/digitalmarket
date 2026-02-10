import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { adminAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: banners } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => adminAPI.getAllBanners().then(res => res.data),
  });

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await adminAPI.createBanner({ title, image, link });
      toast.success('Bannière créée');
      setOpen(false);
      queryClient.invalidateQueries(['admin-banners']);
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteBanner(id);
      toast.success('Bannière supprimée');
      queryClient.invalidateQueries(['admin-banners']);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <>
      <Helmet><title>Bannières - Admin - DigitalMarket</title></Helmet>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bannières</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Nouvelle bannière</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle bannière</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Titre</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>URL Image</Label><Input value={image} onChange={(e) => setImage(e.target.value)} /></div>
                <div><Label>Lien</Label><Input value={link} onChange={(e) => setLink(e.target.value)} /></div>
                <Button className="w-full" onClick={handleCreate} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners?.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img src={banner.image} alt="" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{banner.title}</p>
                    <Badge variant={banner.is_active ? 'success' : 'secondary'}>{banner.is_active ? 'Actif' : 'Inactif'}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
