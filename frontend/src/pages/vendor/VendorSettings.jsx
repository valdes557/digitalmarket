import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../stores/authStore';
import { vendorsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function VendorSettings() {
  const { vendor, updateVendor } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: vendor });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await vendorsAPI.updateProfile(data);
      updateVendor(response.data.vendor);
      toast.success('Paramètres mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Paramètres boutique - DigitalMarket</title></Helmet>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Paramètres de la boutique</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informations de la boutique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom de la boutique</Label>
                <Input {...register('store_name')} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('store_description')} rows={4} />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input {...register('phone')} />
              </div>
              <div>
                <Label>Site web</Label>
                <Input {...register('website')} placeholder="https://" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Réseaux sociaux</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Facebook</Label>
                <Input {...register('social_facebook')} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input {...register('social_instagram')} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label>Twitter</Label>
                <Input {...register('social_twitter')} placeholder="https://twitter.com/..." />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </form>
      </div>
    </>
  );
}
