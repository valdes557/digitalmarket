import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { categoriesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(res => res.data),
  });

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await categoriesAPI.create({ name, description });
      toast.success('Catégorie créée');
      setOpen(false);
      setName('');
      setDescription('');
      queryClient.invalidateQueries(['categories']);
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Catégories - Admin - DigitalMarket</title></Helmet>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Catégories</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Nouvelle catégorie</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <Button className="w-full" onClick={handleCreate} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {categories?.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{cat.product_count || 0} produits</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
