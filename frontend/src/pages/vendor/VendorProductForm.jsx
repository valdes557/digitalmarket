import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { productsAPI, categoriesAPI, uploadAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function VendorProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  const [files, setFiles] = useState([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm();

  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(res => res.data),
  });

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Entrez un nom de catégorie');
      return;
    }
    setIsCreatingCategory(true);
    try {
      const response = await categoriesAPI.create({ name: newCategoryName });
      toast.success('Catégorie créée !');
      setNewCategoryName('');
      setShowCategoryDialog(false);
      await refetchCategories();
      setValue('category_id', response.data.category._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadAPI.uploadImage(file, 'products');
      setThumbnail(response.data.url);
      setValue('thumbnail', response.data.url);
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur upload');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadAPI.uploadProductFile(file);
      setFiles([...files, response.data]);
      toast.success('Fichier uploadé');
    } catch (error) {
      toast.error('Erreur upload');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const productData = { ...data, thumbnail };
      const response = await productsAPI.create(productData);
      
      if (files.length > 0) {
        await productsAPI.addFiles(response.data.product.id, files);
      }
      
      toast.success('Produit créé !');
      navigate('/vendor/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>{id ? 'Modifier' : 'Nouveau'} produit - DigitalMarket</title></Helmet>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{id ? 'Modifier le' : 'Nouveau'} produit</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom du produit *</Label>
                <Input {...register('name', { required: true })} placeholder="Mon super produit" />
              </div>
              <div>
                <Label>Description courte</Label>
                <Input {...register('short_description')} placeholder="Brève description..." />
              </div>
              <div>
                <Label>Description complète</Label>
                <Textarea {...register('description')} rows={5} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Prix (FCFA) *</Label>
                  <Input type="number" {...register('price', { required: true })} />
                </div>
                <div>
                  <Label>Prix promo</Label>
                  <Input type="number" {...register('sale_price')} />
                </div>
              </div>
              <div>
                <Label>Catégorie *</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(v) => setValue('category_id', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id || cat._id} value={String(cat.id || cat._id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Nom de la catégorie</Label>
                          <Input 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Ex: Templates WordPress"
                          />
                        </div>
                        <Button 
                          onClick={handleCreateCategory} 
                          disabled={isCreatingCategory}
                          className="w-full"
                        >
                          {isCreatingCategory && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Créer la catégorie
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Image du produit</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {thumbnail ? (
                  <img src={thumbnail} alt="" className="w-48 h-48 object-cover mx-auto rounded" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fichiers téléchargeables</CardTitle></CardHeader>
            <CardContent>
              <Input type="file" onChange={handleFileUpload} />
              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <li key={i} className="text-sm">{f.file_name}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {id ? 'Mettre à jour' : 'Créer le produit'}
          </Button>
        </form>
      </div>
    </>
  );
}
